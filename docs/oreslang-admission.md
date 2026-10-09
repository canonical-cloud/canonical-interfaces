# Oreslang contract/SDK admission track — draft

**State: BLOCKED / NOT SUPPORTED FOR PUBLICATION.** This change records the Oreslang target for this repository without modifying authored contract semantics, claiming a working SDK, or weakening CI.

- **Repository role:** `interfaces`.
- **Owning authored contract repository:** [canonical-cloud/canonical-interfaces](https://github.com/canonical-cloud/canonical-interfaces).
- **Local contract inventory to bind:** `schema/index.json and schema/*.schema.json; independently reviewed TypeSpec peer must be verified`.
- **Local invariants:** Never hand-edit generated/; preserve exact generator output and schema index. Chromium browser proof requires actual generated wasm-pack output, no network.

## Required implementation

1. Inventory and pin the exact *human-authored* TypeSpec and JSON Schema Draft 2020-12 peers. They are independent coequal authorities; a missing peer is a **blocker**, not a reason to generate it from the other or trust a parity canary for the entire domain.
2. Run reviewed `ORESoftware/typespec-json-schema-validator` (TJSV) against the exact source closure, fail closed on structural/semantic and valid/invalid-instance differences, and retain its Contract IR identity and parity-run receipt. Use `ORESoftware/ores-contracts` additionally only for contract families with supported persistence semantics.
3. Build a real Oreslang `generated/oreslang` adapter from the admitted contract inventory, **not** a duplicate authored schema. Preserve exact wire names, tags, number bounds, null/omitted distinctions, unknown-field rules and error behavior.
4. Compile on the **actual pinned** `oreslang-source.java` GraalVM/Truffle compiler and execute positive, negative, boundary, replay, and malformed-input fixtures via `oreslang-serialization-and-validation`. Native-library incompatibility, missing toolchain, stub compiler, or skipped fixtures MUST NOT produce a success receipt.
5. Bind bounded, payload-free runtime verdicts to the exact Contract IR ID, parity receipt, fixture digest, compiler revision and implementation revision. TJSV decides runtime admission. Test real external consumers and Zed package contents before enabling publish/release.
6. Plan **separate** JS-transpiler and Wasm/browser adapters later. Until toolchains exist and pass hermetic browser execution tests, these are **not** supported or certified targets; WASM from Rust or TypeScript cannot certify Oreslang.

## Review checkpoints

- [ ] Both reviewed domain authorities present and current-input TJSV parity verified
- [ ] Oreslang emitted declarations compile with pinned native compiler
- [ ] Positive and negative fixture corpus passes with exact-bound runtime receipt
- [ ] Real client/consumer import and packaging test passes
- [ ] Missing/unsupported compiler or contract divergence demonstrably fails closed
- [ ] JS/Wasm/browser support remains explicitly deferred

Do not add Oreslang to a required successful runtime matrix or published target list until these checks are complete. This file is an integration and governance checkpoint, **not proof of support**.
