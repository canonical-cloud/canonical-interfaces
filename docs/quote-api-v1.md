# Canonical quote API v1

`schema/quote.schema.json` is the sole wire-contract authority for Canonical's verified-contact compliance quote workflow. Services and clients consume generated bindings or prove compatibility with the golden fixtures in `fixtures/quote-v1`.

## Browser surfaces

| Host | Route | Purpose and authentication |
| --- | --- | --- |
| `app.canonical.plus` | `/quote` | Public entry. Email OTP creates or resumes a customer Shared Auth session, then phone OTP completes contact verification before submission. |
| `app.canonical.plus` | `/u/quote` and `/u/quote/{quoteId}` | Signed-in entry and owner-scoped quote detail. Existing verified contacts may be prefilled, but neither is selected by default. |
| `app.canonical.plus` | `/q/{capability}` | 25-day SMS permalink entry. The server consumes the capability, establishes a short-lived quote session, and redirects immediately to a clean URL. |
| `app.canonical.plus` | `/api/v1/quotes*` | Browser BFF using a host-only Shared Auth cookie and CSRF protection for mutations. |
| `api.canonical.plus` | `/api/v1/quotes*` | Private web-to-API origin. The web server authenticates the customer and supplies its service credential plus the verified Shared Auth subject. Browser cookies are not accepted here. |

Cloudflare provides routing and defense in depth, not authorization. The web origin verifies the customer credential, realm, audience, expiration, and revocation; the API verifies a separate web/API service credential on every quote request. Customer quote identity never crosses into the Shared Auth admin realm.

## Verification and explicit contact selection

Shared Auth owns identity verification facts. Canonical owns the user's product-specific decision to use those contacts for a quote.

1. `/quote` collects and verifies email with the customer passwordless OTP flow. Successful verification creates the customer session; no separate registration screen is required.
2. The authenticated phone challenge uses Twilio Verify through Shared Auth. A phone is not considered verified until the code succeeds.
3. The form displays the masked verified email and verified phone. The user must click both confirmation controls even when `/u/quote` prefilled them from an existing account.
4. `POST /api/v1/quote-contact-selections` accepts only `emailConfirmed: true` and `phoneConfirmed: true`. The server resolves the live verified values from Shared Auth and returns a short-lived, owner-bound `contactSelectionId`; it never trusts raw browser contact values as proof.
5. `POST /api/v1/quotes` consumes that selection once. Expired, already-used, wrong-owner, or partially confirmed selections fail closed.

Changing either displayed contact invalidates the selection and requires fresh verification and confirmation. Canonical retains the selected destinations only under its quote-retention rules; it does not write product consent back into Shared Auth.

## Internal web-to-API contract

The BFF authenticates the customer with Shared Auth, resolves current verified contacts from Shared Auth, and calls the private API origin with exactly:

- `x-canonical-internal-token`: a dedicated web/API service credential;
- `x-canonical-subject`: the verified Shared Auth subject.

Only when creating a contact selection, the same authenticated BFF call also supplies `x-canonical-verified-email` and `x-canonical-verified-phone`, populated exclusively from Shared Auth's protected contact endpoint. The edge strips caller-supplied versions of all four headers. The API never accepts `x-canonical-user-id`, `x-canonical-user-email`, `x-canonical-service-token`, or browser-supplied owner, tenant, or contact identity as authority. The API marks the credential and contact headers as sensitive so middleware cannot log their values.

## REST and WebSocket routes

| Method | Path | Request | Success response |
| --- | --- | --- | --- |
| `POST` | `/api/v1/quote-contact-selections` | `QuoteContactSelectionRequest`; authenticated Shared Auth authority and CSRF at the BFF | `201 QuoteContactSelection` |
| `POST` | `/api/v1/quotes` | `QuoteRequest`; `Idempotency-Key` required | `202 QuoteSubmissionResponse` |
| `GET` | `/api/v1/quotes/{quoteId}` | — | `200 QuoteDetail` |
| `GET` | `/api/v1/quotes?limit={1..100}&cursor=...` | `QuoteListQuery` | `200 QuoteListResponse` |
| `POST` | `/api/v1/quotes/{quoteId}/retry` | Empty body; `Idempotency-Key` required | `202 QuoteRetryResponse` |
| `POST` | `/api/v1/quotes/{quoteId}/submissions` | Edited `QuoteRequest`; `Idempotency-Key` required | `202 QuoteResubmissionResponse` |
| WebSocket | `/api/v1/quotes/{quoteId}/events` | Authenticated upgrade | Persisted `QuoteStatusEvent` messages |

The app and API hosts use the same JSON payloads. Query-string bearer tokens are prohibited. Browser clients use the app BFF and its protected cookie route for REST and WebSocket traffic; the private API origin accepts only the internal service contract above.

## Durable asynchronous processing

Submitting a quote commits the quote revision, a queued event, and a durable job in one PostgreSQL transaction before returning `202`. The user may close the browser after acceptance. Workers lease jobs with bounded leases and `FOR UPDATE SKIP LOCKED`; expired leases are recoverable after a worker or API restart. Each external operation has an idempotency key, bounded retry policy, and persisted safe failure state.

PostgreSQL and its append-only event stream are authoritative. WebSocket delivery is disposable; a reconnect resumes from the last persisted sequence, and clients recover through `GET /api/v1/quotes/{quoteId}`.

Public status for each immutable revision is:

```text
queued -> analyzing -> ready
                    -> failed
failed --retry--> queued
```

Progress `stage` may additionally report `loading_context` and `validating`. A retry processes the same immutable revision again. Editing and resubmitting appends revision `n + 1` under the stable `quoteId`; it never mutates the inputs or estimate for an older revision.

## Permalink and notification rules

The initial accepted submission creates one revocable quote-scoped capability expiring exactly 25 days after issuance and queues an SMS notification in the product notification outbox. Twilio Verify is used only for verification codes; Twilio Messaging sends the permalink.

Capability tokens contain 256 bits of entropy. The database stores a SHA-256 lookup digest and an authenticated-encrypted copy used only by the durable notification worker; plaintext tokens are never stored. They are scoped to one quote, expire server-side, can be revoked or rotated, and never appear in logs, analytics properties, referrers, WebSocket URLs, or public API responses. `/q/{capability}` redeems the token for a short-lived, quote-scoped, HttpOnly, Secure, SameSite cookie and responds with a `303` redirect plus `Referrer-Policy: no-referrer`, so subsequent navigation uses a clean URL. The quote session permits viewing, editing, and resubmitting only that quote; it is not a general Canonical login.

The notification outbox uses a unique deduplication key per quote, revision, destination, and template. A durable worker records delivery state without logging the phone number or capability. Rotating a link revokes the prior capability before a replacement message is queued.

## Identifier, idempotency, and privacy rules

- JSON uses lowerCamelCase field names.
- Quote identifiers are UUIDs and appear as `quoteId` in every quote payload.
- `revision` starts at `1` and increases only for edited resubmissions.
- Framework wire names are exactly those enumerated by `QuoteRequest.frameworks`.
- `contextKey` defaults to `quote-analysis`; the server chooses only from its allow-list.
- `Idempotency-Key` is 8–128 ASCII characters from `[A-Za-z0-9._:-]` and is scoped to owner, operation, and request digest.
- Rate limits apply independently to OTP send, OTP verify, contact selection, quote submission, link redemption, and resubmission.

Owner identity comes only from accepted credentials. Public responses and status messages omit email, phone, capability tokens, internal service credentials, database identifiers, prompts, raw model responses, model-attempt metadata, tenant internals, and persistence diagnostics. Application logs use request, quote, revision, job, and provider-message identifiers rather than contact values. Gemini output is preliminary scoping assistance for human review, not an audit opinion, certification, attestation, or legal conclusion.
