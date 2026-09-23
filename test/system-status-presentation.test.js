import test from "node:test";
import assert from "node:assert/strict";
import {
  formatHealthTime,
  getTenantOperationHistory,
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

test("Settings tenant history never falls back to platform timestamps", () => {
  const status = {
    services: {
      sms_gateway: {
        status: "operational",
        configured: true,
        last_success_at: "2026-09-01T10:00:00.000Z",
        last_failure_at: "2026-09-01T11:00:00.000Z",
        tenant_operation: {
          last_success_at: "2026-09-23T10:00:00.000Z",
          last_failure_at: null,
        },
      },
      voice_calls: {
        status: "operational",
        configured: true,
        last_success_at: "2026-09-01T12:00:00.000Z",
      },
    },
  };

  assert.deepEqual(getTenantOperationHistory(status, "sms_gateway"), {
    last_success_at: "2026-09-23T10:00:00.000Z",
    last_failure_at: null,
  });
  assert.deepEqual(getTenantOperationHistory(status, "voice_calls"), {
    last_success_at: null,
    last_failure_at: null,
  });
});

test("an event at 21/9 23:15 Europe/Athens is not double-converted", () => {
  const rendered = formatHealthTime("2026-09-21T20:15:00.000Z");
  assert.match(rendered, /21\/9\/26/);
  assert.match(rendered, /(23:15:00|11:15:00 μ\.μ\.)/);
  assert.doesNotMatch(rendered, /22\/9\/26/);
  assert.doesNotMatch(rendered, /02:15:00/);
});
