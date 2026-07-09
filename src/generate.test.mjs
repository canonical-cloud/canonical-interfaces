// Self-tests for the generator: no network, no file writes (except the --check
// subprocess, which only reads). Pure schema -> string checks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { build, loadTypes } from './generate.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

test('schema declares the expected canonical.cloud types', () => {
  const names = loadTypes().map((t) => t.name);
  assert.deepEqual(names, ['HealthStatus', 'ServiceInfo', 'AuditEngagement']);
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
  ]) {
    assert.ok(rel in files, `missing ${rel}`);
  }
});

test('rust-wasm mirrors rust types with the tsify/wasm-bindgen boundary', () => {
  const files = build();
  const wasm = files['rust-wasm/src/lib.rs'];
  assert.match(wasm, /use tsify::Tsify;/);
  assert.match(wasm, /#\[tsify\(into_wasm_abi, from_wasm_abi\)\]/);
  assert.match(wasm, /pub struct ServiceInfo/);
  assert.match(files['rust-wasm/Cargo.toml'], /crate-type = \["cdylib", "rlib"\]/);
  assert.match(files['rust-wasm/Cargo.toml'], /tsify = /);
});

test('generated types carry through to every language', () => {
  const files = build();
  assert.match(files['rust/src/lib.rs'], /pub struct ServiceInfo/);
  assert.match(files['rust/Cargo.toml'], /name = "canonical-interfaces"/);
  assert.match(files['typescript/index.ts'], /export type ServiceInfo = \{/);
  assert.match(files['python/canonical_interfaces.py'], /class AuditEngagement:/);
  assert.match(files['go/interfaces.go'], /package canonicalinterfaces/);
});

test('string enums surface as typed unions/literals per language', () => {
  const files = build();
  // AuditEngagement.framework is a string enum.
  assert.match(files['typescript/index.ts'], /framework: "soc2" \| "fedramp" \| "hipaa" \| "iso_27001" \| "pci_dss" \| "gdpr";/);
  assert.match(files['python/canonical_interfaces.py'], /Literal\["soc2", "fedramp", "hipaa", "iso_27001", "pci_dss", "gdpr"\]/);
  assert.match(files['rust/src/lib.rs'], /pub enum AuditEngagementFramework/);
});

test('optional fields are nullable/omittable per language', () => {
  const files = build();
  // AuditEngagement.target_report_date is optional.
  assert.match(files['typescript/index.ts'], /target_report_date\?: string;/);
  assert.match(files['rust/src/lib.rs'], /pub target_report_date: Option<String>,/);
  assert.match(files['go/interfaces.go'], /json:"target_report_date,omitempty"/);
});

test('generated files on disk are up to date (run: node src/generate.mjs)', () => {
  execFileSync('node', ['src/generate.mjs', '--check'], { cwd: root });
});
