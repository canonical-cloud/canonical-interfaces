import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readme = fs.readFileSync(
  path.join(root, "contracts", "pre-interest", "v1", "README.md"),
  "utf8",
);

const API_ROUTE = "POST /v1/pre-interest-registrations";
const BFF_ROUTE = "POST /forms/pre-interest";

test("the public-intake contract has one exact versioned API route", () => {
  assert.equal(readme.split(API_ROUTE).length - 1, 1);
  assert.doesNotMatch(readme, /POST \/api\/v1\/pre-interest\/registrations/);
  assert.doesNotMatch(readme, /POST \/v1\/pre-interest(?:\s|`|$)/);
});

test("browser forms terminate at the same-origin BFF", () => {
  assert.equal(readme.split(BFF_ROUTE).length - 1, 1);
  assert.match(readme, /user\.canonical\.plus/);
  assert.match(readme, /org\.canonical\.plus/);
  assert.match(readme, /BFF derives `requestId`, `partyType`, `consentedAt`, and `sourceHost`/);
});

test("registration cannot imply account or quote creation", () => {
  assert.match(readme, /Neither permission creates an account/);
  assert.match(readme, /quote link is an explicit next\s+step only/);
});
