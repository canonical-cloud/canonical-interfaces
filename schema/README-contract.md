# Contract ownership

Two repos, two halves of one contract. Keeping the split explicit is what stops
either half from being quietly redefined by the other.

| Half | Lives in | Answers |
|---|---|---|
| **Payload schemas** — request and response bodies | this repo, under `schema/` or `schemas/` | "is this JSON valid?" |
| **Surface contract** — what every SDK must export | the paired `*-clients` repo, at `contract/surface.contract.json` | "does every language expose the same interface?" |
| **Meta-schema** — the shape a surface contract may take | published from here as [`schema/surface.schema.json`](surface.schema.json) | "is that contract document itself well-formed?" |

## Why the surface contract is not JSON Schema

JSON Schema validates JSON *data*. An SDK's exported interface is not JSON data,
so aiming JSON Schema at it directly is a category error. The split above uses it
where it fits and nowhere else: payload bodies are validated as data, and the
surface contract is a JSON *document* — which JSON Schema then validates
rigorously, with editor completion as a bonus.

## Vendoring

The clients repo copies the schemas here into its own `contract/schemas/` and
records each file's sha256. That keeps its CI hermetic while making drift
detectable from both directions:

- **from the clients side** — `contract/bin/check_surface.py` fails if a vendored
  copy was hand-edited, and warns when this repo has moved on
- **from this side** — `scripts/validate_schemas.py` fails if a sibling
  `*-clients` checkout is carrying a stale copy

After changing a schema here, re-vendor in the clients repo:

```sh
cd ../<product>-clients
python3 contract/bin/derive_contract.py --repo . --product <slug> \
    --interfaces-repo ../<product>-interfaces
```

## Checks

```sh
python3 scripts/validate_schemas.py                 # this repo
python3 scripts/validate_schemas.py --format github # CI annotations
python3 scripts/validate_schemas.py --consumers ../<product>-clients
```

Standard library only; `jsonschema`, when installed, adds full meta-schema
validation and checks each schema's own `examples` against it.

## Audience: `x-visibility`

Every `$def` in a schema listed by [`index.json`](index.json) declares who it is
for. The marker is mandatory, because the failure mode of forgetting it is a type
silently joining the published SDK surface — and a surface is far easier to add
to than to take away from.

```json
"WireRecord": {
  "x-visibility": "internal",
  "type": "object",
  ...
}
```

| Value | Means | Example |
|---|---|---|
| `public` | Part of the bearer-token API that external callers consume through `canonical-clients`. | `QuoteDetail`, `HealthStatus` |
| `internal` | First-party only. Served by `canonical-web-server`'s session-authenticated `/api/v1/sync/*` routes and consumed by its own client bundle. | `WireRecord`, `MutationRequest` |

"Internal" is about audience, not secrecy: these types are as readable as any
other, they are simply not something an outside integrator should build against,
because nothing promises they will still exist next month.

### The one rule

**A public type may not `$ref` an internal one.** Doing so would publish the
internal type by the back door — an external caller who can hold a `QuoteDetail`
can hold everything reachable from it. Both `src/generate.mjs` and
`scripts/validate_schemas.py` refuse it, and `src/visibility.test.mjs` asserts it.

The reverse direction (internal `$ref`s public) is sound in principle, but no
emitter writes the cross-module import for it yet, so `build()` rejects that too
with an explicit message rather than emitting a file that names a type it never
imported.

Visibility is declared per **type**, never per property. A marker on a property
is rejected rather than ignored: a schema that reads as though a field were
hidden, while every emitter still ships it, is worse than one that never claimed
to hide it.

### What each language does with it

The generated tree carries two artifacts per language, and the boundary is
whatever that language's own toolchain already enforces:

| Language | Public | Internal | Enforced by |
|---|---|---|---|
| Rust | `rust/src/lib.rs` | `rust/src/internal.rs` | non-default Cargo feature `internal` |
| Go | `go/interfaces.go` | `go/internal/canonicalsync/` | the compiler's `internal/` rule |
| Java | `cloud.canonical.interfaces` | `...interfaces.internal` | JPMS: `module-info.java` exports only the public package |
| Swift | `public struct` | default ACL | the compiler; omitting `public` is the boundary |
| Kotlin | `Interfaces.kt` | `internal/Internal.kt` | `@CanonicalInternalApi` opt-in marker |
| TypeScript | `typescript/index.ts` | `typescript/internal.ts` | not re-exported from the barrel |
| Python | `canonical_interfaces.py` | `_internal.py` | underscore-private module, `__all__` |
| Dart | `lib/canonical_interfaces.dart` | `lib/src/internal.dart` | `lib/src/` is package-private |
| Ruby | `CanonicalInterfaces` | `::Internal` | `private_constant` |
| PHP | `Canonical\Interfaces` | `...\Internal` | `@internal`, honoured by PHPStan/Psalm |
| Elixir | `CanonicalInterfaces.*` | `...Internal.*` | `@moduledoc false` |
| Erlang | `canonical_interfaces.hrl` | `canonical_interfaces_internal.hrl` | separate header; `@private` |
| Gleam | `canonical_interfaces.gleam` | `canonical_interfaces/internal.gleam` | the `@internal` attribute |
| C | `canonical_interfaces.h` | `canonical_interfaces_internal.h` | separate header |
| C++ | `canonical::interfaces` | `canonical::interfaces::detail` | `detail::` convention, separate header |
| Zig | `zig/src/interfaces.zig` | `zig/src/internal.zig` | per-declaration `pub`; nothing re-exports it |

Go's and Java's boundaries are hard errors — `use of internal package ... not
allowed` and `package ... is not visible ... which does not export it`
respectively. The rest range from compiler-enforced (Swift, Kotlin, Rust) to
packaging-enforced (Dart, TypeScript, Ruby) to conventional (C, C++, Erlang).
