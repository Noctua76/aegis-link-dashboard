import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const settings = fs.readFileSync(new URL("../src/pages/Settings.jsx", import.meta.url), "utf8");
const patrols = fs.readFileSync(new URL("../src/pages/Patrols.jsx", import.meta.url), "utf8");
const companies = fs.readFileSync(new URL("../src/pages/Companies.jsx", import.meta.url), "utf8");

test("Settings and Patrols display canonical stored site codes and preserve numeric routes", () => {
  assert.match(settings, /\{site\.site_code\} \| \{site\.name\}/);
  assert.match(settings, /Site ID: \$\{formatValue\(site\.site_code\)\}/);
  assert.match(settings, /value=\{profileSite\.site_code \|\| ""\} readOnly/);
  assert.match(settings, /\/settings\/sites\/\$\{profileSite\.id\}/);
  assert.match(patrols, /QR Codes \| \{selectedQrSiteDetails\.site\.site_code\}/);
  assert.match(patrols, /site_id: site\.site_id/);
  assert.doesNotMatch(settings + patrols, /SITE-\$\{|SITE-\{String\(/);
});

test("Company form auto suggests an editable Operational Site Prefix", () => {
  assert.match(companies, /Operational Site Prefix \*/);
  assert.match(companies, /site_prefix: suggestSitePrefix\(value\)/);
  assert.match(companies, /site_prefix", event\.target\.value\.toUpperCase\(\)/);
});
