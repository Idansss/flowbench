import { NextRequest, NextResponse } from "next/server";
import { routeAIRequest, type AIRequest } from "@/lib/ai/provider-router";
import { buildEnrichedPrompt } from "@/lib/ai/rag";
import { getCacheKey, getCached, setCached } from "@/lib/ai/cache";
import { trackEvent } from "@/lib/observability";

export const maxDuration = 30;

const IDANSSS_AI_SYSTEM_PROMPT = `You are Idansss AI, the helpful assistant for Flowbench - a free micro tools suite.

Your knowledge:
- 10 automation tools (Excel Fix It, Lead Scrubber, QR Generator, Image Studio, Invoice Extractor, YouTube Shorts, Blog Atomizer, Email Templater, Sheets Automation, PDF Filler)
- How to use each tool effectively
- Best practices for data processing
- Privacy and security features

Your personality:
- Helpful and encouraging
- Concise but complete
- Technical when needed, friendly always
- Always cite documentation when relevant

When users ask:
1. Recommend the right tool for their task
2. Explain how to configure it
3. Provide clear step-by-step guidance
4. Link to relevant documentation

You do NOT:
- Process files yourself (tools do that)
- Make up information not in documentation
- Recommend external paid tools
- Store user data or conversations`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory, context } = body as {
      message: string;
      conversationHistory?: Array<{ role: string; content: string }>;
      context?: any;
    };

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getCacheKey(message, context);
    const cached = getCached(cacheKey);

    if (cached) {
      trackEvent("ai_chat_cache_hit", { message: message.slice(0, 100) });
      
      return NextResponse.json({
        ...cached,
        cached: true,
      });
    }

    // Build enriched prompt with RAG
    const { messages, sources } = await buildEnrichedPrompt(
      message,
      IDANSSS_AI_SYSTEM_PROMPT
    );

    // Add conversation history if present
    if (conversationHistory && conversationHistory.length > 0) {
      messages.splice(1, 0, ...conversationHistory);
    }

    // Route to appropriate provider
    const startTime = Date.now();
    const aiRequest: AIRequest = {
      message,
      conversationHistory,
      context: {
        ...context,
        retrievedDocs: sources.map((s) => s.chunkText),
      },
    };

    const response = await routeAIRequest(aiRequest);

    // Add sources from RAG
    const sourcesWithMetadata = sources.map((doc) => ({
      title: getToolTitle(doc.docPath),
      url: doc.docPath,
      excerpt: doc.chunkText.slice(0, 150) + "...",
    }));

    const fullResponse = {
      ...response,
      sources: sourcesWithMetadata,
      suggestions: generateSuggestions(message),
    };

    // Cache the response
    setCached(cacheKey, fullResponse);

    // Track event
    trackEvent("ai_chat_completion", {
      provider: response.provider,
      tokens: response.tokens.total,
      latency: response.latency,
      cached: false,
    });

    return NextResponse.json(fullResponse);
  } catch (error) {
    console.error("AI chat error:", error);

    trackEvent("ai_chat_error", {
      error: error instanceof Error ? error.message : "Unknown",
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate response",
      },
      { status: 500 }
    );
  }
}

/**
 * Get human-readable tool title from path
 */
function getToolTitle(docPath: string): string {
  const toolMap: Record<string, string> = {
    "excel-fix-it": "Excel Fix It Bot",
    "lead-scrubber": "Lead Scrubber",
    "qr-generator": "QR Generator",
    "image-studio": "Image Studio",
    "invoice-extractor": "Invoice Extractor",
    "youtube-shorts": "YouTube Shorts Generator",
    "blog-atomizer": "Blog Atomizer",
    "email-templater": "Email Templater",
    "sheets-automation": "Sheets Automation",
    "pdf-filler": "PDF Filler",
  };

  for (const [slug, title] of Object.entries(toolMap)) {
    if (docPath.includes(slug)) {
      return title;
    }
  }

  return "Flowbench Documentation";
}

/**
 * Generate contextual follow-up suggestions
 */
function generateSuggestions(message: string): string[] {
  const lower = message.toLowerCase();

  if (lower.includes("excel") || lower.includes("csv") || lower.includes("spreadsheet")) {
    return [
      "Show me an example",
      "What about duplicates?",
      "How do I normalize dates?",
    ];
  }

  if (lower.includes("email") || lower.includes("lead") || lower.includes("contact")) {
    return [
      "Validate emails",
      "Remove duplicates",
      "Infer company domains",
    ];
  }

  if (lower.includes("qr") || lower.includes("code")) {
    return [
      "Generate QR codes",
      "What's error correction?",
      "Add signing",
    ];
  }

  if (lower.includes("image") || lower.includes("photo") || lower.includes("picture")) {
    return [
      "Batch resize images",
      "Convert to WebP",
      "Remove backgrounds",
    ];
  }

  return [
    "Show me all tools",
    "How does Flowbench work?",
    "Is it really free?",
  ];
}

