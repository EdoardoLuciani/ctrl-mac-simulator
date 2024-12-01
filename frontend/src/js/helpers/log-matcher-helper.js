const STANDARD_PATTERN = "([^:]+): Time [0-9]*.[0-9]*: ";

export function matches_started_request_reply_message(line) {
  return line.match(
    STANDARD_PATTERN + "Started RequestReplyMessage transmission",
  );
}

export function matches_finished_request_reply_message(line) {
  return line.match(
    STANDARD_PATTERN + "Finished RequestReplyMessage transmission",
  );
}

export function matches_started_transmission_request_message(line) {
  const match = line.match(
    STANDARD_PATTERN +
      "Started TransmissionRequestMessage for request slot ([0-9]*) transmission",
  );
  return match
    ? {
        sensorIndex: Number(match[1].split("-", 2)[1]),
        requestSlot: match[2],
      }
    : null;
}

export function matches_started_sensor_measurement_message(line) {
  const match = line.match(
    STANDARD_PATTERN + "Started SensorMeasurementMessage transmission",
  );
  return match
    ? {
        sensorIndex: Number(match[1].split("-", 2)[1]),
      }
    : null;
}

export function matches_on_timeout_for_x_periods(line) {
  const match = line.match(
    STANDARD_PATTERN + "On timeout for ([0-9]*) more periods",
  );
  return match
    ? {
        sensorIndex: Number(match[1].split("-", 2)[1]),
        timeoutPeriod: match[2],
      }
    : null;
}

export function matches_syncing_to_next_rrm(line) {
  const match = line.match(
    STANDARD_PATTERN +
      "Data is available, syncing to next RRM for transmission request",
  );
  return match
    ? {
        sensorIndex: Number(match[1].split("-", 2)[1]),
      }
    : null;
}

export function matches_any_line(line) {
  const match = line.match("Time ([0-9]*.[0-9]*):");
  return match ? match[1] : null;
}

export function matches_debug_log(line) {
  return line.match("INFO");
}

export function matches_debug_rrm_message(line) {
  return line.match("DEBUG: Gateway: {");
}
