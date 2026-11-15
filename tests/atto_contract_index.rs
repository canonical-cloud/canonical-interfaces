//! Rust-only structural regression gate for generated AttoLang source.
//! This checks exported metadata; it does not run an Atto compiler or validate JSON.

use std::collections::BTreeMap;

const ATTO_INDEX: &str = include_str!("../generated/atto/contract_index.atto");
const PACKAGE_JSON: &str = include_str!("../package.json");

fn parse_count(line: &str) -> Result<usize, String> {
    let (_, right) = line
        .split_once("return ")
        .ok_or_else(|| "missing integer return".to_string())?;
    let (value, _) = right
        .split_once(';')
        .ok_or_else(|| "missing return semicolon".to_string())?;
    value.parse::<usize>().map_err(|error| error.to_string())
}

fn validate_index(source: &str) -> Result<(usize, usize), String> {
    let mut functions = BTreeMap::new();
    for line in source.lines().map(str::trim) {
        let Some(signature) = line.strip_prefix("pub fnc ") else {
            continue;
        };
        let (name, rest) = signature
            .split_once('(')
            .ok_or_else(|| format!("missing function paren: {line}"))?;
        if !rest.starts_with("): ") {
            return Err(format!("unsupported signature: {line}"));
        }
        if functions.insert(name, line).is_some() {
            return Err(format!("duplicate function: {name}"));
        }
    }

    let declared = functions
        .get("canonical_interface_type_count")
        .ok_or_else(|| "missing type count".to_string())?;
    let declared_count = parse_count(declared)?;
    let type_names: Vec<&str> = functions
        .keys()
        .copied()
        .filter(|name| name.ends_with("_type_name"))
        .collect();
    if type_names.len() != declared_count {
        return Err(format!(
            "type count mismatch: {declared_count} vs {}",
            type_names.len()
        ));
    }

    let mut field_total = 0;
    for name in &type_names {
        let prefix = name
            .strip_suffix("_type_name")
            .ok_or_else(|| format!("invalid type function: {name}"))?;
        let field_count_key = format!("{prefix}_field_count");
        let count_line = functions
            .get(field_count_key.as_str())
            .ok_or_else(|| format!("missing {field_count_key}"))?;
        let count = parse_count(count_line)?;
        field_total += count;
        for index in 0..count {
            for suffix in ["name", "wire_kind", "required"] {
                let field_key = format!("{prefix}_field_{index}_{suffix}");
                if !functions.contains_key(field_key.as_str()) {
                    return Err(format!("missing {field_key}"));
                }
            }
        }
    }

    let expected_functions = 1 + 2 * type_names.len() + 3 * field_total;
    if functions.len() != expected_functions {
        return Err(format!(
            "unexpected Atto export count: {} vs {expected_functions}",
            functions.len()
        ));
    }

    let executable = source
        .lines()
        .map(str::trim)
        .filter(|line| !line.starts_with("//"))
        .collect::<Vec<_>>()
        .join("\n");
    for forbidden in [
        "fetch(", "socket(", "token(", "http://", "https://", "probe(", "exec(",
    ] {
        if executable.contains(forbidden) {
            return Err(format!("unexpected transport behavior: {forbidden}"));
        }
    }
    Ok((declared_count, field_total))
}

#[test]
fn generated_atto_metadata_is_structurally_complete() {
    let (types, fields) =
        validate_index(ATTO_INDEX).expect("Atto metadata source must be complete");
    assert_eq!(types, 25);
    assert_eq!(fields, 135);
}

#[test]
fn generated_atto_metadata_rejects_mutation_and_untracked_exports() {
    let mutations = [
        ATTO_INDEX.replacen("return 25;", "return 24;", 1),
        ATTO_INDEX.replacen("field_0_name(): string", "field_0_nam(): string", 1),
        format!("{ATTO_INDEX}\npub fnc forged_extra(): int {{ return 1; }}\n"),
        format!("{ATTO_INDEX}\nfetch(\"https://example.invalid\");\n"),
    ];
    for (index, source) in mutations.iter().enumerate() {
        assert!(
            validate_index(source).is_err(),
            "mutation {index} was accepted"
        );
    }
}

#[test]
fn atto_package_export_is_explicitly_experimental() {
    assert!(PACKAGE_JSON.contains("\"./atto\""));
    assert!(PACKAGE_JSON.contains("\"./generated/atto/contract_index.atto\""));
    assert!(ATTO_INDEX.contains("not a JSON validator, runtime SDK, or compiler conformance claim"));
}
