# Readiness assessment v1

This contract defines the deterministic pre-audit/readiness assessment body produced by Canonical assessment engines. It is separate from `ReadinessWorkspace.V1.ReportArtifact`, which is the server-created immutable publication/storage envelope.

## Authority model

`main.tsp` and `authored.schema.json` are independent peer authorities. Neither is generated from or overrides the other. Admission requires TypeSpec/JSON Schema parity plus agreement on the shared fixture corpus through `ORESoftware/typespec-json-schema-validator`.

## Boundary

An `AssessmentReport` is preparedness evidence only. It is not an audit opinion, certification, attestation, legal conclusion, or external assessor decision. Consumers must preserve explicit `unknown` and `error` states rather than coercing incomplete evidence to pass or fail.

The assessment body contains no trusted tenant UUID, R2 bucket/key, signed URL, database provider, cloud-provider credentials, or publication UUID. Those belong to authenticated server-side publication and the readiness-workspace `ReportArtifact` envelope.

## Determinism

`assessmentReportId` is the content-derived identity of the normalized assessment result. A conforming producer must normalize deterministic fields before hashing and use the same digest algorithm/encoding across implementations. Server publication may create multiple immutable `reportUuid` artifacts referencing one `assessmentReportId` without changing the assessment body.

## Runtime admission invariants

The wire authorities intentionally describe portable structure. Runtime admission must additionally enforce relational invariants that JSON Schema/TypeSpec alone cannot prove reliably:

- `assessmentReportId` is a valid lowercase SHA-256 content identity in the agreed representation;
- evidence digests are lowercase SHA-256 values and evidence IDs are unique;
- target IDs and finding IDs are unique;
- every finding `targetId` resolves to a declared target;
- every finding evidence ID resolves to declared evidence;
- every recommendation source finding ID resolves to a declared finding;
- summary counts exactly match findings by status;
- `highOrCriticalFailures` matches failed findings whose severity is high or critical;
- `0 <= scoreBasisPoints <= 10000` when scoring is emitted;
- mappings are framework/control/catalog-version references only and never imply status inheritance across frameworks;
- report, finding, target, evidence, and recommendation strings are bounded before persistence/logging;
- credentials, bearer tokens, signed URLs, private keys, and raw provider secrets are rejected or redacted before a report is admitted.

## Recommendation semantics

`AssessmentRecommendationInput` is deterministic remediation input attached to immutable source findings. Hosted mutable recommendation workflow state lives in `ReadinessWorkspace.V1.Recommendation`; resolving a recommendation never rewrites its source assessment.

## Consumers

Primary consumers are `canonical-cli`, `canonical-company-auditor.rs`, `canonical-api-server.rs`, `canonical-web-server.rs`, `canonical-clients`, `canonical-flutter`, `canonical-orm-core`, and `canonical-e2e`.
