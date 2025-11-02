import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { join } from "path";

test.describe("Excel Fix It Bot", () => {
  test("should display the tool page", async ({ page }) => {
    await page.goto("/tools/excel-fix-it");

    await expect(
      page.getByRole("heading", { name: /Excel Fix It Bot/i })
    ).toBeVisible();

    // Check that all option controls are present
    await expect(page.getByText(/Deduplicate rows/i)).toBeVisible();
    await expect(page.getByText(/Trim whitespace/i)).toBeVisible();
    await expect(page.getByText(/Normalize case/i)).toBeVisible();
    await expect(page.getByText(/Fix dates to ISO/i)).toBeVisible();
    await expect(page.getByText(/Remove empty rows/i)).toBeVisible();
  });

  test("should disable run button when no files selected", async ({ page }) => {
    await page.goto("/tools/excel-fix-it");

    const runButton = page.getByRole("button", { name: /run/i });
    await expect(runButton).toBeDisabled();
  });

  // Note: File upload testing would require a mock API or test environment
  // This is a placeholder for the structure
  test.skip("should process a CSV file", async ({ page }) => {
    await page.goto("/tools/excel-fix-it");

    // Upload file
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.locator('input[type="file"]').click();
    const fileChooser = await fileChooserPromise;

    const samplePath = join(
      process.cwd(),
      "../../infra/samples/sample-data.csv"
    );
    await fileChooser.setFiles(samplePath);

    // Click run
    await page.getByRole("button", { name: /run/i }).click();

    // Wait for results
    await expect(page.getByText(/Processing complete/i)).toBeVisible({
      timeout: 30000,
    });
  });
});

