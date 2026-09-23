import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const settingsSource = fs.readFileSync(
  path.join(dirname, "../src/pages/Settings.jsx"),
  "utf8"
);

test("Incident Rules presents the two-hour resolved timeline window", () => {
  assert.match(settingsSource, /<span>Timeline Reset<\/span>\s*<strong>2 hours<\/strong>/);
  assert.doesNotMatch(settingsSource, /<span>Timeline Reset<\/span>\s*<strong>1 hour<\/strong>/);
});

test("new Guard fields use explicit autofill-safe semantics", () => {
  assert.match(settingsSource, /name="new_guard_full_name"\s*autoComplete="off"/);
  assert.match(settingsSource, /name="new_guard_username"\s*autoComplete="off"/);
  assert.match(settingsSource, /type="tel"\s*name="new_guard_phone"\s*autoComplete="tel"/);
  assert.match(settingsSource, /name="new_guard_temporary_password"\s*autoComplete="new-password"/);
  assert.match(settingsSource, /Generate secure password/);
  assert.match(settingsSource, /setShowNewGuardPassword/);
  assert.match(settingsSource, /Save these credentials now/);
});

test("Settings renders tenant operation history while keeping platform health", () => {
  assert.match(settingsSource, /getTenantOperationHistory\(systemStatus, "sms_gateway"\)/);
  assert.match(settingsSource, /getTenantOperationHistory\(systemStatus, "voice_calls"\)/);
  assert.match(settingsSource, /systemStatus\?\.services\?\.sms_gateway\?\.status/);
  assert.doesNotMatch(settingsSource, /sms_gateway\?\.last_success_at/);
  assert.doesNotMatch(settingsSource, /voice_calls\?\.last_success_at/);
});
