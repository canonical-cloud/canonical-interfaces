# Adversarial readiness evidence v1

This contract admits portable evidence produced by bounded adversarial readiness checks. It is designed to feed `canonical.readiness.assessment.v1` without making a CLI-private Rust structure or a storage-provider envelope authoritative.

## Authority

`main.tsp` and `authored.schema.json` are independently authored peer authorities. Neither is generated from the other. CI admits only their common semantic surface and retains the parity receipt, Contract IR, generated witness, projection, and SARIF evidence.

## Local execution versus portable evidence

Execution plans may contain the concrete hostname, IP address, TCP port, or filesystem path needed to run an authorized check locally. The portable `AdversarialEvidenceReport` intentionally does **not** carry raw target locators. It uses:

- `targetId` for a logical target reference;
- `locatorSha256` for correlation with local/private evidence;
- `authorizationRefSha256` instead of copying an engagement ticket or statement-of-work reference into every portable artifact.

The authenticated API/workspace remains responsible for tenant identity, authorization, publication IDs, object-storage locations, signed URLs, and other server-owned state.

## Evidence semantics

A report separates evidence layers so downstream reports do not overstate what was proved:

- `service-session` — an actual client could or could not establish the explicit service session;
- `network-boundary` — an intended segmentation/firewall claim, which normally needs correlated path/configuration evidence before a negative result is promoted to a pass;
- `provider-path-analysis` — normalized AWS/GCP/Azure or equivalent route/policy analysis;
- `effective-file-access` — the current identity's bounded access to an explicit regular file without collecting content;
- `filesystem-metadata` — ownership/mode baseline evidence;
- `execution-context` — observed root/non-root execution perspective;
- `static-configuration` — pre-audit configuration/IaC evidence;
- `transport-identity` — TLS/mTLS or equivalent transport-identity evidence.

Status is `pass`, `finding`, `unknown`, or `error`. Negative controls must use `unknown`/`error` when the requested fact cannot actually be established.

## Recommendations

Portable results reference a stable `catalogKey` plus normalized `controlLayers`; provider-specific Terraform, Crossplane, Kubernetes, image, or policy templates remain recommendation-catalog data rather than executable mutations inside the evidence contract.

This keeps evidence collection read-only and lets canonical.plus render actionable remediation without coupling the contract to a specific cloud provider or IaC engine.

## Assurance boundary

This is readiness/pre-audit evidence. It is not by itself an audit, penetration-test conclusion, attestation, certification, or legal conclusion. Full-audit workflows may correlate this evidence with independently authorized specialist testing and ATT&CK-style attack-path analysis, but this contract does not carry discovered credentials, raw secrets, exploit payloads, persistence artifacts, or exfiltrated customer data.
