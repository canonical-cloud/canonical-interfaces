# Canonical audit config v1

This contract defines the portable shape consumed from `.canonical-cfg.toml` by Canonical Cloud audit tooling.

## Authority model

`main.tsp` and `authored.schema.json` are independently authored peer authorities. Neither file is generated from the other and neither has precedence. `ORESoftware/typespec-json-schema-validator` (TJSV) admits their common surface, validates positive and negative instances, and emits a non-editable Contract IR plus an exact-head receipt.

The TOML file itself is a serialization of the same object model: parsing `.canonical-cfg.toml` with a conforming TOML parser must produce an object admitted as `CanonicalAuditConfig`. A customer repository may transform TOML to JSON solely for validation; that JSON is derived evidence and is not an editable authority.

## Security invariants encoded in the shape

The contract deliberately makes mutation capability invalid for an audit manifest:

- `audit_mode` is the literal `read-only`;
- `security.allow_mutations` is the literal `false`;
- `security.allow_plaintext_secrets` is the literal `false`;
- every service has `read_only = true`;
- `git.commit_raw_secrets` is the literal `false`;
- credential material is represented by `auth_refs` and `secret_sources`, not by password/token/key fields.

Additional semantic validation in consumers should reject malformed secret references, duplicate service IDs, unsafe publication paths, path traversal/symlinks, and provider permissions that exceed the declared read-only collection scope.

## Repository layout

The portable layout separates private audit material from customer-visible publication:

- `evidence/` — normalized/read-only collection evidence;
- `workpapers/` — private auditor workpapers;
- `reports/` — generated internal reports;
- `manifests/` — provenance and integrity manifests;
- `customer/` — the only directory eligible for customer publication.

A publication implementation must not infer that the entire Git repository is safe to expose simply because `customer/` is present.

## Versioning

Breaking changes require a new contract version and a migration strategy. Provider-specific additions that remain optional may be added to `ServiceSettings` only after TypeSpec/JSON Schema parity, fixtures, and affected consumer tests are updated together.
