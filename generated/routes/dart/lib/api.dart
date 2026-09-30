/// Generated from a route-map JSON. Do not edit by hand.
library;

const String kService = "canonical-api-server";

class RouteMeta {
  const RouteMeta({required this.key, required this.path, required this.methods});
  final String key;
  final String path;
  final List<String> methods;
  String expand(Map<String, String> params) {
    var out = path;
    params.forEach((k, v) {
      out = out.replaceAll('{$k}', Uri.encodeComponent(v));
    });
    return out;
  }
}

abstract final class Routes {
  static const healthz = RouteMeta(key: "healthz", path: "/healthz", methods: ["GET"]);
  static const register_pre_interest = RouteMeta(key: "register_pre_interest", path: "/v1/pre-interest-registrations", methods: ["POST"]);
  static const list_quotes = RouteMeta(key: "list_quotes", path: "/api/v1/quotes", methods: ["GET"]);
  static const create_quote = RouteMeta(key: "create_quote", path: "/api/v1/quotes", methods: ["POST"]);
  static const get_quote = RouteMeta(key: "get_quote", path: "/api/v1/quotes/{quoteId}", methods: ["GET"]);
  static const retry_quote = RouteMeta(key: "retry_quote", path: "/api/v1/quotes/{quoteId}/retry", methods: ["POST"]);
  static const quote_events = RouteMeta(key: "quote_events", path: "/api/v1/quotes/{quoteId}/events", methods: ["GET"]);
  static const list_readiness_frameworks = RouteMeta(key: "list_readiness_frameworks", path: "/api/v1/readiness/frameworks", methods: ["GET"]);
  static const get_readiness_framework = RouteMeta(key: "get_readiness_framework", path: "/api/v1/readiness/frameworks/{frameworkId}", methods: ["GET"]);
  static const list_readiness_assessments = RouteMeta(key: "list_readiness_assessments", path: "/api/v1/readiness/assessments", methods: ["GET"]);
  static const create_readiness_assessment = RouteMeta(key: "create_readiness_assessment", path: "/api/v1/readiness/assessments", methods: ["POST"]);
  static const get_readiness_assessment = RouteMeta(key: "get_readiness_assessment", path: "/api/v1/readiness/assessments/{assessmentId}", methods: ["GET"]);
  static const sync_changes = RouteMeta(key: "sync_changes", path: "/api/v1/sync/changes", methods: ["GET"]);
  static const sync_mutations = RouteMeta(key: "sync_mutations", path: "/api/v1/sync/mutations", methods: ["POST"]);
  static const get_grc_dashboard = RouteMeta(key: "get_grc_dashboard", path: "/api/v1/grc/dashboard", methods: ["GET"]);
  static const list_compliance_programs = RouteMeta(key: "list_compliance_programs", path: "/api/v1/grc/programs", methods: ["GET"]);
  static const get_compliance_program = RouteMeta(key: "get_compliance_program", path: "/api/v1/grc/programs/{programId}", methods: ["GET"]);
  static const list_grc_controls = RouteMeta(key: "list_grc_controls", path: "/api/v1/grc/controls", methods: ["GET"]);
  static const get_grc_control = RouteMeta(key: "get_grc_control", path: "/api/v1/grc/controls/{controlId}", methods: ["GET"]);
  static const list_control_test_runs = RouteMeta(key: "list_control_test_runs", path: "/api/v1/grc/controls/{controlId}/test-runs", methods: ["GET"]);
  static const trigger_control_test = RouteMeta(key: "trigger_control_test", path: "/api/v1/grc/controls/{controlId}/test-runs", methods: ["POST"]);
  static const list_grc_evidence = RouteMeta(key: "list_grc_evidence", path: "/api/v1/grc/evidence", methods: ["GET"]);
  static const get_grc_evidence = RouteMeta(key: "get_grc_evidence", path: "/api/v1/grc/evidence/{evidenceId}", methods: ["GET"]);
  static const list_assets = RouteMeta(key: "list_assets", path: "/api/v1/grc/assets", methods: ["GET"]);
  static const get_asset = RouteMeta(key: "get_asset", path: "/api/v1/grc/assets/{assetId}", methods: ["GET"]);
  static const list_risks = RouteMeta(key: "list_risks", path: "/api/v1/grc/risks", methods: ["GET"]);
  static const create_risk = RouteMeta(key: "create_risk", path: "/api/v1/grc/risks", methods: ["POST"]);
  static const get_risk = RouteMeta(key: "get_risk", path: "/api/v1/grc/risks/{riskId}", methods: ["GET"]);
  static const list_policies = RouteMeta(key: "list_policies", path: "/api/v1/grc/policies", methods: ["GET"]);
  static const get_policy = RouteMeta(key: "get_policy", path: "/api/v1/grc/policies/{policyId}", methods: ["GET"]);
  static const create_policy_version = RouteMeta(key: "create_policy_version", path: "/api/v1/grc/policies/{policyId}/versions", methods: ["POST"]);
  static const acknowledge_policy = RouteMeta(key: "acknowledge_policy", path: "/api/v1/grc/policies/{policyId}/acknowledgements", methods: ["POST"]);
  static const list_vendors = RouteMeta(key: "list_vendors", path: "/api/v1/grc/vendors", methods: ["GET"]);
  static const create_vendor = RouteMeta(key: "create_vendor", path: "/api/v1/grc/vendors", methods: ["POST"]);
  static const get_vendor = RouteMeta(key: "get_vendor", path: "/api/v1/grc/vendors/{vendorId}", methods: ["GET"]);
  static const list_questionnaires = RouteMeta(key: "list_questionnaires", path: "/api/v1/grc/questionnaires", methods: ["GET"]);
  static const create_questionnaire = RouteMeta(key: "create_questionnaire", path: "/api/v1/grc/questionnaires", methods: ["POST"]);
  static const get_questionnaire = RouteMeta(key: "get_questionnaire", path: "/api/v1/grc/questionnaires/{questionnaireId}", methods: ["GET"]);
  static const list_audit_evidence_requests = RouteMeta(key: "list_audit_evidence_requests", path: "/api/v1/grc/audit-evidence-requests", methods: ["GET"]);
  static const get_audit_evidence_request = RouteMeta(key: "get_audit_evidence_request", path: "/api/v1/grc/audit-evidence-requests/{requestId}", methods: ["GET"]);
  static const get_trust_center = RouteMeta(key: "get_trust_center", path: "/api/v1/grc/trust-center", methods: ["GET"]);
  static const list_trust_center_access_requests = RouteMeta(key: "list_trust_center_access_requests", path: "/api/v1/grc/trust-center/access-requests", methods: ["GET"]);
  static const decide_trust_center_access = RouteMeta(key: "decide_trust_center_access", path: "/api/v1/grc/trust-center/access-requests/{accessRequestId}/decision", methods: ["POST"]);
  static const list_ai_systems = RouteMeta(key: "list_ai_systems", path: "/api/v1/grc/ai-systems", methods: ["GET"]);
  static const get_ai_system = RouteMeta(key: "get_ai_system", path: "/api/v1/grc/ai-systems/{aiSystemId}", methods: ["GET"]);
  static const list_training_assignments = RouteMeta(key: "list_training_assignments", path: "/api/v1/grc/training-assignments", methods: ["GET"]);
  static const get_training_assignment = RouteMeta(key: "get_training_assignment", path: "/api/v1/grc/training-assignments/{assignmentId}", methods: ["GET"]);

  static const Map<String, RouteMeta> byKey = {
    "healthz": healthz,
    "register_pre_interest": register_pre_interest,
    "list_quotes": list_quotes,
    "create_quote": create_quote,
    "get_quote": get_quote,
    "retry_quote": retry_quote,
    "quote_events": quote_events,
    "list_readiness_frameworks": list_readiness_frameworks,
    "get_readiness_framework": get_readiness_framework,
    "list_readiness_assessments": list_readiness_assessments,
    "create_readiness_assessment": create_readiness_assessment,
    "get_readiness_assessment": get_readiness_assessment,
    "sync_changes": sync_changes,
    "sync_mutations": sync_mutations,
    "get_grc_dashboard": get_grc_dashboard,
    "list_compliance_programs": list_compliance_programs,
    "get_compliance_program": get_compliance_program,
    "list_grc_controls": list_grc_controls,
    "get_grc_control": get_grc_control,
    "list_control_test_runs": list_control_test_runs,
    "trigger_control_test": trigger_control_test,
    "list_grc_evidence": list_grc_evidence,
    "get_grc_evidence": get_grc_evidence,
    "list_assets": list_assets,
    "get_asset": get_asset,
    "list_risks": list_risks,
    "create_risk": create_risk,
    "get_risk": get_risk,
    "list_policies": list_policies,
    "get_policy": get_policy,
    "create_policy_version": create_policy_version,
    "acknowledge_policy": acknowledge_policy,
    "list_vendors": list_vendors,
    "create_vendor": create_vendor,
    "get_vendor": get_vendor,
    "list_questionnaires": list_questionnaires,
    "create_questionnaire": create_questionnaire,
    "get_questionnaire": get_questionnaire,
    "list_audit_evidence_requests": list_audit_evidence_requests,
    "get_audit_evidence_request": get_audit_evidence_request,
    "get_trust_center": get_trust_center,
    "list_trust_center_access_requests": list_trust_center_access_requests,
    "decide_trust_center_access": decide_trust_center_access,
    "list_ai_systems": list_ai_systems,
    "get_ai_system": get_ai_system,
    "list_training_assignments": list_training_assignments,
    "get_training_assignment": get_training_assignment,
  };
}

