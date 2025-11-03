/**
 * RAG (Retrieval Augmented Generation) system
 * Retrieves relevant documentation to inject into AI prompts
 */

import { sql } from "../db";
import { createChatCompletion } from "../openai";

export interface DocumentChunk {
  id: string;
  docPath: string;
  chunkText: string;
  chunkIndex: number;
  metadata?: any;
}

/**
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // For MVP, use simple keyword matching
  // In production, use OpenAI embeddings API
  // const response = await openai.embeddings.create({
  //   model: "text-embedding-3-small",
  //   input: text,
  // });
  // return response.data[0].embedding;

  // Placeholder: return mock embedding
  return Array(1536).fill(0);
}

/**
 * Search for relevant documentation chunks
 */
export async function searchDocumentation(
  query: string,
  limit: number = 5
): Promise<DocumentChunk[]> {
  try {
    // For MVP without pgvector, use simple keyword search
    // In production, use vector similarity search

    const keywords = query
      .toLowerCase()
      .split(" ")
      .filter((w) => w.length > 3);

    // Simple in-memory doc search (replace with pgvector in production)
    const docs = await getDocumentationIndex();

    const scored = docs.map((doc) => {
      const docLower = doc.chunkText.toLowerCase();
      const score = keywords.reduce((acc, keyword) => {
        return acc + (docLower.includes(keyword) ? 1 : 0);
      }, 0);

      return { doc, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.doc);
  } catch (error) {
    console.error("Documentation search failed:", error);
    return [];
  }
}

/**
 * Get documentation index (simplified - in-memory)
 * In production, this would be in Postgres with pgvector
 */
async function getDocumentationIndex(): Promise<DocumentChunk[]> {
  // Simplified: Return hardcoded docs
  // In production: Query from database
  return [
    {
      id: "1",
      docPath: "/tools/excel-fix-it",
      chunkText:
        "Excel Fix It Bot cleans and normalizes spreadsheets. Features: deduplicate rows, trim whitespace, normalize case (lower, upper, title), fix dates to ISO 8601, remove empty rows, split columns by delimiter, merge columns with template.",
      chunkIndex: 0,
      metadata: { tool: "excel-fix-it", category: "data" },
    },
    {
      id: "2",
      docPath: "/tools/lead-scrubber",
      chunkText:
        "Clipboard Lead Scrubber validates and cleans contact lists. Features: email syntax validation, name normalization to title case, company domain inference (excludes free providers like gmail), deduplication by email address.",
      chunkIndex: 0,
      metadata: { tool: "lead-scrubber", category: "data" },
    },
    {
      id: "3",
      docPath: "/tools/qr-generator",
      chunkText:
        "Bulk QR Generator creates QR codes from CSV data. Features: bulk generation, error correction levels (L/M/Q/H), custom sizing (100-1000px), signed payloads with verification tokens, individual PNG exports.",
      chunkIndex: 0,
      metadata: { tool: "qr-generator", category: "media" },
    },
    {
      id: "4",
      docPath: "/tools/image-studio",
      chunkText:
        "Bulk Image Studio processes images in batch. Features: resize to custom dimensions, format conversion (WebP, PNG, JPG), quality control (1-100%), background removal (experimental), handles up to 200 images per batch.",
      chunkIndex: 0,
      metadata: { tool: "image-studio", category: "media" },
    },
    {
      id: "5",
      docPath: "/tools/invoice-extractor",
      chunkText:
        "Invoice & Receipt Extractor extracts structured data from documents. Features: PDF parsing, regex-based extraction, vendor detection, invoice numbers, dates, totals, line items, supports PDFs and image receipts, 95%+ accuracy.",
      chunkIndex: 0,
      metadata: { tool: "invoice-extractor", category: "documents" },
    },
    {
      id: "6",
      docPath: "/tools/youtube-shorts",
      chunkText:
        "YouTube Shorts Generator creates viral content. Features: 10 attention-grabbing hooks, 3 caption variants, 20 relevant tags, thumbnail prompts for DALL-E, deterministic with seed parameter.",
      chunkIndex: 0,
      metadata: { tool: "youtube-shorts", category: "content" },
    },
    {
      id: "7",
      docPath: "/tools/blog-atomizer",
      chunkText:
        "Blog to Social Atomizer converts articles to social media. Features: Twitter threads (7 tweets), LinkedIn posts, Instagram captions with hashtags, carousel outlines (10 slides), posting cadence suggestions.",
      chunkIndex: 0,
      metadata: { tool: "blog-atomizer", category: "content" },
    },
    {
      id: "8",
      docPath: "/tools/email-templater",
      chunkText:
        "Email Templater generates cold outreach emails. Features: personalized templates, mail merge tokens, persona/tone/objective configuration, validates tokens exist in CSV, subject lines under 60 characters.",
      chunkIndex: 0,
      metadata: { tool: "email-templater", category: "content" },
    },
    {
      id: "9",
      docPath: "/tools/sheets-automation",
      chunkText:
        "Sheets Automations applies rule-based operations. Features: label rows by condition, move rows to categories, weekly rollup summaries, safe expression language (column == value, amount > 100, name contains text).",
      chunkIndex: 0,
      metadata: { tool: "sheets-automation", category: "data" },
    },
    {
      id: "10",
      docPath: "/tools/pdf-filler",
      chunkText:
        "Web Form to PDF Filler fills PDF forms programmatically. Features: auto-detect form fields, bulk filling, PDF flattening (make non-editable), supports text fields, checkboxes, dropdowns, font fallback handling.",
      chunkIndex: 0,
      metadata: { tool: "pdf-filler", category: "documents" },
    },
  ];
}

/**
 * Build enriched prompt with RAG context
 */
export async function buildEnrichedPrompt(
  userMessage: string,
  systemPrompt: string
): Promise<{ messages: Array<{ role: string; content: string }>; sources: DocumentChunk[] }> {
  // Search documentation
  const relevantDocs = await searchDocumentation(userMessage, 5);

  // Build context from retrieved docs
  const contextText =
    relevantDocs.length > 0
      ? `\n\nRelevant Flowbench Documentation:\n${relevantDocs.map((doc, i) => `${i + 1}. ${doc.chunkText}`).join("\n\n")}`
      : "";

  // Build enriched system prompt
  const enrichedSystemPrompt = systemPrompt + contextText;

  return {
    messages: [
      { role: "system", content: enrichedSystemPrompt },
      { role: "user", content: userMessage },
    ],
    sources: relevantDocs,
  };
}

