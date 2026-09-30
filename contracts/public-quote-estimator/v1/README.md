# Public quote estimator contract v1

This subtree governs the public, no-login Canonical Plus readiness estimator shown on `canonical.plus/quote/`. It defines a **non-binding planning estimate**, not an offer, executed statement of work, audit opinion, certification, attestation, or authorization.

## Authorities

Two independently authored sources are peers:

- `main.tsp` — TypeSpec authority.
- `authored.schema.json` — JSON Schema Draft 2020-12 authority.

Neither is generated from the other. `instances/PublicQuoteEstimatorConfig/` is executable evidence: `valid/` must be accepted by both authorities and `invalid/` must be rejected by both.

The v1 authorities intentionally govern the pricing semantics that must not drift independently between consumers:

- USD currency and schema version;
- $5,000 public lower bound and $15,000 public upper bound;
- midpoint clamps, $500 rounding increment, and lower/upper range factors;
- the ordered 9/5/3-week delivery choices and base amounts;
- framework IDs, labels, and incremental amounts;
- advisory/managed/remediation IDs and amounts;
- focused/growing/complex environment IDs and amounts; and
- the default speed, frameworks, delivery depth, and complexity.

Explanatory `note` strings are presentation copy. They are required strings but are not fixed commercial constants by the schema.

## Calculation semantics

Consumers implementing the v1 estimator use the same deterministic calculation:

```text
raw_midpoint = speed.baseUsd
             + sum(selected standards.amountUsd)
             + deliveryDepth.amountUsd
             + complexity.amountUsd

midpoint = clamp(raw_midpoint, midpointFloorUsd, midpointCeilingUsd)
lower = clamp(round_to(midpoint * lowerFactor, roundToUsd), estimateFloorUsd, estimateCeilingUsd)
upper = clamp(round_to(midpoint * upperFactor, roundToUsd), lower, estimateCeilingUsd)
```

At least one framework must be selected before a quote can be completed locally. The checked-in semantic test exhaustively evaluates all 6,885 non-empty v1 combinations and proves bounds/order plus monotonicity for faster delivery, deeper service, and greater environment complexity.

## Privacy and authentication boundary

This contract describes estimator configuration and calculation only. It does **not** authorize persistence, network submission, cookies, browser storage, anonymous quote IDs, or authentication bypasses.

The marketing estimator remains in page memory and must not silently transmit its state. Signing in begins the separate authenticated quote workflow governed by `schema/quote.schema.json` and `docs/quote-api-v1.md`; estimator state is not implicitly transferred.

Any future anonymous persistence is a separate versioned API contract with explicit abuse controls, retention, ownership/claiming, idempotency, and data-handling rules.

## Change discipline

A v1 change to a governed price, ID, label, default, bound, factor, rounding rule, or ordered option set must update both authored authorities independently, update positive/negative fixtures, and pass TJSV parity plus the semantic pricing tests. One-sided authority drift is expected to stop for evaluation rather than silently choosing a winner.
