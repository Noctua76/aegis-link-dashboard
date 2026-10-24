import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDir, "..");
const source = fs.readFileSync(
  path.join(root, "src/pages/AdminAuditLogs.jsx"),
  "utf8"
);
const css = fs.readFileSync(path.join(root, "src/App.css"), "utf8");

test("Admin Audit Logs identifies Dashboard and Guard Web App surfaces", () => {
  assert.match(source, /<th>Surface<\/th>/);
  assert.match(source, /GUARD WEB APP/);
  assert.match(source, /DASHBOARD/);
  assert.match(source, /TEMPORARY GUARD PREVIEW/);
  assert.match(css, /\.audit-surface-badge\.guard/);
  assert.match(css, /\.audit-surface-badge\.dashboard/);
});

test("combined audit rows use collision-safe session identities", () => {
  assert.match(source, /session\.session_key\s*\|\|/);
  assert.match(source, /`\$\{session\.surface \|\| "dashboard"\}:\$\{session\.id\}`/);
});

test("existing date and active-state filtering remain available", () => {
  assert.match(source, /from=\$\{fromDate\}&to=\$\{toDate\}/);
  assert.match(source, /statusFilter === "active"/);
  assert.match(source, /statusFilter === "closed"/);
  assert.match(source, /session\.is_currently_online === true/);
  assert.match(source, /admin\/sessions\/export\?from=\$\{fromDate\}&to=\$\{toDate\}/);
});

test("Guard Preview lifecycle outcomes have explicit audit labels", () => {
  assert.match(source, /case "temporary_access_expired"/);
  assert.match(source, /case "temporary_access_revoked"/);
  assert.match(source, /case "auto_closed"/);
  assert.match(source, /case "stale"/);
});
