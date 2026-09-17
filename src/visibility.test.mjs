// The public/internal split is only worth having if it cannot be undone by
// accident. These tests assert the three things that would silently break it:
// a type with no declared visibility, a public type that drags an internal one
// into the external surface, and an emitter that writes internal payloads into
// the module an external consumer imports.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { build } from './generate-output.mjs';
import { loadTypes, partition, topoSort, REQUIRED_LANGUAGES } from './generate.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// The audience split, stated once. Internal means "first-party sync protocol":
// served by canonical-web-server's session-authenticated /api/v1/sync/* routes
// and consumed only by its own client bundle. Everything else is the bearer-token
// surface canonical-clients publishes to external callers.
const INTERNAL = [
  'ChangesQuery', 'ChangesResponse', 'DraftNoteKey', 'DraftNoteValue',
  'MutationOperation', 'MutationRequest', 'MutationResponse', 'MutationResult',
  'WireRecord',
];

test('every type declares a visibility, and the split is the expected one', () => {
  const types = loadTypes();
  for (const t of types) {
    assert.ok(['public', 'internal'].includes(t.visibility), `${t.name} has no usable x-visibility`);
  }
  const parts = partition(types);
  assert.deepEqual(parts.internal.map((t) => t.name).sort(), INTERNAL);
  assert.equal(parts.public.length + parts.internal.length, types.length);
});

test('no public type reaches into the internal set', () => {
  const parts = partition(loadTypes());
  const internal = new Set(parts.internal.map((t) => t.name));
  for (const t of parts.public) {
    for (const p of t.props) {
      for (const sub of [p.schema, p.schema?.items]) {
        const ref = sub?.$ref?.split('/').pop();
        assert.ok(!internal.has(ref),
          `public ${t.name}.${p.name} $refs internal ${ref}: that publishes ${ref} by the back door`);
      }
    }
  }
});

test('types are emitted in dependency order', () => {
  // C++ needs a complete type before std::optional<T> and C before an embedded
  // struct, so this is a compile/no-compile property, not a cosmetic one.
  const ordered = topoSort(loadTypes());
  const seen = new Set();
  for (const t of ordered) {
    for (const p of t.props) {
      for (const sub of [p.schema, p.schema?.items]) {
        const ref = sub?.$ref?.split('/').pop();
        if (ref) assert.ok(seen.has(ref), `${t.name} is emitted before its dependency ${ref}`);
      }
    }
    seen.add(t.name);
  }
});

test('every client language has an emitter', () => {
  const files = Object.keys(build());
  for (const lang of REQUIRED_LANGUAGES) {
    assert.ok(files.some((f) => f.startsWith(`${lang}/`)),
      `no generated output for ${lang}; canonical-clients ships a ${lang} client`);
  }
  assert.ok(REQUIRED_LANGUAGES.length >= 15,
    'the polyglot contract is 15+ languages');
});

// The files an external consumer reaches for by default. If an internal type
// name appears in one of these, the split has been lost regardless of what the
// schema says.
const PUBLIC_ENTRYPOINTS = [
  'typescript/index.ts',
  'python/canonical_interfaces.py',
  'go/interfaces.go',
  'dart/lib/canonical_interfaces.dart',
  'ruby/lib/canonical_interfaces.rb',
  'php/src/Interfaces.php',
  'elixir/lib/canonical_interfaces.ex',
  'erlang/include/canonical_interfaces.hrl',
  'gleam/src/canonical_interfaces.gleam',
  'c/include/canonical_interfaces.h',
  'cpp/include/canonical/interfaces.hpp',
  'zig/src/interfaces.zig',
  'swift/Sources/CanonicalInterfaces/Interfaces.swift',
  'kotlin/src/main/kotlin/cloud/canonical/interfaces/Interfaces.kt',
];

test('no internal type appears in any public entrypoint', () => {
  const files = build();
  for (const rel of PUBLIC_ENTRYPOINTS) {
    const content = files[rel];
    assert.ok(content, `expected emitter output for ${rel}`);
    for (const name of INTERNAL) {
      assert.ok(!new RegExp(`\\b${name}\\b`).test(content),
        `${rel} names the internal type ${name}`);
    }
  }
});

test('the internal payloads are emitted somewhere, behind a real boundary', () => {
  const files = build();
  // Each entry: the internal artifact, and the mechanism that keeps an outside
  // caller from naming it. Enforced by a compiler wherever the language has one.
  const boundaries = [
    ['rust/src/internal.rs', /^\/\/! First-party/m],
    ['typescript/internal.ts', /NOT re-exported from index\.ts/],
    ['python/_internal.py', /Underscore-private/],
    ['go/internal/canonicalsync/interfaces.go', /^package canonicalsync$/m],
    ['dart/lib/src/internal.dart', /Under `lib\/src\/`/],
    ['java/src/main/java/cloud/canonical/interfaces/internal/WireRecord.java',
      /^package cloud\.canonical\.interfaces\.internal;$/m],
    ['kotlin/src/main/kotlin/cloud/canonical/interfaces/internal/Internal.kt', /@CanonicalInternalApi/],
    ['swift/Sources/CanonicalInterfaces/Internal.swift', /^struct WireRecord/m],
    ['ruby/lib/canonical_interfaces/internal.rb', /module Internal/],
    ['php/src/Internal/Internal.php', /@internal/],
    ['elixir/lib/canonical_interfaces/internal.ex', /@moduledoc false/],
    ['erlang/include/canonical_interfaces_internal.hrl', /@private/],
    ['gleam/src/canonical_interfaces/internal.gleam', /@internal/],
    ['c/include/canonical_interfaces_internal.h', /CANONICAL_INTERFACES_INTERNAL_H/],
    ['cpp/include/canonical/interfaces_internal.hpp', /namespace canonical::interfaces::detail/],
    ['zig/src/internal.zig', /Imported only by first-party code/],
  ];
  for (const [rel, marker] of boundaries) {
    assert.ok(files[rel], `missing internal artifact ${rel}`);
    assert.match(files[rel], marker, `${rel} lost its boundary marker`);
    // Each language spells the type in its own case, and C prefixes every symbol
    // (canonical_wire_record), so match on either spelling as a substring rather
    // than assuming PascalCase and word boundaries.
    const carries = ['WireRecord', 'ChangesQuery'].some((name) => {
      const snakeName = name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
      return files[rel].includes(name) || files[rel].includes(snakeName);
    });
    assert.ok(carries, `${rel} does not actually carry the internal payloads`);
  }
});

test('Swift internal types are module-internal and public ones are not', () => {
  const files = build();
  const pub = files['swift/Sources/CanonicalInterfaces/Interfaces.swift'];
  const int = files['swift/Sources/CanonicalInterfaces/Internal.swift'];
  // Swift's default ACL is the boundary: omitting `public` is what stops an
  // importing module from naming the type.
  assert.match(pub, /^public struct QuoteDetail/m);
  assert.doesNotMatch(int, /^public struct/m);
  assert.match(int, /^struct WireRecord/m);
});

test('Rust internal module is feature-gated, not exported by default', () => {
  const files = build();
  assert.match(files['rust/src/lib.rs'], /#\[cfg\(feature = "internal"\)\]\npub mod internal;/);
  assert.match(files['rust/Cargo.toml'], /^\[features\]\ndefault = \[\]/m);
  assert.doesNotMatch(files['rust/Cargo.toml'], /^default = \["internal"\]/m);
});

test('java module-info exports the public package only', () => {
  const info = build()['java/src/main/java/module-info.java'];
  assert.match(info, /exports cloud\.canonical\.interfaces;/);
  assert.doesNotMatch(info, /exports cloud\.canonical\.interfaces\.internal;/);
});

test('the checked-in generated tree matches what the emitters produce', () => {
  // `npm test` already runs --check; this makes the visibility artifacts
  // specifically fail here rather than only in the aggregate drift report.
  for (const rel of [...PUBLIC_ENTRYPOINTS, 'rust/src/internal.rs', 'typescript/internal.ts']) {
    const onDisk = readFileSync(join(root, 'generated', rel), 'utf8');
    assert.equal(onDisk, build()[rel], `generated/${rel} is out of date; run npm run generate`);
  }
});
