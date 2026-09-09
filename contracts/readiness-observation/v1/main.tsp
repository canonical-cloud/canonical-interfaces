import "@typespec/json-schema";
using TypeSpec.JsonSchema;

namespace Canonical.ReadinessObservation.V1;

@id("ReportedStatus")
enum ReportedStatus {
  observed: "observed",
  notObserved: "not-observed",
  exception: "exception",
  notApplicableRequested: "not-applicable-requested",
  unknown: "unknown",
}

@id("ObservationReceiptStatus")
enum ObservationReceiptStatus {
  accepted: "accepted",
  duplicate: "duplicate",
}

@id("TransportVerification")
enum TransportVerification {
  signatureValid: "signature-valid",
  bearerAuthenticated: "bearer-authenticated",
}

@id("SubstantiveReview")
enum SubstantiveReview {
  unreviewed: "unreviewed",
  inReview: "in-review",
  acceptedAsEvidence: "accepted-as-evidence",
  rejected: "rejected",
  superseded: "superseded",
}

@id("ObservationProblemCode")
enum ObservationProblemCode {
  invalidRequest: "invalid-request",
  invalidSignature: "invalid-signature",
  staleSignature: "stale-signature",
  invalidDigest: "invalid-digest",
  unknownSource: "unknown-source",
  eventConflict: "event-conflict",
  sequenceConflict: "sequence-conflict",
  rateLimited: "rate-limited",
  storageUnavailable: "storage-unavailable",
  internal: "internal",
}

@id("ObservationAssertion")
model ObservationAssertion {
  frameworkId: string;
  controlId: string;
  reportedStatus: ReportedStatus;
  statement?: string;
  evidenceIds: string[];
}

@id("EvidenceItem")
model EvidenceItem {
  evidenceId: string;
  kind: string;
  sha256: string;
  collectedAt: string;
  locator?: string;
  contentType?: string;
  sizeBytes?: int64;
}

@id("ObservationEvent")
model ObservationEvent {
  specVersion: "canonical.readiness.observation.v1";
  eventId: string;
  sourceId: string;
  sourceSequence: int64;
  organization: string;
  observedAt: string;
  assertions: ObservationAssertion[];
  evidence: EvidenceItem[];
}

@id("ObservationReceipt")
model ObservationReceipt {
  specVersion: "canonical.readiness.observation.receipt.v1";
  receiptId: string;
  eventId: string;
  sourceId: string;
  sourceSequence: int64;
  status: ObservationReceiptStatus;
  duplicate: boolean;
  payloadSha256: string;
  receivedAt: string;
  transportVerification: TransportVerification;
  substantiveReview: SubstantiveReview;
}

@id("ObservationProblem")
model ObservationProblem {
  specVersion: "canonical.readiness.observation.problem.v1";
  code: ObservationProblemCode;
  message: string;
  requestId: string;
}
