namespace Canonical.PreInterest.V1;

@doc("Whether the registration is for one person or an organization.")
enum PartyType {
  individual,
  organization,
}

@doc("Bounded, non-sensitive product interests. No free-form notes are accepted.")
enum InterestArea {
  readiness_assessment,
  soc2,
  iso_27001,
  hipaa,
  pci_dss_4,
  fedramp,
  nist,
  gdpr,
  cmmc,
}

@doc("A public, consented pre-interest registration. Host/party matching is revalidated by the origin.")
model PreInterestRegistrationRequest {
  @doc("Client-generated opaque UUID used for durable idempotency. It must not contain or derive from the email address.")
  @format("uuid")
  requestId: string;

  @doc("Contact email. The origin trims and case-normalizes it before deriving a dedicated HMAC alias.")
  @minLength(3)
  @maxLength(320)
  email: string;

  partyType: PartyType;

  @doc("Required only for organization registrations and forbidden for individual registrations.")
  @minLength(1)
  @maxLength(200)
  organizationName?: string;

  @minItems(1)
  @maxItems(9)
  interestAreas: InterestArea[];

  @doc("Immutable reviewed consent-copy revision.")
  @minLength(1)
  @maxLength(64)
  consentRevision: string;

  @doc("Client-observed consent time. The server separately records its acceptance time.")
  @format("date-time")
  consentedAt: string;

  @doc("Must be user.canonical.plus for an individual or org.canonical.plus for an organization.")
  @minLength(1)
  @maxLength(253)
  sourceHost: string;

  @doc("Optional bounded BCP 47-style locale hint.")
  @minLength(2)
  @maxLength(35)
  locale?: string;

  @doc("Optional opaque campaign/referral identifier; never a URL.")
  @minLength(1)
  @maxLength(64)
  referralCode?: string;

  @doc("Optional contact name. It is contact data, never an identity assertion.")
  @minLength(1)
  @maxLength(120)
  displayName?: string;

  @doc("Optional public HTTPS website supplied by the registrant.")
  @format("uri")
  @minLength(9)
  @maxLength(2048)
  websiteUrl?: string;

  @doc("Explicit affirmative consent to submit this registration. The value must be true.")
  registrationConsent: boolean;

  @doc("Separate optional marketing permission. It is never implied by registration consent.")
  marketingConsent: boolean;

  @doc("Required only when marketingConsent is true and forbidden when it is false.")
  @minLength(1)
  @maxLength(64)
  marketingConsentRevision?: string;
}

@doc("Enumeration-resistant response returned for new, duplicate, and already-known email aliases.")
model PreInterestRegistrationResponse {
  @format("uuid")
  receiptId: string;

  status: "accepted";

  @format("date-time")
  acceptedAt: string;

  @doc("Explicit next step only; registering never creates or submits a quote.")
  @maxLength(2048)
  nextStepUrl: string;
}

@doc("Safe bounded error response. It never echoes contact data.")
model PreInterestProblem {
  code: "invalid_request" | "rate_limited" | "verification_required" | "storage_unavailable" | "internal";

  @minLength(1)
  @maxLength(500)
  message: string;

  @minLength(1)
  @maxLength(128)
  requestId: string;
}
