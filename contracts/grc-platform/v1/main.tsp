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
  open_items: int32;
  overdue_items: int32;
  failing_automated_checks: int32;
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
