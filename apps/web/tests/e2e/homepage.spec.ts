import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should display the homepage with all tools", async ({ page }) => {
    await page.goto("/");

    // Check hero section
    await expect(
      page.getByRole("heading", { name: /Free Micro Tools Suite/i })
    ).toBeVisible();

    // Check that all 10 tools are displayed
    await expect(page.getByText("Excel Fix It Bot")).toBeVisible();
    await expect(page.getByText("Invoice & Receipt Extractor")).toBeVisible();
    await expect(page.getByText("Bulk Image Studio")).toBeVisible();
    await expect(page.getByText("Clipboard Lead Scrubber")).toBeVisible();
    await expect(page.getByText("YouTube Shorts Generator")).toBeVisible();
    await expect(page.getByText("Blog to Social Atomizer")).toBeVisible();
    await expect(page.getByText("Bulk QR Generator")).toBeVisible();
    await expect(page.getByText("Email Templater")).toBeVisible();
    await expect(page.getByText("Sheets Automations")).toBeVisible();
    await expect(page.getByText("Web Form to PDF Filler")).toBeVisible();
  });

  test("should navigate to a tool page", async ({ page }) => {
    await page.goto("/");

    // Click on Excel Fix It Bot
    await page.getByRole("link", { name: /Excel Fix It Bot/ }).first().click();

    // Should navigate to tool page
    await expect(page).toHaveURL(/\/tools\/excel-fix-it/);
    await expect(
      page.getByRole("heading", { name: /Excel Fix It Bot/i })
    ).toBeVisible();
  });

  test("should navigate to docs", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /docs/i }).first().click();
    await expect(page).toHaveURL(/\/docs/);
    await expect(
      page.getByRole("heading", { name: /Documentation/i })
    ).toBeVisible();
  });

  test("should navigate to privacy policy", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /privacy/i }).first().click();
    await expect(page).toHaveURL(/\/privacy/);
    await expect(
      page.getByRole("heading", { name: /Privacy Policy/i })
    ).toBeVisible();
  });
});

