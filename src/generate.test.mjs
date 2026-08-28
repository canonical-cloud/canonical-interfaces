// Self-tests for the generator: no network, no file writes (except the --check
// subprocess, which only reads). Pure schema -> string checks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { build, loadTypes } from './generate-output.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// Compared as a sorted set. The guarantee is which types exist, not the order
// they sit in within `$defs` — a merge that alphabetized the quote schema
// failed this test without adding or removing a single type. Ordering is
// covered separately by quote-schema-semantic-merge-guards.
test('schema declares the expected canonical.cloud types', () => {
  const names = loadTypes().map((t) => t.name).sort();
  assert.deepEqual(names, [
    'AuditEngagement',
    'ChangesQuery',
    'ChangesResponse',
    'DraftNoteKey',
    'DraftNoteValue',
    'HealthStatus',
    'MutationOperation',
    'MutationRequest',
    'MutationResponse',
    'MutationResult',
    'QuoteDetail',
    'QuoteEstimate',
    'QuoteListQuery',
    'QuoteListResponse',
    'QuoteProblem',
    'QuoteRequest',
    'QuoteRetryResponse',
    'QuoteStatusEvent',
    'QuoteSubmissionResponse',
    'QuoteSummary',
    'ServiceInfo',
    'WireRecord',
  ]);
});

test('sync schema keeps server-enforced batch, page, and draft-note bounds', () => {
  const schema = JSON.parse(readFileSync(join(root, 'schema/api.schema.json'), 'utf8'));
  assert.equal(schema.$defs.MutationRequest.properties.operations.minItems, 1);
  assert.equal(schema.$defs.MutationRequest.properties.operations.maxItems, 50);
  assert.equal(schema.$defs.ChangesQuery.properties.limit.maximum, 500);
  assert.equal(schema.$defs.DraftNoteValue.properties.title.maxLength, 200);
  assert.equal(schema.$defs.DraftNoteValue.properties.body.maxLength, 100_000);
});

test('quote schema keeps request, context, and estimate payloads bounded', () => {
  const schema = JSON.parse(readFileSync(join(root, 'schema/quote.schema.json'), 'utf8'));
  const request = schema.$defs.QuoteRequest;
  const estimate = schema.$defs.QuoteEstimate;

  assert.equal(request.additionalProperties, false);
  assert.equal(request.properties.frameworks.minItems, 1);
  assert.equal(request.properties.frameworks.maxItems, 12);
  assert.ok(request.properties.frameworks.items.enum.includes('soc2_type_2'));
  assert.ok(request.properties.frameworks.items.enum.includes('nist_csf_2'));
  assert.ok(request.properties.frameworks.items.enum.includes('nist_800_53'));
  assert.ok(request.properties.frameworks.items.enum.includes('hipaa'));
  assert.equal(request.properties.notes.maxLength, 5_000);
  assert.equal(request.properties.contextKey.maxLength, 128);
  assert.equal(request.properties.contextKey.default, 'quote-analysis');
  assert.equal(request.properties.answersVersion.const, 1);
  assert.equal(estimate.properties.summary.maxLength, 4_000);
  assert.equal(estimate.properties.assumptions.maxItems, 50);
  assert.equal(estimate.properties.nextSteps.maxItems, 25);
});

test('build() emits one file per language', () => {
  const files = build();
  for (const rel of [
    'rust/src/lib.rs',
    'rust/Cargo.toml',
    'rust-wasm/src/lib.rs',
    'rust-wasm/Cargo.toml',
    'typescript/index.ts',
    'python/canonical_interfaces.py',
    'go/interfaces.go',
    'dart/lib/canonical_interfaces.dart',
    'dart/lib/quote_v1.dart',
    'dart/pubspec.yaml',
  ]) {
    assert.ok(rel in files, `missing ${rel}`);
  }
});

// Each language now emits two artifacts — the published surface and the
// internal one. These tests are about how a *shape* is rendered (nullability,
// wire names, enum vocabularies), not about which side of the boundary a type
// landed on, so they read the language's whole output. Which types are public
// is asserted separately, in visibility.test.mjs.
const LANG_FILES = {
  rust: ['rust/src/lib.rs', 'rust/src/internal.rs'],
  'rust-wasm': ['rust-wasm/src/lib.rs', 'rust-wasm/src/internal.rs'],
  typescript: ['typescript/index.ts', 'typescript/internal.ts'],
  python: ['python/canonical_interfaces.py', 'python/_internal.py'],
  go: ['go/interfaces.go', 'go/internal/canonicalsync/interfaces.go'],
  dart: ['dart/lib/canonical_interfaces.dart', 'dart/lib/src/internal.dart'],
};
const surface = (files, lang) => LANG_FILES[lang].map((f) => files[f]).join('\n');

test('every language emits every schema type — no partial surfaces', () => {
  const files = build();
  const names = loadTypes().map((t) => t.name);
  for (const name of names) {
    assert.match(surface(files, 'rust'), new RegExp(`pub struct ${name} \\{`), `rust missing ${name}`);
    assert.match(surface(files, 'typescript'), new RegExp(`export type ${name} = \\{`), `typescript missing ${name}`);
    assert.match(surface(files, 'python'), new RegExp(`class ${name}:`), `python missing ${name}`);
    assert.match(surface(files, 'go'), new RegExp(`type ${name} struct`), `go missing ${name}`);
    assert.match(surface(files, 'dart'), new RegExp(`final class ${name} \\{`), `dart missing ${name}`);
  }
});

test('dart quote_v1.dart is a re-export shim, not a second surface', () => {
  const files = build();
  const shim = files['dart/lib/quote_v1.dart'];
  assert.match(shim, /export 'canonical_interfaces\.dart';/);
  assert.doesNotMatch(shim, /final class /);
});

test('dart guards required-nullable fields on both decode and encode', () => {
  const dart = surface(build(), 'dart');
  // Required by the schema, so the key is never omitted and the ctor arg is
  // mandatory — but the value is nullable, so decoding must not cast null.
  assert.match(dart, /required this\.baseVersion/);
  assert.match(dart, /final String\? baseVersion;/);
  assert.match(dart, /baseVersion: json\["baseVersion"\] == null \? null : json\["baseVersion"\] as String,/);
  assert.match(dart, /\n    "baseVersion": baseVersion,/);
  // Genuinely optional ref field: omitted from the map and null-safe on encode.
  assert.match(dart, /if \(value != null\) "value": value\?\.toJson\(\),/);
});

test('dart exposes enum vocabularies as constants', () => {
  const dart = surface(build(), 'dart');
  assert.match(dart, /abstract final class AuditEngagementFramework \{/);
  assert.match(dart, /static const String iso27001 = "iso_27001";/);
  // The vocabulary is the schema's, not a fixed six: canonical.plus publishes
  // readiness coverage for all fifteen frameworks.
  assert.match(dart, /static const List<String> values = <String>\["soc2", "fedramp", "hipaa", "iso_27001", "pci_dss", "gdpr", "cis_controls", "cmmc", "csa_ccm", "dora", "iso_22301", "iso_27701", "nis2", "nist_csf", "nist_800_53"\];/);
});

test('rust and rust-wasm never diverge in data shape (same structs + fields)', () => {
  const out = build();
  const pubLines = (s) => s.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('pub '));
  // Both halves, so a type moving across the visibility boundary in one crate
  // and not the other is still caught.
  assert.deepEqual(pubLines(surface(out, 'rust-wasm')), pubLines(surface(out, 'rust')));
});

test('rust-wasm generated types remain declaration-only Tsify', () => {
  const files = build();
  const wasm = files['rust-wasm/src/lib.rs'];
  assert.match(wasm, /use tsify::Tsify;/);
  assert.doesNotMatch(wasm, /into_wasm_abi|from_wasm_abi/);
  assert.doesNotMatch(wasm, /use wasm_bindgen::prelude/);
  assert.doesNotMatch(wasm, /wasm_bindgen\(start\)/);
  assert.match(wasm, /pub struct ServiceInfo/);
  assert.match(wasm, /pub struct QuoteDetail/);
  assert.match(files['rust-wasm/Cargo.toml'], /crate-type = \["cdylib", "rlib"\]/);
  assert.match(files['rust-wasm/Cargo.toml'], /tsify = /);
  const lines = wasm.split('\n');
  lines.forEach((line, i) => {
    if (/pub .*(serde_json::Value|BTreeMap)/.test(line)) {
      assert.match(lines[i - 1] || '', /#\[tsify\(type = /, `unguarded field: ${line.trim()}`);
    }
  });
});

test('rust-wasm package entrypoint owns only a no-op lifecycle hook', () => {
  const files = build();
  assert.match(
    files['rust-wasm/Cargo.toml'],
    /path = "\.\.\/\.\.\/src\/rust-wasm-entry\.rs"/,
  );

  const entry = readFileSync(join(root, 'src/rust-wasm-entry.rs'), 'utf8');
  assert.match(entry, /use wasm_bindgen::prelude::wasm_bindgen;/);
  assert.match(
    entry,
    /#\[wasm_bindgen\(start\)\]\npub fn initialize_wasm_module\(\) \{\}/,
  );
  assert.match(entry, /include!\("\.\.\/generated\/rust-wasm\/src\/lib\.rs"\);/);

  const executableText = entry.replace(/^\s*\/\/.*$/gm, '');
  assert.doesNotMatch(
    executableText,
    /\b(?:fetch|request|submit|write|delete|storage|cookie|websocket|beacon|probe|execute)\b/i,
  );
});

test('generated types carry through to every language', () => {
  const files = build();
  assert.match(surface(files, 'rust'), /pub struct ServiceInfo/);
  assert.match(surface(files, 'rust'), /pub struct QuoteRequest/);
  assert.match(surface(files, 'rust'), /pub struct QuoteListResponse/);
  assert.match(files['rust/Cargo.toml'], /name = "canonical-interfaces"/);
  assert.match(surface(files, 'typescript'), /export type ServiceInfo = \{/);
  assert.match(surface(files, 'typescript'), /export type QuoteEstimate = \{/);
  assert.match(surface(files, 'typescript'), /export type QuoteDetail = \{/);
  assert.match(surface(files, 'python'), /class AuditEngagement:/);
  assert.match(surface(files, 'python'), /class QuoteStatusEvent:/);
  assert.match(surface(files, 'python'), /class QuoteRetryResponse:/);
  assert.match(surface(files, 'go'), /package canonicalinterfaces/);
  assert.match(surface(files, 'go'), /type QuoteProblem struct/);
  assert.match(surface(files, 'go'), /type QuoteListResponse struct/);
  assert.match(surface(files, 'dart'), /final class QuoteRequest/);
  assert.match(surface(files, 'dart'), /final class QuoteDetail/);
});

test('string enums surface as typed unions/literals per language', () => {
  const files = build();
  assert.match(surface(files, 'typescript'), /framework: "soc2" \| "fedramp" \| "hipaa" \| "iso_27001" \| "pci_dss" \| "gdpr" \| "cis_controls" \| "cmmc" \| "csa_ccm" \| "dora" \| "iso_22301" \| "iso_27701" \| "nis2" \| "nist_csf" \| "nist_800_53";/);
  assert.match(surface(files, 'python'), /Literal\["soc2", "fedramp", "hipaa", "iso_27001", "pci_dss", "gdpr", "cis_controls", "cmmc", "csa_ccm", "dora", "iso_22301", "iso_27701", "nis2", "nist_csf", "nist_800_53"\]/);
  assert.match(surface(files, 'rust'), /pub enum AuditEngagementFramework/);
  assert.match(surface(files, 'typescript'), /status: "applied" \| "conflict" \| "gone" \| "invalid" \| "idempotency_key_reused";/);
  assert.match(surface(files, 'typescript'), /status: "queued" \| "analyzing" \| "ready" \| "failed";/);
});

test('camelCase JSON fields stay camelCase on the wire and idiomatic in Rust', () => {
  const files = build();
  assert.match(surface(files, 'typescript'), /protocolVersion: number;/);
  assert.match(surface(files, 'typescript'), /organizationName: string;/);
  assert.match(surface(files, 'typescript'), /quoteId: string;/);
  assert.match(surface(files, 'rust'), /#\[serde\(rename = "protocolVersion"\)\]\n    pub protocol_version: i64,/);
  assert.match(surface(files, 'rust'), /#\[serde\(rename = "organizationName"\)\]\n    pub organization_name: String,/);
  assert.match(surface(files, 'rust'), /#\[serde\(rename = "quoteId"\)\]\n    pub quote_id: String,/);
  assert.match(surface(files, 'go'), /ProtocolVersion int64 `json:"protocolVersion"`/);
  assert.match(surface(files, 'go'), /OrganizationName string `json:"organizationName"`/);
  assert.match(surface(files, 'go'), /QuoteId string `json:"quoteId"`/);
});

test('required nullable decimal versions stay nullable in every adapter', () => {
  const files = build();
  assert.match(surface(files, 'typescript'), /baseVersion: string \| null;/);
  assert.match(surface(files, 'rust'), /pub base_version: Option<String>,/);
  assert.match(surface(files, 'python'), /baseVersion: Optional\[str\]/);
  assert.match(surface(files, 'go'), /BaseVersion \*string `json:"baseVersion"`/);
});

test('optional fields are nullable/omittable per language', () => {
  const files = build();
  assert.match(surface(files, 'typescript'), /target_report_date\?: string;/);
  assert.match(surface(files, 'typescript'), /contextKey\?: string;/);
  assert.match(surface(files, 'rust'), /pub target_report_date: Option<String>,/);
  assert.match(surface(files, 'rust'), /pub context_key: Option<String>,/);
  assert.match(surface(files, 'go'), /json:"target_report_date,omitempty"/);
  assert.match(surface(files, 'go'), /json:"contextKey,omitempty"/);
  assert.match(surface(files, 'dart'), /final String\? contextKey;/);
});

test('generated files on disk are up to date (run: npm run generate)', () => {
  execFileSync('node', ['src/generate-output.mjs', '--check'], { cwd: root });
});
