import "@typespec/json-schema";
using TypeSpec.JsonSchema;

namespace Canonical.ReadinessWorkspace.V1;

@id("ReadinessOutcome")
enum ReadinessOutcome {
  ready: "ready",
  attentionRequired: "attention-required",
  evidenceIncomplete: "evidence-incomplete",
}

@id("ChecklistState")
enum ChecklistState {
  notStarted: "not-started",
  inProgress: "in-progress",
  needsReview: "needs-review",
  compliant: "compliant",
}

@id("RecommendationPriority")
enum RecommendationPriority {
  urgent: "urgent",
  high: "high",
  medium: "medium",
  low: "low",
}

@id("RecommendationState")
enum RecommendationState {
  open: "open",
  inProgress: "in-progress",
  resolved: "resolved",
  acceptedRisk: "accepted-risk",
}

@id("EvidenceFreshness")
enum EvidenceFreshness {
  current: "current",
  expiring: "expiring",
  expired: "expired",
}

@id("FormSubmissionState")
enum FormSubmissionState {
  submitted: "submitted",
  superseded: "superseded",
}

@id("RiskState")
enum RiskState {
  open: "open",
  mitigating: "mitigating",
  accepted: "accepted",
  closed: "closed",
}

@id("IncidentState")
enum IncidentState {
  open: "open",
  contained: "contained",
  resolved: "resolved",
  postmortemComplete: "postmortem-complete",
}

@id("TrainingState")
enum TrainingState {
  assigned: "assigned",
  inProgress: "in-progress",
  completed: "completed",
  expired: "expired",
}

@id("ReportCounts")
model ReportCounts {
  passed: int64;
  failed: int64;
  unknownCount: int64;
  highOrCriticalFailures: int64;
}

@id("ReportArtifact")
model ReportArtifact {
  specVersion: "canonical.readiness.report-artifact.v1";
  tenantUuid: string;
  reportUuid: string;
  assessmentReportId: string;
  scopeId: string;
  createdAt: string;
  category: string;
  frameworkIds: string[];
  outcome: ReadinessOutcome;
  scoreBasisPoints?: int64;
  counts: ReportCounts;
  bucket: string;
  objectKey: string;
  contentSha256: string;
  contentType: string;
  sizeBytes: int64;
}

@id("ReportIndexRecord")
model ReportIndexRecord {
  specVersion: "canonical.readiness.report-index.v1";
  tenantUuid: string;
  reportUuid: string;
  assessmentReportId: string;
  scopeId: string;
  createdAt: string;
  category: string;
  frameworkIds: string[];
  outcome: ReadinessOutcome;
  scoreBasisPoints?: int64;
  counts: ReportCounts;
  bucket: string;
  objectKey: string;
  contentSha256: string;
  resourceKinds: string[];
  checkIds: string[];
  problemCodes: string[];
  tags: string[];
}

@id("ControlCrosswalk")
model ControlCrosswalk {
  specVersion: "canonical.readiness.control-crosswalk.v1";
  mappingId: string;
  evidenceCapabilityId: string;
  frameworkId: string;
  controlId: string;
  testId: string;
  catalogVersion: string;
}

@id("FrameworkCoverage")
model FrameworkCoverage {
  specVersion: "canonical.readiness.framework-coverage.v1";
  tenantUuid: string;
  scopeId: string;
  frameworkId: string;
  catalogVersion: string;
  satisfied: int64;
  failed: int64;
  unknownCount: int64;
  notApplicableApproved: int64;
  total: int64;
  readinessBasisPoints: int64;
  calculatedAt: string;
}

@id("ChecklistItem")
model ChecklistItem {
  specVersion: "canonical.readiness.checklist-item.v1";
  checklistItemUuid: string;
  tenantUuid: string;
  scopeId: string;
  frameworkIds: string[];
  controlIds: string[];
  title: string;
  state: ChecklistState;
  ownerId?: string;
  evidenceIds: string[];
  recommendationIds: string[];
  updatedAt: string;
  version: int64;
}

@id("Recommendation")
model Recommendation {
  specVersion: "canonical.readiness.recommendation.v1";
  recommendationUuid: string;
  tenantUuid: string;
  scopeId: string;
  sourceFindingIds: string[];
  priority: RecommendationPriority;
  state: RecommendationState;
  title: string;
  summary: string;
  runbookRef?: string;
  ticketRef?: string;
  dueAt?: string;
  updatedAt: string;
}

@id("FormDefinition")
model FormDefinition {
  specVersion: "canonical.readiness.form-definition.v1";
  formUuid: string;
  tenantUuid: string;
  version: int64;
  title: string;
  schemaObjectKey: string;
  schemaSha256: string;
  active: boolean;
  createdAt: string;
}

@id("FormSubmission")
model FormSubmission {
  specVersion: "canonical.readiness.form-submission.v1";
  submissionUuid: string;
  formUuid: string;
  formVersion: int64;
  tenantUuid: string;
  scopeId: string;
  submittedBy: string;
  submittedAt: string;
  sourceIpToken: string;
  payloadObjectKey: string;
  payloadSha256: string;
  state: FormSubmissionState;
}

@id("EvidenceExpiry")
model EvidenceExpiry {
  specVersion: "canonical.readiness.evidence-expiry.v1";
  tenantUuid: string;
  evidenceId: string;
  validUntil: string;
  freshness: EvidenceFreshness;
  renewalTicketRef?: string;
  updatedAt: string;
}

@id("RiskRegisterEntry")
model RiskRegisterEntry {
  specVersion: "canonical.readiness.risk-entry.v1";
  riskUuid: string;
  tenantUuid: string;
  scopeId: string;
  title: string;
  ownerId: string;
  state: RiskState;
  rationaleSha256: string;
  acceptedBy?: string;
  acceptedAt?: string;
  acceptedUntil?: string;
  updatedAt: string;
}

@id("IncidentRecord")
model IncidentRecord {
  specVersion: "canonical.readiness.incident-record.v1";
  incidentUuid: string;
  tenantUuid: string;
  scopeId: string;
  detectedAt: string;
  state: IncidentState;
  severity: string;
  summary: string;
  postmortemObjectKey?: string;
  postmortemSha256?: string;
  resolvedAt?: string;
  updatedAt: string;
}

@id("TrainingAssignment")
model TrainingAssignment {
  specVersion: "canonical.readiness.training-assignment.v1";
  assignmentUuid: string;
  tenantUuid: string;
  subjectId: string;
  courseId: string;
  dueAt: string;
  state: TrainingState;
  completedAt?: string;
  evidenceId?: string;
  updatedAt: string;
}
