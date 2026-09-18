# Reachability probe contract v1

This contract defines the bounded wire shape used to hand an explicitly authorized source-perspective TCP reachability job from Canonical orchestration to an ephemeral worker/runner and to return observation-only results.

## Authority

`main.tsp` and `authored.schema.json` are independently authored peer authorities. CI admits only their common semantic surface and retains parity evidence. Rust, TypeScript, Dart, Go, or other consumers must consume an admitted/generated projection rather than become a second wire authority.

The package exports the TypeSpec and JSON Schema contract paths directly so build tooling can consume the authorities while language adapters are generated separately.

## Safety boundary

A plan contains only explicit host/port tuples. It has no CIDR/range target, wildcard target, arbitrary command/arguments, request body, credential, exploit mode, packet-rate control, or denial-of-service mode. Runtime validation additionally enforces bounded target count, concurrency, timeout, unique target IDs, digest format, and explicit-host syntax.

The plan carries only SHA-256 identities for the authorization reference and the upstream authorized plan artifact. `planSha256` is not defined as a hash of the worker envelope containing itself. The authenticated dispatcher remains responsible for tenant authorization and delivery. The runner must enforce an outbound allowlist equal to the admitted target tuples so the job cannot expand into adjacent discovery.

## Evidence semantics

A completed result set is bound to the admitted `planSha256`, declared `perspectiveId`, a SHA-256 identity for the authenticated runner/deployment, and a UTC observation timestamp. It must contain exactly one unique result for every admitted target; partial execution remains a job failure/retry concern rather than silently becoming complete evidence.

A target result reports only `connected`, `refused`, `timed_out`, `unreachable`, or `unresolved` plus elapsed time. The worker does not interpret refusal/timeout as proof that a VPC, firewall, ACL, VPN, or route blocked traffic. Higher-level adversarial-readiness evidence correlates this observation with provider path/configuration evidence and decides `pass`, `finding`, `unknown`, or `error`.

`runnerIdentitySha256` binds the observation to the authenticated worker identity; it is not a substitute for infrastructure attestation. Deployments that require stronger provenance should additionally retain signed workload/instance attestation and map its evidence ID into the higher-level readiness evidence graph.

This contract is for non-destructive readiness evidence, not exploitation, penetration testing, certification, attestation, or legal conclusions.
