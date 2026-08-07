// Deterministic fixture synthesis for every $def in schema/index.json.
//
// Two fixtures per type, chosen to exercise the two ways a generated adapter
// goes wrong:
//
//   full     every field present; nullable fields carry a real value.
//   minimal  only schema-`required` fields; a required-but-nullable field is
//            explicitly null. This is the shape that caught the Dart emitter
//            casting `null as String`.
//
// Values are derived from the schema (const, enum, format, bounds) so the
// fixtures stay valid as the schema evolves, and are fully deterministic so a
// diff between two runs means a real change.

import { loadTypes, isNullable, isStringEnum } from "../../src/generate.mjs";

const nonNull = (s) => {
  if (!s || !Array.isArray(s.type)) return s;
  const types = s.type.filter((t) => t !== "null");
  return { ...s, type: types.length === 1 ? types[0] : types };
};
const refOf = (s) => (s && s.$ref ? s.$ref.split("/").pop() : null);

function stringValue(schema, fieldName) {
  if (Array.isArray(schema.enum) && schema.enum.length) return schema.enum[0];
  switch (schema.format) {
    case "uuid": return "00000000-0000-4000-8000-000000000000";
    case "date": return "2026-01-02";
    case "date-time": return "2026-01-02T03:04:05Z";
    case "email": return "conformance@example.test";
    case "uri": case "uri-reference": return "https://example.test/conformance";
    default: break;
  }
  // A `pattern` we cannot satisfy would produce a value the schema rejects, so
  // satisfyPattern throws rather than emitting something quietly invalid.
  if (schema.pattern) return satisfyPattern(schema.pattern, fieldName);
  const base = `${fieldName}-value`;
  const max = typeof schema.maxLength === "number" ? schema.maxLength : base.length;
  const min = typeof schema.minLength === "number" ? schema.minLength : 0;
  return base.slice(0, Math.max(max, min)).padEnd(min, "x");
}

function valueFor(schema, fieldName, byName, seen) {
  if (schema && "const" in schema) return schema.const;
  const s = nonNull(schema) || {};

  const ref = refOf(s);
  if (ref) {
    if (seen.has(ref)) return null; // cycle guard; only reachable via a nullable edge
    const target = byName.get(ref);
    if (!target) throw new Error(`fixtures: unknown $ref "${ref}"`);
    return objectFor(target, byName, new Set([...seen, ref]), /* full */ true);
  }

  switch (s.type) {
    case "string": return stringValue(s, fieldName);
    case "integer": {
      if (typeof s.minimum === "number") return s.minimum;
      if (typeof s.maximum === "number") return Math.min(1, s.maximum);
      return 1;
    }
    case "number": return typeof s.minimum === "number" ? s.minimum : 1.5;
    case "boolean": return true;
    case "array": {
      const count = Math.max(1, s.minItems || 1);
      return Array.from({ length: count }, (_, i) =>
        valueFor(s.items || {}, `${fieldName}Item${i}`, byName, seen));
    }
    default: return { conformance: "opaque" };
  }
}

function objectFor(type, byName, seen, full) {
  const out = {};
  for (const p of type.props) {
    const include = full || p.required;
    if (!include) continue;
    // minimal + required + nullable -> the explicit-null case.
    if (!full && isNullable(p.schema)) { out[p.name] = null; continue; }
    out[p.name] = valueFor(p.schema, p.name, byName, seen);
  }
  return out;
}

/** @returns {{name: string, variant: 'full'|'minimal', type: string, json: object}[]} */
export function buildFixtures(types = loadTypes()) {
  const byName = new Map(types.map((t) => [t.name, t]));
  const cases = [];
  for (const t of types) {
    for (const variant of ["full", "minimal"]) {
      cases.push({
        name: `${t.name}/${variant}`,
        variant,
        type: t.name,
        json: objectFor(t, byName, new Set([t.name]), variant === "full"),
      });
    }
  }
  return cases;
}

/**
 * Which keys a correct adapter must emit for a fixture, and which it must omit.
 * Schema-`required` keys are always present — including when the value is null,
 * matching serde without `skip_serializing_if`, Go without `omitempty`, and the
 * TypeScript `T | null` (rather than `T?`) declaration.
 */
export function expectedKeys(type, fixture) {
  const present = [];
  const absent = [];
  for (const p of type.props) {
    if (p.required) present.push(p.name);
    else if (fixture.variant === "full") present.push(p.name);
    else absent.push(p.name);
  }
  return { present, absent };
}

export { isStringEnum };
