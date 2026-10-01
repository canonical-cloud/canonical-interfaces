import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const fixture = new URL(
  "../contracts/adversarial-readiness/v1/instances/AdversarialEvidenceReport/valid/network-boundary.json",
  import.meta.url,
);
const report = JSON.parse(readFileSync(fixture, "utf8"));
const sha256 = /^[0-9a-f]{64}$/;

assert.equal(report.specVersion, "canonical.adversarial-readiness.evidence.v1");
assert.match(report.authorizationRefSha256, sha256);
assert.ok(report.boundary.includes("not an audit"));

const targetIds = report.targets.map((target) => target.targetId);
assert.equal(new Set(targetIds).size, targetIds.length, "target ids must be unique");
for (const target of report.targets) {
  assert.match(target.locatorSha256, sha256);
  assert.equal(Object.hasOwn(target, "locator"), false, "portable targets must not expose raw locators");
  assert.equal(Object.hasOwn(target, "host"), false, "portable targets must not expose raw hosts");
  assert.equal(Object.hasOwn(target, "path"), false, "portable targets must not expose raw paths");
}

const checkIds = report.results.map((result) => result.checkId);
assert.equal(new Set(checkIds).size, checkIds.length, "check ids must be unique per report");
const knownTargets = new Set(targetIds);
for (const result of report.results) {
  assert.ok(knownTargets.has(result.targetId), `unknown targetId ${result.targetId}`);
  assert.ok(Array.isArray(result.sourceObservationIds));
  if (result.recommendation) {
    assert.ok(result.recommendation.catalogKey.includes("."));
    assert.ok(result.recommendation.controlLayers.length > 0);
  }
}

const counts = { pass: 0, finding: 0, unknown: 0, error: 0 };
for (const result of report.results) counts[result.status] += 1;
assert.deepEqual(report.summary, {
  passed: counts.pass,
  findings: counts.finding,
  unknownCount: counts.unknown,
  errors: counts.error,
});

console.log("adversarial readiness runtime invariants verified");
