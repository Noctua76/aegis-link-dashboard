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
const companiesStyles = fs.readFileSync(path.join(dirname, "../src/pages/Companies.css"), "utf8");
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

test("System Owner can change company lifecycle status with inactive confirmation", () => {
  assert.match(companiesSource, /\/admin\/companies\/\$\{company\.id\}\/status/);
  assert.match(companiesSource, /method: "PUT"/);
  assert.match(companiesSource, /window\.confirm/);
  assert.match(companiesSource, /will be signed out immediately/);
  assert.match(companiesSource, /<option value="active">Active<\/option>/);
  assert.match(companiesSource, /<option value="pilot">Pilot<\/option>/);
  assert.match(companiesSource, /<option value="inactive">Inactive<\/option>/);
});

test("Companies table keeps headers and values on one fixed responsive grid", () => {
  const mobileStyles = companiesStyles.slice(companiesStyles.indexOf("@media (max-width: 720px)"));
  const tableRule = companiesStyles.match(/\.companies-table\s*\{([^}]*)\}/)?.[1] || "";
  assert.match(companiesStyles, /\.companies-table\s*\{[^}]*min-width:\s*980px;[^}]*table-layout:\s*fixed;/s);
  assert.match(companiesStyles, /\.companies-table-wrap\s*\{[^}]*overflow:\s*auto;[^}]*max-height:\s*min\(62vh, 620px\);/s);
  assert.match(companiesStyles, /\.companies-table th, \.companies-table td\s*\{[^}]*vertical-align:\s*middle;/s);
  assert.match(companiesStyles, /\.companies-table thead th\s*\{[^}]*position:\s*sticky;[^}]*top:\s*0;[^}]*z-index:\s*2;/s);
  assert.match(companiesStyles, /th:nth-child\(1\), \.companies-table td:nth-child\(1\)\s*\{[^}]*width:\s*190px;[^}]*text-align:\s*left;/s);
  assert.match(companiesStyles, /th:nth-child\(6\), \.companies-table td:nth-child\(6\)\s*\{[^}]*width:\s*135px;[^}]*text-align:\s*center;/s);
  assert.match(companiesStyles, /th:nth-child\(2\), \.companies-table td:nth-child\(2\)\s*\{[^}]*text-align:\s*center;/s);
  assert.match(companiesStyles, /th:nth-child\(3\), \.companies-table td:nth-child\(3\)\s*\{[^}]*text-align:\s*center;/s);
  assert.match(companiesStyles, /th:nth-child\(7\), \.companies-table td:nth-child\(7\)\s*\{[^}]*width:\s*165px;[^}]*text-align:\s*center;/s);
  assert.match(companiesStyles, /\.company-created-at\s*\{[^}]*flex-direction:\s*column;[^}]*align-items:\s*center;/s);
  assert.match(companiesSource, /<CompanyCreatedAt value=\{company\.created_at\} \/>/);
  assert.match(mobileStyles, /\.companies-header\s*\{[^}]*flex-direction:\s*column;/s);
  assert.match(mobileStyles, /\.companies-table-wrap\s*\{[^}]*max-height:\s*55vh;/s);
  assert.doesNotMatch(tableRule, /display:\s*(grid|block)/);
});

test("desktop title spacing is scoped above 720px", () => {
  assert.match(companiesStyles, /@media \(min-width:\s*721px\)[\s\S]*\.companies-header > div\s*\{[^}]*align-items:\s*center;[^}]*text-align:\s*center;/);
  assert.match(companiesStyles, /@media \(min-width:\s*721px\)[\s\S]*\.companies-header > \.companies-primary\s*\{[^}]*position:\s*absolute;[^}]*right:\s*0;/);
  assert.match(companiesStyles, /@media \(min-width:\s*721px\)[\s\S]*\.companies-header h1\s*\{[^}]*margin:\s*6px 0 10px;[^}]*line-height:\s*1\.08;/);
  assert.match(companiesStyles, /@media \(min-width:\s*721px\)[\s\S]*\.companies-header p\s*\{[^}]*margin:\s*0;[^}]*line-height:\s*1\.45;/);
});
