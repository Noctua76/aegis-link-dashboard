import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  dashboardDemoGuides,
  desktopDemoHeading,
  dashboardMenuGuideIds,
  isDashboardPreviewUser,
  resolveDemoLanguage,
} from "../src/demoGuides/dashboard.js";

const root = path.resolve(import.meta.dirname, "..");
const appSource = fs.readFileSync(path.join(root, "src/App.jsx"), "utf8");
const componentSource = fs.readFileSync(path.join(root, "src/components/DemoGuidance.jsx"), "utf8");
const cssSource = fs.readFileSync(path.join(root, "src/components/DemoGuidance.css"), "utf8");

test("Dashboard guidance is enabled only by trusted Preview access state", () => {
  assert.equal(isDashboardPreviewUser({ access_mode: "read_only" }), true);
  assert.equal(isDashboardPreviewUser({ role: "viewer", access_mode: "standard" }), false);
  assert.equal(isDashboardPreviewUser({ role: "system_owner" }), false);
  assert.equal(isDashboardPreviewUser({ tenant_context_active: true, tenant_context_can_mutate: false }), false);
  assert.match(appSource, /\{isReadOnlyAccess && \(/);
  assert.match(appSource, /<DemoGuidance\s+preview/);
  assert.doesNotMatch(componentSource, /[?&]demo=true/);
});

test("every required Dashboard module resolves to distinct bilingual content", () => {
  const requiredMenus = [
    "Dashboard", "Guards", "Sites", "Patrols", "Live Incidents", "Shift Reports",
    "Event Logs", "Admin Audit Logs", "Analytics", "System Status", "Settings",
  ];
  const ids = requiredMenus.map((menu) => dashboardMenuGuideIds[menu]);
  assert.equal(new Set(ids).size, requiredMenus.length);
  for (const id of ids) {
    const guide = dashboardDemoGuides[id];
    assert.ok(guide, `missing guide ${id}`);
    for (const language of ["en", "gr"]) {
      assert.ok(guide.title[language]);
      assert.ok(guide.intro[language]);
      assert.ok(guide.seeing[language].length);
      assert.ok(guide.howItWorks[language].length);
      assert.ok(guide.value[language].length);
      assert.match(guide.demoLimitations[language].body, /read-only|μόνο για ανάγνωση/i);
    }
  }
  assert.equal(resolveDemoLanguage("el-GR"), "gr");
  assert.equal(resolveDemoLanguage("en-US"), "en");
});

test("welcome is session-scoped and does not reopen on Dashboard navigation", () => {
  assert.match(componentSource, /sessionStorage\.getItem\(welcomeKey\)/);
  assert.match(componentSource, /sessionStorage\.setItem\(welcomeKey, "dismissed"\)/);
  assert.match(componentSource, /aegis-demo-welcome:dashboard/);
  assert.match(componentSource, /const guideOpen = openGuideId === guideId/);
});

test("drawer and mobile sheet implement accessible close and scroll behavior", () => {
  assert.match(componentSource, /role="dialog"/);
  assert.match(componentSource, /aria-modal="true"/);
  assert.match(componentSource, /event\.key === "Escape"/);
  assert.match(componentSource, /event\.key !== "Tab"/);
  assert.match(componentSource, /document\.body\.style\.overflow = "hidden"/);
  assert.match(componentSource, /returnFocus\?\.focus\(\)/);
  assert.equal((componentSource.match(/returnFocusRef=\{guideButtonRef\}/g) || []).length, 2);
  assert.match(componentSource, /open=\{welcomeOpen\} onClose=\{closeWelcome\} returnFocusRef=\{guideButtonRef\}/);
  assert.match(componentSource, /className="demo-guidance-primary" type="button" onClick=\{closeWelcome\}/);
  assert.match(componentSource, /open=\{guideOpen\} onClose=\{\(\) => setOpenGuideId\(null\)\} returnFocusRef=\{guideButtonRef\}/);
  assert.doesNotMatch(componentSource, /welcomeReturnRef/);
  assert.match(cssSource, /min-height:\s*44px/);
  assert.match(cssSource, /@media \(max-width: 768px\)/);
  assert.match(cssSource, /@media \(max-width: 390px\)/);
  assert.match(cssSource, /overflow-y:\s*auto/);
  assert.doesNotMatch(cssSource, /overflow-x:\s*(scroll|auto)/);
});

test("guidance remains presentation-only and does not alter Dashboard authorization", () => {
  assert.doesNotMatch(componentSource, /fetch\s*\(/);
  assert.doesNotMatch(componentSource, /localStorage/);
  assert.match(appSource, /const isReadOnlyAccess =\s*currentUser\?\.user\?\.access_mode === "read_only"/);
});

test("Greek desktop headings are deterministic and preserve original mobile/English text", () => {
  assert.equal(desktopDemoHeading(undefined, "gr"), undefined);
  const examples = [
    ["Τι βλέπετε", "ΤΙ ΒΛΕΠΕΤΕ"],
    ["Πώς λειτουργεί", "ΠΩΣ ΛΕΙΤΟΥΡΓΕΙ"],
    ["Επιχειρησιακή αξία", "ΕΠΙΧΕΙΡΗΣΙΑΚΗ ΑΞΙΑ"],
    ["Λειτουργία επίδειξης", "ΛΕΙΤΟΥΡΓΙΑ ΕΠΙΔΕΙΞΗΣ"],
  ];
  for (const [original, expected] of examples) {
    assert.equal(desktopDemoHeading(original, "gr"), expected);
    assert.equal(desktopDemoHeading(original.normalize("NFD"), "gr"), expected);
    assert.equal(desktopDemoHeading(original, "en"), original);
  }
  assert.equal(desktopDemoHeading("What you're seeing", "en"), "What you're seeing");
  assert.equal(desktopDemoHeading("How it works", "en"), "How it works");
  assert.equal(desktopDemoHeading("Operational value", "en"), "Operational value");
  assert.match(cssSource, /@media \(min-width: 769px\)\s*\{\s*\.demo-heading-mobile \{ display: none; \}/);
  assert.match(cssSource, /\.demo-heading-desktop \{ display: none; \}/);
  assert.match(cssSource, /\.demo-heading-desktop \{ display: inline; text-transform: none; \}/);
});
