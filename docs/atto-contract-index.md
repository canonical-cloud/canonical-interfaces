# AttoLang source-only contract index

`generated/atto/contract_index.atto` is an experimental **.atto** artifact derived from the same `schema/index.json` and `$defs` input as the Rust, TypeScript, Go, Python, and Dart adapters.

The exported, snake_case `canonical_interface_type_count()`, per-type `*_type_name()` / `*_field_count()`, and per-field `*_name()` / `*_wire_kind()` / `*_required()` functions provide a deterministic introspection surface for AttoLang integration. Nullable schema values have a `:nullable` tag; named references are `ref:Type`; enum-backed strings are `string:enum`.

This index is **not** a complete typed DTO generator or a schema validator. It does not execute HTTP requests, store credentials, validate payload bounds, or claim Atto compiler/runtime parity. Schema constraints such as maximum length and regex patterns must still be enforced by the authoritative JSON Schema validator. Do not use the introspection functions to admit untrusted payloads.

Regenerate with `npm run generate`; verify with `npm test` or `npm run check`. Do not edit generated files. A future certified Atto target requires exact-commit compilation, positive/negative guest fixtures and a separately verified transport security boundary.
