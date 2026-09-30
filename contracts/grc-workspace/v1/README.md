# GRC workspace v1

This contract is the portable customer/API boundary for Canonical's broader governance, risk, compliance, trust, audit, and AI-governance workspace.

It intentionally does **not** mirror PostgreSQL tables one-for-one. Private persistence semantics live in `canonical-lib-core` and `canonical-orm-core`; this contract exposes bounded resource projections and mutation inputs suitable for app.canonical.plus, web.canonical.plus, api.canonical.plus, SDKs, Flutter, and MCP adapters.

## Authorities

`main.tsp` and `authored.schema.json` are independently editable peer authorities. Neither takes precedence. TJSV admission must fail closed on unexplained differences.

## Resource families

The v1 surface admits projections for:

- dashboard and compliance programs;
- controls and continuous control-test runs;
- evidence and immutable provenance summaries;
- assets/system inventory;
- risk register;
- policy lifecycle;
- vendor/third-party risk;
- questionnaires;
- auditor evidence requests;
- trust center;
- AI systems/governance;
- training assignments.

Mutation records use caller-generated `requestId` values for idempotency. Tenant identity is never a mutation field: servers derive it from verified authorization context.

## Security invariants

- No raw integration credential, signed URL, database role, internal object-store secret, or cross-tenant locator is admitted.
- Evidence is identified by durable UUID/hash metadata; content access remains separately authorized.
- All list/search implementations must use bounded cursors and tenant-scoped authorization.
- Mutable implementations must enforce idempotency and compare-and-set/expected-revision semantics in the service/ORM layer.
- Audit and trust-center access grants remain server-authorized capabilities, not client-declared roles.
- AI governance projections describe registered systems/use cases; they do not make regulatory or legal determinations.

## Versioning

Breaking semantic changes require a new contract namespace/version. New optional fields may be admitted only after both peer authorities and instance corpora agree.
