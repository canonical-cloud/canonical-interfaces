# Canonical pre-interest contract v1

Tracking: **DEN-4058**.

This directory is the reviewable, compiler-ready contract bundle for public
pre-interest registration. It intentionally lives outside `schema/index.json`
until the TypeSpec, Protobuf, and generated-adapter toolchains are pinned and
run on the same reviewed head. Nothing in this directory is represented as
generated output.

## Authority and projections

- `main.tsp` is the candidate API-model source.
- `pre_interest.proto` is the stable RPC/wire projection.
- `pre-interest.schema.json` is the independently authored Draft 2020-12
  validation and closed-object veto.
- Fixtures exercise semantic invariants shared by all three representations.

Promotion requires compiling TypeSpec, compiling a Protobuf descriptor set,
running Buf lint/breaking checks, and generating Rust, Dart, and TypeScript
adapters without hand-editing `generated/`.

## HTTP/RPC boundary

The reviewed HTTP route is `POST /v1/pre-interest-registrations` on
`api.canonical.plus`. `user.canonical.plus` may submit only `partyType =
individual`; `org.canonical.plus` may submit only `partyType = organization`.
The origin re-derives the source host from the verified request host and never
trusts a caller-supplied forwarding or classification header.

`requestId` is the body-level idempotency identity for HTTP and RPC clients.
It is an opaque UUID and must never contain or be derived from an email address.
The server binds it to a canonical request digest atomically. Reuse with a
different canonical request is rejected.

## Privacy and enumeration resistance

The service stores a dedicated HMAC alias for normalized email lookup and keeps
raw contact data encrypted under a separate field-level key. Raw email,
display name, organization name, website URL, referral code, and free-form
payloads never enter URLs, Cloudflare headers, logs, metrics, traces,
idempotency keys, or error bodies.

New registrations, duplicate requests, and already-known email aliases receive
the same response shape and status. Registration records immutable consent
evidence, but does not create an account, session, quote, role, grant, or
entitlement. A quote link is an explicit next step only.

## Stable Protobuf tags

`PreInterestRegistrationRequest` uses tags 1 through 12 exactly as reviewed in
`pre_interest.proto`. Existing tags 1 through 10 retain their original meaning;
the optional contact-name and website fields append tags 11 and 12. Removed
fields must be reserved rather than renumbered. Optional string presence is
significant for organization name, locale, referral code, display name, and
website URL.
