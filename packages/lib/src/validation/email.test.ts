import { describe, it, expect } from "@jest/globals";
import {
  isValidEmail,
  normalizeEmail,
  extractDomain,
  inferCompanyDomain,
  validateEmail,
} from "./email";

describe("Email Validation", () => {
  describe("isValidEmail", () => {
    it("should validate correct emails", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@company.co.uk")).toBe(true);
      expect(isValidEmail("first+last@domain.com")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(isValidEmail("notanemail")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("normalizeEmail", () => {
    it("should lowercase and trim emails", () => {
      expect(normalizeEmail(" USER@EXAMPLE.COM ")).toBe("user@example.com");
      expect(normalizeEmail("Test@Test.com")).toBe("test@test.com");
    });
  });

  describe("extractDomain", () => {
    it("should extract domain from valid emails", () => {
      expect(extractDomain("user@example.com")).toBe("example.com");
      expect(extractDomain("test@company.co.uk")).toBe("company.co.uk");
    });

    it("should return null for invalid emails", () => {
      expect(extractDomain("notanemail")).toBe(null);
      expect(extractDomain("@example.com")).toBe(null);
    });
  });

  describe("inferCompanyDomain", () => {
    it("should return company domains", () => {
      expect(inferCompanyDomain("user@acmecorp.com")).toBe("acmecorp.com");
      expect(inferCompanyDomain("test@startup.io")).toBe("startup.io");
    });

    it("should exclude free email providers", () => {
      expect(inferCompanyDomain("user@gmail.com")).toBe(null);
      expect(inferCompanyDomain("test@yahoo.com")).toBe(null);
      expect(inferCompanyDomain("person@hotmail.com")).toBe(null);
    });
  });

  describe("validateEmail", () => {
    it("should provide complete validation results", () => {
      const result = validateEmail("USER@EXAMPLE.COM");
      
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe("user@example.com");
      expect(result.domain).toBe("example.com");
      expect(result.companyDomain).toBe("example.com");
      expect(result.reason).toBeUndefined();
    });

    it("should handle invalid emails", () => {
      const result = validateEmail("invalid");
      
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Invalid email format");
    });

    it("should handle empty input", () => {
      const result = validateEmail("");
      
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Empty email");
    });
  });
});

