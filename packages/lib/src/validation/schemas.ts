import { z } from "zod";

// Common validation schemas

export const fileUploadSchema = z.object({
  name: z.string(),
  size: z.number().max(50 * 1024 * 1024, "File size must be less than 50MB"),
  type: z.string(),
});

export const jobSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  toolId: z.string(),
  status: z.enum(["created", "running", "succeeded", "failed", "cancelled"]),
  inputConfig: z.record(z.any()).optional(),
  resultSummary: z.record(z.any()).optional(),
  errorMessage: z.string().optional(),
  startedAt: z.date().nullable(),
  completedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const auditLogSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  stepNumber: z.number(),
  stepName: z.string(),
  description: z.string(),
  inputSummary: z.record(z.any()).optional(),
  outputSummary: z.record(z.any()).optional(),
  warnings: z.array(z.string()).optional(),
  counts: z.record(z.number()).optional(),
  durationMs: z.number().optional(),
  createdAt: z.date(),
});

export const presetSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  toolId: z.string(),
  name: z.string().min(1).max(100),
  config: z.record(z.any()),
  isDefault: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Tool-specific schemas

export const excelFixItConfigSchema = z.object({
  dedupeRows: z.boolean().default(true),
  trimWhitespace: z.boolean().default(true),
  normalizeCase: z
    .enum(["none", "lower", "upper", "title"])
    .default("none"),
  fixDates: z.boolean().default(true),
  removeEmptyRows: z.boolean().default(true),
  splitColumn: z
    .object({
      column: z.string(),
      delimiter: z.string(),
    })
    .optional(),
  mergeColumns: z
    .object({
      columns: z.array(z.string()),
      template: z.string(),
    })
    .optional(),
});

export const leadScrubberConfigSchema = z.object({
  normalizeNames: z.boolean().default(true),
  validateEmails: z.boolean().default(true),
  inferDomains: z.boolean().default(true),
  dedupeByEmail: z.boolean().default(true),
});

export const imageStudioConfigSchema = z.object({
  removeBackground: z.boolean().default(false),
  resize: z
    .object({
      width: z.number().positive(),
      height: z.number().positive(),
      fit: z.enum(["cover", "contain", "fill"]).default("cover"),
    })
    .optional(),
  format: z.enum(["webp", "png", "jpg"]).default("webp"),
  quality: z.number().min(1).max(100).default(80),
});

export const qrGeneratorConfigSchema = z.object({
  errorCorrection: z.enum(["L", "M", "Q", "H"]).default("M"),
  size: z.number().min(100).max(1000).default(300),
  includeText: z.boolean().default(true),
  logoUrl: z.string().url().optional(),
});

