#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const generatorPath = path.join(here, "generate.mjs");
const CONTRACT_SCHEMA = "https://json-schema.org/draft/2020-12/schema";
const FAMILY_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

class ConsumerCodegenError extends Error {}
const fail = (message) => { throw new ConsumerCodegenError(message); };
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

function parseArgs(argv) {
  const args = { projections: [], output: null, check: null };
  for (let index = 2; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--projection") {
      const entry = argv[++index];
      if (!entry || !entry.includes("=")) fail("--projection must be FAMILY=PATH");
      const separator = entry.indexOf("=");
      args.projections.push({ family: entry.slice(0, separator), file: entry.slice(separator + 1) });
    } else if (value === "--output") {
      args.output = argv[++index];
    } else if (value === "--check") {
      args.check = argv[++index];
    } else {
      fail(`unknown argument ${value}`);
    }
  }
  if (args.projections.length === 0) fail("at least one --projection FAMILY=PATH is required");
  if (Boolean(args.output) === Boolean(args.check)) fail("choose exactly one of --output or --check");
  return args;
}

function validateProjection(family, file) {
  if (!FAMILY_RE.test(family)) fail(`invalid contract family ${JSON.stringify(family)}`);
  if (!file) fail(`missing projection path for ${family}`);

  let projection;
  try {
    projection = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    fail(`cannot read projection ${family}: ${error.message}`);
  }
  if (projection.$schema !== CONTRACT_SCHEMA) fail(`${family}: projection is not Draft 2020-12`);
  if (projection["x-canonical-generated"] !== true) fail(`${family}: projection is not marked generated`);
  const source = projection["x-canonical-source"];
  if (!source || source.kind !== "admitted-contract-ir") {
    fail(`${family}: projection is not derived from admitted Contract IR`);
  }
  if (typeof source.runId !== "string" || source.runId.length === 0) fail(`${family}: missing admission runId`);
  if (typeof source.receiptDigest !== "string" || !/^[0-9a-f]{64}$/.test(source.receiptDigest)) {
    fail(`${family}: invalid admission receipt digest`);
  }
  if (!Array.isArray(source.declarations) || source.declarations.length === 0) {
    fail(`${family}: admitted projection has no source declarations`);
  }
  if (!projection.$defs || typeof projection.$defs !== "object" || Array.isArray(projection.$defs)) {
    fail(`${family}: projection has no $defs object`);
  }

  const names = Object.keys(projection.$defs).sort();
  if (names.length === 0) fail(`${family}: projection has no declarations`);
  const declared = source.declarations.map((entry) => entry?.name).sort();
  if (declared.some((name) => typeof name !== "string") || JSON.stringify(names) !== JSON.stringify(declared)) {
    fail(`${family}: projected declarations do not match admission provenance`);
  }
  for (const entry of source.declarations) {
    if (typeof entry.id !== "string" || entry.id.length === 0) fail(`${family}: declaration has no admitted id`);
    if (typeof entry.assertionDigest !== "string" || !/^[0-9a-f]{64}$/.test(entry.assertionDigest)) {
      fail(`${family}: declaration ${entry.name} has invalid assertion digest`);
    }
  }

  return { family, file: path.resolve(file), projection, names, source };
}

function listFiles(dir, prefix = "") {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const absolute = path.join(dir, name);
    const relative = prefix ? path.posix.join(prefix, name) : name;
    const stat = statSync(absolute);
    if (stat.isDirectory()) out.push(...listFiles(absolute, relative));
    else if (stat.isFile()) out.push(relative);
    else fail(`generated tree contains unsupported entry ${absolute}`);
  }
  return out;
}

function compareTrees(expectedDir, actualDir) {
  const expectedFiles = listFiles(expectedDir);
  const actualFiles = listFiles(actualDir);
  if (JSON.stringify(expectedFiles) !== JSON.stringify(actualFiles)) {
    fail(`consumer projection file-set drift:\nexpected ${expectedFiles.join(", ")}\nactual ${actualFiles.join(", ")}`);
  }
  const drift = [];
  for (const relative of expectedFiles) {
    const expected = readFileSync(path.join(expectedDir, relative));
    const actual = readFileSync(path.join(actualDir, relative));
    if (!expected.equals(actual)) drift.push(relative);
  }
  if (drift.length > 0) fail(`consumer projection content drift: ${drift.join(", ")}`);
}

function buildProvenance(inputs, stagedProjectionBytes) {
  const generator = readFileSync(generatorPath);
  return {
    schema: "canonical.generated-contract-consumers.provenance.v1",
    generated: true,
    editableAuthority: false,
    generator: {
      path: "src/generate.mjs",
      sha256: sha256(generator),
    },
    projections: inputs.map((input) => ({
      family: input.family,
      projectionSha256: sha256(stagedProjectionBytes.get(input.family)),
      admissionRunId: input.source.runId,
      admissionReceiptDigest: input.source.receiptDigest,
      declarations: input.source.declarations.map((entry) => ({
        id: entry.id,
        name: entry.name,
        assertionDigest: entry.assertionDigest,
      })),
    })),
  };
}

export function generateFromAdmittedProjections(projections, outputDir) {
  const inputs = projections.map(({ family, file }) => validateProjection(family, file));
  const familySet = new Set();
  const declarationSet = new Map();
  for (const input of inputs) {
    if (familySet.has(input.family)) fail(`duplicate contract family ${input.family}`);
    familySet.add(input.family);
    for (const name of input.names) {
      const previous = declarationSet.get(name);
      if (previous) fail(`declaration ${name} is admitted by both ${previous} and ${input.family}`);
      declarationSet.set(name, input.family);
    }
  }
  inputs.sort((left, right) => left.family.localeCompare(right.family));

  const tempRoot = mkdtempSync(path.join(os.tmpdir(), "canonical-admitted-codegen-"));
  try {
    const tempSrc = path.join(tempRoot, "src");
    const tempSchema = path.join(tempRoot, "schema");
    mkdirSync(tempSrc, { recursive: true });
    mkdirSync(tempSchema, { recursive: true });
    cpSync(generatorPath, path.join(tempSrc, "generate.mjs"));

    const stagedProjectionBytes = new Map();
    const schemaFiles = [];
    for (const input of inputs) {
      const fileName = `${input.family}.schema.json`;
      const bytes = Buffer.from(stableJson(input.projection), "utf8");
      stagedProjectionBytes.set(input.family, bytes);
      writeFileSync(path.join(tempSchema, fileName), bytes);
      schemaFiles.push(fileName);
    }
    writeFileSync(
      path.join(tempSchema, "index.json"),
      stableJson({
        $schema: CONTRACT_SCHEMA,
        title: "CanonicalAdmittedConsumerProjectionIndex",
        schemas: schemaFiles,
      }),
    );

    const run = spawnSync(process.execPath, [path.join(tempSrc, "generate.mjs")], {
      cwd: tempRoot,
      encoding: "utf8",
      env: { ...process.env, CANONICAL_CODEGEN_SOURCE: "admitted-contract-ir" },
    });
    if (run.status !== 0) {
      fail(`existing language generator rejected admitted projections (exit ${run.status}):\n${run.stderr || run.stdout}`);
    }

    const tempGenerated = path.join(tempRoot, "generated");
    if (!existsSync(tempGenerated)) fail("existing language generator produced no generated tree");
    rmSync(outputDir, { recursive: true, force: true });
    mkdirSync(path.dirname(outputDir), { recursive: true });
    cpSync(tempGenerated, outputDir, { recursive: true });
    writeFileSync(path.join(outputDir, "contract-provenance.json"), stableJson(buildProvenance(inputs, stagedProjectionBytes)));
    return { outputDir, files: listFiles(outputDir) };
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

export function main(argv = process.argv) {
  const args = parseArgs(argv);
  const projections = args.projections.map(({ family, file }) => ({ family, file: path.resolve(root, file) }));
  if (args.output) {
    const output = path.resolve(root, args.output);
    const result = generateFromAdmittedProjections(projections, output);
    console.log(`generated ${result.files.length} admitted consumer artifact(s) under ${path.relative(root, output)}`);
    return;
  }

  const expected = path.resolve(root, args.check);
  const scratch = mkdtempSync(path.join(os.tmpdir(), "canonical-admitted-check-"));
  try {
    const actual = path.join(scratch, "generated");
    generateFromAdmittedProjections(projections, actual);
    compareTrees(expected, actual);
    console.log(`admitted consumer artifacts are current: ${path.relative(root, expected)}`);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  try {
    main();
  } catch (error) {
    console.error(`generate-admitted-contract-consumers: ${error.message}`);
    process.exitCode = 1;
  }
}
