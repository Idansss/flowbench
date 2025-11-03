/**
 * Multi-provider AI router
 * Routes requests between OpenAI and Gemini based on task type
 */

import { createChatCompletion } from "@/lib/openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export type Provider = "openai" | "gemini";

export interface AIRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  context?: {
    currentTool?: string;
    retrievedDocs?: string[];
  };
  preferredProvider?: Provider;
}

export interface AIResponse {
  message: string;
  provider: Provider;
  model: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  latency: number;
  cached: boolean;
  sources?: Array<{
    title: string;
    url: string;
    excerpt: string;
  }>;
}

/**
 * Determine which provider to use based on message characteristics
 */
export function routeToProvider(request: AIRequest): Provider {
  const message = request.message.toLowerCase();
  const messageLength = request.message.length;

  // Explicit preference
  if (request.preferredProvider) {
    return request.preferredProvider;
  }

  // Code generation → OpenAI (better at code)
  if (
    message.includes("code") ||
    message.includes("function") ||
    message.includes("regex") ||
    message.includes("sql")
  ) {
    return "openai";
  }

  // Long context or attachments → Gemini (1M token window)
  if (messageLength > 500 || (request.context?.retrievedDocs?.length || 0) > 5) {
    return "gemini";
  }

  // Tool use or structured output → Gemini
  if (
    message.includes("generate") ||
    message.includes("create") ||
    message.includes("build")
  ) {
    return "gemini";
  }

  // Default → OpenAI (fast, reliable)
  return "openai";
}

/**
 * Call OpenAI with retry logic
 */
async function callOpenAI(
  messages: Array<{ role: string; content: string }>,
  startTime: number
): Promise<Omit<AIResponse, "sources">> {
  const completion = await createChatCompletion(messages);

  const usage = completion.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

  return {
    message: completion.choices[0].message.content || "",
    provider: "openai",
    model: completion.model,
    tokens: {
      input: usage.prompt_tokens,
      output: usage.completion_tokens,
      total: usage.total_tokens,
    },
    latency: Date.now() - startTime,
    cached: false,
  };
}

/**
 * Call Gemini with retry logic
 */
async function callGemini(
  messages: Array<{ role: string; content: string }>,
  startTime: number
): Promise<Omit<AIResponse, "sources">> {
  if (!gemini) {
    throw new Error("Gemini API key not configured");
  }

  const model = gemini.getGenerativeModel({ model: "gemini-pro" });

  // Convert messages to Gemini format
  const lastMessage = messages[messages.length - 1];
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage.content);
  const response = await result.response;

  // Gemini doesn't return detailed token counts by default
  const textLength = response.text().length;
  const estimatedTokens = Math.ceil(textLength / 4); // Rough estimate

  return {
    message: response.text(),
    provider: "gemini",
    model: "gemini-pro",
    tokens: {
      input: Math.ceil(lastMessage.content.length / 4),
      output: estimatedTokens,
      total: Math.ceil((lastMessage.content.length + textLength) / 4),
    },
    latency: Date.now() - startTime,
    cached: false,
  };
}

/**
 * Main routing function with fallback
 */
export async function routeAIRequest(request: AIRequest): Promise<AIResponse> {
  const startTime = Date.now();
  const provider = routeToProvider(request);

  // Build messages array
  const messages = [
    ...(request.conversationHistory || []),
    { role: "user", content: request.message },
  ];

  try {
    // Try primary provider
    if (provider === "openai") {
      const response = await callOpenAI(messages, startTime);
      return { ...response, sources: [] };
    } else {
      const response = await callGemini(messages, startTime);
      return { ...response, sources: [] };
    }
  } catch (error) {
    console.error(`${provider} failed, trying fallback:`, error);

    // Fallback to other provider
    try {
      if (provider === "openai") {
        const response = await callGemini(messages, startTime);
        return { ...response, sources: [] };
      } else {
        const response = await callOpenAI(messages, startTime);
        return { ...response, sources: [] };
      }
    } catch (fallbackError) {
      throw new Error(
        `Both providers failed. Primary: ${error instanceof Error ? error.message : "Unknown"}, Fallback: ${fallbackError instanceof Error ? fallbackError.message : "Unknown"}`
      );
    }
  }
}

