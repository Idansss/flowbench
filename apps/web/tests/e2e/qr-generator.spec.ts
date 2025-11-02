import { test, expect } from "@playwright/test";

test.describe("QR Generator Tool", () => {
  test("should display the tool page", async ({ page }) => {
    await page.goto("/tools/qr-generator");

    await expect(
      page.getByRole("heading", { name: /Bulk QR Generator/i })
    ).toBeVisible();

    // Check for upload zone
    await expect(page.getByText(/Upload Data/i)).toBeVisible();
    await expect(page.getByText(/CSV of names and fields/i)).toBeVisible();
  });

  test("should disable button when no files uploaded", async ({ page }) => {
    await page.goto("/tools/qr-generator");

    const generateButton = page.getByRole("button", { name: /Generate QR Codes/i });
    await expect(generateButton).toBeDisabled();
  });

  test("should show CSV upload instructions", async ({ page }) => {
    await page.goto("/tools/qr-generator");

    await expect(
      page.getByText(/Drag and drop files here/i)
    ).toBeVisible();
  });
});

