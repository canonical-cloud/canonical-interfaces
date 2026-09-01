import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export async function loadSchemaIndex(path) {
  const content = await readFile(path, "utf8");
  const index = JSON.parse(content);
  if (!Array.isArray(index.schemas) || index.schemas.length === 0) {
    throw new Error(`schema index ${path} must contain a non-empty schemas array`);
  }
  return index.schemas;
}

export async function loadSchema(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function unescapeLiteral(value) {
  return value.replace(/\\([\\.^$|?*+(){}\[\]-])/g, "$1");
}

function readQuantifier(pattern, index, fieldName) {
  if (index >= pattern.length) return { minimum: 1, next: index };
  if (pattern[index] === "?") return { minimum: 0, next: index + 1 };
  if (pattern[index] === "*") return { minimum: 0, next: index + 1 };
  if (pattern[index] === "+") return { minimum: 1, next: index + 1 };
  if (pattern[index] !== "{") return { minimum: 1, next: index };
  const close = pattern.indexOf("}", index + 1);
  if (close < 0) {
    throw new Error(`unterminated quantifier for ${fieldName}`);
  }
  const contents = pattern.slice(index + 1, close);
  const match = /^(\d+)(?:,(\d*)?)?$/.exec(contents);
  if (!match) {
    throw new Error(`unsupported quantifier {${contents}} for ${fieldName}`);
  }
  return { minimum: Number(match[1]), next: close + 1 };
}

function firstOfClass(source, fieldName) {
  let value = source;
  let negate = false;
  if (value.startsWith("^")) {
    negate = true;
    value = value.slice(1);
  }
  const candidates = [];
  for (let index = 0; index < value.length; index += 1) {
    const current = value[index];
    if (current === "\\") {
      const escaped = value[index + 1];
      if (escaped === "d") candidates.push("0");
      else if (escaped === "w") candidates.push("a");
      else if (escaped === "s") candidates.push(" ");
      else if (escaped) candidates.push(escaped);
      else throw new Error(`unterminated class escape for ${fieldName}`);
      index += 1;
      continue;
    }
    if (index + 2 < value.length && value[index + 1] === "-") {
      const end = value[index + 2];
      if (current <= "A" && "A" <= end) candidates.push("A");
      else if (current <= "a" && "a" <= end) candidates.push("a");
      else if (current <= "0" && "0" <= end) candidates.push("0");
      else candidates.push(current);
      index += 2;
      continue;
    }
    candidates.push(current);
  }
  if (!negate) {
    if (candidates.length === 0) {
      throw new Error(`empty character class for ${fieldName}`);
    }
    return candidates[0];
  }
  for (const candidate of ["a", "A", "0", "x", "-"]) {
    if (!candidates.includes(candidate)) return candidate;
  }
  throw new Error(`unsupported negated class for ${fieldName}`);
}

function satisfyPattern(pattern, fieldName) {
  if (typeof pattern !== "string" || pattern.length === 0) {
    throw new Error(`invalid pattern for ${fieldName}`);
  }
  let source = pattern;
  if (source.startsWith("^")) source = source.slice(1);
  if (source.endsWith("$")) source = source.slice(0, -1);
  let output = "";
  let index = 0;
  while (index < source.length) {
    let unit;
    if (source[index] === "[") {
      const close = source.indexOf("]", index + 1);
      if (close < 0) {
        throw new Error(`unterminated character class for ${fieldName}`);
      }
      unit = firstOfClass(source.slice(index + 1, close), fieldName);
      index = close + 1;
    } else if (source[index] === "(") {
      const close = source.indexOf(")", index + 1);
      if (close < 0) {
        throw new Error(`unterminated group for ${fieldName}`);
      }
      const alternatives = source.slice(index + 1, close).split("|");
      if (alternatives.some((alternative) => /[()[\]{}?*+]/.test(alternative))) {
        throw new Error(`non-literal alternation branch for ${fieldName}`);
      }
      unit = unescapeLiteral(alternatives[0]);
      index = close + 1;
    } else if (source[index] === "\\") {
      const escaped = source[index + 1];
      if (!escaped) throw new Error(`unterminated escape for ${fieldName}`);
      if (escaped === "d") unit = "0";
      else if (escaped === "w") unit = "a";
      else if (escaped === "s") unit = " ";
      else unit = escaped;
      index += 2;
    } else if (".|".includes(source[index])) {
      throw new Error(`unsupported regular expression token for ${fieldName}`);
    } else {
      unit = source[index];
      index += 1;
    }
    const quantifier = readQuantifier(source, index, fieldName);
    output += unit.repeat(quantifier.minimum);
    index = quantifier.next;
  }
  let expression;
  try {
    expression = new RegExp(pattern);
  } catch (error) {
    throw new Error(`invalid regular expression for ${fieldName}: ${error.message}`);
  }
  if (!expression.test(output)) {
    throw new Error(`cannot synthesize a value satisfying ${pattern} for ${fieldName}`);
  }
  return output;
}

function valueForSchema(schema, fieldName) {
  if (schema.const !== undefined) return clone(schema.const);
  if (schema.default !== undefined) return clone(schema.default);
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return clone(schema.enum[0]);
  }
  if (Array.isArray(schema.examples) && schema.examples.length > 0) {
    return clone(schema.examples[0]);
  }
  if (schema.type === "string") {
    switch (schema.format) {
      case "uuid":
        return "00000000-0000-4000-8000-000000000000";
      case "date-time":
        return "2026-01-01T00:00:00Z";
      case "email":
        return "conformance@example.invalid";
      case "uri":
        return "https://example.invalid/resource";
      default:
        if (schema.pattern) return satisfyPattern(schema.pattern, fieldName);
        return "value";
    }
  }
  if (schema.type === "integer" || schema.type === "number") {
    return schema.minimum ?? 0;
  }
  if (schema.type === "boolean") return true;
  if (schema.type === "array") {
    const minimum = Math.max(1, schema.minItems ?? 0);
    return Array.from({ length: minimum }, () =>
      valueForSchema(schema.items ?? {}, `${fieldName} item`),
    );
  }
  if (schema.type === "object") {
    return fixtureForDefinition(schema, fieldName);
  }
  if (Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    return valueForSchema(schema.anyOf[0], fieldName);
  }
  if (Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
    return valueForSchema(schema.oneOf[0], fieldName);
  }
  throw new Error(`cannot synthesize fixture for ${fieldName}`);
}

export function fixtureForDefinition(definition, definitionName) {
  if (!isObject(definition) || definition.type !== "object") {
    throw new Error(`definition ${definitionName} must be an object`);
  }
  const required = Array.isArray(definition.required) ? definition.required : [];
  const properties = isObject(definition.properties) ? definition.properties : {};
  const fixture = {};
  for (const fieldName of required) {
    const fieldSchema = properties[fieldName];
    if (!isObject(fieldSchema)) {
      throw new Error(`missing property schema for ${definitionName}.${fieldName}`);
    }
    fixture[fieldName] = valueForSchema(
      fieldSchema,
      `${definitionName}.${fieldName}`,
    );
  }
  for (const [fieldName, fieldSchema] of Object.entries(properties)) {
    if (Object.hasOwn(fixture, fieldName) || !isObject(fieldSchema)) continue;
    fixture[fieldName] = valueForSchema(
      fieldSchema,
      `${definitionName}.${fieldName}`,
    );
  }
  return fixture;
}

function collectObjectDefinitions(schema) {
  if (!isObject(schema.$defs)) {
    throw new Error(`schema ${schema.$id ?? "<unknown>"} must contain $defs`);
  }
  return Object.entries(schema.$defs)
    .filter(([, definition]) => definition?.type === "object")
    .map(([name, definition]) => ({ name, definition }));
}

export async function loadRegistry(schemaDirectory, indexPath) {
  const schemaPaths = await loadSchemaIndex(indexPath);
  const registry = [];
  for (const relativePath of schemaPaths) {
    if (typeof relativePath !== "string" || relativePath.length === 0) {
      throw new Error(`invalid schema path in ${indexPath}`);
    }
    const absolutePath = new URL(relativePath, pathToFileURL(`${schemaDirectory}/`));
    const schema = await loadSchema(absolutePath);
    for (const entry of collectObjectDefinitions(schema)) {
      registry.push({
        schemaPath: absolutePath,
        schema,
        name: entry.name,
        definition: entry.definition,
      });
    }
  }
  return registry;
}

const clone = (value) => JSON.parse(JSON.stringify(value));

export function mutationsForFixture(fixture, definition, name) {
  const required = Array.isArray(definition.required) ? definition.required : [];
  const properties = isObject(definition.properties) ? definition.properties : {};
  const mutations = [];
  if (required.length > 0) {
    const missing = clone(fixture);
    delete missing[required[0]];
    mutations.push({
      name: `${name}: missing required ${required[0]}`,
      value: missing,
    });
  }
  const wrongTypeField = Object.keys(properties).find((fieldName) =>
    Object.hasOwn(fixture, fieldName),
  );
  if (wrongTypeField) {
    const wrongType = clone(fixture);
    const expected = properties[wrongTypeField].type;
    wrongType[wrongTypeField] = expected === "string" ? 7 : "wrong-type";
    mutations.push({
      name: `${name}: wrong type for ${wrongTypeField}`,
      value: wrongType,
    });
  }
  if (definition.additionalProperties === false) {
    mutations.push({
      name: `${name}: unknown property`,
      value: { ...clone(fixture), unexpectedField: true },
    });
  }
  return mutations;
}
