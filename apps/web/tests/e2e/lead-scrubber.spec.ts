import { test, expect } from "@playwright/test";

test.describe("Lead Scrubber Tool", () => {
  test("should display the tool page", async ({ page }) => {
    await page.goto("/tools/lead-scrubber");

    await expect(
      page.getByRole("heading", { name: /Clipboard Lead Scrubber/i })
    ).toBeVisible();

    // Check for upload zone
    await expect(page.getByText(/Upload Lead List/i)).toBeVisible();
    await expect(page.getByText(/CSV export or pasted table/i)).toBeVisible();
  });

  test("should disable button when no files uploaded", async ({ page }) => {
    await page.goto("/tools/lead-scrubber");

    const cleanButton = page.getByRole("button", { name: /Clean Leads/i });
    await expect(cleanButton).toBeDisabled();
  });

  test("should show upload instructions", async ({ page }) => {
    await page.goto("/tools/lead-scrubber");

    await expect(
      page.getByText(/Drag and drop files here/i)
    ).toBeVisible();
  });
});

