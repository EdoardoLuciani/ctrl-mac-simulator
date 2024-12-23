import { test, expect } from "@playwright/test";

test.describe("Ctrl-Mac Simulator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should show error for multiple invalid input", async ({ page }) => {
    await page.fill('input[name="sensor_count"]', "-1");
    await page.fill('input[name="max_cycles"]', "-1");

    await page.click("#submit-button");

    // Check if error message appears
    const errorBox = page.locator("#error-box");
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText("Error");
    await expect(errorBox).toContainText("sensor_count");
    await expect(errorBox).toContainText("max_cycles");
  });

  test("should show loading widget which disappears after request has completed", async ({
    page,
  }) => {
    await page.route("*/api/simulate", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Add 1s delay

      let loadingText = page.locator("#loading-text");
      await expect(loadingText).toBeVisible();
      await expect(loadingText).toContainText(
        "Computing the simulation just for you",
      );

      await route.continue();
    });

    await page.click("#submit-button");

    // After max 5 seconds the loading text should be hidden
    await expect(page.locator("#loading-text")).toBeHidden();
  });
});
