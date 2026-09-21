import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  canAccessDashboardMenu,
  getDashboardPollingCapabilities,
  getDashboardSessionToken,
  getPermittedDashboardMenus,
  hasDashboardPermission,
  hydrateDashboardSession,
  isAuthorizationReady,
} from "../src/utils/dashboardAuth.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const appSource = fs.readFileSync(path.join(dirname, "../src/App.jsx"), "utf8");
const settingsSource = fs.readFileSync(path.join(dirname, "../src/pages/Settings.jsx"), "utf8");

test("canonical token supports both session shapes", () => {
  assert.equal(getDashboardSessionToken({ session_token: "flat" }), "flat");
  assert.equal(getDashboardSessionToken({ session: { token: "nested" } }), "nested");
  assert.equal(getDashboardSessionToken({}), null);
});

test("permissions are fail closed until an authoritative array exists", () => {
  assert.equal(hasDashboardPermission({ role_code: "viewer" }, "dashboard.view"), false);
  assert.equal(hasDashboardPermission({ permissions: null }, "dashboard.view"), false);
  assert.equal(isAuthorizationReady({ user: {} }), false);
  assert.equal(isAuthorizationReady({ user: { permissions: [] } }), true);
});

test("custom Shift Report Viewer sees only permitted navigation", () => {
  const user = { role_code: "custom_shift_viewer", permissions: ["shift_reports.view"] };
  assert.deepEqual(getPermittedDashboardMenus(user), ["Shift Reports"]);
  assert.equal(canAccessDashboardMenu(user, "Shift Reports"), true);
  assert.equal(canAccessDashboardMenu(user, "Dashboard"), false);
  assert.equal(canAccessDashboardMenu(user, "Settings"), false);
});

test("Settings uses any-of permissions and stale menus are rejectable", () => {
  const user = { permissions: ["alerts.view"] };
  assert.equal(canAccessDashboardMenu(user, "Settings"), true);
  assert.equal(canAccessDashboardMenu(user, "Dashboard"), false);
  assert.equal(getPermittedDashboardMenus(user)[0], "Settings");
});

test("background polling starts only for authorized resources", () => {
  const user = { permissions: ["shift_reports.view"] };
  assert.deepEqual(getDashboardPollingCapabilities(user, false), {
    auditLogs: false,
    dashboard: false,
    guards: false,
    incidents: false,
    sites: false,
    shiftReports: false,
    systemStatus: false,
  });
  assert.deepEqual(getDashboardPollingCapabilities(user, true), {
    auditLogs: false,
    dashboard: false,
    guards: false,
    incidents: false,
    sites: false,
    shiftReports: true,
    systemStatus: false,
  });
});

test("authorization hydration preserves session metadata and canonical token", () => {
  const hydrated = hydrateDashboardSession(
    {
      session_token: "token",
      session: { id: 12, token: "token", login_time: "2026-09-21T10:00:00Z" },
      user: { id: 5, company_name: "Existing Company" },
    },
    {
      user_id: 5,
      role: "viewer",
      role_id: 3,
      role_code: "viewer",
      role_name: "Viewer / Auditor",
      permissions: ["audit_logs.view"],
      company_id: 8,
      company_name: "Aegis",
      access_mode: "standard",
    }
  );
  assert.equal(hydrated.session_token, "token");
  assert.equal(hydrated.session.token, "token");
  assert.equal(hydrated.session.id, 12);
  assert.equal(hydrated.user.id, 5);
  assert.equal(hydrated.user.company_name, "Aegis");
  assert.equal(hydrated.user.must_change_password, false);
});

test("incomplete auth context cannot create a full Dashboard session", () => {
  assert.equal(
    hydrateDashboardSession({ session_token: "token" }, { role_code: "viewer" }),
    null
  );
});

test("password change rehydrates context before granting normal access", () => {
  assert.match(
    appSource,
    /auth\/change-password[\s\S]*auth\/context[\s\S]*buildPasswordChangedSession\([\s\S]*contextData\.auth/
  );
  assert.match(
    appSource,
    /Password changed successfully\. Please sign in again using your new password\./
  );
});

test("heartbeat and logout resolve the canonical session token", () => {
  assert.match(
    appSource,
    /const handleLogout[\s\S]*getDashboardSessionToken\(currentUser\)[\s\S]*\/admin\/logout/
  );
  assert.match(
    appSource,
    /getDashboardSessionToken\(currentUser\)[\s\S]*\/admin\/heartbeat/
  );
  assert.doesNotMatch(appSource, /currentUser\?\.session\?\.token/);
});

test("authorization loading and Settings status polling are fail closed", () => {
  assert.match(appSource, /Loading authorization\.\.\./);
  assert.match(
    settingsSource,
    /hasPermission\("system_status\.tenant"\)\) loadSystemStatus\(\)/
  );
  assert.doesNotMatch(settingsSource, /!Array\.isArray\([^)]*permissions/);
});
