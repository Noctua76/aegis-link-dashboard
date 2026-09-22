import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  canAccessDashboardMenu,
  getPermittedDashboardMenus,
} from "../src/utils/dashboardAuth.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const appSource = fs.readFileSync(path.join(dirname, "../src/App.jsx"), "utf8");
const companiesSource = fs.readFileSync(path.join(dirname, "../src/pages/Companies.jsx"), "utf8");
const settingsSource = fs.readFileSync(path.join(dirname, "../src/pages/Settings.jsx"), "utf8");

test("Companies navigation is visible only to the System Owner", () => {
  const owner = { role_code: "system_owner", permissions: ["*"] };
  const companyAdministrator = { role_code: "company_administrator", permissions: ["dashboard.view", "users.manage"] };
  assert.equal(canAccessDashboardMenu(owner, "Companies"), true);
  assert.equal(getPermittedDashboardMenus(owner).includes("Companies"), true);
  assert.equal(canAccessDashboardMenu(companyAdministrator, "Companies"), false);
  assert.equal(getPermittedDashboardMenus(companyAdministrator).includes("Companies"), false);
});

test("App renders Companies only through the authorization gate", () => {
  assert.match(appSource, /activeMenu === "Companies" && canRenderMenu\("Companies"\) && <Companies \/>/);
});

test("company onboarding form creates no sample operational records", () => {
  assert.match(companiesSource, /Only the tenant and its first administrator are created/);
  assert.doesNotMatch(companiesSource, /securityData|Ekali|Demo Site/);
  assert.doesNotMatch(appSource, /\.\/data\/securityData/);
});

test("credentials are presented once with copy controls and required password-change notice", () => {
  assert.match(companiesSource, /temporary_password/);
  assert.match(companiesSource, /will not be shown again/);
  assert.match(companiesSource, /Password change is required at first sign-in/);
  assert.match(companiesSource, /Copy credentials/);
});

test("Settings no longer defaults user creation to company 1", () => {
  assert.doesNotMatch(settingsSource, /company_id:\s*1/);
});

