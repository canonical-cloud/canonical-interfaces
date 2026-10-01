import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const fixturePath = "contracts/readiness-assessment/v1/instances/AssessmentReport/valid/basic-findings.json";
const report = JSON.parse(readFileSync(fixturePath, "utf8"));

const sha256 = /^(?:sha256:)?[0-9a-f]{64}$/;
const forbiddenKeys = new Set([
  "bucket",
  "objectKey",
  "signedUrl",
  "accessToken",
  "refreshToken",
  "apiKey",
  "privateKey",
  "password",
  "databaseUrl",
]);

function fail(message) {
  throw new Error(message);
}

function walk(value, path = "$") {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(entry, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) fail(`forbidden provider/secret field ${path}.${key}`);
    walk(child, `${path}.${key}`);
  }
}

export function assertAssessmentRuntime(value) {
  assert.equal(value.specVersion, "canonical.readiness.assessment.v1");
  if (!sha256.test(value.assessmentReportId)) fail("assessmentReportId must be a lowercase SHA-256 identity");

  const evidenceIds = new Set();
  for (const evidence of value.evidence) {
    if (evidenceIds.has(evidence.evidenceId)) fail(`duplicate evidenceId ${evidence.evidenceId}`);
    evidenceIds.add(evidence.evidenceId);
    if (!sha256.test(evidence.sha256)) fail(`invalid evidence sha256 ${evidence.evidenceId}`);
  }

  const targetIds = new Set();
  for (const target of value.targets) {
    if (targetIds.has(target.targetId)) fail(`duplicate targetId ${target.targetId}`);
    targetIds.add(target.targetId);
  }

  const findingIds = new Set();
  for (const finding of value.findings) {
    if (findingIds.has(finding.findingId)) fail(`duplicate findingId ${finding.findingId}`);
    findingIds.add(finding.findingId);
    if (!targetIds.has(finding.targetId)) fail(`finding ${finding.findingId} references unknown target ${finding.targetId}`);
    for (const evidenceId of finding.evidenceIds) {
      if (!evidenceIds.has(evidenceId)) fail(`finding ${finding.findingId} references unknown evidence ${evidenceId}`);
    }
  }

  for (const recommendation of value.recommendations) {
    for (const findingId of recommendation.sourceFindingIds) {
      if (!findingIds.has(findingId)) fail(`recommendation ${recommendation.recommendationId} references unknown finding ${findingId}`);
    }
  }

  const expected = {
    passed: value.findings.filter((f) => f.status === "pass").length,
    failed: value.findings.filter((f) => f.status === "fail").length,
    unknownCount: value.findings.filter((f) => f.status === "unknown").length,
    errors: value.findings.filter((f) => f.status === "error").length,
    highOrCriticalFailures: value.findings.filter((f) => f.status === "fail" && (f.severity === "high" || f.severity === "critical")).length,
  };
  assert.deepEqual(value.counts, expected, "assessment summary counts must exactly match findings");

  if (value.scoreBasisPoints !== undefined) {
    if (!Number.isInteger(value.scoreBasisPoints) || value.scoreBasisPoints < 0 || value.scoreBasisPoints > 10000) {
      fail("scoreBasisPoints must be an integer from 0 through 10000");
    }
  }

  walk(value);
  if (/\b(certified|certification issued|attested)\b/i.test(value.boundary)) {
    if (!/not an audit|not.*certification|not.*attestation/i.test(value.boundary)) {
      fail("boundary must not make an assurance claim");
    }
  }
}

assertAssessmentRuntime(report);

const cases = [
  ["missing evidence reference", (x) => { x.findings[0].evidenceIds = ["missing-evidence"]; }],
  ["missing target reference", (x) => { x.findings[0].targetId = "missing-target"; }],
  ["inconsistent summary", (x) => { x.counts.failed = 0; }],
  ["invalid evidence digest", (x) => { x.evidence[0].sha256 = "ABC123"; }],
  ["score overflow", (x) => { x.scoreBasisPoints = 10001; }],
  ["provider metadata leak", (x) => { x.bucket = "canonical-rdy-tenant"; }],
  ["secret field leak", (x) => { x.evidence[0].accessToken = "secret"; }],
  ["orphan recommendation", (x) => { x.recommendations[0].sourceFindingIds = ["missing-finding"]; }],
];

for (const [name, mutate] of cases) {
  const candidate = structuredClone(report);
  mutate(candidate);
  assert.throws(() => assertAssessmentRuntime(candidate), undefined, name);
}

console.log(`readiness assessment runtime invariants passed (${cases.length} negative cases)`);
