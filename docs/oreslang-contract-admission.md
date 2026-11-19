# Oreslang interface-admission candidate

**Candidate only; not a supported Oreslang runtime.**

`canonical-cloud/canonical-interfaces` reviewed boundaries: `schema/`, `contracts/`, `schema-authority-canary/`, `contract-admission/`.

## Independent authorities and migration safety

Existing schema migration/canary work must not be mistaken for a complete product
TypeSpec/JSON Schema peer pair. Identify the product source revisions and
independently authored TypeSpec plus Draft 2020-12 JSON Schema authority
coverage *per contract family*. Missing peer coverage stops promotion, rather
than making the canary count as product-wide parity. Neither generated schema
nor generated language files may be promoted as an authored authority.

## Oreslang parity and conformance gates

- Run the current-input TJSV source/IR parity gate, with immutable source and
  fixture digests and provenance on the exact head.
- Compile the actual Oreslang JVM/GraalVM adapter and run both positive and
  negative contract-owner fixtures. Preserve evidence collection, controls, policies, identity scoping and audit-domain precision.
- Compare null-vs-absent, unions/enums, object field policy, integer bounds,
  serialization, errors and exact wire behavior against admitted runtime peers.
- Produce actual TJSV runtime-bound ingress/egress and language-boundary
  evidence, with Oreslang toolchain and artifact identities; declaration-only
  code generation, missing tests, and CI with no executed steps are not passes.
- JavaScript-browser and Wasm-browser are independent **future** targets and
  require generated artifact + browser sandbox + differential runtime fixtures.
- Update `governance/` / `contract-admission/` and consumer target matrices
  only when an executable Oreslang implementation passes these gates.

Draft exit condition: complete product-domain peer parity, compiler-backed
runtime conformance, governance mirrors and exact-head CI. No claims of support
or publishable language artifacts are made by this document.
