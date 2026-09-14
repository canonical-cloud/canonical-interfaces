import "@typespec/json-schema";
using TypeSpec.JsonSchema;

namespace Canonical.ReadinessAssessment.V1;

@id("AssessmentFindingStatus")
enum AssessmentFindingStatus {
  passed: "pass",
  failed: "fail",
  unknownValue: "unknown",
  error: "error",
}

@id("AssessmentSeverity")
enum AssessmentSeverity {
  info: "info",
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
}

@id("RecommendationPriority")
enum RecommendationPriority {
  urgent: "urgent",
  high: "high",
  medium: "medium",
  low: "low",
}

@id("AssessmentEvidenceRef")
model AssessmentEvidenceRef {
  evidenceId: string;
  sha256: string;
  observedAt: string;
  kind?: string;
}

@id("AssessmentTarget")
model AssessmentTarget {
  targetId: string;
  kind: string;
  locator?: string;
}

@id("AssessmentControlMapping")
model AssessmentControlMapping {
  frameworkId: string;
  controlId: string;
  catalogVersion: string;
}

@id("AssessmentFinding")
model AssessmentFinding {
  findingId: string;
  checkId: string;
  status: AssessmentFindingStatus;
  severity: AssessmentSeverity;
  title: string;
  summary: string;
  targetId: string;
  evidenceIds: string[];
  mappings: AssessmentControlMapping[];
}

@id("AssessmentCounts")
model AssessmentCounts {
  passed: int64;
  failed: int64;
  unknownCount: int64;
  errors: int64;
  highOrCriticalFailures: int64;
}

@id("AssessmentRecommendationInput")
model AssessmentRecommendationInput {
  recommendationId: string;
  sourceFindingIds: string[];
  priority: RecommendationPriority;
  title: string;
  summary: string;
  runbookRef?: string;
}

@id("AssessmentReport")
model AssessmentReport {
  specVersion: "canonical.readiness.assessment.v1";
  assessmentReportId: string;
  scopeId: string;
  generatedAt: string;
  engineId: string;
  engineVersion: string;
  sourceObservationIds: string[];
  evidence: AssessmentEvidenceRef[];
  targets: AssessmentTarget[];
  findings: AssessmentFinding[];
  recommendations: AssessmentRecommendationInput[];
  counts: AssessmentCounts;
  scoreBasisPoints?: int64;
  boundary: string;
}
