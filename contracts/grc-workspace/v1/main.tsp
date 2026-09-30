import "@typespec/json-schema";
using TypeSpec.JsonSchema;

namespace Canonical.GrcWorkspace.V1;

@id("ProgramStatus")
enum ProgramStatus {
  planned: "planned",
  active: "active",
  paused: "paused",
  complete: "complete",
  cancelled: "cancelled",
}

@id("ControlImplementationStatus")
enum ControlImplementationStatus {
  planned: "planned",
  implemented: "implemented",
  partiallyImplemented: "partially_implemented",
  notApplicable: "not_applicable",
}

@id("ControlTestState")
enum ControlTestState {
  queued: "queued",
  running: "running",
  passed: "passed",
  failed: "failed",
  error: "error",
  cancelled: "cancelled",
}

@id("RiskStatus")
enum RiskStatus {
  open: "open",
  monitoring: "monitoring",
  treating: "treating",
  accepted: "accepted",
  closed: "closed",
}

@id("Criticality")
enum Criticality {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
}

@id("PolicyStatus")
enum PolicyStatus {
  draft: "draft",
  inReview: "in_review",
  published: "published",
  retired: "retired",
}

@id("VendorStatus")
enum VendorStatus {
  proposed: "proposed",
  active: "active",
  monitoring: "monitoring",
  offboarding: "offboarding",
  offboarded: "offboarded",
  rejected: "rejected",
}

@id("QuestionnaireStatus")
enum QuestionnaireStatus {
  draft: "draft",
  open: "open",
  inProgress: "in_progress",
  review: "review",
  completed: "completed",
  expired: "expired",
  cancelled: "cancelled",
}

@id("AuditEvidenceRequestStatus")
enum AuditEvidenceRequestStatus {
  open: "open",
  inProgress: "in_progress",
  ready: "ready",
  submitted: "submitted",
  accepted: "accepted",
  rejected: "rejected",
  closed: "closed",
}

@id("TrustCenterStatus")
enum TrustCenterStatus {
  private: "private",
  published: "published",
  paused: "paused",
}

@id("AiSystemStatus")
enum AiSystemStatus {
  evaluation: "evaluation",
  approved: "approved",
  restricted: "restricted",
  retired: "retired",
}

@id("TrainingStatus")
enum TrainingStatus {
  assigned: "assigned",
  inProgress: "in_progress",
  completed: "completed",
  overdue: "overdue",
  waived: "waived",
}

@id("ControlCounts")
model ControlCounts {
  @minValue(0)
  implemented: int64;
  @minValue(0)
  partiallyImplemented: int64;
  @minValue(0)
  planned: int64;
  @minValue(0)
  notApplicable: int64;
  @minValue(0)
  failingTests: int64;
}

@id("GrcDashboardSummary")
model GrcDashboardSummary {
  specVersion: "canonical.grc.dashboard-summary.v1";
  @format("uuid")
  tenantUuid: string;
  @minValue(0)
  activeProgramCount: int64;
  controls: ControlCounts;
  @minValue(0)
  openRiskCount: int64;
  @minValue(0)
  criticalVendorCount: int64;
  @minValue(0)
  pendingQuestionnaireCount: int64;
  @minValue(0)
  openAuditRequestCount: int64;
  @minValue(0)
  expiringEvidenceCount: int64;
  @minValue(0)
  trainingOverdueCount: int64;
  calculatedAt: utcDateTime;
}

@id("ComplianceProgramSummary")
model ComplianceProgramSummary {
  specVersion: "canonical.grc.compliance-program-summary.v1";
  @format("uuid")
  programUuid: string;
  name: string;
  status: ProgramStatus;
  frameworkReleaseIds: string[];
  customFrameworkIds: string[];
  scopeIds: string[];
  ownerId?: string;
  targetDate?: plainDate;
  updatedAt: utcDateTime;
}

@id("ControlSummary")
model ControlSummary {
  specVersion: "canonical.grc.control-summary.v1";
  @format("uuid")
  controlImplementationUuid: string;
  controlKey: string;
  title: string;
  category: string;
  status: ControlImplementationStatus;
  frameworkControlIds: string[];
  @format("uuid")
  scopeId?: string;
  ownerId?: string;
  latestTestState?: ControlTestState;
  lastReviewedAt?: utcDateTime;
  nextReviewDueAt?: utcDateTime;
  updatedAt: utcDateTime;
}

@id("ControlTestRunSummary")
model ControlTestRunSummary {
  specVersion: "canonical.grc.control-test-run-summary.v1";
  @format("uuid")
  runUuid: string;
  @format("uuid")
  controlImplementationUuid: string;
  testKey: string;
  state: ControlTestState;
  startedAt?: utcDateTime;
  completedAt?: utcDateTime;
  @minValue(0)
  observationCount: int64;
  @minValue(0)
  failureCount: int64;
}

@id("EvidenceSummary")
model EvidenceSummary {
  specVersion: "canonical.grc.evidence-summary.v1";
  @format("uuid")
  evidenceUuid: string;
  kind: string;
  sourceKind?: string;
  sourceLocator?: string;
  @pattern("^[0-9a-f]{64}$")
  contentSha256: string;
  collectedAt: utcDateTime;
  reviewState: string;
  controlIds: string[];
  @minValue(0)
  provenanceEventCount: int64;
}

@id("AssetSummary")
model AssetSummary {
  specVersion: "canonical.grc.asset-summary.v1";
  @format("uuid")
  assetUuid: string;
  assetKind: string;
  name: string;
  criticality: Criticality;
  dataClassification: string;
  lifecycleState: string;
  ownerId?: string;
  updatedAt: utcDateTime;
}

@id("RiskSummary")
model RiskSummary {
  specVersion: "canonical.grc.risk-summary.v1";
  @format("uuid")
  riskUuid: string;
  @format("uuid")
  scopeId?: string;
  title: string;
  category: string;
  @minValue(1)
  @maxValue(5)
  likelihood: int32;
  @minValue(1)
  @maxValue(5)
  impact: int32;
  @minValue(1)
  @maxValue(25)
  inherentScore: int32;
  @minValue(1)
  @maxValue(25)
  residualScore?: int32;
  status: RiskStatus;
  ownerId?: string;
  treatmentCount: int64;
  linkedControlIds: string[];
  reviewDueAt?: utcDateTime;
  updatedAt: utcDateTime;
}

@id("PolicySummary")
model PolicySummary {
  specVersion: "canonical.grc.policy-summary.v1";
  @format("uuid")
  policyUuid: string;
  policyKey: string;
  title: string;
  status: PolicyStatus;
  currentVersion?: int64;
  @pattern("^[0-9a-f]{64}$")
  currentContentSha256?: string;
  ownerId?: string;
  nextReviewDate?: plainDate;
  @minValue(0)
  acknowledgementCount: int64;
  updatedAt: utcDateTime;
}

@id("VendorSummary")
model VendorSummary {
  specVersion: "canonical.grc.vendor-summary.v1";
  @format("uuid")
  vendorUuid: string;
  name: string;
  domain?: string;
  category?: string;
  criticality: Criticality;
  status: VendorStatus;
  @minValue(0)
  @maxValue(10000)
  latestRiskScoreBasisPoints?: int32;
  nextReviewAt?: utcDateTime;
  updatedAt: utcDateTime;
}

@id("QuestionnaireSummary")
model QuestionnaireSummary {
  specVersion: "canonical.grc.questionnaire-summary.v1";
  @format("uuid")
  questionnaireUuid: string;
  direction: string;
  counterpartyType: string;
  counterpartyRef?: string;
  status: QuestionnaireStatus;
  @minValue(0)
  questionCount: int64;
  @minValue(0)
  answeredCount: int64;
  dueAt?: utcDateTime;
  completedAt?: utcDateTime;
  updatedAt: utcDateTime;
}

@id("AuditEvidenceRequestSummary")
model AuditEvidenceRequestSummary {
  specVersion: "canonical.grc.audit-evidence-request-summary.v1";
  @format("uuid")
  requestUuid: string;
  @format("uuid")
  engagementUuid: string;
  requestKey?: string;
  title: string;
  status: AuditEvidenceRequestStatus;
  ownerId?: string;
  controlIds: string[];
  evidenceIds: string[];
  dueAt?: utcDateTime;
  submittedAt?: utcDateTime;
  updatedAt: utcDateTime;
}

@id("TrustCenterSummary")
model TrustCenterSummary {
  specVersion: "canonical.grc.trust-center-summary.v1";
  @format("uuid")
  trustCenterUuid: string;
  slug: string;
  title: string;
  status: TrustCenterStatus;
  @minValue(0)
  publicResourceCount: int64;
  @minValue(0)
  gatedResourceCount: int64;
  @minValue(0)
  pendingAccessRequestCount: int64;
  updatedAt: utcDateTime;
}

@id("AiSystemSummary")
model AiSystemSummary {
  specVersion: "canonical.grc.ai-system-summary.v1";
  @format("uuid")
  aiSystemUuid: string;
  @format("uuid")
  assetUuid: string;
  provider?: string;
  modelName?: string;
  modelVersion?: string;
  deploymentMode: string;
  purpose: string;
  riskTier: Criticality;
  humanOversight: boolean;
  status: AiSystemStatus;
  @minValue(0)
  useCaseCount: int64;
  updatedAt: utcDateTime;
}

@id("TrainingAssignmentSummary")
model TrainingAssignmentSummary {
  specVersion: "canonical.grc.training-assignment-summary.v1";
  @format("uuid")
  assignmentUuid: string;
  @format("uuid")
  courseUuid: string;
  @format("uuid")
  userUuid: string;
  courseTitle: string;
  status: TrainingStatus;
  dueAt?: utcDateTime;
  completedAt?: utcDateTime;
}

@id("CreateRiskRequest")
model CreateRiskRequest {
  specVersion: "canonical.grc.create-risk.v1";
  @format("uuid")
  requestId: string;
  @format("uuid")
  scopeId?: string;
  @minLength(1)
  @maxLength(200)
  title: string;
  @minLength(1)
  @maxLength(100)
  category: string;
  @minValue(1)
  @maxValue(5)
  likelihood: int32;
  @minValue(1)
  @maxValue(5)
  impact: int32;
  ownerId?: string;
}

@id("CreateVendorRequest")
model CreateVendorRequest {
  specVersion: "canonical.grc.create-vendor.v1";
  @format("uuid")
  requestId: string;
  @minLength(1)
  @maxLength(200)
  name: string;
  @maxLength(253)
  domain?: string;
  category?: string;
  criticality: Criticality;
  ownerId?: string;
}

@id("CreateQuestionnaireRequest")
model CreateQuestionnaireRequest {
  specVersion: "canonical.grc.create-questionnaire.v1";
  @format("uuid")
  requestId: string;
  @format("uuid")
  templateUuid: string;
  direction: string;
  counterpartyType: string;
  counterpartyRef?: string;
  ownerId?: string;
  dueAt?: utcDateTime;
}

@id("PolicyVersionCreateRequest")
model PolicyVersionCreateRequest {
  specVersion: "canonical.grc.create-policy-version.v1";
  @format("uuid")
  requestId: string;
  @format("uuid")
  policyUuid: string;
  @pattern("^[0-9a-f]{64}$")
  contentSha256: string;
  contentMarkdown?: string;
  @format("uuid")
  documentVersionUuid?: string;
  changeSummary?: string;
}

@id("TrustCenterAccessDecisionRequest")
model TrustCenterAccessDecisionRequest {
  specVersion: "canonical.grc.trust-access-decision.v1";
  @format("uuid")
  requestId: string;
  @format("uuid")
  accessRequestUuid: string;
  approved: boolean;
  resourceUuids: string[];
  expiresAt?: utcDateTime;
}
