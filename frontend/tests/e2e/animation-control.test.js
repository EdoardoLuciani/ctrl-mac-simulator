import { test, expect } from "@playwright/test";

test.describe("Ctrl-Mac Simulator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
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
