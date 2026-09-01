import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const contract = path.join(root, "contracts", "pre-interest", "v1");
const schema = JSON.parse(
  fs.readFileSync(path.join(contract, "pre-interest.schema.json"), "utf8"),
);
const typeSpec = fs.readFileSync(path.join(contract, "main.tsp"), "utf8");
const proto = fs.readFileSync(path.join(contract, "pre_interest.proto"), "utf8");
const requestSchema = schema.$defs.PreInterestRegistrationRequest;

const expectedFields = [
  "requestId",
  "email",
  "partyType",
  "organizationName",
  "interestAreas",
  "consentRevision",
  "consentedAt",
  "sourceHost",
  "locale",
  "referralCode",
];

const protoFields = [
  ["request_id", 1],
  ["email", 2],
  ["party_type", 3],
  ["organization_name", 4],
  ["interest_areas", 5],
  ["consent_revision", 6],
  ["consented_at", 7],
  ["source_host", 8],
  ["locale", 9],
  ["referral_code", 10],
];

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validateRequest(value) {
  const errors = [];
  const properties = requestSchema.properties;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return ["request must be an object"];
  }

  for (const key of requestSchema.required) {
    if (!(key in value) || value[key] === null) errors.push(`missing ${key}`);
  }
  for (const key of Object.keys(value)) {
    if (!(key in properties)) errors.push(`unknown ${key}`);
  }

  if (!isUuid(value.requestId || "")) errors.push("invalid requestId");
  if (
    typeof value.email !== "string" ||
    value.email.length < 3 ||
    value.email.length > 320 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)
  ) {
    errors.push("invalid email");
  }

  if (!["individual", "organization"].includes(value.partyType)) {
    errors.push("invalid partyType");
  }
  if (
    !Array.isArray(value.interestAreas) ||
    value.interestAreas.length < 1 ||
    value.interestAreas.length > 9 ||
    new Set(value.interestAreas).size !== value.interestAreas.length ||
    value.interestAreas.some(
      (item) => !schema.$defs.InterestArea.enum.includes(item),
    )
  ) {
    errors.push("invalid interestAreas");
  }

  if (
    typeof value.consentRevision !== "string" ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value.consentRevision)
  ) {
    errors.push("invalid consentRevision");
  }
  if (
    typeof value.consentedAt !== "string" ||
    Number.isNaN(Date.parse(value.consentedAt))
  ) {
    errors.push("invalid consentedAt");
  }

  if (value.partyType === "individual") {
    if (value.sourceHost !== "user.canonical.plus") errors.push("host mismatch");
    if ("organizationName" in value) errors.push("organizationName forbidden");
  }
  if (value.partyType === "organization") {
    if (value.sourceHost !== "org.canonical.plus") errors.push("host mismatch");
    if (
      typeof value.organizationName !== "string" ||
      value.organizationName.trim().length < 1 ||
      value.organizationName.length > 200
    ) {
      errors.push("organizationName required");
    }
  }

  for (const [key, max] of [["locale", 35], ["referralCode", 64]]) {
    if (key in value && (typeof value[key] !== "string" || value[key].length < 1 || value[key].length > max)) {
      errors.push(`invalid ${key}`);
    }
  }
  if ("locale" in value && !/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(value.locale)) {
    errors.push("invalid locale");
  }
  if ("referralCode" in value && !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value.referralCode)) {
    errors.push("invalid referralCode");
  }

  return errors;
}

test("all three contract representations expose the same request fields", () => {
  assert.deepEqual(Object.keys(requestSchema.properties), expectedFields);
  for (const field of expectedFields) {
    assert.match(typeSpec, new RegExp(`\\b${field}\\??:`));
  }
  for (const [field, tag] of protoFields) {
    assert.match(
      proto,
      new RegExp(`\\b${field}\\s*=\\s*${tag}\\s*;`),
      `${field} must retain protobuf tag ${tag}`,
    );
  }
});

test("protobuf field numbers are unique, contiguous, and stable", () => {
  const tags = [
    ...proto.matchAll(
      /^\s*(?:optional\s+|repeated\s+)?[\w.<>]+\s+\w+\s*=\s*(\d+)\s*;/gm,
    ),
  ].map((match) => Number(match[1]));
  const requestTags = tags.slice(0, 10);
  assert.deepEqual(requestTags, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(new Set(requestTags).size, requestTags.length);
});

test("privacy-sensitive and free-form fields are absent", () => {
  const forbidden = [
    "password",
    "token",
    "secret",
    "identityDocument",
    "quoteAnswers",
    "notes",
    "message",
    "description",
  ];
  for (const field of forbidden) {
    assert.equal(field in requestSchema.properties, false, field);
  }
  assert.equal(requestSchema.additionalProperties, false);
});

test("host and party invariants are explicit in JSON Schema", () => {
  const serialized = JSON.stringify(requestSchema.allOf);
  assert.match(serialized, /user\.canonical\.plus/);
  assert.match(serialized, /org\.canonical\.plus/);
  assert.match(serialized, /organizationName/);
});

test("reviewed valid fixtures satisfy the shared semantic validator", () => {
  for (const filename of ["valid-individual.json", "valid-organization.json"]) {
    const value = JSON.parse(
      fs.readFileSync(path.join(contract, "fixtures", filename), "utf8"),
    );
    assert.deepEqual(validateRequest(value), [], filename);
  }
});

test("reviewed negative fixtures are rejected", () => {
  const cases = JSON.parse(
    fs.readFileSync(path.join(contract, "fixtures", "invalid.json"), "utf8"),
  );
  assert.ok(cases.length >= 7);
  for (const fixture of cases) {
    assert.ok(validateRequest(fixture.value).length > 0, fixture.name);
  }
});

test("the accepted response is enumeration resistant and cannot imply account or quote creation", () => {
  const response = schema.$defs.PreInterestRegistrationResponse;
  assert.equal(response.properties.status.const, "accepted");
  assert.equal(response.additionalProperties, false);
  const text = `${response.description} ${schema.description}`.toLowerCase();
  assert.match(text, /uniform|registration/);
  assert.match(text, /never creates an account, quote, role, grant, or entitlement/);
});

test("candidate artifacts are never represented as generated output", () => {
  const readme = fs.readFileSync(path.join(contract, "README.md"), "utf8");
  assert.match(readme, /outside `schema\/index\.json`/);
  assert.match(readme, /Nothing in this directory is represented as\s+generated output/);
  assert.match(readme, /Buf lint\/breaking/);
});
