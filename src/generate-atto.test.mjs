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
