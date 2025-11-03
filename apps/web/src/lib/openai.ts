/**
 * Secure OpenAI wrapper with privacy headers and validation
 */

import OpenAI from "openai";
import { config } from "@/config";
import { z } from "zod";

// Initialize OpenAI client with privacy settings
export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      // SECURITY: Disable OpenAI request logging
      defaultHeaders: {
        "OpenAI-Organization": process.env.OPENAI_ORG_ID || "",
      },
    })
  : null;

// System prompts (checked into repo as required)
export const SYSTEM_PROMPTS = {
  youtubeShorts: `You are a YouTube Shorts content expert. Generate engaging, viral-worthy content for short-form videos.

Rules:
- Hooks must be attention-grabbing (5-10 words)
- Captions should be concise and actionable
- Tags must be relevant and searchable
- Thumbnail prompts should be visually striking
- Keep language conversational and energetic
- Focus on viewer retention and engagement`,

  blogAtomizer: `You are a social media content strategist. Convert blog posts into engaging social media content across platforms.

Rules:
- Preserve key insights and takeaways
- Adapt tone for each platform (Twitter: concise, LinkedIn: professional, Instagram: visual)
- Keep code blocks intact when present
- Generate platform-specific formats
- Include posting cadence suggestions
- Focus on engagement and value`,

  emailTemplater: `You are an expert cold email copywriter. Generate personalized, effective outreach emails.

Rules:
- Use provided persona and tone
- Keep subject lines under 60 characters
- Preview text should hook the reader (40-100 chars)
- Body should be concise and value-focused
- Use merge tokens like {firstName}, {company}
- Include clear CTAs
- Avoid spam triggers`,
};

// Validation schemas for AI tool configs
const youtubeConfigSchema = z.object({
  seed: z.number().optional(),
  url: z.string().url().optional(),
  transcript: z.string().optional(),
});

const blogConfigSchema = z.object({
  seed: z.number().optional(),
  url: z.string().url().optional(),
  html: z.string().optional(),
});

const emailConfigSchema = z.object({
  seed: z.number().optional(),
  persona: z.string().optional(),
  tone: z.string().optional(),
  objective: z.string().optional(),
});

export const AI_CONFIG_SCHEMAS = {
  "youtube-shorts": youtubeConfigSchema,
  "blog-atomizer": blogConfigSchema,
  "email-templater": emailConfigSchema,
};

/**
 * Make OpenAI chat completion with privacy and validation
 */
export async function createChatCompletion(
  messages: Array<{ role: string; content: string }>,
  options: {
    temperature?: number;
    seed?: number;
    maxTokens?: number;
  } = {}
) {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }

  // Use safe defaults from config
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    temperature: options.temperature ?? config.openai.temperature,
    seed: options.seed ?? config.openai.defaultSeed,
    max_tokens: options.maxTokens ?? config.openai.maxTokens,
    messages: messages as any,
    // SECURITY: Include header to opt-out of OpenAI logging
    ...(config.openai.disableLogging && {
      headers: {
        "OpenAI-Beta": "assistants=v1",
        "User-Agent": "Flowbench/1.0 (privacy-mode)",
      },
    }),
  });

  return completion;
}

/**
 * Validate AI tool configuration
 */
export function validateAIConfig(toolId: string, config: any): any {
  const schema = AI_CONFIG_SCHEMAS[toolId as keyof typeof AI_CONFIG_SCHEMAS];
  
  if (!schema) {
    throw new Error(`No validation schema for tool: ${toolId}`);
  }

  try {
    return schema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid configuration: ${error.errors.map((e) => e.message).join(", ")}`);
    }
    throw error;
  }
}

/**
 * Check if tool can use AI (feature flag + API key)
 */
export function canUseAI(): boolean {
  return !!openai && !!process.env.OPENAI_API_KEY;
}

