import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const runner = readFileSync(
  new URL("../tests/interface-wasm-browser/run.sh", import.meta.url),
  "utf8",
);
const contract = readFileSync(
  new URL("../tests/interface-wasm-browser/contract.mjs", import.meta.url),
  "utf8",
);
const workflow = readFileSync(
  new URL("../.github/workflows/ci.yml", import.meta.url),
  "utf8",
);

test("Chromium is supervised by bounded wall clock rather than virtual time", () => {
  for (const token of [
    "CANONICAL_INTERFACE_BROWSER_TIMEOUT_SECONDS",
    "command -v timeout",
    'timeout --signal=TERM --kill-after=5s "${wall_timeout}s"',
    "chrome_status == 124",
    "wall-clock limit",
  ]) {
    assert.ok(runner.includes(token), `browser runner must retain ${token}`);
  }

  assert.ok(!runner.includes("--virtual-time-budget"));
  assert.ok(!contract.includes("Promise.race"));
  assert.ok(!contract.includes("setTimeout"));
  assert.ok(!contract.includes("withTimeout"));
});

test("exact reviewed package must initialize twice in Chromium", () => {
  for (const token of [
    "for attempt in 1 2",
    'attempt_dir="${RUNNER_TEMP}/canonical-interface-browser/attempt-${attempt}"',
    "CANONICAL_BROWSER_ARTIFACT_DIR=\"$attempt_dir\"",
    "bash tests/interface-wasm-browser/run.sh",
  ]) {
    assert.ok(workflow.includes(token), `CI must retain ${token}`);
  }
});
