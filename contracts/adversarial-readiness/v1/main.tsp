import "@typespec/json-schema";
using TypeSpec.JsonSchema;

namespace Canonical.AdversarialReadiness.V1;

@id("AdversarialFindingStatus")
enum AdversarialFindingStatus {
  passed: "pass",
  finding: "finding",
  unknownValue: "unknown",
  error: "error",
}

@id("AdversarialSeverity")
enum AdversarialSeverity {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
}

@id("AdversarialRecommendationPriority")
enum AdversarialRecommendationPriority {
  urgent: "urgent",
  high: "high",
  medium: "medium",
  low: "low",
}

@id("AdversarialExpectedDisposition")
enum AdversarialExpectedDisposition {
  allow: "allow",
  deny: "deny",
  baseline: "baseline",
}

@id("AdversarialExecutionPrivilege")
enum AdversarialExecutionPrivilege {
  root: "root",
  nonRoot: "non-root",
  any: "any",
}

@id("AdversarialObservedPrivilege")
enum AdversarialObservedPrivilege {
  root: "root",
  nonRoot: "non-root",
  unknownValue: "unknown",
}

@id("AdversarialEvidenceLayer")
enum AdversarialEvidenceLayer {
  serviceSession: "service-session",
  networkBoundary: "network-boundary",
  providerPathAnalysis: "provider-path-analysis",
  effectiveFileAccess: "effective-file-access",
  filesystemMetadata: "filesystem-metadata",
  executionContext: "execution-context",
  staticConfiguration: "static-configuration",
  transportIdentity: "transport-identity",
}

@id("AdversarialPerspective")
model AdversarialPerspective {
  perspectiveId: string;
  trustZone: string;
  expectedPrivilege: AdversarialExecutionPrivilege;
}

@id("AdversarialTargetRef")
model AdversarialTargetRef {
  targetId: string;
  kind: string;
  locatorSha256: string;
}

@id("AdversarialRecommendationRef")
model AdversarialRecommendationRef {
  catalogKey: string;
  priority: AdversarialRecommendationPriority;
  controlLayers: string[];
  verification: string;
}

@id("AdversarialResult")
model AdversarialResult {
  checkId: string;
  title: string;
  severity: AdversarialSeverity;
  kind: string;
  targetId: string;
  status: AdversarialFindingStatus;
  expected: AdversarialExpectedDisposition;
  observed: string;
  evidenceLayer: AdversarialEvidenceLayer;
  sourceObservationIds: string[];
  recommendation?: AdversarialRecommendationRef;
}

@id("AdversarialSummary")
model AdversarialSummary {
  passed: int64;
  findings: int64;
  unknownCount: int64;
  errors: int64;
}

@id("AdversarialEvidenceReport")
model AdversarialEvidenceReport {
  specVersion: "canonical.adversarial-readiness.evidence.v1";
  reportId: string;
  planId: string;
  authorizationRefSha256: string;
  perspective: AdversarialPerspective;
  observedPrivilege: AdversarialObservedPrivilege;
  generatedAt: string;
  targets: AdversarialTargetRef[];
  results: AdversarialResult[];
  summary: AdversarialSummary;
  boundary: string;
}
