# Canonical audit report account contract v1

This contract defines the customer-account metadata around an existing Canonical audit report. It deliberately does **not** redefine the audit report payload itself.

## Authority model

`main.tsp` and `authored.schema.json` are independently authored peer authorities with no precedence. `ORESoftware/typespec-json-schema-validator` compiles TypeSpec to a generated comparison schema and proves parity against the authored Draft 2020-12 schema. Generated output is evidence only and must never overwrite either authored source.

## Ownership and authorization

An audit report belongs to exactly one `AuditReportOwner`:

- `user`: a personal customer account;
- `org`: an organization/customer account.

The caller may request an owner, but the API server is authoritative for whether the authenticated subject may write or read that owner. A client-supplied owner ID is never sufficient authorization by itself. Organization membership and role checks belong to the shared-auth/API boundary.

`subjectId` is server-derived from authentication and appears only in the persisted `AuditReportRecord`; it is not caller-controlled metadata.

## Immutability

`AuditReportCreateMetadata` accompanies a separately validated Canonical `AuditReport` payload.

The server must verify:

1. `programDigest` identifies the admitted audit program;
2. `reportDigest` is the SHA-256 digest of the exact canonicalized report payload accepted for storage;
3. replay of the same immutable payload may return a `duplicate` receipt;
4. reuse of a report identity/idempotency key for different bytes fails closed as `report-conflict`;
5. labels are mutable presentation/search metadata and do not change report identity.

Runtime validation must require digests in the form `sha256:<64 lowercase hex characters>`. The wire contract keeps these fields as strings so runtime implementations may strengthen digest validation without creating TypeSpec/JSON-Schema regex drift.

Persisted report JSON and its digest are append-only/immutable. Retention, tombstoning, or administrative lifecycle state must not silently rewrite the evidence document.

## Provider boundary

This contract is independent of database and hosting provider. A conforming API may persist through Supabase PostgreSQL or Neon PostgreSQL and may run behind Cloudflare on GCP Cloud Run or `ORESoftware/k8s-cluster`. Those choices never change the wire shape.

## Assurance boundary

Receipt status means transport/admission/storage succeeded or was a byte-identical duplicate. It does not mean the report is an audit opinion, certification, attestation, control pass, regulatory authorization, or guarantee of compliance.
