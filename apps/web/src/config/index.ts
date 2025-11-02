import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  ENABLE_SENTRY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  ENABLE_POSTHOG: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
});

// Configuration with defaults
export const config = {
  // File upload limits
  fileSizeLimitMB: parseInt(process.env.FILE_SIZE_LIMIT_MB || "50", 10),
  fileSizeLimitBytes: parseInt(process.env.FILE_SIZE_LIMIT_MB || "50", 10) * 1024 * 1024,
  
  // Processing limits
  jobConcurrencyLimit: parseInt(process.env.JOB_CONCURRENCY_LIMIT || "5", 10),
  maxRowsPerFile: 100000,
  
  // Rate limiting
  rateLimitPerIP: parseInt(process.env.RATE_LIMIT_PER_IP || "100", 10),
  rateLimitPerUser: parseInt(process.env.RATE_LIMIT_PER_USER || "500", 10),
  rateLimitWindowMinutes: 60,
  
  // Data retention
  fileRetentionHours: parseInt(process.env.FILE_RETENTION_HOURS || "24", 10),
  extendedRetentionHours: 168, // 7 days
  
  // Observability
  enableSentry: process.env.ENABLE_SENTRY === "true",
  sentryDSN: process.env.SENTRY_DSN,
  enablePosthog: process.env.ENABLE_POSTHOG === "true",
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  
  // Feature flags
  features: {
    anonymousSessions: true,
    extendedRetention: true,
    telemetryOptIn: true,
  },
  
  // Supported file types
  supportedFileTypes: {
    documents: [".csv", ".xlsx", ".xls", ".pdf"],
    images: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    archives: [".zip"],
  },
  
  // AI settings
  openai: {
    temperature: 0.2,
    maxTokens: 2000,
    defaultSeed: 42,
    disableLogging: true, // OpenAI request logging
  },
};

// Tools registry
export const tools = [
  {
    id: "excel-fix-it",
    name: "Excel Fix It Bot",
    slug: "excel-fix-it",
    description: "Clean and normalize spreadsheets with deduplication, formatting, and validation",
    icon: "FileSpreadsheet",
    category: "data",
  },
  {
    id: "invoice-extractor",
    name: "Invoice & Receipt Extractor",
    slug: "invoice-extractor",
    description: "Extract structured data from invoices and receipts",
    icon: "Receipt",
    category: "documents",
  },
  {
    id: "image-studio",
    name: "Bulk Image Studio",
    slug: "image-studio",
    description: "Background removal, resizing, and batch conversion",
    icon: "ImageIcon",
    category: "media",
  },
  {
    id: "lead-scrubber",
    name: "Clipboard Lead Scrubber",
    slug: "lead-scrubber",
    description: "Clean and validate contact lists with smart normalization",
    icon: "Users",
    category: "data",
  },
  {
    id: "youtube-shorts",
    name: "YouTube Shorts Generator",
    slug: "youtube-shorts",
    description: "Create captions, hooks, and tags for short-form videos",
    icon: "Video",
    category: "content",
  },
  {
    id: "blog-atomizer",
    name: "Blog to Social Atomizer",
    slug: "blog-atomizer",
    description: "Convert blog posts into social media content",
    icon: "Share2",
    category: "content",
  },
  {
    id: "qr-generator",
    name: "Bulk QR Generator",
    slug: "qr-generator",
    description: "Create QR codes for events with custom templates",
    icon: "QrCode",
    category: "media",
  },
  {
    id: "email-templater",
    name: "Email Templater",
    slug: "email-templater",
    description: "Generate personalized cold outreach emails",
    icon: "Mail",
    category: "content",
  },
  {
    id: "sheets-automation",
    name: "Sheets Automations",
    slug: "sheets-automation",
    description: "Rule-based spreadsheet operations and transformations",
    icon: "Workflow",
    category: "data",
  },
  {
    id: "pdf-filler",
    name: "Web Form to PDF Filler",
    slug: "pdf-filler",
    description: "Fill PDF forms programmatically",
    icon: "FileText",
    category: "documents",
  },
] as const;

export type ToolId = (typeof tools)[number]["id"];
export type ToolSlug = (typeof tools)[number]["slug"];

