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

  test("Should not show seed before request, but should show after completion", async ({
    page,
  }) => {
    await expect(page.locator("#seed-box")).toContainText(
      "No simulation loaded",
    );
    await page.fill('input[name="seed"]', "226");

    await page.click("#submit-button");

    // The seed should be populated and visibile
    await expect(page.locator("#seed-box")).toContainText(
      "Seed of the simulation is: 226",
    );
  });

  test("When seed is empty it must be random", async ({ page }) => {
    await page.fill('input[name="seed"]', "");

    await page.click("#submit-button");

    // The seed should be populated and visibile
    await expect(page.locator("#seed-box")).toContainText(
      "Seed of the simulation is:",
    );
    await expect(page.locator("#seed-box")).not.toContainText(
      "Seed of the simulation is: 226",
    );
  });

  test("Should clear seed when clicking reset", async ({ page }) => {
    await page.fill('input[name="seed"]', "226");
    await page.click("#submit-button");

    // The seed should be populated and visibile
    await expect(page.locator("#seed-box")).toContainText(
      "Seed of the simulation is: 226",
    );

    await page.click("#reset-button");
    await expect(page.locator("#seed-box")).toContainText(
      "No simulation loaded",
    );
  });

  test("Should clear form errors when clicking reset", async ({ page }) => {
    await page.fill('input[name="sensor_count"]', "-1");
    await page.click("#submit-button");

    await expect(page.locator("#error-box")).toBeVisible();

    await page.click("#reset-button");
    await expect(page.locator("#error-box")).not.toBeVisible();
  });

  test("animation control buttons should be enable when simulation has rendered and be disabled when resetting", async ({
    page,
  }) => {
    await page.click("#submit-button");

    await expect(page.locator("#play-pause-button")).toBeEnabled();
    await expect(page.locator("#prev-button")).toBeEnabled();
    await expect(page.locator("#next-button")).toBeEnabled();

    await page.click("#reset-button");

    await expect(page.locator("#play-pause-button")).toBeDisabled();
    await expect(page.locator("#prev-button")).toBeDisabled();
    await expect(page.locator("#next-button")).toBeDisabled();
  });

  test("animation control buttons should be disabled by default", async ({
    page,
  }) => {
    await expect(page.locator("#play-pause-button")).toBeDisabled();
    await expect(page.locator("#prev-button")).toBeDisabled();
    await expect(page.locator("#next-button")).toBeDisabled();
  });

  test("animation control buttons should be disabled when request has errored", async ({
    page,
  }) => {
    await page.fill('input[name="sensor_count"]', "-1");

    await page.click("#submit-button");

    await expect(page.locator("#play-pause-button")).toBeDisabled();
    await expect(page.locator("#prev-button")).toBeDisabled();
    await expect(page.locator("#next-button")).toBeDisabled();
  });
});
