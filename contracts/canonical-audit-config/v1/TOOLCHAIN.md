# `.canonical-cfg.toml` validation

Canonical audit configuration has two independent authored authorities:

- `main.tsp` (TypeSpec)
- `authored.schema.json` (JSON Schema Draft 2020-12)

`ORESoftware/typespec-json-schema-validator` (TJSV) compares those authorities during build/CI and validates the parsed configuration object against Schema A.

For end-user repositories, the preferred command is:

```sh
canonical-config validate --config .canonical-cfg.toml
```

The companion validator is shipped from the same `canonical-cli` package and therefore knows the exact running `canonical-cli` package version. It requires the TOML's `[toolchain].canonical_cli` value to match that version and delegates full TOML parsing/schema validation through `ores-config-shape` and `tjsv-config`.

For runtime observation, where schema drift must be reported but not by itself stop startup:

```sh
canonical-config validate --config .canonical-cfg.toml --mode runtime
```

Parser failures and application safety invariants remain separate fail-closed concerns. Runtime mode only makes the additional schema-observation lane warning-only.

A repository may install this command in a pre-commit/pre-push hook. CI and release admission should always use build mode. Zed packages should declare the validator dependencies so these commands are available without a separate manual installation.
