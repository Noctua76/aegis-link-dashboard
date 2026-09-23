import test from "node:test";
import assert from "node:assert/strict";
import { gpsAccuracyLabel } from "../src/utils/gpsAccuracy.js";

test("missing and invalid GPS accuracy is Unknown", () => {
  for (const value of [null, undefined, "", "   ", "invalid", Number.NaN]) {
    assert.equal(gpsAccuracyLabel(value).label, "Unknown");
    assert.equal(gpsAccuracyLabel(value).className, "gps-accuracy-unknown");
  }
});

test("valid GPS accuracy thresholds remain unchanged", () => {
  assert.equal(gpsAccuracyLabel(0).label, "Excellent");
  assert.equal(gpsAccuracyLabel(20).label, "Excellent");
  assert.equal(gpsAccuracyLabel(20.1).label, "Good");
  assert.equal(gpsAccuracyLabel(50).label, "Good");
  assert.equal(gpsAccuracyLabel(50.1).label, "Fair");
  assert.equal(gpsAccuracyLabel(100).label, "Fair");
  assert.equal(gpsAccuracyLabel(100.1).label, "Poor");
  assert.equal(gpsAccuracyLabel(200).label, "Poor");
  assert.equal(gpsAccuracyLabel(200.1).label, "Very Poor / Unreliable");
});
