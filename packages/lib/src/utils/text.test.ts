import { describe, it, expect } from "@jest/globals";
import {
  normalizeWhitespace,
  titleCase,
  slugify,
  truncate,
  normalizeName,
  extractInitials,
  splitByDelimiter,
  mergeWithTemplate,
  countWords,
  sanitizeFilename,
} from "./text";

describe("Text Utilities", () => {
  describe("normalizeWhitespace", () => {
    it("should collapse multiple spaces", () => {
      expect(normalizeWhitespace("hello    world")).toBe("hello world");
      expect(normalizeWhitespace("  trim  me  ")).toBe("trim me");
    });
  });

  describe("titleCase", () => {
    it("should convert to title case", () => {
      expect(titleCase("hello world")).toBe("Hello World");
      expect(titleCase("HELLO WORLD")).toBe("Hello World");
      expect(titleCase("hELLo wOrLd")).toBe("Hello World");
    });
  });

  describe("slugify", () => {
    it("should create URL-safe slugs", () => {
      expect(slugify("Hello World!")).toBe("hello-world");
      expect(slugify("Test@123#456")).toBe("test123456");
      expect(slugify("  Spaces  Everywhere  ")).toBe("spaces-everywhere");
    });
  });

  describe("truncate", () => {
    it("should truncate long strings", () => {
      expect(truncate("Hello World", 8)).toBe("Hello...");
      expect(truncate("Short", 10)).toBe("Short");
      expect(truncate("Hello World", 8, ">>")).toBe("Hello>>");
    });
  });

  describe("normalizeName", () => {
    it("should normalize names properly", () => {
      expect(normalizeName("  john doe  ")).toBe("John Doe");
      expect(normalizeName("JANE SMITH")).toBe("Jane Smith");
    });
  });

  describe("extractInitials", () => {
    it("should extract initials from names", () => {
      expect(extractInitials("John Doe")).toBe("JD");
      expect(extractInitials("Jane Mary Smith")).toBe("JM");
      expect(extractInitials("Bob")).toBe("B");
    });
  });

  describe("splitByDelimiter", () => {
    it("should split and trim", () => {
      expect(splitByDelimiter("one, two, three", ",")).toEqual(["one", "two", "three"]);
      expect(splitByDelimiter("a|b|c", "|")).toEqual(["a", "b", "c"]);
    });
  });

  describe("mergeWithTemplate", () => {
    it("should merge values into template", () => {
      const result = mergeWithTemplate("{firstName} {lastName}", {
        firstName: "John",
        lastName: "Doe",
      });
      expect(result).toBe("John Doe");
    });

    it("should handle missing values", () => {
      const result = mergeWithTemplate("{name} at {company}", {
        name: "John",
      });
      expect(result).toBe("John at {company}");
    });
  });

  describe("countWords", () => {
    it("should count words correctly", () => {
      expect(countWords("Hello world")).toBe(2);
      expect(countWords("One two three four five")).toBe(5);
      expect(countWords("  Spaces  everywhere  ")).toBe(2);
    });
  });

  describe("sanitizeFilename", () => {
    it("should create safe filenames", () => {
      expect(sanitizeFilename("My File!.txt")).toBe("My_File_.txt");
      expect(sanitizeFilename("test@123#file.csv")).toBe("test_123_file.csv");
    });
  });
});

