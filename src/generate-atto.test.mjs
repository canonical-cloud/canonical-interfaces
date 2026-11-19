import { test } from "node:test";
import assert from "node:assert/strict";
import { build, loadTypes } from "./generate-output.mjs";
import { emitAttoBounds } from "./generate-atto.mjs";

test("AttoLang bounds projection is included and covers every constrained scalar/list", () => {
  const source = build()["atto/bounds.atto"];
  assert.equal(typeof source, "string");
  assert.match(source, /pub fnc within_changes_query_limit_value\(int value\): bool/);
  assert.match(source, /if value < 1 then return false; fi/);
  assert.match(source, /if value > 500 then return false; fi/);
  assert.match(source, /pub fnc within_quote_request_notes_length\(int length\): bool/);
  assert.match(source, /if length < 0 then return false; fi/);
  assert.match(source, /if length > 5000 then return false; fi/);
  assert.match(source, /pub fnc within_mutation_request_operations_count\(int count\): bool/);
  assert.match(source, /if count > 50 then return false; fi/);
  const expectedCount = loadTypes().flatMap((t) => t.props)
    .filter(({ schema }) => {
      const type = Array.isArray(schema.type) ? schema.type.filter((v) => v !== "null")[0] : schema.type;
      const keys = type === "integer" ? ["minimum", "maximum"]
        : type === "string" ? ["minLength", "maxLength"]
        : type === "array" ? ["minItems", "maxItems"] : [];
      return keys.some((key) => schema[key] !== undefined);
    }).length;
  assert.equal((source.match(/^pub fnc /gm) || []).length, expectedCount);
  assert.doesNotMatch(source, /\b(fetch|http|throw|unsafe|export type)\b/);
});

test("AttoLang projection fails closed on unsafe bounds and identifier collisions", () => {
  const mk = (name, schema) => [{ name: "Fixture", props: [{ name, schema }] }];
  assert.throws(() => emitAttoBounds(mk("count", { type: "integer", maximum: 1.5 })), /safe integer/);
  assert.throws(() => emitAttoBounds(mk("count", { type: "array", maxItems: -1 })), /safe integer/);
  assert.throws(() => emitAttoBounds(mk("count", { type: "string", minLength: 3, maxLength: 2 })), /minimum exceeds maximum/);
  assert.throws(() => emitAttoBounds([{ name: "Fixture", props: [
    { name: "camelCase", schema: { type: "string", maxLength: 8 } },
    { name: "camel_case", schema: { type: "string", maxLength: 8 } },
  ] }]), /duplicate/);
  assert.throws(() => emitAttoBounds(mk("noop", { type: "boolean" })), /silently become empty/);
});

test("AttoLang projection rejects unsupported or mismatched constraint keywords", () => {
  const mk = (schema) => [{ name: "Fixture", props: [{ name: "size", schema }] }];
  assert.throws(() => emitAttoBounds(mk({ type: "integer", exclusiveMinimum: 0 })), /unsupported bound keyword/);
  assert.throws(() => emitAttoBounds(mk({ type: "integer", multipleOf: 2, maximum: 10 })), /unsupported bound keyword/);
  assert.throws(() => emitAttoBounds(mk({ type: "string", maximum: 8 })), /unsupported bound keyword/);
  assert.throws(() => emitAttoBounds(mk({ type: "number", maximum: 8 })), /unsupported constrained type/);
  assert.throws(() => emitAttoBounds(mk({ type: ["string", "integer"], maxLength: 8 })), /unsupported constrained type/);
  assert.throws(() => emitAttoBounds(mk(null)), /invalid property schema/);
  assert.throws(() => emitAttoBounds(mk({ type: "string", maxLength: 9007199254740992 })), /safe integer/);
});

test("AttoLang integer and collection boundaries preserve their comparisons", () => {
  const generated = emitAttoBounds([
    { name: "Fixture", props: [
      { name: "count", schema: { type: "integer", minimum: -2, maximum: 2 } },
      { name: "items", schema: { type: "array", maxItems: 0 } },
      { name: "label", schema: { type: ["string", "null"], minLength: 1 } },
    ] },
  ])["atto/bounds.atto"];
  assert.match(generated, /if value < -2 then return false; fi/);
  assert.match(generated, /if value > 2 then return false; fi/);
  assert.match(generated, /if count < 0 then return false; fi/);
  assert.match(generated, /if count > 0 then return false; fi/);
  assert.match(generated, /if length < 1 then return false; fi/);
  assert.equal((generated.match(/^pub fnc /gm) || []).length, 3);
});


test("AttoLang bounds projection rejects duplicate nullable union entries", () => {
  const fixture = (type) => [{ name: "Fixture", props: [
    { name: "quantity", schema: { type, maximum: 50 } },
  ] }];
  assert.throws(() => emitAttoBounds(fixture(["integer", "null", "null"])),
    /unsupported constrained type/);
  assert.throws(() => emitAttoBounds(fixture(["integer", "integer"])),
    /unsupported constrained type/);
  assert.match(emitAttoBounds(fixture(["integer", "null"]))["atto/bounds.atto"],
    /within_fixture_quantity_value/);
});
