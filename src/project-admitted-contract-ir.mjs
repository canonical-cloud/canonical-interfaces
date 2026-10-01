#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

export class ProjectionError extends Error {}
const fail = (message) => { throw new ProjectionError(message); };

export function projectContractIr(ir) {
  if (!ir || typeof ir !== "object") fail("Contract IR must be an object");
  if (ir.status !== "passed" || ir.admissible !== true) {
    fail("Contract IR is not admitted");
  }
  if (ir.editableAuthority === true) fail("Contract IR must not be an editable authority");
  if (ir.authorities?.precedence !== "none") {
    fail("Contract IR must preserve peer-authority precedence=none");
  }
  if (ir.authorities?.generatedJsonSchema !== "comparison-evidence-only") {
    fail("generated JSON Schema must remain comparison evidence only");
  }
  if (ir.admission?.receipt?.status !== "passed" || ir.admission?.receipt?.zeroUnexplainedFindings !== true) {
    fail("Contract IR admission receipt is not clean");
  }
  if (ir.admission?.scope?.complete !== true || ir.admission?.scope?.excludedDeclarations !== 0) {
    fail("Contract IR admission scope is incomplete");
  }
  if (!Array.isArray(ir.declarations) || ir.declarations.length === 0) {
    fail("Contract IR contains no declarations");
  }

  const defs = {};
  const sourceDeclarations = [];
  for (const declaration of ir.declarations) {
    const name = declaration?.names?.authoredJsonSchema;
    if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name)) {
      fail(`invalid projected declaration name: ${JSON.stringify(name)}`);
    }
    if (Object.hasOwn(defs, name)) fail(`duplicate projected declaration: ${name}`);
    if (!declaration.assertionSchema || typeof declaration.assertionSchema !== "object") {
      fail(`declaration ${name} has no admitted assertionSchema`);
    }
    const schema = structuredClone(declaration.assertionSchema);
    schema.$schema = "https://json-schema.org/draft/2020-12/schema";
    schema.$id = name;
    defs[name] = schema;
    sourceDeclarations.push({
      id: declaration.id,
      name,
      assertionDigest: declaration.assertionDigest,
    });
  }

  const admittedCount = ir.admission?.scope?.admittedDeclarations;
  if (admittedCount !== undefined && admittedCount !== sourceDeclarations.length) {
    fail(`projected ${sourceDeclarations.length} declarations but admission says ${admittedCount}`);
  }

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "canonical.admitted-contract-projection.v1.schema.json",
    "x-canonical-generated": true,
    "x-canonical-source": {
      kind: "admitted-contract-ir",
      runId: ir.admission.receipt.runId,
      receiptDigest: ir.admission.receipt.digest,
      declarations: sourceDeclarations,
    },
    $defs: defs,
  };
}

function parseArgs(argv) {
  const args = { input: null, output: null, check: null };
  for (let index = 2; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--input") args.input = argv[++index];
    else if (value === "--output") args.output = argv[++index];
    else if (value === "--check") args.check = argv[++index];
    else fail(`unknown argument ${value}`);
  }
  if (!args.input) fail("--input is required");
  if (!args.output && !args.check) fail("--output or --check is required");
  if (args.output && args.check) fail("choose exactly one of --output or --check");
  return args;
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function main(argv = process.argv) {
  const args = parseArgs(argv);
  const ir = JSON.parse(fs.readFileSync(args.input, "utf8"));
  const projection = stableJson(projectContractIr(ir));
  if (args.output) {
    fs.mkdirSync(path.dirname(args.output), { recursive: true });
    fs.writeFileSync(args.output, projection);
    return;
  }
  const current = fs.readFileSync(args.check, "utf8");
  if (current !== projection) {
    fail(`projection drift: ${args.check} does not match admitted Contract IR ${args.input}`);
  }
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    main();
  } catch (error) {
    console.error(`project-admitted-contract-ir: ${error.message}`);
    process.exitCode = 1;
  }
}
