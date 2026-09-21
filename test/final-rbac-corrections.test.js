import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AUTH_SESSION_INVALID_CODE,
  classifyAuthenticatedFailure,
} from "../src/utils/authenticatedResponse.js";
import { canAccessDashboardMenu, hasDashboardPermission } from "../src/utils/dashboardAuth.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const appSource = fs.readFileSync(path.join(dirname, "../src/App.jsx"), "utf8");
const eventLogsSource = fs.readFileSync(path.join(dirname, "../src/pages/EventLogs.jsx"), "utf8");
const patrolsSource = fs.readFileSync(path.join(dirname, "../src/pages/Patrols.jsx"), "utf8");

test("AUTH_SESSION_INVALID is distinct from login failure and other auth states", () => {
  assert.equal(classifyAuthenticatedFailure({ status: 401, code: AUTH_SESSION_INVALID_CODE, requestPath: "/dashboard/metrics" }), "session_invalid");
  assert.equal(classifyAuthenticatedFailure({ status: 401, code: AUTH_SESSION_INVALID_CODE, requestPath: "/auth/login" }), null);
  assert.equal(classifyAuthenticatedFailure({ status: 403, code: "PASSWORD_CHANGE_REQUIRED", requestPath: "/sites" }), "password_change_required");
  assert.equal(classifyAuthenticatedFailure({ status: 403, code: "TEMPORARY_ACCESS_EXPIRED", requestPath: "/sites" }), "temporary_access_expired");
});

test("global invalid-session handling clears authorization and returns to login", () => {
  assert.match(appSource, /authFailure === "session_invalid"[\s\S]*removeItem\("aegis-current-user"\)[\s\S]*setCurrentUser\(null\)[\s\S]*setAuthorizationReady\(false\)/);
  assert.match(appSource, /Your Dashboard session is no longer active\. Please sign in again\./);
  assert.match(appSource, /useEffect\([\s\S]*setInterval\([\s\S]*return \(\) => clearInterval\(/);
});

test("audit-only custom role sees Event Logs without requesting Sites", () => {
  const user = { permissions: ["audit_logs.view"] };
  assert.equal(canAccessDashboardMenu(user, "Event Logs"), true);
  assert.equal(canAccessDashboardMenu(user, "Guards"), false);
  assert.equal(hasDashboardPermission(user, "sites.view"), false);
  assert.match(eventLogsSource, /hasDashboardPermission\(user, "audit_logs\.view"\)[\s\S]*\/guards\/shifts\/history/);
  assert.match(eventLogsSource, /hasDashboardPermission\(user, "sites\.view"\)[\s\S]*\/sites/);
});

test("Patrol QR credential controls require patrols.manage and use boolean metadata", () => {
  assert.match(appSource, /<Patrols permissions=\{currentUser\.user\.permissions\}/);
  assert.match(patrolsSource, /hasDashboardPermission\([\s\S]*"patrols\.manage"/);
  assert.match(patrolsSource, /canManagePatrols && point\.qr_generated/);
  assert.doesNotMatch(patrolsSource, /point\.qr_token \? "QR GENERATED"/);
  assert.match(patrolsSource, /point\.qr_generated \? "QR GENERATED" : "QR PENDING"/);
});
