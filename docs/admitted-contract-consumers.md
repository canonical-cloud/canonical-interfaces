# Admitted contract consumer generation

Canonical's authored TypeSpec and Draft 2020-12 JSON Schema files remain independent peer authorities. Consumer code must not pick one authority as the winner merely because one syntax is easier to feed into a language generator.

For transport/value contracts under `contracts/`, the consumer path is therefore:

```text
TypeSpec authority -----\
                        +--> TJSV admission --> Contract IR --> admitted common projection
JSON Schema authority --/                                      |
                                                               v
                                                canonical language generator
                                                               |
                                                               v
                                          Rust / TypeScript / Dart / Go / ...
```

`src/generate-admitted-contract-consumers.mjs` implements only the final adapter step. It refuses authored schemas and accepts projections only when they are marked generated from admitted Contract IR with a clean receipt identity and per-declaration assertion digests.

The script stages projections in a temporary workspace and invokes the repository's existing `src/generate.mjs`. It does not rewrite `schema/index.json`, either authored contract, or the checked-in `generated/` tree. The resulting consumer bundle carries `contract-provenance.json` with the exact admission run, receipt digest, declaration digests, and generator digest.

## Why a separate lane

The existing `schema/` generator predates the peer-authority contract registry and directly owns several legacy JSON-Schema-authored surfaces. Repointing `schema/index.json` at a contract's authored JSON Schema would silently make that peer the code-generation winner. Copying generated structs into a Rust consumer would create a second wire authority. Both are intentionally avoided.

Pure transport/value contracts also do not go through `ores-contracts` merely to obtain language types: that tool is the persistence/codegen convergence layer for contract families that opt into its supported persistence semantics. TJSV remains the wire/schema admission authority.

## Promotion rule

A generated consumer bundle is admissible only when all of the following are true:

1. the exact TypeSpec and JSON Schema source revision passes TJSV with zero unexplained findings;
2. the Contract IR is admissible, non-editable, complete, and preserves peer precedence `none`;
3. `project-admitted-contract-ir.mjs` produces the common projection from that Contract IR;
4. the existing multi-language generator accepts that projection;
5. a second generation is byte-identical;
6. language-specific compile/conformance checks pass; and
7. the retained provenance binds the bundle to the admission receipt and generator digest.

The first consumers for this lane are:

- `canonical.adversarial-readiness.evidence.v1` for portable readiness evidence; and
- `canonical.worker.reachability-probe.v1` / result v1 for bounded external/cross-zone runner jobs.

Until a consuming repository pins a certified generated bundle, it should remain draft rather than maintaining an independent hand-written wire struct.
