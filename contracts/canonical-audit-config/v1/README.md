# Canonical audit config v1

This contract defines the portable shape consumed from `.canonical-cfg.toml` by Canonical Cloud audit tooling.

## Authority model

`main.tsp` and `authored.schema.json` are independently authored peer authorities. Neither file is generated from the other and neither has precedence. `ORESoftware/typespec-json-schema-validator` (TJSV) admits their common surface, validates positive and negative instances, and emits a non-editable Contract IR plus an exact-head receipt.

The TOML file itself is a serialization of the same object model: parsing `.canonical-cfg.toml` with a conforming TOML parser must produce an object admitted as `CanonicalAuditConfig`. A customer repository may transform TOML to JSON solely for validation; that JSON is derived evidence and is not an editable authority.

## Toolchain declaration

Every v1 `.canonical-cfg.toml` must contain a `[toolchain]` table. This prevents a customer from silently validating a current configuration with an older CLI or an unknown schema engine.

```toml
[toolchain]
canonical_cli = "0.1.0"
validator = "oresoftware/typespec-json-schema-validator"
validator_revision = "7b1e79a32b89006a6eb6642ccd71ef25ffac0103"
validator_receipt_schema = "ores.tjsv.config-instance/v1"
config_bridge = "oresoftware/ores-cli"
config_bridge_revision = "f07b3785a6cd1957591104d19099724452058172"
require_exact_cli_version = true
runtime_schema_drift = "warn"
```

`canonical_cli` is the exact Canonical CLI version expected by the file. Build, CI, pre-commit/pre-push and explicit `canonical-config validate` checks must fail closed when that version differs from the running CLI. A migration must deliberately update the config and its contract fixtures rather than silently accepting `latest`, an unbounded range or an unknown CLI.

`validator` and `validator_receipt_schema` make the validation implementation/protocol visible in the config. The current v1 contract requires `oresoftware/typespec-json-schema-validator` and the `ores.tjsv.config-instance/v1` receipt. `validator_revision` pins the exact admitted TJSV implementation. `config_bridge` must be `oresoftware/ores-cli`, and `config_bridge_revision` pins the exact `ores-config-shape` implementation used to parse/bridge the TOML instance. Both revision fields are lowercase 40-hex Git object IDs so customer evidence can be traced back to immutable source.

`require_exact_cli_version` is deliberately fixed to `true` for v1. `runtime_schema_drift = "warn"` applies only to the additional JSON-Schema observation after the TOML parser has successfully produced a value. It does not weaken TOML parse failures, the read-only security invariants below, credential-reference rules, path-safety checks, or other application invariants that must remain fail closed.

## Validation lifecycle

The same contract is checked at multiple boundaries without creating another schema authority:

1. **Contract/build admission:** `tjsv check` compiles the TypeSpec authority, compares it with the independently authored Draft 2020-12 Schema A, evaluates the positive/negative corpus, and emits retained parity/Contract-IR evidence. Drift fails the build.
2. **Configuration build/CI check:** parse `.canonical-cfg.toml` with the application TOML parser or `ores-config-shape`, convert the parsed value to JSON-equivalent data, then run `tjsv-config --mode build` against `authored.schema.json`. Invalid shape, unavailable validation, or mismatched declared tool revisions fail closed.
3. **CLI / git-hook check:** `canonical-config validate` performs the same build-mode shape check and verifies the running `canonical-cli` version plus the expected validator/bridge identities and revisions against `[toolchain]`. This is suitable for pre-commit/pre-push and zed-pkg install/smoke hooks.
4. **Runtime observation:** after the application has parsed its config, stream the JSON-equivalent value to `tjsv-config --mode runtime`. Schema drift is logged as a structured warning and startup may continue; actual parser or safety-invariant failures still stop execution.

Configuration contents must not be written to an unprotected temporary file merely to invoke validation. Consumers should stream the parsed JSON-equivalent value to TJSV over stdin. TJSV diagnostics should retain schema/config pointers and keyword classes rather than configuration values.

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

Breaking changes require a new contract version and a migration strategy. Provider-specific additions that remain optional may be added to `ServiceSettings` only after TypeSpec/JSON Schema parity, fixtures, actual `.canonical-cfg.toml` instance validation, and affected consumer tests are updated together.
