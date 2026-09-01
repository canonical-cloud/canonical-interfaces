import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const schema = JSON.parse(fs.readFileSync("schema/pre-interest.schema.json", "utf8"));
const request = schema.$defs.PreInterestRegistrationRequest;
const receipt = schema.$defs.PreInterestRegistrationReceipt;
const routeMap = JSON.parse(fs.readFileSync("route-maps/api.route-map.json", "utf8"));

function fixture(name) {
  return JSON.parse(fs.readFileSync(`fixtures/pre-interest/${name}`, "utf8"));
}

test("pre-interest request is closed, versioned, consented, and bounded", () => {
  assert.equal(request.type, "object");
  assert.equal(request.additionalProperties, false);
  assert.deepEqual(request.properties.requestVersion, {
    type: "integer",
    const: 1,
    minimum: 1,
    maximum: 1,
    description: "Public registration contract version; only version 1 is accepted.",
  });
  for (const required of ["requestVersion", "registrationKind", "contactEmail", "interestAreas", "privacyVersion", "contactConsent"]) {
    assert.ok(request.required.includes(required));
  }
  assert.equal(request.properties.contactConsent.const, true);
  assert.equal(request.properties.contactEmail.maxLength, 320);
  assert.equal(request.properties.interestAreas.maxItems, 6);
  assert.equal(request.properties.interestAreas.uniqueItems, true);
  assert.equal(request.properties.notes.maxLength, 1000);
  assert.equal(request.properties.sourcePath.maxLength, 256);
});

test("caller cannot assert host, identity, address, score, or registration state", () => {
  const forbidden = [
    "sourceHost", "host", "ownerSubject", "userId", "organizationId", "ipAddress",
    "forwardedFor", "riskScore", "status", "registrationId", "createdAt",
  ];
  for (const field of forbidden) assert.equal(request.properties[field], undefined, field);
});

test("organization registration requires an organization name", () => {
  assert.deepEqual(request.allOf, [{
    if: { properties: { registrationKind: { const: "organization" } }, required: ["registrationKind"] },
    then: { required: ["organizationName"] },
  }]);
});

test("interest vocabulary and safe fixtures remain exact", () => {
  assert.deepEqual(request.properties.interestAreas.items.enum, [
    "compliance_quote", "readiness_assessment", "managed_remediation",
    "vendor_risk", "security_program", "platform_partnership",
  ]);
  const user = fixture("user-request.json");
  const organization = fixture("organization-request.json");
  assert.equal(user.registrationKind, "user");
  assert.equal(user.organizationName, undefined);
  assert.equal(organization.registrationKind, "organization");
  assert.equal(organization.organizationName, "Example Corporation");
  assert.ok(organization.notes.length <= request.properties.notes.maxLength);
  assert.ok(!JSON.stringify([user, organization]).match(/password|secret|token|credential/i));
});

test("receipt is uniform and cannot disclose new-versus-existing state", () => {
  assert.equal(receipt.additionalProperties, false);
  assert.equal(receipt.properties.status.pattern, "^accepted$");
  assert.equal(receipt.properties.message.maxLength, 240);
  const accepted = fixture("accepted-receipt.json");
  assert.equal(accepted.status, "accepted");
  for (const field of ["alreadyRegistered", "isNew", "accountExists", "emailExists"]) {
    assert.equal(receipt.properties[field], undefined);
    assert.equal(accepted[field], undefined);
  }
});

test("route map exposes exactly one write-only public pre-interest operation", () => {
  const registration = routeMap.map.register_pre_interest;
  assert.equal(registration.path, "/api/v1/pre-interest/registrations");
  assert.deepEqual(registration.methods, ["POST"]);
  assert.match(registration.summary, /No public list, read, update, or delete route exists/);
  const related = Object.entries(routeMap.map).filter(([, value]) =>
    typeof value === "object" && value.path?.includes("/pre-interest"));
  assert.deepEqual(related.map(([key]) => key), ["register_pre_interest"]);
  assert.equal(registration.request_schema.additionalProperties, false);
});

test("schema index includes pre-interest after existing public contracts", () => {
  const index = JSON.parse(fs.readFileSync("schema/index.json", "utf8"));
  assert.deepEqual(index.schemas, [
    "api.schema.json", "compliance.schema.json", "quote.schema.json", "pre-interest.schema.json",
  ]);
});
