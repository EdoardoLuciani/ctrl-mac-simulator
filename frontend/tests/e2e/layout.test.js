import { test, expect } from "@playwright/test";

test.describe("Ctrl-Mac Simulator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the simulator page correctly", async ({ page }) => {
    await expect(page).toHaveTitle("Ctrl-Mac Simulator");
    await expect(page.locator("h2").first()).toHaveText("Simulation interface");
  });

  test("should display another page when clicking navbar buttons", async ({
    page,
  }) => {
    // Test Protocol Explanation page navigation
    await page.click('a[href="/src/pages/protocol-explanation.html"]');
    await expect(page).toHaveURL(/.*protocol-explanation.html/);
    await expect(page.getByText(/About the Ctrl-Mac protocol/)).toBeVisible();

    // Test Instructions page navigation
    await page.click('a[href="/src/pages/tutorial.html"]');
    await expect(page).toHaveURL(/.*tutorial.html/);
    await expect(page.getByText(/How to use/)).toBeVisible();

    // Test About page navigation
    await page.click('a[href="/src/pages/about.html"]');
    await expect(page).toHaveURL(/.*about.html/);
    await expect(page.getByText(/About Ctrl-Mac Simulator/)).toBeVisible();

    // Test navigation back to Simulator page
    await page.click('a[href="/index.html"]');
    await expect(page).toHaveURL(/.*index.html/);
    await expect(page.getByText(/Simulation interface/)).toBeVisible();
  });
});
