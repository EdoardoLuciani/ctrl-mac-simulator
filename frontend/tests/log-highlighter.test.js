import { describe, expect, test, beforeEach, vi } from "vitest";
import { JSDOM } from "jsdom";
import { LogHighlighter } from "../src/js/log-highlighter";
import * as logMatcher from "../src/js/helpers/log-matcher-helper";

describe("LogHighlighter", () => {
  let logHighlighter;
  let mockCallback;

  const testLog = [
    "INFO: Gateway: Time 0.00: Started RequestReplyMessage transmission",
    'DEBUG: Gateway: {"request_slots": [{"state": "free", "data_channel": 0, "data_slot": 0}, {"state": "free", "data_channel": 1, "data_slot": 0}, {"state": "free", "data_channel": 2, "data_slot": 0}, {"state": "free", "data_channel": 0, "data_slot": 0.25}, {"state": "free", "data_channel": 1, "data_slot": 0.25}, {"state": "free", "data_channel": 2, "data_slot": 0.25}], "ftr": 0, "old_ftr": 0, "old_contentions": 0, "_start_time": 0, "_contentions": 0, "_arrive_time": 0.030976, "message_type": "RequestReplyMessage"}',
    "INFO: Gateway: Time 0.03: Finished RequestReplyMessage transmission",
    "INFO: Sensor-0: Time 0.03: Received RequestReplayMessage",
    "INFO: Sensor-0: Time 0.03: Data is available, syncing to next RRM for transmission request",
    "INFO: Sensor-1: Time 0.03: Received RequestReplayMessage",
    "INFO: Sensor-1: Time 0.03: Data is available, syncing to next RRM for transmission request",
    "INFO: Gateway: Time 0.53: Started RequestReplyMessage transmission",
    'DEBUG: Gateway: {"request_slots": [{"state": "free", "data_channel": 0, "data_slot": 0}, {"state": "free", "data_channel": 1, "data_slot": 0}, {"state": "free", "data_channel": 2, "data_slot": 0}, {"state": "free", "data_channel": 0, "data_slot": 0.25}, {"state": "free", "data_channel": 1, "data_slot": 0.25}, {"state": "free", "data_channel": 2, "data_slot": 0.25}], "ftr": 0, "old_ftr": 0, "old_contentions": 0, "_start_time": 0.530976, "_contentions": 0, "_arrive_time": 0.561952, "message_type": "RequestReplyMessage"}',
    "INFO: Gateway: Time 0.56: Finished RequestReplyMessage transmission",
  ];

  beforeEach(() => {
    // Setup DOM environment
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="result"></div>
          <div id="canvas-column" style="height: 1000px;"></div>
        </body>
      </html>
    `);

    global.document = dom.window.document;
    global.window = dom.window;
    global.window.HTMLElement.prototype.scrollIntoView = vi.fn();

    mockCallback = vi.fn();
    logHighlighter = new LogHighlighter(mockCallback);
  });

  test("setLog() should properly parse and group log entries", () => {
    logHighlighter.setLog(testLog);

    const resultContainer = document.getElementById("result");
    const lineContainers = resultContainer.querySelectorAll(".line-container");

    // Should create three groups
    expect(lineContainers.length).toBe(3);

    // Check RRM group content
    let rrmGroup = lineContainers[0].querySelector("summary").innerHTML;
    expect(rrmGroup).toContain("Cycle: 0");
    expect(rrmGroup).toContain("RRM Slots Status");

    // Check sensor transmission group content
    const sensorGroup = lineContainers[1].querySelector("summary").innerHTML;
    expect(sensorGroup).toContain("Cycle: 0");
    expect(sensorGroup).toContain("Sensor Slots Collisions");
    expect(sensorGroup).toContain(
      "No sensor sent a transmission request message",
    );

    rrmGroup = lineContainers[2].querySelector("summary").innerHTML;
    expect(rrmGroup).toContain("Cycle: 1");
    expect(rrmGroup).toContain("RRM Slots Status");
  });

  test("highlightLogGroup() should highlight correct group", () => {
    logHighlighter.setLog(testLog);

    const lineContainers = document.querySelectorAll(".line-container");

    logHighlighter.highlightLogGroup(0);
    let highlightedText = lineContainers[0].querySelector("mark");
    expect(highlightedText).not.toBeNull();
    expect(highlightedText.innerHTML).toContain("Cycle: 0 | Time: 0.00");

    logHighlighter.highlightLogGroup(1);
    highlightedText = lineContainers[1].querySelector("mark");
    expect(highlightedText).not.toBeNull();
    expect(highlightedText.innerHTML).toContain("Cycle: 0 | Time: 0.03");

    highlightedText = lineContainers[0].querySelector("mark");
    expect(highlightedText).toBeNull();
  });

  test("createVisualLogGroup() should create correct DOM elements", () => {
    logHighlighter.setLog(testLog);

    const lineContainers = document.querySelectorAll(".line-container");

    // Check basic structure
    expect(lineContainers[0]).not.toBeNull();
    expect(lineContainers[0].className).toBe("line-container");

    // Check button
    let button = lineContainers[0].querySelector("button");
    expect(button).not.toBeNull();
    expect(button.textContent).toBe("→");

    // Check details element
    const details = lineContainers[0].querySelector("details");
    expect(details).not.toBeNull();

    // Check summary content
    const summary = details.querySelector("summary");
    expect(summary).not.toBeNull();
    expect(summary.innerHTML).toContain("Cycle: 0");
    expect(summary.innerHTML).toContain("RRM Slots Status");

    // Verify button click triggers callback
    button.click();
    expect(mockCallback).toHaveBeenCalledWith(0);

    button = lineContainers[1].querySelector("button");
    button.click();
    expect(mockCallback).toHaveBeenCalledWith(1);
  });
});
