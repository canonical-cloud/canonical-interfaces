#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
export const SOURCE_PATH = path.join(
  root,
  "contracts",
  "pre-interest",
  "v1",
  "pre-interest.schema.json",
);
export const OUTPUT_PATH = path.join(root, "schema", "pre-interest.schema.json");

const OBJECT_TYPES = Object.freeze([
  "PreInterestRegistrationRequest",
  "PreInterestRegistrationResponse",
  "PreInterestProblem",
]);
const ENUM_TYPES = Object.freeze(["PartyType", "InterestArea"]);

function fail(message) {
  throw new Error(`PRE_INTEREST_PROJECTION_INVALID: ${message}`);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertExactKeys(actual, expected, label) {
  const left = [...actual].sort();
  const right = [...expected].sort();
  if (JSON.stringify(left) !== JSON.stringify(right)) {
    fail(`${label} keys differ: ${left.join(",")}`);
  }
}

function validateEnum(name, value) {
  if (
    !isObject(value) ||
    value.type !== "string" ||
    !Array.isArray(value.enum) ||
    value.enum.length < 1 ||
    value.enum.some((item) => typeof item !== "string" || item.length < 1) ||
    new Set(value.enum).size !== value.enum.length
  ) {
    fail(`${name} must be a non-empty unique string enum`);
  }
}

function validateObjectType(name, value) {
  if (
    !isObject(value) ||
    value.type !== "object" ||
    value.additionalProperties !== false ||
    !isObject(value.properties) ||
    !Array.isArray(value.required)
  ) {
    fail(`${name} must be a closed object with properties and required`);
  }
  const properties = new Set(Object.keys(value.properties));
  for (const required of value.required) {
    if (typeof required !== "string" || !properties.has(required)) {
      fail(`${name} has an invalid required property`);
    }
  }
}

export function validateContractSource(source) {
  if (
    !isObject(source) ||
    source.$schema !== "https://json-schema.org/draft/2020-12/schema" ||
    source.$id !==
      "https://interfaces.canonical.plus/pre-interest/v1/pre-interest.schema.json" ||
    !isObject(source.$defs)
  ) {
    fail("unexpected source identity");
  }
  assertExactKeys(
    Object.keys(source.$defs),
    [...ENUM_TYPES, ...OBJECT_TYPES],
    "$defs",
  );
  for (const name of ENUM_TYPES) validateEnum(name, source.$defs[name]);
  for (const name of OBJECT_TYPES) validateObjectType(name, source.$defs[name]);
  return source;
}

function inlineReferences(value, definitions) {
  if (Array.isArray(value)) {
    return value.map((item) => inlineReferences(item, definitions));
  }
  if (!isObject(value)) return value;

  if (Object.hasOwn(value, "$ref")) {
    if (Object.keys(value).length !== 1 || typeof value.$ref !== "string") {
      fail("a local enum reference must contain only $ref");
    }
    const match = /^#\/\$defs\/([A-Za-z][A-Za-z0-9]*)$/.exec(value.$ref);
    if (!match || !ENUM_TYPES.includes(match[1])) {
      fail(`unsupported reference ${value.$ref}`);
    }
    const target = definitions[match[1]];
    validateEnum(match[1], target);
    return { type: "string", enum: [...target.enum] };
  }

  const projected = {};
  for (const [key, nested] of Object.entries(value)) {
    projected[key] = inlineReferences(nested, definitions);
  }
  if (
    projected.type === "string" &&
    typeof projected.const === "string" &&
    !Object.hasOwn(projected, "enum")
  ) {
    projected.enum = [projected.const];
    delete projected.const;
  }
  return projected;
}

export function buildProjection(source) {
  const checked = validateContractSource(structuredClone(source));
  const definitions = {};
  for (const name of OBJECT_TYPES) {
    definitions[name] = inlineReferences(checked.$defs[name], checked.$defs);
  }
  const result = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://interfaces.canonical.plus/schema/pre-interest.schema.json",
    title: "CanonicalPreInterestGeneratedProjection",
    description:
      "Deterministic generator-compatible projection of contracts/pre-interest/v1/pre-interest.schema.json. Do not edit by hand.",
    "x-canonical-source":
      "contracts/pre-interest/v1/pre-interest.schema.json",
    $defs: definitions,
  };
  if (JSON.stringify(result).includes('"$ref"')) {
    fail("projection contains a dangling reference");
  }
  return result;
}

export function renderProjection(source) {
  return `${JSON.stringify(buildProjection(source), null, 2)}\n`;
}

function loadSource() {
  return JSON.parse(fs.readFileSync(SOURCE_PATH, "utf8"));
}

function writeProjection() {
  fs.writeFileSync(OUTPUT_PATH, renderProjection(loadSource()), "utf8");
}

function checkProjection() {
  const expected = renderProjection(loadSource());
  const observed = fs.existsSync(OUTPUT_PATH)
    ? fs.readFileSync(OUTPUT_PATH, "utf8")
    : "";
  if (observed !== expected) {
    fail("schema/pre-interest.schema.json is missing or stale");
  }
}

function main(argv = process.argv.slice(2)) {
  if (argv.length !== 1) {
    fail("usage: project-pre-interest-contract.mjs --write|--check");
  }
  if (argv[0] === "--write") writeProjection();
  else if (argv[0] === "--check") checkProjection();
  else fail("usage: project-pre-interest-contract.mjs --write|--check");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    console.error(
      error instanceof Error
        ? error.message
        : "PRE_INTEREST_PROJECTION_INVALID",
    );
    process.exitCode = 1;
  }
}
