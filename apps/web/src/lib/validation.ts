/**
 * Zod validation schemas for all tool configurations
 */

import { z } from "zod";

// Excel Fix It Bot
export const excelFixItConfigSchema = z.object({
  dedupeRows: z.boolean().default(true),
  trimWhitespace: z.boolean().default(true),
  normalizeCase: z.enum(["none", "lower", "upper", "title"]).default("none"),
  fixDates: z.boolean().default(true),
  removeEmptyRows: z.boolean().default(true),
  splitColumn: z
    .object({
      column: z.string().min(1),
      delimiter: z.string().min(1),
    })
    .optional(),
  mergeColumns: z
    .object({
      columns: z.array(z.string()).min(1),
      template: z.string().min(1),
      targetColumn: z.string().optional(),
    })
    .optional(),
});

// Lead Scrubber
export const leadScrubberConfigSchema = z.object({
  normalizeNames: z.boolean().default(true),
  validateEmails: z.boolean().default(true),
  inferDomains: z.boolean().default(true),
  dedupeByEmail: z.boolean().default(true),
});

// Image Studio
export const imageStudioConfigSchema = z.object({
  removeBackground: z.boolean().default(false),
  resize: z
    .object({
      enabled: z.boolean(),
      width: z.number().int().min(100).max(4000),
      height: z.number().int().min(100).max(4000),
      fit: z.enum(["cover", "contain", "fill"]).default("cover"),
    })
    .optional(),
  format: z.enum(["webp", "png", "jpg"]).default("webp"),
  quality: z.number().int().min(1).max(100).default(80),
});

// QR Generator
export const qrGeneratorConfigSchema = z.object({
  errorCorrection: z.enum(["L", "M", "Q", "H"]).default("M"),
  size: z.number().int().min(100).max(1000).default(300),
  secret: z.string().optional(),
});

// Invoice Extractor
export const invoiceExtractorConfigSchema = z.object({
  extractLineItems: z.boolean().default(true),
  strictValidation: z.boolean().default(false),
  currencyHint: z.string().optional(),
});

// Sheets Automation
export const sheetsAutomationConfigSchema = z.object({
  recipe: z.enum(["label", "move", "rollup"]).default("label"),
  rules: z
    .array(
      z.object({
        condition: z.string().min(1),
        label: z.string().optional(),
        target: z.string().optional(),
      })
    )
    .optional(),
  groupColumn: z.string().optional(),
  sumColumn: z.string().optional(),
});

// PDF Filler
export const pdfFillerConfigSchema = z.object({
  fieldData: z.record(z.string()).default({}),
  flatten: z.boolean().default(true),
  preserveFormFields: z.boolean().default(false),
});

// Export all schemas
export const TOOL_CONFIG_SCHEMAS = {
  "excel-fix-it": excelFixItConfigSchema,
  "lead-scrubber": leadScrubberConfigSchema,
  "image-studio": imageStudioConfigSchema,
  "qr-generator": qrGeneratorConfigSchema,
  "invoice-extractor": invoiceExtractorConfigSchema,
  "sheets-automation": sheetsAutomationConfigSchema,
  "pdf-filler": pdfFillerConfigSchema,
} as const;

/**
 * Validate tool configuration against schema
 */
export function validateToolConfig(toolId: string, config: any): any {
  const schema = TOOL_CONFIG_SCHEMAS[toolId as keyof typeof TOOL_CONFIG_SCHEMAS];

  if (!schema) {
    // No schema = no validation (pass through)
    return config;
  }

  try {
    return schema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid configuration for ${toolId}: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
      );
    }
    throw error;
  }
}

