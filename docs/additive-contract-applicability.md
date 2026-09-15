# Additive contract applicability

Status: repository policy for additive verification lanes. This document does not promote Protobuf, WIT, or Dafny to editable contract authority.

## Authority model

For contract families declared as peer-authority families, independently authored TypeSpec and JSON Schema Draft 2020-12 remain the editable peers. They have equal authority and no precedence. `ORESoftware/typespec-json-schema-validator` (TJSV) admission is the fail-closed parity boundary. Generated JSON Schema, Contract IR, language adapters, SQL projections, Protobuf descriptors, WIT packages, Dafny models, and verification receipts are derived evidence only.

Legacy families that are still JSON-Schema-only remain explicitly legacy until they are migrated by a separate reviewed change. Additive lanes do not silently convert a legacy family into a peer-authority family.

## Lane inventory

| Lane | Current applicability | Owner | Purpose | Authority |
| --- | --- | --- | --- | --- |
| Protobuf / gRPC | not globally applicable; opt-in per contract family when a stable binary/RPC wire surface is declared | `canonical-interfaces` contract owner + TJSV verifier | wire compatibility and descriptor evolution evidence | derived only |
| WIT | not globally applicable; opt-in for WASM component boundaries that actually cross a component ABI | `canonical-interfaces` contract owner + TJSV verifier | package/world parsing and component-interface compatibility evidence | derived only |
| Dafny | not globally applicable; opt-in for correctness-critical invariants selected for formal verification | domain contract owner + TJSV verifier | proof evidence for declared invariants/algorithms | derived only |

Absence of an opt-in declaration is **not** a pass. It means the lane is `not_applicable` for that contract family until an owning decision changes it. CI and `ores-cli` should distinguish `not_applicable`, `applicable_with_fresh_receipt`, `applicable_missing_receipt`, and `applicable_stale_receipt`.

## Canonical artifact locations

The following locations are reserved so discovery is deterministic when additive lanes are implemented:

- authored applicability manifest: `contract-admission/additive-contracts.json`;
- immutable admission receipts: `contract-admission/receipts/additive/<contract-family>/<source-digest>.json`;
- generated Protobuf evidence: `generated/additive/protobuf/<contract-family>/`;
- generated WIT evidence: `generated/additive/wit/<contract-family>/`;
- generated Dafny evidence: `generated/additive/dafny/<contract-family>/`.

The manifest is repository-authored policy, not a copy of wire schemas. Receipts and everything under `generated/additive/` are generated/read-only evidence. They must carry or bind the exact editable-authority source digests and immutable verifier/tool revisions used to produce them.

Until `canonical-interfaces#68` implements these paths, tools must not fabricate empty receipts or generated artifacts merely to satisfy discovery.

## Versioning and freshness

Applicability is versioned with the contract family and source digest, not only the repository branch name. A receipt is stale when any of these changes:

- either editable peer-authority digest;
- the contract family/version named by the applicability entry;
- the additive-lane inputs;
- the pinned verifier/tool revision that the owning policy requires;
- the declared Protobuf/WIT/Dafny compatibility or proof policy.

A stale, missing, malformed, unverifiable, or wrong-source receipt blocks an applicable lane. Latest-tip compatibility checks may run as canaries, but they do not replace exact resolved-source admission.

## `ores-cli` discovery contract

`ores-cli` should discover additive applicability from `contract-admission/additive-contracts.json` and report receipt state. It must not duplicate TJSV verification semantics or infer applicability from the incidental presence of `.proto`, `.wit`, or `.dfy` files. A lane is applicable only when the owning manifest says so.

Machine output should include the contract family, lane, applicability state, exact source digest(s), receipt path when applicable, and a bounded reason code. It must not claim that `not_applicable` or an absent lane is verified.

## Current repository decision

As of this policy revision, no contract family in `canonical-interfaces` has a repository-wide requirement for Protobuf, WIT, or Dafny. Individual families may opt in through `canonical-interfaces#68` or a successor only when the runtime boundary justifies the lane. The readiness assessment/workspace work remains TypeSpec + authored Draft 2020-12 JSON Schema peer authority with TJSV/Contract-IR/generated-language evidence; adding an additive lane requires an explicit applicability entry rather than implicit rollout.
