# Public quote v3 — offline calibration prework (NOT published pricing)

Status: **research only**. This documentation and `src/public-quote-calibration.mjs` do not establish new customer prices or replace the pinned public quote v2 fixture.

## Evidence needed before v3 pricing

Obtain commercially authorized, de-identified historical projects with executed statements of work and reconciled actual delivery costs. Use a secure workspace, **never a Git repository**, for the underlying rows. A human must verify provenance, currency, fee period (one-time project vs monthly recurring), exclusions, discount effects, and whether each example is comparable to readiness engineering. If any record is not authorized for this analysis, exclude it entirely. Do not export client names, emails, employee identifiers, URLs, customer-specific notes, or audit evidence.

The private offline rows accepted by the evaluator are **exactly**:

- `sample`: `calibration` or `holdout`
- `month`: YYYY-MM only; calibration months must be strictly earlier than the holdout period
- `deliveryDepthId`: `advisory`, `managed`, or `remediation`
- `employeeBandId`: one of the five v2 employee bands
- `sectorId`: one of the seven v2 sectors
- `quotedLowerUsd`, `quotedUpperUsd`: historical **original** public range, USD
- `contractedUsd`: actual executed project service fee in the same scope, USD, excluding auditor/assessor fees and recurring software subscriptions
- `deliveredCostUsd`: reconciled internal + subcontractor cost to deliver that same scope, USD

Use aggregate output from `evaluateQuoteCalibration(rows)` only; do not commit private input rows, report client-level outliers or publish actual cost data. Test fixtures are **synthetic**, not calibration evidence.

## Prepublication quality gates

The default gate requires at least 30 chronologically separate holdout records, at least 10 holdout records in each observed segment (delivery depth, employee band, sector), median absolute percentage error no more than 20%, and quoted-range coverage at least 70%. These numbers are **provisional engineering review thresholds**, not proven business targets; the commercial owner must ratify them or replace them in a reviewed contract. Report the p90 error, underquote/overquote rates and realized gross margin as additional diagnostics.

**Passing this evaluator never authorizes deployment by itself.** A v3 numeric public model also needs:

1. Versioned, independently authored TypeSpec and JSON Schema authorities; deterministic overlapping-framework controls; strict range/size boundaries, price floors, currency and arithmetic definitions, and an independently reviewed labor-rate/discount policy.
2. Calibration with time-separated out-of-sample evaluations, small/medium/enterprise/regulated edge cases, fairness across sectors, and sensitivity tests for number of accounts, evidence sources, cloud boundaries, control owners, remediation effort and overlapping controls. No automatic surcharge purely because a business is healthcare or fintech.
3. Explicit custom-scoping behavior for FedRAMP, large/unknown systems, unverified control maturity and estimate-cap overflows. No false one-size-fits-all estimate.
4. Exact browser/server parity under one pinned approved contract revision, negative mutation tests, idempotency and hosted Edge execution.
5. Independent finance/commercial sign-off with actual delivery profitability, security/privacy review, and a production canary that does **not** automatically email test prices to prospects.

## Current deployment boundary

Marketing `/quote/` consumes public v2; release PR https://github.com/canonical-cloud/canonical-marketing-site.web/pull/153 adds qualifying scope dimensions and blocks misleading capped prices. No v3 estimator should be wired to production until independently approved and verified. The Supabase public-intake function and public Pages build must be deployed coherently; quote email delivery requires the provider and secret configuration and cannot be inferred from a successful frontend build.
