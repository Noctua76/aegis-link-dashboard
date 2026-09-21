import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getAlertCapabilities } from "../src/utils/alertPermissions.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const settingsSource = fs.readFileSync(path.join(dirname, "../src/pages/Settings.jsx"), "utf8");

test("user without alerts.view has no Alert Configuration capability", () => {
  const requested = [];
  const capabilities = getAlertCapabilities((permission) => {
    requested.push(permission);
    return false;
  });
  assert.deepEqual(capabilities, { canViewAlerts: false, canManageAlerts: false });
  assert.deepEqual(requested, ["alerts.view"]);
  assert.match(settingsSource, /if \(!canViewAlerts\) return null;/);
  assert.match(settingsSource, /if \(canViewAlerts\) \{\s*loadAlertConfiguration\(\);\s*loadTestAlertHistory\(1\);\s*loadRecipients\(\);/);
  assert.match(settingsSource, /\{canViewAlerts && <div className="settings-card">\s*<h3>Alert Configuration<\/h3>/);
});

test("user with alerts.view but without alerts.manage gets read-only Alert Configuration", () => {
  const capabilities = getAlertCapabilities((permission) => permission === "alerts.view");
  assert.deepEqual(capabilities, { canViewAlerts: true, canManageAlerts: false });
  assert.match(settingsSource, /\{canManageAlerts && <>\s*<input\s*placeholder="Name"/);
  assert.match(settingsSource, /\{canManageAlerts \? "Manage Recipients" : "View Recipients"\}/);
  assert.match(settingsSource, /\{canManageAlerts && item\.source !== "env"/);
  assert.match(settingsSource, /const handleTestAlert = async \(\) => \{\s*if \(!canManageAlerts\) return;/);
});

test("alerts.manage becomes effective only together with alerts.view", () => {
  assert.deepEqual(
    getAlertCapabilities((permission) => permission === "alerts.manage"),
    { canViewAlerts: false, canManageAlerts: false }
  );
  assert.deepEqual(
    getAlertCapabilities(() => true),
    { canViewAlerts: true, canManageAlerts: true }
  );
});
