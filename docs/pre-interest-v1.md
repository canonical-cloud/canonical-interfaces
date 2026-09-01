# Canonical pre-interest API v1

`POST /api/v1/pre-interest/registrations` is the only public pre-interest operation. It accepts a closed, versioned user-or-organization request and returns the same `accepted` receipt shape for a new registration or an idempotently repeated registration.

The API derives the accepted source host, request correlation, network metadata, and any authenticated identity server-side. Callers cannot submit those values. A public client cannot list, read, update, or delete registrations and cannot learn whether an email address was previously registered.

Browser entry points are owned by `user.canonical.plus` and `org.canonical.plus`. `api.canonical.plus` owns the write endpoint. `admin.canonical.plus` and `api-admin.canonical.plus` remain separately deployed, AAL2/role-gated staff surfaces; this contract does not expose staff reads through the public API. `app.canonical.plus` and `account.canonical.plus` remain compatibility aliases pending a separately reviewed cutover.

The request intentionally excludes passwords, credentials, regulated records, customer datasets, IP addresses, forwarded headers, risk scores, account state, and quote results. `notes` is capped at 1,000 characters and must not contain sensitive material.

This schema and its generated adapters are source readiness only. It does not apply a database migration, create Cloudflare DNS records, bind Worker routes, provision secrets, or activate production traffic.
