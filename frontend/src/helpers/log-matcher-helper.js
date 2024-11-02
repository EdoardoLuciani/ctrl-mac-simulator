const STANDARD_PATTERN = "([^:]+): Time [0-9]*.[0-9]*: ";

export function matches_started_request_reply_message(line) {
  return line.match(
    STANDARD_PATTERN + "Started RequestReplyMessage transmission",
  );
}
