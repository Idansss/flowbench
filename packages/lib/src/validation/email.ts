import { z } from "zod";

// RFC 5322 compliant email regex (simplified)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return emailRegex.test(email);
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function extractDomain(email: string): string | null {
  if (!isValidEmail(email)) return null;
  return email.split("@")[1].toLowerCase();
}

export function inferCompanyDomain(email: string): string | null {
  const domain = extractDomain(email);
  if (!domain) return null;

  // Filter out common free email providers
  const freeProviders = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "aol.com",
    "mail.com",
    "protonmail.com",
  ];

  if (freeProviders.includes(domain)) {
    return null;
  }

  return domain;
}

export const emailSchema = z
  .string()
  .email()
  .transform((email) => normalizeEmail(email));

export interface EmailValidationResult {
  isValid: boolean;
  normalized: string;
  domain: string | null;
  companyDomain: string | null;
  reason?: string;
}

export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim();

  if (!trimmed) {
    return {
      isValid: false,
      normalized: "",
      domain: null,
      companyDomain: null,
      reason: "Empty email",
    };
  }

  const isValid = isValidEmail(trimmed);
  const normalized = normalizeEmail(trimmed);
  const domain = extractDomain(trimmed);
  const companyDomain = inferCompanyDomain(trimmed);

  return {
    isValid,
    normalized: isValid ? normalized : trimmed,
    domain,
    companyDomain,
    reason: isValid ? undefined : "Invalid email format",
  };
}

