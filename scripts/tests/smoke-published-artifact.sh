#!/bin/sh
set -eu

target="${ZED_PKG_TEST_TARGET:?ZED_PKG_TEST_TARGET is required}"
test -f "$target/schema/index.json"
test -f "$target/schema/quote.schema.json"
test -f "$target/schema/pre-interest.schema.json"
test -f "$target/contracts/pre-interest/v1/main.tsp"
test -f "$target/contracts/pre-interest/v1/pre_interest.proto"
grep -q PreInterestRegistrationRequest "$target/generated/rust/src/lib.rs"
test -f "$target/generated/dart/lib/quote_v1.dart"
test -f "$target/sql/schema.sql"
