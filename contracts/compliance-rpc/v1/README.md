# Canonical compliance RPC v1

This directory contains independent TypeSpec and JSON Schema Draft 2020-12 peer authorities for the object-key RPC envelope used by Canonical compliance/readiness services.

## Trust boundary

`RpcCall` is caller-controlled and deliberately contains no tenant, actor, role, scope, or authentication-strength authority. After Shared Auth or service authentication succeeds, the trusted server constructs `RequestContext` from verified claims and transport-local state. Handlers receive the two values separately; the gateway must never merge a caller-provided context into the trusted context.

Object-key operations are stable wire identifiers such as `compliance.evidence.upload`. HTTP paths, NATS subjects, WebSocket frames, and other transports are projections/bindings of those operations rather than independent RPC authorities.

## Wire formats

JSON is the interoperable baseline. Generated Protobuf and optional CBOR projections may be used where admitted by the same semantic contract. Rust-native serialization such as bincode is not a durable/public wire authority and is limited to same-build internal state where version coupling is explicit.

## Authority and generation

`main.tsp` and `authored.schema.json` are independently edited authorities. Neither is generated from the other. `ORESoftware/typespec-json-schema-validator` admits their common surface and emits read-only Contract IR/evidence. Generated Rust, Rust/WASM, Dart, TypeScript, Go, Python, Protobuf, API-doc, and route projections consume only an admitted contract revision.

Authorization metadata belongs in the route/operation registry in `ORESoftware/api-docs`; it documents required roles/scopes but never replaces runtime authorization checks.
