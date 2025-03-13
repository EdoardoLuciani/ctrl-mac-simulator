import { describe, expect, test } from "vitest";
import {
  matches_started_request_reply_message,
  matches_finished_request_reply_message,
  matches_started_transmission_request_message,
  matches_started_sensor_measurement_message,
  matches_on_timeout_for_x_periods,
  matches_syncing_to_next_rrm,
  matches_any_line,
  matches_debug_log,
  matches_debug_rrm_message,
} from "../src/js/helpers/log-matcher-helper";

describe("request replay message", () => {
  test("matches request reply message", () => {
    const res = matches_started_request_reply_message(
      "INFO: Gateway: Time 0.50: Started RequestReplyMessage transmission",
    );

    expect(res).not.toBeUndefined();
  });

  test("correctly rejects match", () => {
    const res = matches_started_request_reply_message(
      "INFO: Gateway: Time 0.50: Started something else",
    );

    expect(res).toBeNull();
  });
});

describe("finished request reply message", () => {
  test("matches finished request reply message", () => {
    const res = matches_finished_request_reply_message(
      "INFO: Gateway: Time 0.50: Finished RequestReplyMessage transmission",
    );

    expect(res).not.toBeUndefined();
  });

  test("correctly rejects match", () => {
    const res = matches_finished_request_reply_message(
      "INFO: Gateway: Time 0.50: Finished something else",
    );

    expect(res).toBeNull();
  });
});

describe("started transmission request message", () => {
  test("matches transmission request message and extracts data", () => {
    const res = matches_started_transmission_request_message(
      "INFO: Sensor-3: Time 1.25: Started TransmissionRequestMessage for request slot 5 transmission",
    );

    expect(res).toEqual({
      sensorIndex: 3,
      requestSlot: 5,
    });
  });

  test("correctly rejects match", () => {
    const res = matches_started_transmission_request_message(
      "INFO: Sensor-2: Time 1.25: Started something else",
    );

    expect(res).toBeNull();
  });
});

describe("started sensor measurement message", () => {
  test("matches sensor measurement message and extracts data", () => {
    const res = matches_started_sensor_measurement_message(
      "INFO: Sensor-4: Time 2.30: Started SensorMeasurementMessage transmission",
    );

    expect(res).toEqual({
      sensorIndex: 4,
    });
  });

  test("correctly rejects match", () => {
    const res = matches_started_sensor_measurement_message(
      "INFO: Sensor-4: Time 2.30: Started something else",
    );

    expect(res).toBeNull();
  });
});

describe("on timeout for x periods", () => {
  test("matches timeout message and extracts data", () => {
    const res = matches_on_timeout_for_x_periods(
      "INFO: Sensor-2: Time 3.40: On timeout for 3 more periods",
    );

    expect(res).toEqual({
      sensorIndex: 2,
      timeoutPeriod: "3",
    });
  });

  test("correctly rejects match", () => {
    const res = matches_on_timeout_for_x_periods(
      "INFO: Sensor-2: Time 3.40: Something about timeout",
    );

    expect(res).toBeNull();
  });
});

describe("syncing to next rrm", () => {
  test("matches syncing message and extracts data", () => {
    const res = matches_syncing_to_next_rrm(
      "INFO: Sensor-5: Time 4.50: Data is available, syncing to next RRM for transmission request",
    );

    expect(res).toEqual({
      sensorIndex: 5,
    });
  });

  test("correctly rejects match", () => {
    const res = matches_syncing_to_next_rrm(
      "INFO: Sensor-5: Time 4.50: Data is available, but doing something else",
    );

    expect(res).toBeNull();
  });
});

describe("matches any line", () => {
  test("extracts time from any log line", () => {
    const res = matches_any_line(
      "INFO: Gateway: Time 5.75: Some random log message",
    );

    expect(res).toBe("5.75");
  });

  test("returns null when no time found", () => {
    const res = matches_any_line(
      "INFO: Gateway: No time here: Some random log message",
    );

    expect(res).toBeNull();
  });
});

describe("matches debug log", () => {
  test("matches INFO logs", () => {
    const res = matches_debug_log(
      "INFO: Gateway: Time 6.00: Some debug message",
    );

    expect(res).not.toBeNull();
  });

  test("correctly rejects non-INFO logs", () => {
    const res = matches_debug_log(
      "ERROR: Gateway: Time 6.00: Some error message",
    );

    expect(res).toBeNull();
  });
});

describe("matches debug rrm message", () => {
  test("matches DEBUG Gateway logs with JSON", () => {
    const res = matches_debug_rrm_message(
      "DEBUG: Gateway: { some: 'json data' }",
    );

    expect(res).not.toBeNull();
  });

  test("correctly rejects non-matching logs", () => {
    const res = matches_debug_rrm_message(
      "DEBUG: Sensor-1: { some: 'json data' }",
    );

    expect(res).toBeNull();
  });
});
