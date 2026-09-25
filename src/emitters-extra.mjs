// Additional language emitters for the generated interface types.
//
// generate.mjs owns the schema loading, validation and the six original
// targets; this module holds the rest, so that adding a language is a self
// contained addition rather than another 60 lines in an already long file.
//
// Every emitter here takes the visibility partition — { public, internal } —
// and returns TWO artifacts: the published surface, and an internal surface
// that the language itself keeps out of reach of an external consumer. The
// mechanism differs per language (Cargo feature, Go internal/, JPMS exports,
// Kotlin opt-in, Swift module ACL, Ruby private_constant, ...), but the rule
// is the same everywhere: an outside caller cannot name an internal type
// without deliberately reaching past a boundary the compiler or runtime knows
// about.
//
// Enum-valued fields stay plain strings on the models, with the permitted
// values emitted alongside as constants. A strict native enum would throw on a
// server value the client predates; the vocabulary is still published so
// callers get the same information a native enum would give them.

import {
  pascal, snake, camel, oneLine, refName, isNullable, isStringEnum,
  nonNullSchema, enumTypeName, cLine, cBlock, BANNER,
} from "./generate.mjs";

const SCREAM = (s) => snake(s).toUpperCase();
const head = (comment, extra = []) => [`${comment} ${BANNER}`, "", ...extra];

// Enum vocabularies for one set of types, as [constName, values] pairs.
function enumsOf(types) {
  const out = [];
  for (const t of types) {
    for (const p of t.props) {
      if (isStringEnum(p.schema)) {
        out.push([enumTypeName(t.name, p.name), nonNullSchema(p.schema).enum.slice()]);
      }
    }
  }
  return out;
}

// --- java --------------------------------------------------------------------
// One public class per file (the language requires it), and a module-info.java
// that exports only the public package. JPMS is the enforced boundary: a
// consumer module cannot `requires` its way into `...interfaces.internal`.

const JAVA_PKG = "cloud.canonical.interfaces";
const JAVA_KEYWORDS = new Set([
  "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char", "class", "const",
  "continue", "default", "do", "double", "else", "enum", "extends", "final", "finally", "float",
  "for", "goto", "if", "implements", "import", "instanceof", "int", "interface", "long", "native",
  "new", "package", "private", "protected", "public", "return", "short", "static", "strictfp",
  "super", "switch", "synchronized", "this", "throw", "throws", "transient", "try", "void",
  "volatile", "while", "record", "var", "yield",
]);
const javaIdent = (n) => (JAVA_KEYWORDS.has(camel(n)) ? `${camel(n)}_` : camel(n));

function javaType(s, boxed) {
  s = nonNullSchema(s);
  const r = refName(s); if (r) return r;
  switch (s.type) {
    case "string": return "String";
    case "integer": return boxed ? "Long" : "long";
    case "number": return boxed ? "Double" : "double";
    case "boolean": return boxed ? "Boolean" : "boolean";
    case "array": return `java.util.List<${javaType(s.items || {}, true)}>`;
    default: return "java.util.Map<String, Object>";
  }
}

function javaRecord(t, pkg) {
  // A record: the payloads are immutable value types, and the canonical
  // constructor gives every field a compile-time-checked arity.
  const out = head("//", [`package ${pkg};`, ""]);
  if (t.description) out.push("/**", ` * ${cBlock(t.description)}`, " */");
  const comps = t.props.map((p) => {
    const optional = !p.required || isNullable(p.schema);
    return `    ${javaType(p.schema, optional)} ${javaIdent(p.name)}`;
  });
  out.push(`public record ${t.name}(`, comps.join(",\n"), ") {");
  for (const p of t.props) {
    if (isStringEnum(p.schema)) {
      const vals = nonNullSchema(p.schema).enum;
      out.push(`    /** Permitted values for {@code ${p.name}}. */`);
      out.push(`    public static final java.util.List<String> ${SCREAM(p.name)}_VALUES =`);
      out.push(`        java.util.List.of(${vals.map((v) => JSON.stringify(v)).join(", ")});`);
    }
  }
  out.push("}", "");
  return out.join("\n");
}

export function emitJava({ public: pub, internal: intl }) {
  const files = {};
  const base = "java/src/main/java/cloud/canonical/interfaces";
  for (const t of pub) files[`${base}/${t.name}.java`] = javaRecord(t, JAVA_PKG);
  for (const t of intl) files[`${base}/internal/${t.name}.java`] = javaRecord(t, `${JAVA_PKG}.internal`);
  files["java/src/main/java/module-info.java"] = [
    `// ${BANNER}`,
    "",
    "// The internal package is deliberately NOT exported: JPMS refuses to resolve",
    "// cloud.canonical.interfaces.internal for any consumer module, so the first-party",
    "// sync payloads cannot leak into an external SDK surface by accident.",
    "module cloud.canonical.interfaces {",
    `    exports ${JAVA_PKG};`,
    "}",
    "",
  ].join("\n");
  return files;
}

// --- kotlin ------------------------------------------------------------------
// Data classes in one file per visibility. Kotlin's own `internal` modifier is
// module-scoped, which would also hide the types from our servers, so the
// boundary here is an opt-in marker: using an internal payload is a deliberate
//, greppable `@OptIn(CanonicalInternalApi::class)` at the call site.

function kotlinType(s) {
  s = nonNullSchema(s);
  const r = refName(s); if (r) return r;
  switch (s.type) {
    case "string": return "String";
    case "integer": return "Long";
    case "number": return "Double";
    case "boolean": return "Boolean";
    case "array": return `List<${kotlinType(s.items || {})}>`;
    default: return "Map<String, Any?>";
  }
}

function kotlinBody(types, pkg, annotate) {
  const out = head("//", [`package ${pkg}`, ""]);
  for (const t of types) {
    if (t.description) out.push("/**", ` * ${cBlock(t.description)}`, " */");
    if (annotate) out.push("@CanonicalInternalApi");
    out.push(`data class ${t.name}(`);
    const fields = t.props.map((p) => {
      const nullable = !p.required || isNullable(p.schema);
      const ty = `${kotlinType(p.schema)}${nullable ? "?" : ""}`;
      const doc = p.description ? `    /** ${cBlock(p.description)} */\n` : "";
      return `${doc}    val ${camel(p.name)}: ${ty}${nullable ? " = null" : ""}`;
    });
    out.push(fields.join(",\n"), ")", "");
    for (const p of t.props) {
      if (isStringEnum(p.schema)) {
        const vals = nonNullSchema(p.schema).enum.map((v) => JSON.stringify(v)).join(", ");
        out.push(`/** Permitted values for [${t.name}.${camel(p.name)}]. */`);
        out.push(`val ${SCREAM(t.name)}_${SCREAM(p.name)}_VALUES: List<String> = listOf(${vals})`, "");
      }
    }
  }
  return out.join("\n");
}

export function emitKotlin({ public: pub, internal: intl }) {
  const base = "kotlin/src/main/kotlin/cloud/canonical/interfaces";
  return {
    [`${base}/Interfaces.kt`]: kotlinBody(pub, "cloud.canonical.interfaces", false),
    [`${base}/internal/InternalApi.kt`]: [
      `// ${BANNER}`,
      "",
      "package cloud.canonical.interfaces.internal",
      "",
      "/**",
      " * Marks a first-party payload that is not part of the published SDK surface.",
      " * Touching one requires an explicit @OptIn, so an accidental dependency on the",
      " * internal sync protocol shows up as a compiler error rather than as a shipped",
      " * API that has to be supported forever.",
      " */",
      "@RequiresOptIn(",
      '    message = "Internal canonical.cloud payload: not part of the published SDK surface.",',
      "    level = RequiresOptIn.Level.ERROR,",
      ")",
      "@Retention(AnnotationRetention.BINARY)",
      "annotation class CanonicalInternalApi",
      "",
    ].join("\n"),
    [`${base}/internal/Internal.kt`]: kotlinBody(intl, "cloud.canonical.interfaces.internal", true),
  };
}

// --- swift -------------------------------------------------------------------
// Swift's default access level IS module-internal, so the internal payloads
// need no annotation at all: omitting `public` is the boundary, and it is
// enforced by the compiler for every consumer outside the module.

function swiftType(s) {
  s = nonNullSchema(s);
  const r = refName(s); if (r) return r;
  switch (s.type) {
    case "string": return "String";
    case "integer": return "Int64";
    case "number": return "Double";
    case "boolean": return "Bool";
    case "array": return `[${swiftType(s.items || {})}]`;
    default: return "[String: AnyCodable]";
  }
}

function swiftBody(types, acl) {
  const pfx = acl ? "public " : "";
  const out = head("//", ["import Foundation", ""]);
  for (const t of types) {
    if (t.description) out.push(`/// ${cLine(t.description)}`);
    out.push(`${pfx}struct ${t.name}: Codable, Sendable {`);
    for (const p of t.props) {
      if (p.description) out.push(`    /// ${cLine(p.description)}`);
      const optional = !p.required || isNullable(p.schema);
      out.push(`    ${pfx}var ${camel(p.name)}: ${swiftType(p.schema)}${optional ? "?" : ""}`);
    }
    // Wire names are not always the Swift spelling; CodingKeys keeps decode honest.
    const needsKeys = t.props.some((p) => camel(p.name) !== p.name);
    if (needsKeys) {
      out.push("", `    ${pfx}enum CodingKeys: String, CodingKey {`);
      for (const p of t.props) out.push(`        case ${camel(p.name)} = ${JSON.stringify(p.name)}`);
      out.push("    }");
    }
    for (const p of t.props) {
      if (isStringEnum(p.schema)) {
        const vals = nonNullSchema(p.schema).enum.map((v) => JSON.stringify(v)).join(", ");
        out.push("", `    /// Permitted values for \`${camel(p.name)}\`.`);
        out.push(`    ${pfx}static let ${camel(p.name)}Values: [String] = [${vals}]`);
      }
    }
    out.push("}", "");
  }
  return out.join("\n");
}

export function emitSwift({ public: pub, internal: intl }) {
  const base = "swift/Sources/CanonicalInterfaces";
  return {
    [`${base}/Interfaces.swift`]: swiftBody(pub, true),
    // No `public`: Swift's default ACL already stops anything outside this
    // module from naming these, which is exactly the boundary we want.
    [`${base}/Internal.swift`]: swiftBody(intl, false),
  };
}

// --- ruby --------------------------------------------------------------------
// Struct subclasses under one module, with the internal namespace sealed by
// `private_constant` so `CanonicalInterfaces::Internal` raises NameError for an
// outside caller while remaining reachable from inside the gem.

function rubyBody(types, indent) {
  const pad = " ".repeat(indent);
  const out = [];
  for (const t of types) {
    if (t.description) out.push(`${pad}# ${cLine(t.description)}`);
    const fields = t.props.map((p) => `:${snake(p.name)}`).join(", ");
    out.push(`${pad}${t.name} = Struct.new(${fields || ""}${fields ? ", " : ""}keyword_init: true) do`);
    out.push(`${pad}  # Wire field order: ${t.props.map((p) => p.name).join(", ") || "(none)"}`);
    for (const p of t.props) {
      if (isStringEnum(p.schema)) {
        const vals = nonNullSchema(p.schema).enum.map((v) => JSON.stringify(v)).join(", ");
        out.push(`${pad}  ${SCREAM(p.name)}_VALUES = [${vals}].freeze`);
      }
    }
    out.push(`${pad}end`, "");
  }
  return out;
}

export function emitRuby({ public: pub, internal: intl }) {
  const main = [
    `# ${BANNER}`,
    "# frozen_string_literal: true",
    "",
    'require_relative "canonical_interfaces/internal"',
    "",
    "module CanonicalInterfaces",
    ...rubyBody(pub, 2),
    "  # Sealed: the first-party sync payloads are reachable from inside the gem",
    "  # and raise NameError for anyone outside it.",
    "  private_constant :Internal",
    "end",
    "",
  ].join("\n");
  const internal = [
    `# ${BANNER}`,
    "# frozen_string_literal: true",
    "",
    "module CanonicalInterfaces",
    "  # Not part of the published surface. See private_constant in the parent file.",
    "  module Internal",
    ...rubyBody(intl, 4),
    "  end",
    "end",
    "",
  ].join("\n");
  return {
    "ruby/lib/canonical_interfaces.rb": main,
    "ruby/lib/canonical_interfaces/internal.rb": internal,
  };
}

// --- php ---------------------------------------------------------------------
// Readonly classes in two namespaces. PHP has no namespace-level access
// control, so the boundary is the `@internal` marker every static analyser
// (PHPStan, Psalm, PhpStorm) enforces across package boundaries, plus the
// separate namespace that makes a violation obvious in review.

function phpType(s) {
  s = nonNullSchema(s);
  const r = refName(s); if (r) return r;
  switch (s.type) {
    case "string": return "string";
    case "integer": return "int";
    case "number": return "float";
    case "boolean": return "bool";
    case "array": return "array";
    default: return "array";
  }
}

function phpBody(types, ns, internal) {
  const out = ["<?php", "", `// ${BANNER}`, "", "declare(strict_types=1);", "", `namespace ${ns};`, ""];
  for (const t of types) {
    out.push("/**");
    if (t.description) out.push(` * ${cBlock(t.description)}`);
    if (internal) out.push(" *", " * @internal Not part of the published SDK surface.");
    out.push(" */");
    out.push(`final class ${t.name}`, "{");
    for (const p of t.props) {
      if (isStringEnum(p.schema)) {
        const vals = nonNullSchema(p.schema).enum.map((v) => `'${v}'`).join(", ");
        out.push(`    /** Permitted values for $${camel(p.name)}. */`);
        out.push(`    public const ${SCREAM(p.name)}_VALUES = [${vals}];`, "");
      }
    }
    out.push("    public function __construct(");
    for (const p of t.props) {
      const optional = !p.required || isNullable(p.schema);
      const ty = `${optional ? "?" : ""}${phpType(p.schema)}`;
      if (p.description) out.push(`        /** ${cBlock(p.description)} */`);
      out.push(`        public readonly ${ty} $${camel(p.name)}${optional ? " = null" : ""},`);
    }
    out.push("    ) {", "    }", "}", "");
  }
  return out.join("\n");
}

export function emitPhp({ public: pub, internal: intl }) {
  return {
    "php/src/Interfaces.php": phpBody(pub, "Canonical\\Interfaces", false),
    "php/src/Internal/Internal.php": phpBody(intl, "Canonical\\Interfaces\\Internal", true),
  };
}

// --- elixir ------------------------------------------------------------------
// One struct module per type. `@moduledoc false` keeps the internal modules out
// of generated docs and out of the published surface; ExDoc and the compiler's
// documentation tooling both treat it as "not API".

function elixirBody(types, ns, internal) {
  const out = [`# ${BANNER}`, ""];
  for (const t of types) {
    out.push(`defmodule ${ns}.${t.name} do`);
    if (internal) out.push("  @moduledoc false");
    else out.push(`  @moduledoc """`, `  ${oneLine(t.description) || t.name}`, `  """`);
    const keys = t.props.map((p) => `:${snake(p.name)}`);
    const enforce = t.props.filter((p) => p.required).map((p) => `:${snake(p.name)}`);
    if (enforce.length) out.push(`  @enforce_keys [${enforce.join(", ")}]`);
    out.push(`  defstruct [${keys.join(", ")}]`);
    for (const p of t.props) {
      if (isStringEnum(p.schema)) {
        const vals = nonNullSchema(p.schema).enum.map((v) => `"${v}"`).join(", ");
        out.push(`  @${snake(p.name)}_values [${vals}]`);
        out.push(`  def ${snake(p.name)}_values, do: @${snake(p.name)}_values`);
      }
    }
    out.push("end", "");
  }
  return out.join("\n");
}

export function emitElixir({ public: pub, internal: intl }) {
  return {
    "elixir/lib/canonical_interfaces.ex": elixirBody(pub, "CanonicalInterfaces", false),
    "elixir/lib/canonical_interfaces/internal.ex": elixirBody(intl, "CanonicalInterfaces.Internal", true),
  };
}

// --- erlang ------------------------------------------------------------------
// Records in header files. Erlang's unit of visibility is the export list, and
// records are a compile-time construct, so the boundary here is the separate
// header plus `@private`: including the internal header is a visible, greppable
// line in the consumer rather than something that happens implicitly.

function erlType(s) {
  s = nonNullSchema(s);
  if (refName(s)) return "map()";
  switch (s.type) {
    case "string": return "binary()";
    case "integer": return "integer()";
    case "number": return "float()";
    case "boolean": return "boolean()";
    case "array": return "list()";
    default: return "map()";
  }
}

function erlBody(types, guard, internal) {
  const out = [`%% ${BANNER}`, "", `-ifndef(${guard}).`, `-define(${guard}, true).`, ""];
  if (internal) out.push("%% @private Not part of the published SDK surface.", "");
  for (const t of types) {
    if (t.description) out.push(`%% ${cLine(t.description)}`);
    const fields = t.props.map((p) => {
      const opt = !p.required || isNullable(p.schema);
      return `    ${snake(p.name)} :: ${erlType(p.schema)}${opt ? " | undefined" : ""}`;
    });
    out.push(`-record(${snake(t.name)}, {`, fields.join(",\n"), "}).", "");
    for (const p of t.props) {
      if (isStringEnum(p.schema)) {
        const vals = nonNullSchema(p.schema).enum.map((v) => `<<"${v}">>`).join(", ");
        out.push(`-define(${SCREAM(t.name)}_${SCREAM(p.name)}_VALUES, [${vals}]).`);
      }
    }
  }
  out.push("-endif.", "");
  return out.join("\n");
}

export function emitErlang({ public: pub, internal: intl }) {
  return {
    "erlang/include/canonical_interfaces.hrl": erlBody(pub, "CANONICAL_INTERFACES_HRL", false),
    "erlang/include/canonical_interfaces_internal.hrl": erlBody(intl, "CANONICAL_INTERFACES_INTERNAL_HRL", true),
  };
}

// --- gleam -------------------------------------------------------------------
// Gleam has a first-class `@internal` attribute: the type stays usable inside
// the package and is omitted from the generated documentation and the package
// interface, which is precisely the split we want.

function gleamType(s) {
  s = nonNullSchema(s);
  const r = refName(s); if (r) return r;
  switch (s.type) {
    case "string": return "String";
    case "integer": return "Int";
    case "number": return "Float";
    case "boolean": return "Bool";
    case "array": return `List(${gleamType(s.items || {})})`;
    default: return "Dynamic";
  }
}

function gleamBody(types, internal) {
  const usesDynamic = types.some((t) => t.props.some((p) => gleamType(p.schema).includes("Dynamic")));
  const out = head("//", usesDynamic ? ["import gleam/dynamic.{type Dynamic}", ""] : []);
  const optional = types.some((t) => t.props.some((p) => !p.required || isNullable(p.schema)));
  if (optional) out.push("import gleam/option.{type Option}", "");
  for (const t of types) {
    if (t.description) out.push(`/// ${cLine(t.description)}`);
    if (internal) out.push("@internal");
    out.push(`pub type ${t.name} {`, `  ${t.name}(`);
    for (const p of t.props) {
      const opt = !p.required || isNullable(p.schema);
      const ty = opt ? `Option(${gleamType(p.schema)})` : gleamType(p.schema);
      out.push(`    ${snake(p.name)}: ${ty},`);
    }
    out.push("  )", "}", "");
    for (const p of t.props) {
      if (isStringEnum(p.schema)) {
        const vals = nonNullSchema(p.schema).enum.map((v) => `"${v}"`).join(", ");
        if (internal) out.push("@internal");
        out.push(`pub const ${snake(t.name)}_${snake(p.name)}_values: List(String) = [${vals}]`, "");
      }
    }
  }
  return out.join("\n");
}

export function emitGleam({ public: pub, internal: intl }) {
  return {
    "gleam/src/canonical_interfaces.gleam": gleamBody(pub, false),
    "gleam/src/canonical_interfaces/internal.gleam": gleamBody(intl, true),
  };
}

// --- c -----------------------------------------------------------------------
// Plain structs in two headers. C has no namespaces, so every symbol carries the
// canonical_ prefix the surface contract already declares for this language, and
// the internal header is the one a public consumer never includes.

function cScalar(s) {
  s = nonNullSchema(s);
  const r = refName(s); if (r) return `struct canonical_${snake(r)} *`;
  switch (s.type) {
    case "string": return "const char *";
    case "integer": return "int64_t";
    case "number": return "double";
    case "boolean": return "bool";
    default: return "void *";
  }
}
// C has no array type that carries its own length, so an array field becomes a
// typed pointer plus an explicit `_len`. A bare `void *` would have compiled
// just as well and told the caller nothing about what it points at.
function cType(s) {
  const inner = nonNullSchema(s);
  if (!refName(inner) && inner.type === "array") {
    const item = cScalar(inner.items || {});
    return item.endsWith("*") ? `${item}const *` : `const ${item} *`;
  }
  return cScalar(s);
}

function cBody(types, guard, internal) {
  const out = [
    `/* ${BANNER} */`, "",
    `#ifndef ${guard}`, `#define ${guard}`, "",
    "#include <stdbool.h>", "#include <stddef.h>", "#include <stdint.h>", "",
  ];
  if (internal) {
    out.push("/* Internal: first-party payloads only. Not part of the published", "   canonical_interfaces.h surface. */", "");
  }
  for (const t of types) {
    if (t.description) out.push(`/* ${cBlock(t.description)} */`);
    out.push(`struct canonical_${snake(t.name)} {`);
    for (const p of t.props) {
      const ty = cType(p.schema);
      const sep = ty.endsWith("*") ? "" : " ";
      if (p.description) out.push(`    /* ${cBlock(p.description)} */`);
      out.push(`    ${ty}${sep}${snake(p.name)};`);
      const inner = nonNullSchema(p.schema);
      if (!refName(inner) && inner.type === "array") out.push(`    size_t ${snake(p.name)}_len;`);
      // An absent scalar has no null in C; a presence flag keeps optional honest.
      else if (!p.required && !ty.endsWith("*")) out.push(`    bool has_${snake(p.name)};`);
    }
    out.push("};", "");
    for (const p of t.props) {
      if (isStringEnum(p.schema)) {
        const vals = nonNullSchema(p.schema).enum;
        out.push(`/* Permitted values for ${snake(t.name)}.${snake(p.name)}. */`);
        out.push(`#define CANONICAL_${SCREAM(t.name)}_${SCREAM(p.name)}_COUNT ${vals.length}`);
        out.push(`static const char *const canonical_${snake(t.name)}_${snake(p.name)}_values[] = {`);
        out.push(vals.map((v) => `    ${JSON.stringify(v)}`).join(",\n"), "};", "");
      }
    }
  }
  out.push(`#endif /* ${guard} */`, "");
  return out.join("\n");
}

export function emitC({ public: pub, internal: intl }) {
  return {
    "c/include/canonical_interfaces.h": cBody(pub, "CANONICAL_INTERFACES_H", false),
    "c/include/canonical_interfaces_internal.h": cBody(intl, "CANONICAL_INTERFACES_INTERNAL_H", true),
  };
}

// --- cpp ---------------------------------------------------------------------
// Aggregates in `canonical::interfaces`, with the internal ones in
// `canonical::interfaces::detail` — the convention every C++ consumer already
// reads as "not the public API".

function cppType(s) {
  s = nonNullSchema(s);
  const r = refName(s); if (r) return r;
  switch (s.type) {
    case "string": return "std::string";
    case "integer": return "std::int64_t";
    case "number": return "double";
    case "boolean": return "bool";
    case "array": return `std::vector<${cppType(s.items || {})}>`;
    default: return "std::map<std::string, std::string>";
  }
}

function cppBody(types, ns, internal) {
  const body = [];
  const uses = (needle) => body.some((l) => l.includes(needle));
  const out = [`// ${BANNER}`, "", "#pragma once", ""];
  if (internal) body.push("// detail:: is not the published API. Do not include this from a public header.", "");
  body.push(`namespace ${ns} {`, "");
  for (const t of types) {
    if (t.description) body.push(`/// ${cLine(t.description)}`);
    body.push(`struct ${t.name} {`);
    for (const p of t.props) {
      const opt = !p.required || isNullable(p.schema);
      const ty = opt ? `std::optional<${cppType(p.schema)}>` : cppType(p.schema);
      if (p.description) body.push(`    /// ${cLine(p.description)}`);
      body.push(`    ${ty} ${snake(p.name)};`);
    }
    body.push("};", "");
    for (const p of t.props) {
      if (isStringEnum(p.schema)) {
        const vals = nonNullSchema(p.schema).enum.map((v) => JSON.stringify(v)).join(", ");
        body.push(`/// Permitted values for ${t.name}::${snake(p.name)}.`);
        body.push(`inline constexpr std::string_view ${snake(t.name)}_${snake(p.name)}_values[] = {${vals}};`, "");
      }
    }
  }
  body.push(`}  // namespace ${ns}`, "");
  // Include exactly what the emitted types reference — nothing speculative.
  for (const [needle, header] of [
    ["std::int64_t", "<cstdint>"],
    ["std::map", "<map>"],
    ["std::optional", "<optional>"],
    ["std::string_view", "<string_view>"],
    ["std::string", "<string>"],
    ["std::vector", "<vector>"],
  ]) {
    if (uses(needle)) out.push(`#include ${header}`);
  }
  out.push("", ...body);
  return out.join("\n");
}

export function emitCpp({ public: pub, internal: intl }) {
  return {
    "cpp/include/canonical/interfaces.hpp": cppBody(pub, "canonical::interfaces", false),
    "cpp/include/canonical/interfaces_internal.hpp": cppBody(intl, "canonical::interfaces::detail", true),
  };
}

// --- zig ---------------------------------------------------------------------
// Zig's visibility is per-declaration: a struct without `pub` cannot be named
// from another file at all. The internal module therefore exposes its types
// through one `pub` container that only the first-party code imports.

function zigType(s) {
  s = nonNullSchema(s);
  const r = refName(s); if (r) return r;
  switch (s.type) {
    case "string": return "[]const u8";
    case "integer": return "i64";
    case "number": return "f64";
    case "boolean": return "bool";
    case "array": return `[]const ${zigType(s.items || {})}`;
    default: return "std.json.Value";
  }
}

function zigBody(types, internal) {
  // An unused top-level constant is a compile ERROR in Zig, so the std import
  // is emitted only when a field actually resolves to std.json.Value.
  const needsStd = types.some((t) => t.props.some((p) => zigType(p.schema).startsWith("std.")));
  const out = head("//", needsStd ? ['const std = @import("std");', ""] : []);
  if (internal) {
    out.push("// Internal payloads. Imported only by first-party code; nothing in", "// interfaces.zig re-exports this module.", "");
  }
  for (const t of types) {
    if (t.description) out.push(`/// ${cLine(t.description)}`);
    out.push(`pub const ${t.name} = struct {`);
    for (const p of t.props) {
      const opt = !p.required || isNullable(p.schema);
      const ty = `${opt ? "?" : ""}${zigType(p.schema)}`;
      if (p.description) out.push(`    /// ${cLine(p.description)}`);
      out.push(`    ${snake(p.name)}: ${ty}${opt ? " = null" : ""},`);
    }
    for (const p of t.props) {
      if (isStringEnum(p.schema)) {
        const vals = nonNullSchema(p.schema).enum.map((v) => JSON.stringify(v)).join(", ");
        out.push("");
        out.push(`    /// Permitted values for \`${snake(p.name)}\`.`);
        out.push(`    pub const ${snake(p.name)}_values = [_][]const u8{ ${vals} };`);
      }
    }
    out.push("};", "");
  }
  return out.join("\n");
}

export function emitZig({ public: pub, internal: intl }) {
  return {
    "zig/src/interfaces.zig": zigBody(pub, false),
    "zig/src/internal.zig": zigBody(intl, true),
  };
}

export const EXTRA_EMITTERS = {
  java: emitJava,
  kotlin: emitKotlin,
  swift: emitSwift,
  ruby: emitRuby,
  php: emitPhp,
  elixir: emitElixir,
  erlang: emitErlang,
  gleam: emitGleam,
  c: emitC,
  cpp: emitCpp,
  zig: emitZig,
};
