import { describe, expect, test, beforeEach } from "vitest";
import { PlayPauseController } from "../src/js/play-pause-controller";
import { JSDOM } from "jsdom";

describe("PlayPauseController", () => {
  let controller;

  // Setup DOM elements before each test
  beforeEach(() => {
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <button id="test-button">
            <i class="fa-play"></i>
          </button>
        </body>
      </html>
    `);

    global.window = dom.window;
    global.document = dom.window.document;

    controller = new PlayPauseController("test-button");
  });

  test("toggle() should switch between playing and paused states", () => {
    // Initial state should be paused
    expect(controller.state).toBe("paused");

    // First toggle should switch to playing
    expect(controller.toggle()).toBe("playing");
    expect(controller.state).toBe("playing");

    // Second toggle should switch back to paused
    expect(controller.toggle()).toBe("paused");
    expect(controller.state).toBe("paused");
  });

  test("setState() should set the correct state", () => {
    // Initial state is paused
    expect(controller.state).toBe("paused");

    // Setting to playing should change state
    controller.setState("playing");
    expect(controller.state).toBe("playing");

    // Setting to paused should change state
    controller.setState("paused");
    expect(controller.state).toBe("paused");

    // Setting to current state should not trigger toggle
    controller.setState("paused");
    expect(controller.state).toBe("paused");
  });

  test("isPlaying() should return correct boolean", () => {
    // Should initially be false
    expect(controller.isPlaying()).toBe(false);

    // Should be true after toggling to playing
    controller.toggle();
    expect(controller.isPlaying()).toBe(true);

    // Should be false after toggling back to paused
    controller.toggle();
    expect(controller.isPlaying()).toBe(false);
  });

  test("icon classes should update correctly when toggling", () => {
    const icon = document.querySelector("i");

    // Check initial state
    expect(icon.classList.contains("fa-play")).toBe(true);
    expect(icon.classList.contains("fa-pause")).toBe(false);

    // Toggle to playing
    controller.toggle();
    expect(icon.classList.contains("fa-play")).toBe(false);
    expect(icon.classList.contains("fa-pause")).toBe(true);

    // Toggle back to paused
    controller.toggle();
    expect(icon.classList.contains("fa-play")).toBe(true);
    expect(icon.classList.contains("fa-pause")).toBe(false);
  });
});
