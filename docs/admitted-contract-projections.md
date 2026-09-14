# Admitted Contract IR projections

Readiness contracts under `contracts/` use independent TypeSpec and authored Draft 2020-12 JSON Schema peer authorities. Generated language adapters must not silently choose either editable authority as canonical.

The supported bridge is the TJSV **admitted Contract IR**. After an exact-head run passes with zero unexplained findings, each admitted declaration contains an `assertionSchema`: the normalized common assertion proven by both authorities and the differential fixture/probe corpus. `src/project-admitted-contract-ir.mjs` projects only those admitted assertion schemas into a generator-friendly JSON Schema bundle.

The projector fails closed unless:

- the IR status is `passed` and `admissible=true`;
- it is explicitly non-editable;
- authority precedence is `none`;
- generated TypeSpec JSON Schema remains comparison evidence only;
- the admission receipt is clean;
- admission scope is complete with no excluded declarations;
- every admitted declaration has exactly one portable name and assertion schema;
- projected declaration count matches the admission receipt.

This projection is **generated evidence**, not a third editable contract authority. Any checked-in projection must be generated from and cryptographically linked to an exact admitted IR receipt, live under a generated/read-only path, and be regenerated rather than hand-edited.

## Next integration step

The existing legacy adapter generator currently reads `schema/index.json`, whose entries are editable schema files. Readiness assessment/workspace types should not be copied into that directory by hand. Instead, the generator should gain an admitted-projection input lane and emit the Rust, TypeScript, Dart, Go and other supported adapters from the projected Contract IR bundle. CI must regenerate from a fresh exact-head IR and compare the result with checked-in generated adapters.

`canonical-e2e` should then require `AssessmentReport`, `ReportArtifact`, `ReportIndexRecord`, `Recommendation`, and the rest of the supported readiness surface to exist in every generated adapter; deleting or narrowing one adapter must fail parity rather than silently reducing the comparison set.
