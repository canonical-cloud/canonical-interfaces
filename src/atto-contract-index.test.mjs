import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { emitAttoContractIndex } from "./atto-contract-index.mjs";
import { build, loadTypes } from "./generate-output.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("Atto source projection includes every authored schema declaration and field", () => {
  const types = loadTypes();
  const source = build()["atto/contract_index.atto"];
  assert.equal((source.match(/_type_name\(\)/g) || []).length, types.length);
  for (const type of types) {
    const snake = type.name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
    assert.ok(source.includes(`canonical_${snake}_type_name()`), type.name);
    assert.ok(source.includes(`canonical_${snake}_field_count(): int { return ${type.props.length}; }`), type.name);
  }
  assert.equal(source, readFileSync(join(root, "generated/atto/contract_index.atto"), "utf8"));
});

test("Atto metadata emits stable required, nullable, reference and enum field tags", () => {
  const type = { name: "Example", props: [
    { name: "required_name", schema: { type: "string" }, required: true },
    { name: "nullable_count", schema: { type: ["integer", "null"] }, required: true },
    { name: "reference", schema: { $ref: "#/$defs/Other" }, required: false },
    { name: "status", schema: { type: "string", enum: ["ready"] }, required: true },
  ] };
  const text = emitAttoContractIndex([type]);
  assert.match(text, /field_0_wire_kind\(\): string \{ return "string"; \}/);
  assert.match(text, /field_1_wire_kind\(\): string \{ return "integer:nullable"; \}/);
  assert.match(text, /field_2_wire_kind\(\): string \{ return "ref:Other"; \}/);
  assert.match(text, /field_3_wire_kind\(\): string \{ return "string:enum"; \}/);
  assert.match(text, /field_2_required\(\): bool \{ return false; \}/);
  assert.equal(text, emitAttoContractIndex([structuredClone(type)]));
});

test("Atto projection fails closed for unsupported unions, external references and identifier collisions", () => {
  const entry = (name, schema) => ({ name, props: [{ name: "field", schema, required: true }] });
  assert.throws(() => emitAttoContractIndex([entry("X", { $ref: "https://external/schema" })]), /external reference/);
  assert.throws(() => emitAttoContractIndex([entry("X", { type: ["integer", "string"] })]), /multi-type union/);
  assert.throws(() => emitAttoContractIndex([entry("X", { type: "nonsense" })]), /schema type/);
  assert.throws(() => emitAttoContractIndex([entry("X", { type: "string" }), entry("X", { type: "string" })]), /duplicated/);
  assert.throws(() => emitAttoContractIndex([entry("X();", { type: "string" })]), /invalid/);
});

test("Atto projection remains source-only and free from executable transport", () => {
  const source = build()["atto/contract_index.atto"];
  assert.doesNotMatch(source, /\b(fetch|http|socket|token|probe|execute|eval)\s*\(/i);
  assert.match(source, /not a JSON validator, runtime SDK, or compiler conformance claim/);
});
