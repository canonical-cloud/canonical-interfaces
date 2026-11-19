import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

// Security-reviewed upstream commit: production npm lock resolves undici 6.29.1.
// A replacement must be audited and changed here in the same reviewed PR.
const admittedValidatorSha = "f386c78e44c93309029e186799d926c652cb0d96";
const olderVulnerableSha = "2d3b187aec68477cff579f2f3a9275ea5ef62f88";

function assertAdmittedValidatorWorkflow(source) {
  const revisions = [...source.matchAll(/^\s*TJSV_REVISION:\s*([0-9a-f]{40})\s*$/gm)];
  const actions = [...source.matchAll(/^\s*uses:\s*ORESoftware\/typespec-json-schema-validator@([0-9a-f]{40})\s*$/gm)];
  assert.equal(revisions.length, 1, "one exact validator checkout revision required");
  assert.equal(actions.length, 1, "one exact validator action SHA required");
  assert.equal(revisions[0][1], actions[0][1], "validator runtime and action pins must match");
  assert.equal(revisions[0][1], admittedValidatorSha, "validator revision has not passed dependency-security review");
  assert.notEqual(revisions[0][1], olderVulnerableSha, "do not reintroduce the undici 6.28.1 lock");
  assert.match(source, /ref:\s*\$\{\{\s*env\.TJSV_REVISION\s*\}\}/);
  assert.doesNotMatch(source, /continue-on-error:\s*true/);
}

const workflow = await readFile(new URL("../.github/workflows/canonical-audit-config-contract.yml", import.meta.url), "utf8");

test("TJSV checkout and action share the independently admitted, immutable security pin", () => {
  assertAdmittedValidatorWorkflow(workflow);
});

test("reject known vulnerable validator rollback even when both references match", () => {
  assert.throws(() => assertAdmittedValidatorWorkflow(workflow.replaceAll(admittedValidatorSha, olderVulnerableSha)),
    /dependency-security review/);
});

test("reject mismatched action and runtime SHA, branch names, and missing evidence", () => {
  const action = "ORESoftware/typespec-json-schema-validator@" + admittedValidatorSha;
  const oldAction = "ORESoftware/typespec-json-schema-validator@" + olderVulnerableSha;
  assert.throws(() => assertAdmittedValidatorWorkflow(workflow.replace(action, oldAction)), /pins must match/);
  assert.throws(() => assertAdmittedValidatorWorkflow(workflow.replace(action, "ORESoftware/typespec-json-schema-validator@main")), /one exact validator action SHA/);
  assert.throws(() => assertAdmittedValidatorWorkflow(workflow.replace(/\n\s*uses:\s*ORESoftware\/typespec-json-schema-validator@[^\n]+/, "")), /one exact validator action SHA/);
});
