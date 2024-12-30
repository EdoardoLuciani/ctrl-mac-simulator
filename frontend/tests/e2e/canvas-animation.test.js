import { test, expect } from "@playwright/test";

test.describe("Ctrl-Mac Simulator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("Canvas rendering", () => {
    test("should render with 6 sensors", async ({ page }) => {
      await page.fill('input[name="sensor_count"]', "6");
      await page.click("#submit-button");

      await expect(page.locator("canvas")).toHaveScreenshot("6-sensors.png");
    });

    test("should render with 8 sensors", async ({ page }) => {
      await page.fill('input[name="sensor_count"]', "8");
      await page.click("#submit-button");

      await expect(page.locator("canvas")).toHaveScreenshot("8-sensors.png");
    });
  });

  test.describe("Controls", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
      await page.fill('input[name="sensor_count"]', "6");
      await page.fill('input[name="seed"]', "226");
      await page.click("#submit-button");
    });

    test(`should clear canvas on button reset click`, async ({ page }) => {
      await page.click("#reset-button");
      await expect(page.locator("canvas")).toHaveScreenshot("clear-canvas.png");
    });

    [
      {
        playPause: async (page) => await page.click("#play-pause-button"),
        next: async (page) => await page.click("#next-button"),
        prev: async (page) => await page.click("#prev-button"),
        desc: "using ui buttons",
      },
      {
        playPause: async (page) => await page.keyboard.down("Space"),
        next: async (page) => await page.keyboard.down("ArrowRight"),
        prev: async (page) => await page.keyboard.down("ArrowLeft"),
        desc: "using keyboard shortcuts",
      },
    ].forEach(({ playPause, next, prev, desc }) => {
      test(`should go forward and backwards ${desc}`, async ({ page }) => {
        // Start
        await playPause(page);
        // Stop
        await playPause(page);

        await expect(page.locator("canvas")).toHaveScreenshot("stage-0.png");

        // Go forward 2 steps
        await next(page);
        await next(page);
        // Stop
        await playPause(page);

        await expect(page.locator("canvas")).toHaveScreenshot("stage-3.png");

        // Go back at the start
        await prev(page);
        await prev(page);
        // Stop
        await playPause(page);

        await expect(page.locator("canvas")).toHaveScreenshot("stage-0.png");
      });
    });

    test(`should go to different stages based on the log buttons`, async ({
      page,
    }) => {
      await page.click("#play-pause-button");

      await page.locator(".line-button").nth(2).click();
      await page.click("#play-pause-button");
      await expect(page.locator("canvas")).toHaveScreenshot("stage-3.png");

      await page.locator(".line-button").nth(0).click();
      await page.click("#play-pause-button");
      await expect(page.locator("canvas")).toHaveScreenshot("stage-0.png");
    });
  });

  test.describe("Stages", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
      await page.fill('input[name="sensor_count"]', "6");
      await page.fill('input[name="seed"]', "226");
      await page.click("#submit-button");
    });

    test("should display the sending of the rrm", async ({ page }) => {
      await page.click("#play-pause-button");
      await page.click("#play-pause-button");

      await expect(page.locator("canvas")).toHaveScreenshot(
        "sending-rrm-message.png",
      );
    });

    test("should display the sensors all sensing data", async ({ page }) => {
      await page.click("#play-pause-button");
      await page.click("#play-pause-button");

      await page.click("#next-button");

      await page.click("#play-pause-button");

      await expect(page.locator("canvas")).toHaveScreenshot("sensing-data.png");
    });

    test("should display the sensors all sending their slots", async ({
      page,
    }) => {
      await page.click("#play-pause-button");
      await page.click("#play-pause-button");

      await page.click("#next-button");
      await page.click("#next-button");
      await page.click("#next-button");

      await page.click("#play-pause-button");

      await expect(page.locator("canvas")).toHaveScreenshot(
        "all-sensors-sending-their-slot.png",
      );
    });

    test("should display the sensors all sending their data", async ({
      page,
    }) => {
      await page.click("#play-pause-button");
      await page.click("#play-pause-button");

      await page.click("#next-button");
      await page.click("#next-button");
      await page.click("#next-button");
      await page.click("#next-button");
      await page.click("#next-button");

      await page.click("#play-pause-button");

      await expect(page.locator("canvas")).toHaveScreenshot(
        "all-sensors-sending-their-slot.png",
      );
    });
  });
});
