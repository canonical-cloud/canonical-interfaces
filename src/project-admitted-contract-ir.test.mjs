import test from "node:test";
import assert from "node:assert/strict";

import { ProjectionError, projectContractIr } from "./project-admitted-contract-ir.mjs";

function admittedIr() {
  return {
    status: "passed",
    admissible: true,
    editableAuthority: false,
    authorities: {
      precedence: "none",
      generatedJsonSchema: "comparison-evidence-only",
      jsonSchema: "independently-authored",
      typespec: "independently-authored",
    },
    admission: {
      receipt: {
        status: "passed",
        zeroUnexplainedFindings: true,
        runId: "run-123",
        digest: "abc123",
      },
      scope: {
        complete: true,
        admittedDeclarations: 2,
        excludedDeclarations: 0,
      },
    },
    declarations: [
      {
        id: "Canonical.ReadinessAssessment.V1.AssessmentCounts",
        assertionDigest: "digest-counts",
        names: { authoredJsonSchema: "AssessmentCounts" },
        assertionSchema: {
          type: "object",
          properties: { passed: { type: "integer" } },
          required: ["passed"],
          unevaluatedProperties: false,
        },
      },
      {
        id: "Canonical.ReadinessAssessment.V1.AssessmentFindingStatus",
        assertionDigest: "digest-status",
        names: { authoredJsonSchema: "AssessmentFindingStatus" },
        assertionSchema: { type: "string", enum: ["pass", "fail", "unknown", "error"] },
      },
    ],
  };
}

test("projects only admitted common assertion schemas", () => {
  const projection = projectContractIr(admittedIr());
  assert.equal(projection["x-canonical-generated"], true);
  assert.equal(projection["x-canonical-source"].kind, "admitted-contract-ir");
  assert.equal(projection["x-canonical-source"].runId, "run-123");
  assert.deepEqual(Object.keys(projection.$defs).sort(), ["AssessmentCounts", "AssessmentFindingStatus"]);
  assert.equal(projection.$defs.AssessmentCounts.$id, "AssessmentCounts");
  assert.equal(projection.$defs.AssessmentCounts.$schema, "https://json-schema.org/draft/2020-12/schema");
});

for (const [name, mutate] of [
  ["non-admitted IR", (ir) => { ir.admissible = false; }],
  ["editable IR", (ir) => { ir.editableAuthority = true; }],
  ["authority precedence", (ir) => { ir.authorities.precedence = "json-schema"; }],
  ["unclean receipt", (ir) => { ir.admission.receipt.zeroUnexplainedFindings = false; }],
  ["incomplete scope", (ir) => { ir.admission.scope.complete = false; }],
  ["excluded declaration", (ir) => { ir.admission.scope.excludedDeclarations = 1; }],
  ["missing assertion schema", (ir) => { delete ir.declarations[0].assertionSchema; }],
  ["duplicate declaration", (ir) => { ir.declarations[1].names.authoredJsonSchema = "AssessmentCounts"; }],
  ["count mismatch", (ir) => { ir.admission.scope.admittedDeclarations = 3; }],
]) {
  test(`fails closed for ${name}`, () => {
    const ir = admittedIr();
    mutate(ir);
    assert.throws(() => projectContractIr(ir), ProjectionError);
  });
}
