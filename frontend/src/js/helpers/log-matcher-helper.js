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
  if (!match) return null;

  return {
    sensorIndex: Number(match[1].split("-", 2)[1]),
    requestSlot: match[2],
  };
}

export function matches_started_sensor_measurement_message(line) {
  const match = line.match(
    STANDARD_PATTERN + "Started SensorMeasurementMessage transmission",
  );
  if (!match) return null;

  return {
    sensorIndex: Number(match[1].split("-", 2)[1]),
  };
}

export function matches_on_timeout_for_x_periods(line) {
  const match = line.match(
    STANDARD_PATTERN + "On timeout for ([0-9]*) more periods",
  );
  if (!match) return null;

  return {
    sensorIndex: Number(match[1].split("-", 2)[1]),
    timeoutPeriod: match[2],
  };
}
