import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const component = fs.readFileSync(path.join(directory, "../src/pages/Settings.jsx"), "utf8");
const styles = fs.readFileSync(path.join(directory, "../src/pages/Settings.css"), "utf8");
const profile = component.slice(component.indexOf("{profileSite && ("), component.indexOf("<h4>Residence Contact</h4>", component.indexOf("{profileSite && (")));

test("Site Profile has scoped sizing for the modal and all form controls", () => {
  assert.match(profile, /className="recipients-modal site-profile-modal"/);
  assert.match(styles, /\.site-profile-modal\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*980px;[^}]*box-sizing:\s*border-box;[^}]*overflow-x:\s*hidden;/s);
  assert.match(styles, /\.site-profile-modal \.settings-field[^}]*\{[^}]*width:\s*100%;[^}]*min-width:\s*0;[^}]*box-sizing:\s*border-box;/s);
  assert.match(styles, /\.site-profile-modal \.settings-field input,[\s\S]*?\.site-profile-modal \.settings-field select\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*100%;[^}]*min-width:\s*0;[^}]*box-sizing:\s*border-box;/s);
  for (const label of ["Full Address", "Site Phone", "Coverage Type", "Schedule Mode", "Days of Week", "Days of Month"]) {
    assert.ok(profile.includes(label), `${label} remains in the scoped modal`);
  }
});

test("Shift Rules use responsive rows, native time pickers, and compact remove controls", () => {
  assert.match(profile, /className="settings-field site-shift-rules"/);
  assert.match(profile, /className="site-shift-rule-header"/);
  assert.match(profile, /className="site-shift-rule-row"/);
  assert.match(profile, /className="site-shift-remove"/);
  assert.equal((profile.match(/type="time"/g) || []).length, 2);
  assert.doesNotMatch(profile, /gridTemplateColumns:\s*"1fr 1fr 1fr auto"/);
  assert.match(styles, /\.site-shift-rule-row\s*\{[^}]*margin-bottom:\s*10px;/s);
  assert.match(styles, /grid-template-columns:\s*minmax\(160px, 1\.4fr\) minmax\(130px, 1fr\) minmax\(130px, 1fr\) 44px;/);
  assert.match(styles, /\.site-profile-modal \.site-shift-remove\s*\{[^}]*width:\s*44px;[^}]*min-width:\s*44px;[^}]*max-width:\s*44px;[^}]*margin:\s*0;/s);
  assert.match(styles, /@media \(max-width: 700px\)\s*\{[\s\S]*?\.site-shift-rule-row\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) minmax\(0, 1fr\);/);
  assert.match(styles, /@media \(max-width: 430px\)\s*\{[\s\S]*?\.site-shift-rule-row\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\);/);
  assert.match(styles, /\.site-shift-mobile-label\s*\{\s*display:\s*block;/);
});
