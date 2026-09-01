# Canonical pre-interest contract v1

Tracking: **DEN-4058**.

This directory is the authoritative multi-representation contract bundle for
public pre-interest registration. TypeSpec, Protobuf, and independently authored
Draft 2020-12 JSON Schema are reviewed together. The repository-wide generator
consumes the deterministic object-only projection at
`schema/pre-interest.schema.json`; that projection is produced by
`scripts/project-pre-interest-contract.mjs` and must never be hand-edited.

## Authority and projections

- `main.tsp` is the candidate API-model source and must compile with the pinned
  TypeSpec compiler.
- `pre_interest.proto` is the stable RPC/wire projection. Buf must format, lint,
  build a descriptor set, and pass breaking comparison against `baseline/`.
- `pre-interest.schema.json` is the independent validation and closed-object
  veto.
- `schema/pre-interest.schema.json` is a deterministic generator-compatible
  projection that inlines only the two enum references and contains the request,
  response, and problem object definitions.
- Generated Rust, Rust/WASM, TypeScript, Python, Go, and Dart adapters are
  produced by the existing repository generator from `schema/index.json`.
- The HTTP route projection is generated from
  `route-maps/api.route-map.json`.

The immutable `baseline/` snapshot establishes the initial Protobuf v1
compatibility boundary. Additive changes must pass `buf breaking`; removing or
renumbering a field requires a new contract version rather than editing the
baseline to make a breaking check pass.

## Local checks

```sh
npm test
node scripts/project-pre-interest-contract.mjs --check
buf format --diff --exit-code contracts/pre-interest/v1
buf lint contracts/pre-interest/v1
buf build contracts/pre-interest/v1
buf breaking contracts/pre-interest/v1 \
  --against contracts/pre-interest/v1/baseline
tsp compile contracts/pre-interest/v1/main.tsp --no-emit
```

The PR workflow pins the TypeSpec compiler and Buf release and independently
checks the committed descriptor digest. Zed continues to own repository package
identity and generated adapter targets.

## HTTP/RPC boundary

The reviewed HTTP route is exactly `POST /v1/pre-interest-registrations` on
`api.canonical.plus`. No unversioned route, `/api/v1/pre-interest/registrations`
alias, collection read, update, delete, or browser-facing redirect endpoint is
part of this contract.

Public HTML forms submit only to the same-origin BFF route
`POST /forms/pre-interest` on `user.canonical.plus` or `org.canonical.plus`.
The BFF derives `requestId`, `partyType`, `consentedAt`, and `sourceHost` from
trusted server context before calling the dedicated API. The API revalidates
that metadata at its authenticated BFF/edge boundary; it never trusts arbitrary
browser forwarding or classification headers.

`user.canonical.plus` may submit only `partyType = individual`;
`org.canonical.plus` may submit only `partyType = organization`.
`requestId` is an opaque server-generated idempotency UUID and must never
contain or be derived from an email address. The API binds it to a canonical
request digest atomically. Reuse with a different canonical request is rejected.

## Privacy and enumeration resistance

The service stores a dedicated HMAC alias for normalized email lookup and keeps
raw contact data encrypted under a separate field-level key. Raw email, display
name, organization name, website URL, referral code, and free-form payloads
never enter URLs, Cloudflare headers, logs, metrics, traces, idempotency keys,
or error bodies.

New registrations, duplicate requests, and already-known email aliases receive
the same response shape and status. `registrationConsent` must be affirmatively
true. `marketingConsent` is a separate explicit choice and requires its own
reviewed revision only when granted. Neither permission creates an account,
session, quote, role, grant, or entitlement. A quote link is an explicit next
step only and must be allow-listed by the BFF rather than followed as an open
redirect.

## Stable Protobuf tags

`PreInterestRegistrationRequest` uses tags 1 through 15 exactly as reviewed in
`pre_interest.proto`. Existing tags 1 through 10 retain their original meaning;
the optional contact-name and website fields append tags 11 and 12. Explicit
registration consent, explicit marketing consent, and the optional marketing
consent revision append tags 13 through 15. Removed fields must be reserved
rather than renumbered. Optional string presence is significant for organization
name, locale, referral code, display name, website URL, and marketing revision.

This contract and its generated adapters are source readiness only. They do not
apply a database migration, deploy an API, create Cloudflare DNS records, bind
Worker routes, provision secrets, or activate production traffic.
