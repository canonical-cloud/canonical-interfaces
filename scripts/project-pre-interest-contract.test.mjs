import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  buildProjection,
  renderProjection,
  SOURCE_PATH,
  OUTPUT_PATH,
} from "./project-pre-interest-contract.mjs";

const sourceText = fs.readFileSync(SOURCE_PATH, "utf8");
const source = JSON.parse(sourceText);
const projection = buildProjection(source);
const committed = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"));

test("projection is deterministic and does not mutate the authoritative source", () => {
  assert.equal(renderProjection(source), fs.readFileSync(OUTPUT_PATH, "utf8"));
  assert.equal(fs.readFileSync(SOURCE_PATH, "utf8"), sourceText);
  assert.deepEqual(buildProjection(source), projection);
  assert.deepEqual(committed, projection);
});

test("only generator-compatible object definitions are projected", () => {
  assert.deepEqual(Object.keys(projection.$defs), [
    "PreInterestRegistrationRequest",
    "PreInterestRegistrationResponse",
    "PreInterestProblem",
  ]);
  assert.equal(projection.$defs.PartyType, undefined);
  assert.equal(projection.$defs.InterestArea, undefined);
  assert.ok(!JSON.stringify(projection).includes('"$ref"'));
});

test("projected enums preserve authoritative wire vocabulary", () => {
  const request = projection.$defs.PreInterestRegistrationRequest;
  assert.deepEqual(request.properties.partyType.enum, [
    "individual",
    "organization",
  ]);
  assert.deepEqual(request.properties.interestAreas.items.enum, [
    "readiness_assessment",
    "soc2",
    "iso_27001",
    "hipaa",
    "pci_dss_4",
    "fedramp",
    "nist",
    "gdpr",
    "cmmc",
  ]);
  assert.deepEqual(
    projection.$defs.PreInterestRegistrationResponse.properties.status.enum,
    ["accepted"],
  );
  assert.equal(request.additionalProperties, false);
  assert.equal(request.properties.email.maxLength, 320);
  assert.equal(request.properties.interestAreas.maxItems, 9);
  assert.equal(request.allOf.length, 4);
});

test("route map exposes one exact write-only public registration operation", () => {
  const routeMap = JSON.parse(
    fs.readFileSync(
      new URL("../route-maps/api.route-map.json", import.meta.url),
      "utf8",
    ),
  );
  const operation = routeMap.map.register_pre_interest;
  assert.equal(operation.path, "/api/v1/pre-interest/registrations");
  assert.deepEqual(operation.methods, ["POST"]);
  assert.equal(operation.request_schema.additionalProperties, false);
  assert.deepEqual(
    operation.request_schema.required,
    projection.$defs.PreInterestRegistrationRequest.required,
  );
  assert.ok(
    Object.entries(routeMap.map)
      .filter(([, value]) => value?.path?.includes("pre-interest"))
      .every(([name]) => name === "register_pre_interest"),
  );
});

test("package index and exports include the generated projection", () => {
  const index = JSON.parse(
    fs.readFileSync(new URL("../schema/index.json", import.meta.url), "utf8"),
  );
  const packageJson = JSON.parse(
    fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(index.schemas, [
    "api.schema.json",
    "compliance.schema.json",
    "quote.schema.json",
    "pre-interest.schema.json",
  ]);
  assert.equal(
    packageJson.exports["./pre-interest-schema"],
    "./schema/pre-interest.schema.json",
  );
  assert.equal(
    packageJson.exports["./pre-interest-contract"],
    "./contracts/pre-interest/v1/pre-interest.schema.json",
  );
});
