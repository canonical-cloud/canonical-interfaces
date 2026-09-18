import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const planUrl = new URL(
  "../contracts/reachability-probe/v1/instances/ReachabilityProbePlan/valid/external-db.json",
  import.meta.url,
);
const resultUrl = new URL(
  "../contracts/reachability-probe/v1/instances/ReachabilityProbeResultSet/valid/external-db.json",
  import.meta.url,
);

const plan = JSON.parse(readFileSync(planUrl, "utf8"));
const resultSet = JSON.parse(readFileSync(resultUrl, "utf8"));
const sha256 = /^[0-9a-f]{64}$/;
const clone = (value) => JSON.parse(JSON.stringify(value));

function validText(value, max = 256) {
  return typeof value === "string" && value.length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/u.test(value);
}

function validHost(host) {
  return validText(host, 253) && !/[\s\/@?*#]/u.test(host);
}

function validatePlan(value) {
  if (value.specVersion !== "canonical.worker.reachability-probe.v1") return false;
  if (!sha256.test(value.authorizationRefSha256) || !sha256.test(value.planSha256)) return false;
  if (!validText(value.perspectiveId) || !validText(value.trustZone)) return false;
  if (!Number.isInteger(value.timeoutSeconds) || value.timeoutSeconds < 1 || value.timeoutSeconds > 15) return false;
  if (!Number.isInteger(value.concurrency) || value.concurrency < 1 || value.concurrency > 8) return false;
  if (!Array.isArray(value.targets) || value.targets.length < 1 || value.targets.length > 32) return false;

  const ids = new Set();
  for (const target of value.targets) {
    if (!validText(target.targetId) || ids.has(target.targetId)) return false;
    ids.add(target.targetId);
    if (!validHost(target.host)) return false;
    if (!Number.isInteger(target.port) || target.port < 1 || target.port > 65535) return false;
  }

  for (const forbidden of [
    "command", "arguments", "cidr", "portRange", "payload", "credentials",
    "rate", "packetsPerSecond", "exploit", "scanRange",
  ]) {
    if (Object.hasOwn(value, forbidden)) return false;
  }
  return true;
}

function validateResultSet(value, admittedPlan) {
  if (value.specVersion !== "canonical.worker.reachability-probe-result.v1") return false;
  if (value.planSha256 !== admittedPlan.planSha256 || !sha256.test(value.planSha256)) return false;
  if (value.perspectiveId !== admittedPlan.perspectiveId) return false;
  if (!Array.isArray(value.results) || value.results.length > admittedPlan.targets.length) return false;

  const admitted = new Set(admittedPlan.targets.map((target) => target.targetId));
  const seen = new Set();
  const observations = new Set(["connected", "refused", "timed_out", "unreachable", "unresolved"]);
  for (const result of value.results) {
    if (!admitted.has(result.targetId) || seen.has(result.targetId)) return false;
    seen.add(result.targetId);
    if (!observations.has(result.observation)) return false;
    if (!Number.isInteger(result.elapsedMillis) || result.elapsedMillis < 0) return false;
  }
  return true;
}

assert.equal(validatePlan(plan), true);
assert.equal(validateResultSet(resultSet, plan), true);

for (const badHost of ["10.0.0.0/8", "*.example.com", "https://example.com", "host name", "user@host"] ) {
  const invalid = clone(plan);
  invalid.targets[0].host = badHost;
  assert.equal(validatePlan(invalid), false, `must reject host ${badHost}`);
}

const duplicate = clone(plan);
duplicate.targets[1].targetId = duplicate.targets[0].targetId;
assert.equal(validatePlan(duplicate), false);

const excessiveTimeout = clone(plan);
excessiveTimeout.timeoutSeconds = 16;
assert.equal(validatePlan(excessiveTimeout), false);

const excessiveConcurrency = clone(plan);
excessiveConcurrency.concurrency = 9;
assert.equal(validatePlan(excessiveConcurrency), false);

const badDigest = clone(plan);
badDigest.authorizationRefSha256 = "CHG-1234";
assert.equal(validatePlan(badDigest), false);

const scannerLike = clone(plan);
scannerLike.portRange = "1-65535";
assert.equal(validatePlan(scannerLike), false);

const unknownTarget = clone(resultSet);
unknownTarget.results[0].targetId = "not-admitted";
assert.equal(validateResultSet(unknownTarget, plan), false);

const duplicateResult = clone(resultSet);
duplicateResult.results[1].targetId = duplicateResult.results[0].targetId;
assert.equal(validateResultSet(duplicateResult, plan), false);

console.log("reachability probe runtime invariants verified");
