export function normalizeWhitespace(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number, suffix = "..."): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

export function normalizeName(name: string): string {
  // Trim, normalize whitespace, and title case
  return titleCase(normalizeWhitespace(name));
}

export function extractInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

export function splitByDelimiter(
  text: string,
  delimiter: string
): string[] {
  return text.split(delimiter).map((s) => s.trim());
}

export function mergeWithTemplate(
  template: string,
  values: Record<string, any>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
}

export function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const visibleLocal = local.slice(0, 2);
  return `${visibleLocal}***@${domain}`;
}

export function redactPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return "***-***-" + digits.slice(-4);
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9.-]/gi, "_");
}

