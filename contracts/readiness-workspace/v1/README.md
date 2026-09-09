# Readiness workspace v1

This contract defines the portable multi-tenant boundary for Canonical readiness reporting and the manual workflows around it. It does **not** turn Canonical into an auditor, certification body, legal reviewer, or attestation provider.

## Independent authorities

`main.tsp` and `authored.schema.json` are independently maintained peer authorities. Neither is generated from, overrides, or edits the other. CI admits the boundary only when `ORESoftware/typespec-json-schema-validator` proves structural parity and both authorities agree on the same valid/invalid instance corpus.

Generated JSON Schema from TypeSpec is comparison evidence only. Runtime implementations in Rust, TypeScript/JavaScript, Dart/Flutter, Go, Gleam, and other languages consume the admitted Contract IR or generated language projections; they must not silently select one editable authority as canonical over the other.

## Report artifact and R2 layout

The deterministic assessment result remains separate from its storage envelope. `assessmentReportId` identifies the reproducible assessment result; `reportUuid` identifies one immutable published artifact.

For the current multi-tenant deployment, provision a dedicated Cloudflare R2 bucket per tenant/customer. The recommended bucket and key layout is:

```text
bucket: canonical-rdy-<lowercase-tenant-uuid>
key:    reports/v1/<YYYY>/<MM>/<DD>/<category>/<YYYYMMDDTHHMMSSZ>_<report-uuid>_<sha256-prefix>.json
```

Examples are in `instances/ReportArtifact/`.

Runtime admission must additionally enforce:

- RFC 4122 UUID syntax for tenant, report, form, submission, risk, incident, and training assignment UUIDs;
- RFC 3339 UTC timestamps and a server-controlled `createdAt` / `submittedAt` clock;
- lowercase 64-hex SHA-256 digests;
- `0 <= scoreBasisPoints <= 10000` and non-negative counters/sizes;
- DNS-compatible bucket names and normalized object keys with no `.`/`..` path segments;
- exact tenant-to-bucket ownership: a tenant may never name another tenant's bucket;
- immutable object creation for report artifacts and form submissions; a correction creates a new UUID and links/supersedes the prior record rather than overwriting it;
- content digest verification before an artifact is indexed or served.

Only low-sensitivity routing metadata belongs in R2 object metadata. A recommended allowlist is `tenant-id`, `report-uuid`, `created-at`, `category`, `outcome`, `content-sha256`, and bounded score/count fields. Do not place findings, CVEs, resource names, employee identifiers, form answers, access tokens, or raw evidence in R2 object metadata.

## Search and indexing

R2 is the immutable blob store, not the query engine. `ReportIndexRecord` is the bounded relational/search projection written in the same logical ingest transaction after the R2 content digest is verified. The database should index at least:

- `(tenant_uuid, created_at DESC)`;
- `(tenant_uuid, category, created_at DESC)`;
- `(tenant_uuid, outcome, created_at DESC)`;
- framework IDs, check IDs, problem codes, resource kinds, and tags using database-native array/GIN indexes where supported;
- `assessment_report_id`, `report_uuid`, and `content_sha256` as exact lookups.

Search endpoints must always derive tenant scope from authenticated authorization context, never from an untrusted query parameter alone. Fetch raw report JSON from R2 only after the indexed row has passed tenant/scope authorization.

## Crosswalk semantics

`ControlCrosswalk` allows one framework-neutral evidence capability or deterministic test to reference several framework controls. `FrameworkCoverage` remains a separate result per framework and catalog version. Evidence reuse must never cause one framework's approval, exception, not-applicable decision, or completion state to become another framework's state by inheritance.

## Checklists and recommendations

Manual checklist state is explicit: `not-started`, `in-progress`, `needs-review`, or `compliant`. `compliant` is a customer workflow state, not an audit opinion. Checklist updates are versioned, tenant-scoped, and must preserve actor/time audit history in persistence even though this current wire record carries only the latest projection.

Recommendations are separate records tied to source findings and can carry a runbook and external ticket reference. A recommendation may be resolved without altering the immutable source report that created it.

## Forms and privacy

`FormDefinition` points at a versioned JSON Schema object plus its digest. The schema may drive Maud/HTMX, Leptos, Dioxus, Flutter, or other clients without embedding arbitrary form definitions into every submission record.

`FormSubmission` is immutable and stores a content-addressed R2 payload reference. The general submission/index contract deliberately carries `sourceIpToken`, not a raw IP address. When policy or law requires retaining the exact source IP, the ingress service should place it in a separately access-controlled encrypted audit store with a documented retention period, and derive a keyed token for ordinary search/deduplication. The invalid corpus proves that a raw `sourceIp` property is not admitted into this broad wire shape.

Initial form templates should cover at least access requests, security incident reports, vendor intake/risk review, employee security acknowledgements, exception/risk acceptance, and evidence attestations. Jurisdiction-specific background-check consent language requires qualified legal review before use.

## Ongoing readiness lifecycle

The remaining records provide explicit lifecycle primitives for evidence expiration/renewal, risk acceptance with expiry and executive approval references, incident/postmortem tracking, and training assignments. These are readiness records; they are not replacements for HRIS, SIEM, ticketing, or external auditor systems of record.

## Security and authorization invariants

Runtime implementations must enforce all of the following in addition to schema validation:

1. tenant identity comes from `shared-auth` authorization context and is checked against every row/object;
2. `ores-middleware` request policy and `ores-rate-limit` controls run before mutable endpoints;
3. telemetry uses `ores-otel` and must redact form answers, evidence bodies, credentials, raw source IPs, and signed URLs;
4. cross-process/cache invalidation uses the approved `ores-redis-lru-cache` boundary without treating cache state as authoritative;
5. offline/client synchronization through `opto-sync` preserves immutable IDs and server-side authorization rather than granting offline data authority;
6. RPC/API documentation and shared method contracts use `ORESoftware/api-docs` without bypassing these TypeSpec/JSON Schema peer authorities;
7. raw R2 credentials, signed URLs, auth tokens, and encryption keys never appear in reports, metadata, logs, form payload indexes, or command-line arguments.
