# Canonical GRC platform contract

This contract is the transport-neutral read-model and capability registry for the Canonical Plus compliance application served through `app.canonical.plus` and `api.canonical.plus`.

TypeSpec and JSON Schema Draft 2020-12 are independently authored peer authorities. Neither is generated from nor subordinate to the other. TJSV must pass before consumers may update generated clients or server bindings.

## Capability baseline

The v1 registry covers the operating domains needed to compete with current compliance-automation platforms such as Drata, Secureframe, Sprinto, Thoropass, Scrut, Scytale, Delve, and Vanta without copying vendor-specific implementation details:

- controls, evidence, continuous tests, exceptions, and remediation
- framework catalogs, crosswalks, coverage, and multi-framework programs
- policies, policy versions, acknowledgements, personnel, and training
- risk register, scoring, controls, treatment, acceptance, and review
- assets, relationships, vulnerabilities, remediation, and monitoring
- vendor inventory, assessments, evidence, monitoring, and reassessment
- user access-review campaigns, decisions, remediation, and evidence
- audit collaboration, PBC/evidence requests, findings, recommendations, and reports
- trust centers, gated resources, NDA/access requests, and approved publication
- security questionnaires, assignments, approved answers, and answer provenance
- integrations, permission snapshots, scheduled collection, and automation runs
- AI system/agent inventory, ownership, risk tiering, controls, and monitoring
- plan catalog, tenant subscriptions, feature entitlements, and usage boundaries

The `feature-parity-target.json` fixture is a target inventory, not a claim that every capability is already deployed. Runtime availability must be derived from admitted server implementation and entitlements, not inferred from this fixture.

## Ownership boundaries

- `canonical-interfaces`: authored transport contracts and parity gates.
- `canonical-lib-core`: reusable domain behavior and typed operations.
- `canonical-orm-core`: private SQL/ORM persistence and tenant isolation.
- `canonical-api-server.rs`: authenticated write/read transport and orchestration for `api.canonical.plus`.
- `canonical-web-server.rs`: customer-facing application rendering and read projections for `app.canonical.plus`.
- `canonical-evidence-connectors.rs`: least-privilege evidence collection and continuous observation adapters.
- admin/auditor services: physically separate privileged review/workpaper plane.

Do not expose generic SQL, database handles, raw provider credentials, or unrestricted JSON mutation through this contract. Write operations belong in separately typed contracts with explicit authorization, bounded inputs, idempotency rules where needed, and negative-access tests.
