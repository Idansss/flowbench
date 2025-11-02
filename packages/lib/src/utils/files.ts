export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

export function getFileName(filename: string): string {
  const parts = filename.split(".");
  return parts.slice(0, -1).join(".");
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext);
}

export function isDocumentFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ["pdf", "doc", "docx", "txt", "csv", "xlsx", "xls"].includes(ext);
}

export function isSpreadsheetFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ["csv", "xlsx", "xls"].includes(ext);
}

export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);
  const mimeTypes: Record<string, string> = {
    csv: "text/csv",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    zip: "application/zip",
  };

  return mimeTypes[ext] || "application/octet-stream";
}

export function generateUniqueFilename(
  originalName: string,
  prefix?: string
): string {
  const ext = getFileExtension(originalName);
  const name = getFileName(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  const parts = [prefix, name, timestamp, random].filter(Boolean);
  return `${parts.join("_")}.${ext}`;
}

export function validateFileSize(
  file: File,
  maxSizeMB: number
): { valid: boolean; error?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size ${formatFileSize(file.size)} exceeds maximum ${maxSizeMB}MB`,
    };
  }
  return { valid: true };
}

export function validateFileType(
  file: File,
  allowedExtensions: string[]
): { valid: boolean; error?: string } {
  const ext = getFileExtension(file.name);
  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File type .${ext} not allowed. Allowed: ${allowedExtensions.join(", ")}`,
    };
  }
  return { valid: true };
}

export async function calculateChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

