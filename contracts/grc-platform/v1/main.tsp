union GrcCapabilityKey {
  controls_evidence: "controls_evidence",
  framework_crosswalks: "framework_crosswalks",
  policies_people_training: "policies_people_training",
  risk_management: "risk_management",
  asset_vulnerability: "asset_vulnerability",
  vendor_risk: "vendor_risk",
  access_reviews: "access_reviews",
  audit_collaboration: "audit_collaboration",
  trust_center: "trust_center",
  security_questionnaires: "security_questionnaires",
  integrations_automation: "integrations_automation",
  ai_governance: "ai_governance",
  commercial_entitlements: "commercial_entitlements",
}

model GrcCapabilityDescriptor {
  key: GrcCapabilityKey;
  api_path: string;
  app_path: string;
  persistence_tables: string[];
  continuous_monitoring: boolean;
  evidence_provenance: boolean;
  human_approval: boolean;
}

model GrcModuleSnapshot {
  key: GrcCapabilityKey;
  open_items: uint32;
  overdue_items: uint32;
  failing_automated_checks: uint32;
  last_updated_at: string;
}

model GrcDashboardSnapshot {
  schema_version: 1;
  tenant_id: string;
  generated_at: string;
  modules: GrcModuleSnapshot[];
}

model GrcCapabilityCatalog {
  schema_version: 1;
  capabilities: GrcCapabilityDescriptor[];
}

model EvidenceProvenance {
  source_system: string;
  source_locator_sha256: string;
  payload_sha256: string;
  collected_at: string;
}

model Approval {
  actor_subject: string;
  approved_at: string;
  rationale?: string;
}

union ControlTestOutcome {
  passed: "passed",
  failed: "failed",
  stale: "stale",
  indeterminate: "indeterminate",
}

// Tenant ownership is authenticated request context, never a body field.
model RecordControlTestRun {
  control_test_id: string;
  run_id: string;
  outcome: ControlTestOutcome;
  observed_at: string;
  actor_subject: string;
  evidence: EvidenceProvenance[];
}

union RiskTreatment {
  avoid: "avoid",
  accept: "accept",
  mitigate: "mitigate",
  transfer: "transfer",
  monitor: "monitor",
}

model DecideRiskTreatment {
  risk_id: string;
  treatment: RiskTreatment;
  owner_subject: string;
  due_at?: string;
  rationale: string;
  approval: Approval;
}

union VendorDecision {
  approved: "approved",
  conditionally_approved: "conditionally_approved",
  needs_follow_up: "needs_follow_up",
  rejected: "rejected",
}

model DecideVendorAssessment {
  vendor_assessment_id: string;
  decision: VendorDecision;
  rationale: string;
  evidence: EvidenceProvenance[];
  approval: Approval;
}

union AccessDecision {
  approve: "approve",
  modify: "modify",
  revoke: "revoke",
  investigate: "investigate",
  not_applicable: "not_applicable",
}

model DecideAccessReviewItem {
  campaign_id: string;
  item_id: string;
  decision: AccessDecision;
  reviewer_subject: string;
  rationale: string;
  evidence: EvidenceProvenance[];
  approval: Approval;
}

model ApproveQuestionnaireAnswer {
  questionnaire_id: string;
  question_id: string;
  answer: string;
  sources: EvidenceProvenance[];
  approval: Approval;
}

union TrustResourceAccessLevel {
  public: "public",
  request_access: "request_access",
  approved_only: "approved_only",
}

model PublishTrustCenterResource {
  trust_center_id: string;
  resource_id: string;
  access_level: TrustResourceAccessLevel;
  nda_required: boolean;
  expires_at?: string;
  approval: Approval;
}

union AiRiskTier {
  unclassified: "unclassified",
  low: "low",
  moderate: "moderate",
  high: "high",
  critical: "critical",
}

model RegisterAiSystem {
  ai_system_id: string;
  name: string;
  owner_subject: string;
  purpose: string;
  data_classes: string[];
  risk_tier: AiRiskTier;
  approval?: Approval;
}
