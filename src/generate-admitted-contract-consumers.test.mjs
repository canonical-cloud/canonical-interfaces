import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { generateFromAdmittedProjections } from "./generate-admitted-contract-consumers.mjs";

const digest = (char) => char.repeat(64);

function projection(name, runId = "run-1") {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "canonical.admitted-contract-projection.v1.schema.json",
    "x-canonical-generated": true,
    "x-canonical-source": {
      kind: "admitted-contract-ir",
      runId,
      receiptDigest: digest("a"),
      declarations: [{ id: `decl:${name}`, name, assertionDigest: digest("b") }],
    },
    $defs: {
      [name]: {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        $id: name,
        type: "object",
        properties: {
          wireName: { type: "string" },
        },
        required: ["wireName"],
        unevaluatedProperties: false,
      },
    },
  };
}

function withScratch(fn) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "canonical-admitted-codegen-test-"));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function writeProjection(dir, fileName, value) {
  const file = path.join(dir, fileName);
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
  return file;
}

test("generates existing language adapters without mutating an authority", () => withScratch((dir) => {
  const alpha = writeProjection(dir, "alpha.json", projection("AlphaEvidence", "run-alpha"));
  const output = path.join(dir, "generated");

  const result = generateFromAdmittedProjections([{ family: "alpha", file: alpha }], output);
  assert.ok(result.files.includes("rust/src/lib.rs"));
  assert.ok(result.files.includes("typescript/index.ts"));
  assert.ok(result.files.includes("contract-provenance.json"));

  const rust = readFileSync(path.join(output, "rust/src/lib.rs"), "utf8");
  const ts = readFileSync(path.join(output, "typescript/index.ts"), "utf8");
  const provenance = JSON.parse(readFileSync(path.join(output, "contract-provenance.json"), "utf8"));
  assert.match(rust, /pub struct AlphaEvidence/);
  assert.match(ts, /export type AlphaEvidence/);
  assert.match(ts, /wireName: string/);
  assert.equal(provenance.projections[0].admissionRunId, "run-alpha");
  assert.equal(provenance.editableAuthority, false);
}));

test("generation is deterministic regardless of projection argument order", () => withScratch((dir) => {
  const alpha = writeProjection(dir, "alpha.json", projection("AlphaEvidence", "run-alpha"));
  const beta = writeProjection(dir, "beta.json", projection("BetaEvidence", "run-beta"));
  const left = path.join(dir, "left");
  const right = path.join(dir, "right");

  generateFromAdmittedProjections([
    { family: "beta", file: beta },
    { family: "alpha", file: alpha },
  ], left);
  generateFromAdmittedProjections([
    { family: "alpha", file: alpha },
    { family: "beta", file: beta },
  ], right);

  for (const relative of ["rust/src/lib.rs", "typescript/index.ts", "contract-provenance.json"]) {
    assert.equal(readFileSync(path.join(left, relative), "utf8"), readFileSync(path.join(right, relative), "utf8"));
  }
}));

test("rejects a schema that is not an admitted generated projection", () => withScratch((dir) => {
  const authored = projection("AuthoredOnly");
  delete authored["x-canonical-generated"];
  const file = writeProjection(dir, "authored.json", authored);
  assert.throws(
    () => generateFromAdmittedProjections([{ family: "authored", file }], path.join(dir, "out")),
    /not marked generated/,
  );
}));

test("rejects declaration collisions across admitted families", () => withScratch((dir) => {
  const left = writeProjection(dir, "left.json", projection("SharedType", "run-left"));
  const right = writeProjection(dir, "right.json", projection("SharedType", "run-right"));
  assert.throws(
    () => generateFromAdmittedProjections([
      { family: "left", file: left },
      { family: "right", file: right },
    ], path.join(dir, "out")),
    /admitted by both left and right/,
  );
}));

test("rejects missing admission provenance", () => withScratch((dir) => {
  const value = projection("MissingReceipt");
  value["x-canonical-source"].receiptDigest = "not-a-digest";
  const file = writeProjection(dir, "invalid.json", value);
  assert.throws(
    () => generateFromAdmittedProjections([{ family: "invalid", file }], path.join(dir, "out")),
    /invalid admission receipt digest/,
  );
}));
