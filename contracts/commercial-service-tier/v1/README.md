# Commercial service-tier contract v1

This subtree defines the serialized Canonical Cloud commercial service-tier catalog. It does **not** make a proposed price a binding offer, executed SOW, or approved commercial term.

## Authorities

Two independently authored sources are peers:

- `main.tsp` — TypeSpec authority.
- `authored.schema.json` — JSON Schema Draft 2020-12 authority.

Neither is generated from the other. Generated schemas, Contract IR, witnesses, SDK models, marketing pages, and legal-document projections are evidence or consumers only.

`instances/ServiceTierCatalog/` is independently maintained executable evidence. `valid/` must be accepted by both authorities; `invalid/` must be rejected by both.

## Current proposed catalog

As of 2026-09-11 the v1 fixture records three **proposed** monthly starting-price assumptions:

| id | display name | monthly USD |
| --- | --- | ---: |
| `foundation-readiness` | Foundation Readiness | 2,500 |
| `managed-readiness` | Managed Readiness | 7,500 |
| `assurance-engineering` | Assurance Engineering | 20,000 |

The human-facing governed draft is maintained in `canonical-cloud/canonical-docs` under `docs/legal/external/service-tier-schedule.md`. Business, finance, and counsel approval remains a separate gate from schema admission.

## Change discipline

A change to identity, name, price, currency, publication state semantics, or catalog shape must update both authored authorities independently, add or amend positive/negative fixtures, and produce a fresh TJSV receipt. A one-sided edit is expected to stop for evaluation rather than silently choosing a winner.

The dedicated CI gate also performs an explicit negative control by mutating the Foundation price to 2,600 in a temporary copy of the JSON Schema authority and requiring TJSV to refuse convergence.
