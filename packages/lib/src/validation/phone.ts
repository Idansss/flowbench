// Basic phone validation without external libraries
// For production, consider libphonenumber-js

export function normalizePhone(phone: string): string {
  // Remove all non-digit characters except +
  return phone.replace(/[^\d+]/g, "");
}

export function formatPhoneUS(phone: string): string | null {
  const normalized = normalizePhone(phone);
  const digits = normalized.replace(/\+?1?/, "");

  if (digits.length !== 10) return null;

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function isValidPhoneUS(phone: string): boolean {
  const normalized = normalizePhone(phone);
  const digits = normalized.replace(/\+?1?/, "");
  return digits.length === 10 && /^\d+$/.test(digits);
}

