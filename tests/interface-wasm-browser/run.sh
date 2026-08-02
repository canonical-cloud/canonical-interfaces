#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
contract_dir="$repo_root/tests/interface-wasm-browser"
chrome_bin=${CHROME_BIN:-}
artifact_dir=${CANONICAL_BROWSER_ARTIFACT_DIR:-}
wall_timeout=${CANONICAL_INTERFACE_BROWSER_TIMEOUT_SECONDS:-45}

if [[ ! "$wall_timeout" =~ ^[1-9][0-9]*$ ]] || (( wall_timeout > 120 )); then
  echo "CANONICAL_INTERFACE_BROWSER_TIMEOUT_SECONDS must be an integer from 1 to 120" >&2
  exit 1
fi

if [[ -z "$chrome_bin" ]]; then
  for candidate in google-chrome google-chrome-stable chromium chromium-browser; do
    if command -v "$candidate" >/dev/null 2>&1; then
      chrome_bin=$(command -v "$candidate")
      break
    fi
  done
fi

if [[ -z "$chrome_bin" || ! -x "$chrome_bin" ]]; then
  echo "A Chromium-family browser is required for the interface WASM contract" >&2
  exit 1
fi

if ! command -v timeout >/dev/null 2>&1; then
  echo "GNU timeout is required for wall-clock browser supervision" >&2
  exit 1
fi

for required in \
  "$contract_dir/index.html" \
  "$contract_dir/contract.mjs" \
  "$repo_root/generated/rust-wasm/pkg/canonical_interfaces_wasm.js" \
  "$repo_root/generated/rust-wasm/pkg/canonical_interfaces_wasm_bg.wasm" \
  "$repo_root/generated/rust-wasm/pkg/canonical_interfaces_wasm.d.ts"
do
  if [[ ! -f "$required" ]]; then
    echo "Missing browser contract input: $required" >&2
    exit 1
  fi
done

work_dir=$(mktemp -d)
server_log="$work_dir/server.log"
chrome_log="$work_dir/chrome.stderr"
dom="$work_dir/result.html"
port=${CANONICAL_INTERFACE_BROWSER_PORT:-4181}
server_pid=

preserve_failure_evidence() {
  if [[ -z "$artifact_dir" ]]; then
    return
  fi
  mkdir -p "$artifact_dir"
  for evidence in "$dom" "$server_log" "$chrome_log"; do
    if [[ -f "$evidence" ]]; then
      cp "$evidence" "$artifact_dir/$(basename "$evidence")"
    fi
  done
}

cleanup() {
  if [[ -n "$server_pid" ]]; then
    kill "$server_pid" >/dev/null 2>&1 || true
    wait "$server_pid" >/dev/null 2>&1 || true
  fi
  rm -rf "$work_dir"
}
trap cleanup EXIT

python3 -m http.server "$port" \
  --bind 127.0.0.1 \
  --directory "$repo_root" \
  >"$server_log" 2>&1 &
server_pid=$!

for _ in $(seq 1 100); do
  if curl --fail --silent --show-error \
    "http://127.0.0.1:${port}/tests/interface-wasm-browser/index.html" >/dev/null; then
    break
  fi
  if ! kill -0 "$server_pid" >/dev/null 2>&1; then
    preserve_failure_evidence
    cat "$server_log" >&2
    exit 1
  fi
  sleep 0.1
done

if ! curl --fail --silent --show-error \
  "http://127.0.0.1:${port}/tests/interface-wasm-browser/index.html" >/dev/null; then
  preserve_failure_evidence
  cat "$server_log" >&2
  echo "Interface browser contract server did not become ready" >&2
  exit 1
fi

chrome_args=(
  --headless=new
  --disable-background-networking
  --disable-component-update
  --disable-default-apps
  --disable-extensions
  --disable-sync
  --metrics-recording-only
  --no-first-run
  --no-default-browser-check
  --host-resolver-rules="MAP * ~NOTFOUND, EXCLUDE 127.0.0.1"
  --dump-dom
)
if [[ $(id -u) -eq 0 ]]; then
  chrome_args+=(--no-sandbox)
fi

set +e
timeout --signal=TERM --kill-after=5s "${wall_timeout}s" \
  "$chrome_bin" "${chrome_args[@]}" \
  "http://127.0.0.1:${port}/tests/interface-wasm-browser/index.html" \
  >"$dom" 2>"$chrome_log"
chrome_status=$?
set -e

if [[ "$chrome_status" -eq 124 || "$chrome_status" -eq 137 ]]; then
  preserve_failure_evidence
  echo "Canonical interface Chromium contract exceeded ${wall_timeout}s wall-clock limit" >&2
  sed -n '1,240p' "$dom" >&2
  echo "--- Chromium stderr ---" >&2
  sed -n '1,160p' "$chrome_log" >&2
  echo "--- local server log ---" >&2
  sed -n '1,160p' "$server_log" >&2
  exit 1
fi

if [[ "$chrome_status" -ne 0 ]] || ! grep -q 'data-status="pass"' "$dom"; then
  preserve_failure_evidence
  echo "Canonical interface Chromium contract failed (Chrome exit $chrome_status)" >&2
  sed -n '1,240p' "$dom" >&2
  echo "--- Chromium stderr ---" >&2
  sed -n '1,160p' "$chrome_log" >&2
  echo "--- local server log ---" >&2
  sed -n '1,160p' "$server_log" >&2
  exit 1
fi

grep 'data-status="pass"' "$dom"
