# canonical-interfaces

Shared Canonical wire/data contracts, HTTP route maps, reference storage shapes,
and generated language adapters.

This repository intentionally does **not** have one universal editable “source
of truth” for every concern. Different contract families have different
explicit authorities, and generated artifacts are never promoted into a new
editable authority merely because consumers use them.

## Contract authority families

### Legacy JSON-Schema-authored typed I/O

`schema/*.schema.json`, indexed by `schema/index.json`, remains the authored
authority for the legacy typed-I/O families that have not been migrated to a
peer-authority contract directory. These schemas include the established web
sync, quote, compliance, health/info, and related adapter surfaces.

For those legacy families only, update the authored JSON Schema and regenerate
the supported adapters. Do not generalize that workflow to contract families
that use peer authorities.

### TypeSpec + authored JSON Schema peer authorities

Newer contracts such as readiness assessment use independently authored
TypeSpec and Draft 2020-12 JSON Schema peers under `contracts/`. Neither peer
has precedence and one must not be regenerated from the other merely to make a
parity check pass.

`ORESoftware/typespec-json-schema-validator` (TJSV) compares/admit the peers and
retains Contract IR, reports, generated comparison evidence, and provenance.
For an admitted peer-authority contract:

- TypeSpec is editable authority;
- authored JSON Schema is editable authority;
- TJSV admission proves the common admitted surface;
- Contract IR is read-only admitted evidence/projection input;
- any generated comparison JSON Schema is comparison evidence only;
- generated language adapters are read-only consumer projections.

The fail-closed Contract-IR projector lives in this repository. Consumer adapter
generation from the admitted readiness projections is tracked separately and
must preserve this no-precedence boundary.

### HTTP/RPC route maps

HTTP **operation keys, methods, and paths** live in
`route-maps/*.route-map.json`. Message types referenced by a route should come
from the owning admitted/legacy message contract rather than be hand-copied
into a route map.

Run:

```sh
python3 scripts/generate-routes.py \
  --map route-maps/api.route-map.json \
  --out generated/routes
```

for compile-time Rust/TypeScript/Dart route objects. Route aliases or
compatibility paths, when intentionally supported, should be represented in the
shared route authority and generated consistently rather than promised by one
service/client README.

The route-map integration follows `github.com/ORESoftware/api-docs` principles.
Route maps may synchronize via Opto Sync envelopes (`ores.api-docs.route-map`),
but Opto Sync is not the route/RPC authority.

### Persistence/reference SQL

`sql/schema.sql` documents reference storage shapes needed to make important
schema/security drift visible. It is **not** a universal wire-contract authority
and is not automatically deployable DDL.

The owning service/persistence repository remains responsible for the reviewed
runtime migration/desired-state source, roles, RLS, grants, migration ordering,
and deployment admission. Generated message types do not silently become ORM
or database migration authority.

## Generated adapters

Everything under `generated/` is a read-only adapter/projection. Never
hand-edit generated output to resolve semantic drift; change the owning authored
contract and regenerate/re-admit through that contract family's workflow.

| Language | Path |
| --- | --- |
| TypeScript | `generated/typescript/index.ts` |
| Rust (serde) | `generated/rust/src/lib.rs` |
| Rust → WebAssembly (tsify) | `generated/rust-wasm/src/lib.rs` |
| Dart / Flutter | `generated/dart/lib/canonical_interfaces.dart` |
| Dart / Flutter quote v1 | `generated/dart/lib/quote_v1.dart` |
| Python (dataclasses) | `generated/python/canonical_interfaces.py` |
| Go | `generated/go/interfaces.go` |

The `rust-wasm` target uses the same serde-oriented semantic types as Rust plus
`tsify`/`wasm-bindgen` projection support so payloads cross the JS/WASM boundary
as typed objects. It remains a separate crate so the plain Rust adapter need not
carry browser/WASM dependencies.

## Existing legacy typed-I/O surfaces

The web/sync contract currently represented in `schema/api.schema.json`
includes:

- **`HealthStatus`** — legacy-compatible health response;
- **`ServiceInfo`** — service metadata response;
- **`DraftNoteValue`**, **`DraftNoteKey`**, and **`WireRecord`** — bounded
  owner-scoped sync records/snapshots/tombstones;
- **`MutationOperation`**, **`MutationRequest`**, **`MutationResult`**, and
  **`MutationResponse`** — idempotent compare-and-swap mutations;
- **`ChangesQuery`** and **`ChangesResponse`** — bounded incremental pulls.

The current v1 sync contract is deliberately bounded: only the admitted record
kinds/schema versions are accepted, mutation batches and pull pages have hard
limits, record versions are JSON decimal strings, and REST pull is authoritative.
WebSocket invalidations wake a pull loop; they do not become a second state
authority.

The signed-in quote contract in `schema/quote.schema.json` includes generated
request/response/detail/list/retry/event/error shapes. Contact fields remain
follow-up metadata, never identity authority. The exact quote route,
authentication, idempotency, state-machine, privacy, and internal-header
decisions are documented in [`docs/quote-api-v1.md`](docs/quote-api-v1.md), with
golden cross-language fixtures under `fixtures/quote-v1`.

The existing compliance domain in `schema/compliance.schema.json` retains its
established snake_case wire/storage naming where already part of the contract.
Do not mechanically camelCase or regenerate one authority from another merely
for stylistic uniformity.

## Readiness contracts

The readiness contract family is being converged onto admitted peer authorities
rather than copied into every consumer:

- `canonical.readiness.assessment.v1` — deterministic pre-audit/readiness
  assessment body with evidence/targets/findings/counts and explicit
  pass/fail/unknown/error semantics;
- readiness workspace/publication contracts — portable report/publication/index
  semantics separate from provider storage layout;
- admitted Contract IR projection — read-only common surface used to feed
  generated consumer adapters;
- readiness HTTP route operations — shared route-map authority, including typed
  publication/list/detail/content work as it is admitted.

A customer CLI, server, SDK, Flutter app, web app, ORM, MCP surface, or e2e suite
must consume these contracts; none should create its own portable readiness
wire authority.

## Postgres safety/reference contract

`sql/schema.sql` documents owner-aware web/sync/compliance/session shapes used
as a cross-repository reference. Runtime migration remains the responsibility
of the owning service/persistence migration source.

Owner-scoped tables use forced RLS and transaction-local verified identity
context. The browser receives no database credentials. Server-only session,
revocation, admin-role, and audit shapes must not leak into generated public
customer wire adapters or broad customer database grants.

Administrative authorization is a separate data plane. Dedicated admin web/API
repositories now exist, but repository/source preparation does not itself prove
a deployed admin service. Admin roles/credentials/routes remain isolated from
the customer data plane; owner policies must not grow a generic `OR is_admin`
escape hatch. Privileged decisions require their own capability, step-up, and
audit policy.

## Use

For the legacy JSON-Schema-authored adapter set:

```sh
npm install
npm run generate
npm run check
npm test
```

Peer-authority contract directories additionally run their dedicated TJSV
admission/parity workflows, runtime invariants, negative fixtures, and admitted
projection checks. A green legacy generator check is not evidence that an
unrelated peer-authority contract was admitted.

Consume generated adapters via the package `exports` map, for example
`@canonical-cloud/interfaces/typescript`, `.../rust`, `.../dart`, and `.../sql`.

## Making a contract change

Before editing, identify the owning authority family.

### Legacy JSON-Schema-authored type

1. Edit the appropriate authored `schema/*.schema.json` `$def` (or add an
   indexed legacy schema file).
2. Preserve the existing wire naming/compatibility rules for that family.
3. Run the legacy generator/checks and commit generated read-only adapters.
4. If persistence is affected, update the owning migration/desired-state source;
   update reference SQL here only when it is part of the documented parity
   boundary.

### Peer-authority TypeSpec + JSON Schema contract

1. Edit the TypeSpec authority and authored Draft 2020-12 JSON Schema authority
   independently.
2. Do **not** generate one editable peer from the other to force a match.
3. Run TJSV admission/parity, fixtures, runtime invariants, and negative tests.
4. Project only from admitted Contract IR/common assertions into generated
   consumer adapters.
5. Fail closed if scope is incomplete, declarations are excluded, admission is
   not clean, or generated output drifts.

### HTTP route change

1. Change the owning route map/typed route metadata.
2. Bind request/response types to the owning shared contract rather than copying
   schemas inline where an admitted named type exists.
3. Regenerate Rust/TypeScript/Dart/API-doc projections.
4. Test canonical path, any explicit compatibility alias/deprecation policy,
   authentication scope, and non-disclosing error behavior across consumers.

### Persistence change

Change the owning service/ORM migration authority first. Reference SQL in this
repository may be updated to describe required cross-repository parity, but it
must not replace the executable migration/role/grant authority.

## Non-negotiable boundary

No generated adapter, generated comparison schema, Contract IR artifact,
service-local struct, SDK copy, provider-specific schema, prose example, or
reference SQL file becomes a new editable contract authority merely because it
is convenient for a consumer.
