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
  return line.match(
    STANDARD_PATTERN +
      "Started TransmissionRequestMessage for request slot ([0-9]*) transmission",
  );
}

export function matches_started_sensor_measurement_message(line) {
  return line.match(
    STANDARD_PATTERN + "Started SensorMeasurementMessage transmission",
  );
}
