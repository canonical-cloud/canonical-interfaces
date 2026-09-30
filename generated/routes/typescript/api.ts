/** Generated from a route-map JSON. Do not edit by hand. */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export const SERVICE = "canonical-api-server" as const;

export const Routes = {
  "healthz": {
    key: "healthz",
    path: "/healthz" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "register_pre_interest": {
    key: "register_pre_interest",
    path: "/v1/pre-interest-registrations" as const,
    methods: ["POST"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "list_quotes": {
    key: "list_quotes",
    path: "/api/v1/quotes" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "create_quote": {
    key: "create_quote",
    path: "/api/v1/quotes" as const,
    methods: ["POST"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "get_quote": {
    key: "get_quote",
    path: "/api/v1/quotes/{quoteId}" as const,
    methods: ["GET"] as const,
    buildPath: (p: { "quoteId": string }) => "/api/v1/quotes/{quoteId}".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "retry_quote": {
    key: "retry_quote",
    path: "/api/v1/quotes/{quoteId}/retry" as const,
    methods: ["POST"] as const,
    buildPath: (p: { "quoteId": string }) => "/api/v1/quotes/{quoteId}/retry".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "quote_events": {
    key: "quote_events",
    path: "/api/v1/quotes/{quoteId}/events" as const,
    methods: ["GET"] as const,
    buildPath: (p: { "quoteId": string }) => "/api/v1/quotes/{quoteId}/events".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "list_readiness_frameworks": {
    key: "list_readiness_frameworks",
    path: "/api/v1/readiness/frameworks" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "get_readiness_framework": {
    key: "get_readiness_framework",
    path: "/api/v1/readiness/frameworks/{frameworkId}" as const,
    methods: ["GET"] as const,
    buildPath: (p: { "frameworkId": string }) => "/api/v1/readiness/frameworks/{frameworkId}".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "list_readiness_assessments": {
    key: "list_readiness_assessments",
    path: "/api/v1/readiness/assessments" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "create_readiness_assessment": {
    key: "create_readiness_assessment",
    path: "/api/v1/readiness/assessments" as const,
    methods: ["POST"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "get_readiness_assessment": {
    key: "get_readiness_assessment",
    path: "/api/v1/readiness/assessments/{assessmentId}" as const,
    methods: ["GET"] as const,
    buildPath: (p: { "assessmentId": string }) => "/api/v1/readiness/assessments/{assessmentId}".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "sync_changes": {
    key: "sync_changes",
    path: "/api/v1/sync/changes" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "sync_mutations": {
    key: "sync_mutations",
    path: "/api/v1/sync/mutations" as const,
    methods: ["POST"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "get_grc_dashboard": {
    key: "get_grc_dashboard",
    path: "/api/v1/grc/dashboard" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "list_compliance_programs": {
    key: "list_compliance_programs",
    path: "/api/v1/grc/programs" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "get_compliance_program": {
    key: "get_compliance_program",
    path: "/api/v1/grc/programs/{programId}" as const,
    methods: ["GET"] as const,
    buildPath: (p: { "programId": string }) => "/api/v1/grc/programs/{programId}".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "list_grc_controls": {
    key: "list_grc_controls",
    path: "/api/v1/grc/controls" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "get_grc_control": {
    key: "get_grc_control",
    path: "/api/v1/grc/controls/{controlId}" as const,
    methods: ["GET"] as const,
    buildPath: (p: { "controlId": string }) => "/api/v1/grc/controls/{controlId}".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "list_control_test_runs": {
    key: "list_control_test_runs",
    path: "/api/v1/grc/controls/{controlId}/test-runs" as const,
    methods: ["GET"] as const,
    buildPath: (p: { "controlId": string }) => "/api/v1/grc/controls/{controlId}/test-runs".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "trigger_control_test": {
    key: "trigger_control_test",
    path: "/api/v1/grc/controls/{controlId}/test-runs" as const,
    methods: ["POST"] as const,
    buildPath: (p: { "controlId": string }) => "/api/v1/grc/controls/{controlId}/test-runs".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "list_grc_evidence": {
    key: "list_grc_evidence",
    path: "/api/v1/grc/evidence" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "get_grc_evidence": {
    key: "get_grc_evidence",
    path: "/api/v1/grc/evidence/{evidenceId}" as const,
    methods: ["GET"] as const,
    buildPath: (p: { "evidenceId": string }) => "/api/v1/grc/evidence/{evidenceId}".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "list_assets": {
    key: "list_assets",
    path: "/api/v1/grc/assets" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "get_asset": {
    key: "get_asset",
    path: "/api/v1/grc/assets/{assetId}" as const,
    methods: ["GET"] as const,
    buildPath: (p: { "assetId": string }) => "/api/v1/grc/assets/{assetId}".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "list_risks": {
    key: "list_risks",
    path: "/api/v1/grc/risks" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "create_risk": {
    key: "create_risk",
    path: "/api/v1/grc/risks" as const,
    methods: ["POST"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "get_risk": {
    key: "get_risk",
    path: "/api/v1/grc/risks/{riskId}" as const,
    methods: ["GET"] as const,
    buildPath: (p: { "riskId": string }) => "/api/v1/grc/risks/{riskId}".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "list_policies": {
    key: "list_policies",
    path: "/api/v1/grc/policies" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "get_policy": {
    key: "get_policy",
    path: "/api/v1/grc/policies/{policyId}" as const,
    methods: ["GET"] as const,
    buildPath: (p: { "policyId": string }) => "/api/v1/grc/policies/{policyId}".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "create_policy_version": {
    key: "create_policy_version",
    path: "/api/v1/grc/policies/{policyId}/versions" as const,
    methods: ["POST"] as const,
    buildPath: (p: { "policyId": string }) => "/api/v1/grc/policies/{policyId}/versions".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "acknowledge_policy": {
    key: "acknowledge_policy",
    path: "/api/v1/grc/policies/{policyId}/acknowledgements" as const,
    methods: ["POST"] as const,
    buildPath: (p: { "policyId": string }) => "/api/v1/grc/policies/{policyId}/acknowledgements".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "list_vendors": {
    key: "list_vendors",
    path: "/api/v1/grc/vendors" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "create_vendor": {
    key: "create_vendor",
    path: "/api/v1/grc/vendors" as const,
    methods: ["POST"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "get_vendor": {
    key: "get_vendor",
    path: "/api/v1/grc/vendors/{vendorId}" as const,
    methods: ["GET"] as const,
    buildPath: (p: { "vendorId": string }) => "/api/v1/grc/vendors/{vendorId}".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "list_questionnaires": {
    key: "list_questionnaires",
    path: "/api/v1/grc/questionnaires" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "create_questionnaire": {
    key: "create_questionnaire",
    path: "/api/v1/grc/questionnaires" as const,
    methods: ["POST"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "get_questionnaire": {
    key: "get_questionnaire",
    path: "/api/v1/grc/questionnaires/{questionnaireId}" as const,
    methods: ["GET"] as const,
    buildPath: (p: { "questionnaireId": string }) => "/api/v1/grc/questionnaires/{questionnaireId}".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "list_audit_evidence_requests": {
    key: "list_audit_evidence_requests",
    path: "/api/v1/grc/audit-evidence-requests" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "get_audit_evidence_request": {
    key: "get_audit_evidence_request",
    path: "/api/v1/grc/audit-evidence-requests/{requestId}" as const,
    methods: ["GET"] as const,
    buildPath: (p: { "requestId": string }) => "/api/v1/grc/audit-evidence-requests/{requestId}".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "get_trust_center": {
    key: "get_trust_center",
    path: "/api/v1/grc/trust-center" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "list_trust_center_access_requests": {
    key: "list_trust_center_access_requests",
    path: "/api/v1/grc/trust-center/access-requests" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "decide_trust_center_access": {
    key: "decide_trust_center_access",
    path: "/api/v1/grc/trust-center/access-requests/{accessRequestId}/decision" as const,
    methods: ["POST"] as const,
    buildPath: (p: { "accessRequestId": string }) => "/api/v1/grc/trust-center/access-requests/{accessRequestId}/decision".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "list_ai_systems": {
    key: "list_ai_systems",
    path: "/api/v1/grc/ai-systems" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "get_ai_system": {
    key: "get_ai_system",
    path: "/api/v1/grc/ai-systems/{aiSystemId}" as const,
    methods: ["GET"] as const,
    buildPath: (p: { "aiSystemId": string }) => "/api/v1/grc/ai-systems/{aiSystemId}".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
  "list_training_assignments": {
    key: "list_training_assignments",
    path: "/api/v1/grc/training-assignments" as const,
    methods: ["GET"] as const,
    buildPath: undefined as ((p: Record<string, never>) => string) | undefined,
  },
  "get_training_assignment": {
    key: "get_training_assignment",
    path: "/api/v1/grc/training-assignments/{assignmentId}" as const,
    methods: ["GET"] as const,
    buildPath: (p: { "assignmentId": string }) => "/api/v1/grc/training-assignments/{assignmentId}".replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(String((p as Record<string, string>)[n]))),
  },
} as const;

export type RouteName = keyof typeof Routes;

export interface RouteTypes {
  "healthz": { path: Record<string, never>; query: Record<string, never>; body: void; response: unknown };
  "register_pre_interest": { path: Record<string, never>; query: Record<string, never>; body: { "requestId": string; "email": string; "partyType": "individual" | "organization"; "organizationName"?: string; "interestAreas": Array<"readiness_assessment" | "soc2" | "iso_27001" | "hipaa" | "pci_dss_4" | "fedramp" | "nist" | "gdpr" | "cmmc">; "consentRevision": string; "consentedAt": string; "sourceHost": "user.canonical.plus" | "org.canonical.plus"; "locale"?: string; "referralCode"?: string; "displayName"?: string; "websiteUrl"?: string; "registrationConsent": boolean; "marketingConsent": boolean; "marketingConsentRevision"?: string }; response: { "receiptId": string; "status": "accepted"; "acceptedAt": string; "nextStepUrl": string } };
  "list_quotes": { path: Record<string, never>; query: { "cursor"?: string; "limit"?: number }; body: void; response: { "quotes": Array<unknown>; "nextCursor"?: string } };
  "create_quote": { path: Record<string, never>; query: Record<string, never>; body: { "organizationName": string; "contactEmail": string }; response: { "quoteId": string; "status": string } };
  "get_quote": { path: { "quoteId": string }; query: Record<string, never>; body: void; response: unknown };
  "retry_quote": { path: { "quoteId": string }; query: Record<string, never>; body: void; response: unknown };
  "quote_events": { path: { "quoteId": string }; query: Record<string, never>; body: void; response: unknown };
  "list_readiness_frameworks": { path: Record<string, never>; query: Record<string, never>; body: void; response: unknown };
  "get_readiness_framework": { path: { "frameworkId": string }; query: Record<string, never>; body: void; response: unknown };
  "list_readiness_assessments": { path: Record<string, never>; query: Record<string, never>; body: void; response: unknown };
  "create_readiness_assessment": { path: Record<string, never>; query: Record<string, never>; body: void; response: unknown };
  "get_readiness_assessment": { path: { "assessmentId": string }; query: Record<string, never>; body: void; response: unknown };
  "sync_changes": { path: Record<string, never>; query: { "cursor"?: string; "limit"?: number }; body: void; response: unknown };
  "sync_mutations": { path: Record<string, never>; query: Record<string, never>; body: { "operations": Array<unknown> }; response: unknown };
  "get_grc_dashboard": { path: Record<string, never>; query: Record<string, never>; body: void; response: unknown };
  "list_compliance_programs": { path: Record<string, never>; query: { "cursor"?: string; "limit"?: number }; body: void; response: unknown };
  "get_compliance_program": { path: { "programId": string }; query: Record<string, never>; body: void; response: unknown };
  "list_grc_controls": { path: Record<string, never>; query: { "cursor"?: string; "limit"?: number }; body: void; response: unknown };
  "get_grc_control": { path: { "controlId": string }; query: Record<string, never>; body: void; response: unknown };
  "list_control_test_runs": { path: { "controlId": string }; query: { "cursor"?: string; "limit"?: number }; body: void; response: unknown };
  "trigger_control_test": { path: { "controlId": string }; query: Record<string, never>; body: void; response: unknown };
  "list_grc_evidence": { path: Record<string, never>; query: { "cursor"?: string; "limit"?: number }; body: void; response: unknown };
  "get_grc_evidence": { path: { "evidenceId": string }; query: Record<string, never>; body: void; response: unknown };
  "list_assets": { path: Record<string, never>; query: { "cursor"?: string; "limit"?: number }; body: void; response: unknown };
  "get_asset": { path: { "assetId": string }; query: Record<string, never>; body: void; response: unknown };
  "list_risks": { path: Record<string, never>; query: { "cursor"?: string; "limit"?: number }; body: void; response: unknown };
  "create_risk": { path: Record<string, never>; query: Record<string, never>; body: void; response: unknown };
  "get_risk": { path: { "riskId": string }; query: Record<string, never>; body: void; response: unknown };
  "list_policies": { path: Record<string, never>; query: { "cursor"?: string; "limit"?: number }; body: void; response: unknown };
  "get_policy": { path: { "policyId": string }; query: Record<string, never>; body: void; response: unknown };
  "create_policy_version": { path: { "policyId": string }; query: Record<string, never>; body: void; response: unknown };
  "acknowledge_policy": { path: { "policyId": string }; query: Record<string, never>; body: void; response: unknown };
  "list_vendors": { path: Record<string, never>; query: { "cursor"?: string; "limit"?: number }; body: void; response: unknown };
  "create_vendor": { path: Record<string, never>; query: Record<string, never>; body: void; response: unknown };
  "get_vendor": { path: { "vendorId": string }; query: Record<string, never>; body: void; response: unknown };
  "list_questionnaires": { path: Record<string, never>; query: { "cursor"?: string; "limit"?: number }; body: void; response: unknown };
  "create_questionnaire": { path: Record<string, never>; query: Record<string, never>; body: void; response: unknown };
  "get_questionnaire": { path: { "questionnaireId": string }; query: Record<string, never>; body: void; response: unknown };
  "list_audit_evidence_requests": { path: Record<string, never>; query: { "cursor"?: string; "limit"?: number }; body: void; response: unknown };
  "get_audit_evidence_request": { path: { "requestId": string }; query: Record<string, never>; body: void; response: unknown };
  "get_trust_center": { path: Record<string, never>; query: Record<string, never>; body: void; response: unknown };
  "list_trust_center_access_requests": { path: Record<string, never>; query: { "cursor"?: string; "limit"?: number }; body: void; response: unknown };
  "decide_trust_center_access": { path: { "accessRequestId": string }; query: Record<string, never>; body: void; response: unknown };
  "list_ai_systems": { path: Record<string, never>; query: { "cursor"?: string; "limit"?: number }; body: void; response: unknown };
  "get_ai_system": { path: { "aiSystemId": string }; query: Record<string, never>; body: void; response: unknown };
  "list_training_assignments": { path: Record<string, never>; query: { "cursor"?: string; "limit"?: number }; body: void; response: unknown };
  "get_training_assignment": { path: { "assignmentId": string }; query: Record<string, never>; body: void; response: unknown };
}

/** Adding a map key without a handler is a TypeScript error. */
export type RouteHandlers<Ctx> = {
  [K in RouteName]: (ctx: Ctx, args: {
    path: RouteTypes[K]["path"];
    query: RouteTypes[K]["query"];
    body: RouteTypes[K]["body"];
  }) => Promise<RouteTypes[K]["response"]> | RouteTypes[K]["response"];
};

export function lookup<K extends RouteName>(key: K): (typeof Routes)[K] {
  return Routes[key];
}

