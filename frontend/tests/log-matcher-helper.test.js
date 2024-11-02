import { describe, expect, test } from "vitest";
import { matches_started_request_reply_message } from "../src/helpers/log-matcher-helper";

describe("request replay message", () => {
  test("matches request reply message", () => {
    const res = matches_started_request_reply_message(
      "Gateway: Time 0.50: Started RequestReplyMessage transmission",
    );

    expect(res).not.toBeUndefined();
  });

  test("correctly rejects match", () => {
    const res = matches_started_request_reply_message(
      "Gateway: Time 0.50: Started something else",
    );

    expect(res).toBeNull();
  });
});
