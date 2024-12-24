import { test, expect, devices } from "@playwright/test";

[
  { width: 960, height: 720, expected: 365 },
  { width: 1920, height: 1080, expected: 922 },
  { width: 2560, height: 1440, expected: 1229 },
  { width: 3840, height: 2160, expected: 1843 },
].forEach(({ width, height, expected }) => {
  // You can also do it with test.describe() or with multiple tests as long the test name is unique.
  test(`should size the canvas correctly on ${height}p`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");

    await expect(page).toHaveTitle("Ctrl-Mac Simulator");
    await expect(page.locator("h2").first()).toHaveText("Simulation interface");

    const canvas = await page.locator("canvas");

    // Check if canvas exists
    await expect(canvas).toBeVisible();
    const canvasWidth = await canvas.evaluate((el) => el.width);
    const canvasHeight = await canvas.evaluate((el) => el.height);
    expect(canvasWidth).toBe(canvasHeight);
    expect(canvasHeight).toBe(expected);
  });
});
