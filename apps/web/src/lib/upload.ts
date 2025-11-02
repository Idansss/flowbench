/**
 * File upload utilities with content scanning and validation
 */

import { config } from "@/config";

// File signatures (magic numbers) for validation
const FILE_SIGNATURES: Record<string, number[][]> = {
  pdf: [[0x25, 0x50, 0x44, 0x46]], // %PDF
  png: [[0x89, 0x50, 0x4e, 0x47]],
  jpg: [[0xff, 0xd8, 0xff]],
  zip: [[0x50, 0x4b, 0x03, 0x04], [0x50, 0x4b, 0x05, 0x06]],
  xlsx: [[0x50, 0x4b, 0x03, 0x04]], // ZIP-based
};

// Executable file signatures to block
const EXECUTABLE_SIGNATURES = {
  exe: [[0x4d, 0x5a]], // MZ
  elf: [[0x7f, 0x45, 0x4c, 0x46]], // ELF
  mach: [[0xca, 0xfe, 0xba, 0xbe]], // Mach-O
  script: [[0x23, 0x21]], // Shebang #!
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Check file signature matches claimed type
 */
export function validateFileSignature(
  buffer: ArrayBuffer,
  expectedType: string
): boolean {
  const bytes = new Uint8Array(buffer.slice(0, 8));
  const signatures = FILE_SIGNATURES[expectedType];

  if (!signatures) return true; // Unknown type, allow

  return signatures.some((sig) =>
    sig.every((byte, index) => bytes[index] === byte)
  );
}

/**
 * Check if file is an executable
 */
export function isExecutable(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer.slice(0, 4));

  return Object.values(EXECUTABLE_SIGNATURES).some((signatures) =>
    signatures.some((sig) =>
      sig.every((byte, index) => bytes[index] === byte)
    )
  );
}

/**
 * Validate file before processing
 */
export async function validateFile(file: File): Promise<FileValidationResult> {
  const warnings: string[] = [];

  // Check file size
  if (file.size > config.fileSizeLimitBytes) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds limit of ${config.fileSizeLimitMB}MB`,
    };
  }

  // Check file extension
  const ext = file.name.split(".").pop()?.toLowerCase();
  const allowedExtensions = [
    ...config.supportedFileTypes.documents,
    ...config.supportedFileTypes.images,
    ...config.supportedFileTypes.archives,
  ].map((e) => e.replace(".", ""));

  if (ext && !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File type .${ext} not allowed`,
    };
  }

  // Read file header for content scanning
  const buffer = await file.slice(0, 4096).arrayBuffer();

  // Block executables
  if (isExecutable(buffer)) {
    return {
      valid: false,
      error: "Executable files are not allowed for security reasons",
    };
  }

  // Validate file signature matches extension
  if (ext && FILE_SIGNATURES[ext]) {
    if (!validateFileSignature(buffer, ext)) {
      warnings.push(
        `File signature doesn't match .${ext} extension - may be mislabeled`
      );
    }
  }

  // Check for empty files
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validate multiple files
 */
export async function validateFiles(
  files: File[]
): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const file of files) {
    const result = await validateFile(file);

    if (!result.valid) {
      errors.push(`${file.name}: ${result.error}`);
    }

    if (result.warnings) {
      warnings.push(...result.warnings.map((w) => `${file.name}: ${w}`));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Scan file content for suspicious patterns
 */
export function scanFileContent(content: string | Buffer): {
  suspicious: boolean;
  reasons: string[];
} {
  const text = typeof content === "string" ? content : content.toString("utf-8");
  const reasons: string[] = [];

  // Check for script tags
  if (/<script[^>]*>/.test(text)) {
    reasons.push("Contains script tags");
  }

  // Check for SQL injection patterns
  if (/(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b).*\bTABLE\b/i.test(text)) {
    reasons.push("Contains SQL-like commands");
  }

  // Check for base64 executables (simplified)
  if (/TVqQAAMAAAAEAAAA/.test(text)) {
    reasons.push("Contains base64-encoded executable");
  }

  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}

