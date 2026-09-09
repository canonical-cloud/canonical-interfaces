# Readiness observation v1 peer authorities

Linear: `DEN-3938`

This directory defines the transport contract used when a customer system or an authorized read-only connector reports readiness evidence over time.

`main.tsp` and `authored.schema.json` are independent, human-maintained authorities. Neither file is generated from, ranked below, or allowed to overwrite the other. `ORESoftware/typespec-json-schema-validator` generates a temporary JSON Schema witness from TypeSpec only for comparison, executes both authorities against the same instance corpus, emits deterministic receipts and Contract IR, and fails closed on unexplained structural or behavioral drift.

The contract is intentionally limited to portable wire data shared across Rust, TypeScript/JavaScript, Dart/Flutter, Go, Gleam and other consumers. Runtime implementations add bounded identifier, timestamp, digest, reference-integrity, authorization, replay, sequencing and persistence checks without changing these field names or enum values.

## Boundary

A valid signature or bearer token establishes only transport origin and integrity. An accepted observation starts with `substantiveReview: "unreviewed"`. It is not a passed control, audit opinion, attestation, certification, authorization, legal conclusion, or independent evaluator determination.

Evidence may be referenced from several framework assertions, but applicability, answers, exceptions, approval and completion remain independent for each framework and control.

## Validate

The repository workflow pins the validator to commit `03ccc0ecdfc70f9198c3ccf80718910961d3fde1` and retains the parity receipt, SARIF, generated comparison witness and admissible Contract IR.
