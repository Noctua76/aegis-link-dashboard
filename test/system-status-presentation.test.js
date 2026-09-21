import test from "node:test";
import assert from "node:assert/strict";
import {
  formatHealthTime,
  hasCurrentHealthError,
} from "../src/utils/systemStatus.js";

test("historical failures do not render as current red errors", () => {
  assert.equal(
    hasCurrentHealthError({
      status: "operational",
      current_error: null,
      last_failure_reason: "HTTP 429",
    }),
    false
  );
  assert.equal(
    hasCurrentHealthError({ status: "degraded", current_error: "HTTP 429" }),
    true
  );
});

test("an event at 21/9 23:15 Europe/Athens is not double-converted", () => {
  const rendered = formatHealthTime("2026-09-21T20:15:00.000Z");
  assert.match(rendered, /21\/9\/26/);
  assert.match(rendered, /(23:15:00|11:15:00 μ\.μ\.)/);
  assert.doesNotMatch(rendered, /22\/9\/26/);
  assert.doesNotMatch(rendered, /02:15:00/);
});
