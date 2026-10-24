import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDir, "..");
const auditSource = fs.readFileSync(
  path.join(root, "src/pages/AdminAuditLogs.jsx"),
  "utf8"
);
const appCss = fs.readFileSync(path.join(root, "src/App.css"), "utf8");
const analyticsSource = fs.readFileSync(
  path.join(root, "src/pages/Analytics.jsx"),
  "utf8"
);
const analyticsCss = fs.readFileSync(
  path.join(root, "src/pages/Analytics.css"),
  "utf8"
);

test("Admin Audit Logs uses page-scoped mobile title spacing without changing its copy", () => {
  assert.match(auditSource, /<h1 className="admin-audit-title">\s*Admin Audit Logs\s*<\/h1>/);
  assert.match(auditSource, /<p className="admin-audit-subtitle">/);
  const auditStyles = appCss.slice(appCss.indexOf(".admin-audit-page"));
  const desktopTitleRule = auditStyles.match(/\.admin-audit-title\s*\{([^}]*)\}/)?.[1] || "";
  const mobileTitleRule = auditStyles.match(
    /@media \(max-width: 768px\)[\s\S]*?\.admin-audit-title\s*\{([^}]*)\}/
  )?.[1] || "";

  assert.match(desktopTitleRule, /font-size:\s*42px/);
  assert.match(desktopTitleRule, /margin-bottom:\s*8px/);
  assert.doesNotMatch(desktopTitleRule, /margin:\s*0 0 8px/);
  assert.match(mobileTitleRule, /font-size:\s*34px/);
  assert.match(mobileTitleRule, /line-height:\s*1\.12/);
  assert.match(mobileTitleRule, /margin:\s*0 0 12px/);
  assert.match(
    appCss,
    /@media \(max-width: 768px\)[\s\S]*?\.admin-audit-subtitle\s*\{[^}]*line-height:\s*1\.5/s
  );
});

test("Analytics mobile index pairs every existing value with an explicit label", () => {
  for (const label of [
    "Company",
    "Alerts",
    "Guards",
    "Shifts",
    "Ratio",
    "Risk",
    "Readiness",
    "Fatigue",
  ]) {
    assert.match(
      analyticsSource,
      new RegExp(`<span className="analytics-mobile-label">${label}<\\/span>`)
    );
  }

  assert.match(analyticsSource, /analytics\?\.company\?\.total_sites \?\? "No Data"/);
  assert.match(analyticsSource, /analytics\?\.alerts\?\.count \?\? "No Data"/);
  assert.match(analyticsSource, /analytics\?\.readiness\?\.assigned_guards \?\? "No Data"/);
  assert.match(analyticsSource, /analytics\?\.readiness\?\.required_shifts \?\? "No Data"/);
  assert.match(analyticsSource, /analytics\?\.readiness\?\.ratio \?\? "No Data"/);
  assert.match(analyticsSource, /\{riskLevel\}/);
  assert.match(analyticsSource, /\{readinessLevel\}/);
  assert.match(analyticsSource, /\{fatigueLevel\}/);
});

test("Analytics labels are mobile-only while the desktop header remains intact", () => {
  assert.match(analyticsCss, /\.analytics-mobile-label\s*\{\s*display:\s*none;/s);
  assert.match(
    analyticsCss,
    /\.analytics-metric-cell > \.badge\s*\{[^}]*width:\s*100%;/s
  );
  assert.match(
    analyticsCss,
    /@media \(max-width: 900px\)[\s\S]*?\.analytics-mobile-label\s*\{[^}]*display:\s*inline;/s
  );
  assert.match(
    analyticsCss,
    /@media \(max-width: 900px\)[\s\S]*?\.analytics-metric-cell > \.badge\s*\{[^}]*width:\s*auto;/s
  );
  assert.match(analyticsSource, /analytics-row analytics-row-head/);
  assert.match(analyticsSource, /<span>Company<\/span>[\s\S]*<span>Fatigue<\/span>/);
  assert.equal((analyticsSource.match(/analytics\/summary/g) || []).length, 1);
});
