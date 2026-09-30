//! Generated from a route-map JSON. Do not edit by hand.
//! Exhaustive `RouteKey` match is the backend compile check.
#![allow(dead_code)]

pub const SERVICE: &str = "canonical-api-server";

#[derive(Copy, Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum RouteKey {
    Healthz,
    RegisterPreInterest,
    ListQuotes,
    CreateQuote,
    GetQuote,
    RetryQuote,
    QuoteEvents,
    ListReadinessFrameworks,
    GetReadinessFramework,
    ListReadinessAssessments,
    CreateReadinessAssessment,
    GetReadinessAssessment,
    SyncChanges,
    SyncMutations,
    GetGrcDashboard,
    ListCompliancePrograms,
    GetComplianceProgram,
    ListGrcControls,
    GetGrcControl,
    ListControlTestRuns,
    TriggerControlTest,
    ListGrcEvidence,
    GetGrcEvidence,
    ListAssets,
    GetAsset,
    ListRisks,
    CreateRisk,
    GetRisk,
    ListPolicies,
    GetPolicy,
    CreatePolicyVersion,
    AcknowledgePolicy,
    ListVendors,
    CreateVendor,
    GetVendor,
    ListQuestionnaires,
    CreateQuestionnaire,
    GetQuestionnaire,
    ListAuditEvidenceRequests,
    GetAuditEvidenceRequest,
    GetTrustCenter,
    ListTrustCenterAccessRequests,
    DecideTrustCenterAccess,
    ListAiSystems,
    GetAiSystem,
    ListTrainingAssignments,
    GetTrainingAssignment,
}

impl RouteKey {
    pub const ALL: &'static [Self] = &[Self::Healthz, Self::RegisterPreInterest, Self::ListQuotes, Self::CreateQuote, Self::GetQuote, Self::RetryQuote, Self::QuoteEvents, Self::ListReadinessFrameworks, Self::GetReadinessFramework, Self::ListReadinessAssessments, Self::CreateReadinessAssessment, Self::GetReadinessAssessment, Self::SyncChanges, Self::SyncMutations, Self::GetGrcDashboard, Self::ListCompliancePrograms, Self::GetComplianceProgram, Self::ListGrcControls, Self::GetGrcControl, Self::ListControlTestRuns, Self::TriggerControlTest, Self::ListGrcEvidence, Self::GetGrcEvidence, Self::ListAssets, Self::GetAsset, Self::ListRisks, Self::CreateRisk, Self::GetRisk, Self::ListPolicies, Self::GetPolicy, Self::CreatePolicyVersion, Self::AcknowledgePolicy, Self::ListVendors, Self::CreateVendor, Self::GetVendor, Self::ListQuestionnaires, Self::CreateQuestionnaire, Self::GetQuestionnaire, Self::ListAuditEvidenceRequests, Self::GetAuditEvidenceRequest, Self::GetTrustCenter, Self::ListTrustCenterAccessRequests, Self::DecideTrustCenterAccess, Self::ListAiSystems, Self::GetAiSystem, Self::ListTrainingAssignments, Self::GetTrainingAssignment];

    #[must_use]
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Healthz => "healthz",
            Self::RegisterPreInterest => "register_pre_interest",
            Self::ListQuotes => "list_quotes",
            Self::CreateQuote => "create_quote",
            Self::GetQuote => "get_quote",
            Self::RetryQuote => "retry_quote",
            Self::QuoteEvents => "quote_events",
            Self::ListReadinessFrameworks => "list_readiness_frameworks",
            Self::GetReadinessFramework => "get_readiness_framework",
            Self::ListReadinessAssessments => "list_readiness_assessments",
            Self::CreateReadinessAssessment => "create_readiness_assessment",
            Self::GetReadinessAssessment => "get_readiness_assessment",
            Self::SyncChanges => "sync_changes",
            Self::SyncMutations => "sync_mutations",
            Self::GetGrcDashboard => "get_grc_dashboard",
            Self::ListCompliancePrograms => "list_compliance_programs",
            Self::GetComplianceProgram => "get_compliance_program",
            Self::ListGrcControls => "list_grc_controls",
            Self::GetGrcControl => "get_grc_control",
            Self::ListControlTestRuns => "list_control_test_runs",
            Self::TriggerControlTest => "trigger_control_test",
            Self::ListGrcEvidence => "list_grc_evidence",
            Self::GetGrcEvidence => "get_grc_evidence",
            Self::ListAssets => "list_assets",
            Self::GetAsset => "get_asset",
            Self::ListRisks => "list_risks",
            Self::CreateRisk => "create_risk",
            Self::GetRisk => "get_risk",
            Self::ListPolicies => "list_policies",
            Self::GetPolicy => "get_policy",
            Self::CreatePolicyVersion => "create_policy_version",
            Self::AcknowledgePolicy => "acknowledge_policy",
            Self::ListVendors => "list_vendors",
            Self::CreateVendor => "create_vendor",
            Self::GetVendor => "get_vendor",
            Self::ListQuestionnaires => "list_questionnaires",
            Self::CreateQuestionnaire => "create_questionnaire",
            Self::GetQuestionnaire => "get_questionnaire",
            Self::ListAuditEvidenceRequests => "list_audit_evidence_requests",
            Self::GetAuditEvidenceRequest => "get_audit_evidence_request",
            Self::GetTrustCenter => "get_trust_center",
            Self::ListTrustCenterAccessRequests => "list_trust_center_access_requests",
            Self::DecideTrustCenterAccess => "decide_trust_center_access",
            Self::ListAiSystems => "list_ai_systems",
            Self::GetAiSystem => "get_ai_system",
            Self::ListTrainingAssignments => "list_training_assignments",
            Self::GetTrainingAssignment => "get_training_assignment",
        }
    }

    #[must_use]
    pub fn parse(key: &str) -> Option<Self> {
        match key {
            "healthz" => Some(Self::Healthz),
            "register_pre_interest" => Some(Self::RegisterPreInterest),
            "list_quotes" => Some(Self::ListQuotes),
            "create_quote" => Some(Self::CreateQuote),
            "get_quote" => Some(Self::GetQuote),
            "retry_quote" => Some(Self::RetryQuote),
            "quote_events" => Some(Self::QuoteEvents),
            "list_readiness_frameworks" => Some(Self::ListReadinessFrameworks),
            "get_readiness_framework" => Some(Self::GetReadinessFramework),
            "list_readiness_assessments" => Some(Self::ListReadinessAssessments),
            "create_readiness_assessment" => Some(Self::CreateReadinessAssessment),
            "get_readiness_assessment" => Some(Self::GetReadinessAssessment),
            "sync_changes" => Some(Self::SyncChanges),
            "sync_mutations" => Some(Self::SyncMutations),
            "get_grc_dashboard" => Some(Self::GetGrcDashboard),
            "list_compliance_programs" => Some(Self::ListCompliancePrograms),
            "get_compliance_program" => Some(Self::GetComplianceProgram),
            "list_grc_controls" => Some(Self::ListGrcControls),
            "get_grc_control" => Some(Self::GetGrcControl),
            "list_control_test_runs" => Some(Self::ListControlTestRuns),
            "trigger_control_test" => Some(Self::TriggerControlTest),
            "list_grc_evidence" => Some(Self::ListGrcEvidence),
            "get_grc_evidence" => Some(Self::GetGrcEvidence),
            "list_assets" => Some(Self::ListAssets),
            "get_asset" => Some(Self::GetAsset),
            "list_risks" => Some(Self::ListRisks),
            "create_risk" => Some(Self::CreateRisk),
            "get_risk" => Some(Self::GetRisk),
            "list_policies" => Some(Self::ListPolicies),
            "get_policy" => Some(Self::GetPolicy),
            "create_policy_version" => Some(Self::CreatePolicyVersion),
            "acknowledge_policy" => Some(Self::AcknowledgePolicy),
            "list_vendors" => Some(Self::ListVendors),
            "create_vendor" => Some(Self::CreateVendor),
            "get_vendor" => Some(Self::GetVendor),
            "list_questionnaires" => Some(Self::ListQuestionnaires),
            "create_questionnaire" => Some(Self::CreateQuestionnaire),
            "get_questionnaire" => Some(Self::GetQuestionnaire),
            "list_audit_evidence_requests" => Some(Self::ListAuditEvidenceRequests),
            "get_audit_evidence_request" => Some(Self::GetAuditEvidenceRequest),
            "get_trust_center" => Some(Self::GetTrustCenter),
            "list_trust_center_access_requests" => Some(Self::ListTrustCenterAccessRequests),
            "decide_trust_center_access" => Some(Self::DecideTrustCenterAccess),
            "list_ai_systems" => Some(Self::ListAiSystems),
            "get_ai_system" => Some(Self::GetAiSystem),
            "list_training_assignments" => Some(Self::ListTrainingAssignments),
            "get_training_assignment" => Some(Self::GetTrainingAssignment),
            _ => None,
        }
    }

    #[must_use]
    pub fn path(self) -> &'static str {
        match self {
            Self::Healthz => "/healthz",
            Self::RegisterPreInterest => "/v1/pre-interest-registrations",
            Self::ListQuotes => "/api/v1/quotes",
            Self::CreateQuote => "/api/v1/quotes",
            Self::GetQuote => "/api/v1/quotes/{quoteId}",
            Self::RetryQuote => "/api/v1/quotes/{quoteId}/retry",
            Self::QuoteEvents => "/api/v1/quotes/{quoteId}/events",
            Self::ListReadinessFrameworks => "/api/v1/readiness/frameworks",
            Self::GetReadinessFramework => "/api/v1/readiness/frameworks/{frameworkId}",
            Self::ListReadinessAssessments => "/api/v1/readiness/assessments",
            Self::CreateReadinessAssessment => "/api/v1/readiness/assessments",
            Self::GetReadinessAssessment => "/api/v1/readiness/assessments/{assessmentId}",
            Self::SyncChanges => "/api/v1/sync/changes",
            Self::SyncMutations => "/api/v1/sync/mutations",
            Self::GetGrcDashboard => "/api/v1/grc/dashboard",
            Self::ListCompliancePrograms => "/api/v1/grc/programs",
            Self::GetComplianceProgram => "/api/v1/grc/programs/{programId}",
            Self::ListGrcControls => "/api/v1/grc/controls",
            Self::GetGrcControl => "/api/v1/grc/controls/{controlId}",
            Self::ListControlTestRuns => "/api/v1/grc/controls/{controlId}/test-runs",
            Self::TriggerControlTest => "/api/v1/grc/controls/{controlId}/test-runs",
            Self::ListGrcEvidence => "/api/v1/grc/evidence",
            Self::GetGrcEvidence => "/api/v1/grc/evidence/{evidenceId}",
            Self::ListAssets => "/api/v1/grc/assets",
            Self::GetAsset => "/api/v1/grc/assets/{assetId}",
            Self::ListRisks => "/api/v1/grc/risks",
            Self::CreateRisk => "/api/v1/grc/risks",
            Self::GetRisk => "/api/v1/grc/risks/{riskId}",
            Self::ListPolicies => "/api/v1/grc/policies",
            Self::GetPolicy => "/api/v1/grc/policies/{policyId}",
            Self::CreatePolicyVersion => "/api/v1/grc/policies/{policyId}/versions",
            Self::AcknowledgePolicy => "/api/v1/grc/policies/{policyId}/acknowledgements",
            Self::ListVendors => "/api/v1/grc/vendors",
            Self::CreateVendor => "/api/v1/grc/vendors",
            Self::GetVendor => "/api/v1/grc/vendors/{vendorId}",
            Self::ListQuestionnaires => "/api/v1/grc/questionnaires",
            Self::CreateQuestionnaire => "/api/v1/grc/questionnaires",
            Self::GetQuestionnaire => "/api/v1/grc/questionnaires/{questionnaireId}",
            Self::ListAuditEvidenceRequests => "/api/v1/grc/audit-evidence-requests",
            Self::GetAuditEvidenceRequest => "/api/v1/grc/audit-evidence-requests/{requestId}",
            Self::GetTrustCenter => "/api/v1/grc/trust-center",
            Self::ListTrustCenterAccessRequests => "/api/v1/grc/trust-center/access-requests",
            Self::DecideTrustCenterAccess => "/api/v1/grc/trust-center/access-requests/{accessRequestId}/decision",
            Self::ListAiSystems => "/api/v1/grc/ai-systems",
            Self::GetAiSystem => "/api/v1/grc/ai-systems/{aiSystemId}",
            Self::ListTrainingAssignments => "/api/v1/grc/training-assignments",
            Self::GetTrainingAssignment => "/api/v1/grc/training-assignments/{assignmentId}",
        }
    }

    #[must_use]
    pub fn methods(self) -> &'static [&'static str] {
        match self {
            Self::Healthz => &["GET"],
            Self::RegisterPreInterest => &["POST"],
            Self::ListQuotes => &["GET"],
            Self::CreateQuote => &["POST"],
            Self::GetQuote => &["GET"],
            Self::RetryQuote => &["POST"],
            Self::QuoteEvents => &["GET"],
            Self::ListReadinessFrameworks => &["GET"],
            Self::GetReadinessFramework => &["GET"],
            Self::ListReadinessAssessments => &["GET"],
            Self::CreateReadinessAssessment => &["POST"],
            Self::GetReadinessAssessment => &["GET"],
            Self::SyncChanges => &["GET"],
            Self::SyncMutations => &["POST"],
            Self::GetGrcDashboard => &["GET"],
            Self::ListCompliancePrograms => &["GET"],
            Self::GetComplianceProgram => &["GET"],
            Self::ListGrcControls => &["GET"],
            Self::GetGrcControl => &["GET"],
            Self::ListControlTestRuns => &["GET"],
            Self::TriggerControlTest => &["POST"],
            Self::ListGrcEvidence => &["GET"],
            Self::GetGrcEvidence => &["GET"],
            Self::ListAssets => &["GET"],
            Self::GetAsset => &["GET"],
            Self::ListRisks => &["GET"],
            Self::CreateRisk => &["POST"],
            Self::GetRisk => &["GET"],
            Self::ListPolicies => &["GET"],
            Self::GetPolicy => &["GET"],
            Self::CreatePolicyVersion => &["POST"],
            Self::AcknowledgePolicy => &["POST"],
            Self::ListVendors => &["GET"],
            Self::CreateVendor => &["POST"],
            Self::GetVendor => &["GET"],
            Self::ListQuestionnaires => &["GET"],
            Self::CreateQuestionnaire => &["POST"],
            Self::GetQuestionnaire => &["GET"],
            Self::ListAuditEvidenceRequests => &["GET"],
            Self::GetAuditEvidenceRequest => &["GET"],
            Self::GetTrustCenter => &["GET"],
            Self::ListTrustCenterAccessRequests => &["GET"],
            Self::DecideTrustCenterAccess => &["POST"],
            Self::ListAiSystems => &["GET"],
            Self::GetAiSystem => &["GET"],
            Self::ListTrainingAssignments => &["GET"],
            Self::GetTrainingAssignment => &["GET"],
        }
    }
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct RegisterPreInterestRequest {
    #[serde(rename = "requestId")]
    pub request_id: String,
    pub email: String,
    #[serde(rename = "partyType")]
    pub party_type: String,
    #[serde(rename = "organizationName")]
    pub organization_name: Option<String>,
    #[serde(rename = "interestAreas")]
    pub interest_areas: Vec<String>,
    #[serde(rename = "consentRevision")]
    pub consent_revision: String,
    #[serde(rename = "consentedAt")]
    pub consented_at: String,
    #[serde(rename = "sourceHost")]
    pub source_host: String,
    pub locale: Option<String>,
    #[serde(rename = "referralCode")]
    pub referral_code: Option<String>,
    #[serde(rename = "displayName")]
    pub display_name: Option<String>,
    #[serde(rename = "websiteUrl")]
    pub website_url: Option<String>,
    #[serde(rename = "registrationConsent")]
    pub registration_consent: bool,
    #[serde(rename = "marketingConsent")]
    pub marketing_consent: bool,
    #[serde(rename = "marketingConsentRevision")]
    pub marketing_consent_revision: Option<String>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct RegisterPreInterestResponse {
    #[serde(rename = "receiptId")]
    pub receipt_id: String,
    pub status: String,
    #[serde(rename = "acceptedAt")]
    pub accepted_at: String,
    #[serde(rename = "nextStepUrl")]
    pub next_step_url: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct ListQuotesQuery {
    pub cursor: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct ListQuotesResponse {
    pub quotes: Vec<serde_json::Value>,
    #[serde(rename = "nextCursor")]
    pub next_cursor: Option<String>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct CreateQuoteRequest {
    #[serde(rename = "organizationName")]
    pub organization_name: String,
    #[serde(rename = "contactEmail")]
    pub contact_email: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct CreateQuoteResponse {
    #[serde(rename = "quoteId")]
    pub quote_id: String,
    pub status: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct GetQuotePath {
    #[serde(rename = "quoteId")]
    pub quote_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct RetryQuotePath {
    #[serde(rename = "quoteId")]
    pub quote_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct QuoteEventsPath {
    #[serde(rename = "quoteId")]
    pub quote_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct GetReadinessFrameworkPath {
    #[serde(rename = "frameworkId")]
    pub framework_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct GetReadinessAssessmentPath {
    #[serde(rename = "assessmentId")]
    pub assessment_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct SyncChangesQuery {
    pub cursor: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct SyncMutationsRequest {
    pub operations: Vec<serde_json::Value>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct ListComplianceProgramsQuery {
    pub cursor: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct GetComplianceProgramPath {
    #[serde(rename = "programId")]
    pub program_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct ListGrcControlsQuery {
    pub cursor: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct GetGrcControlPath {
    #[serde(rename = "controlId")]
    pub control_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct ListControlTestRunsPath {
    #[serde(rename = "controlId")]
    pub control_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct ListControlTestRunsQuery {
    pub cursor: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct TriggerControlTestPath {
    #[serde(rename = "controlId")]
    pub control_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct ListGrcEvidenceQuery {
    pub cursor: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct GetGrcEvidencePath {
    #[serde(rename = "evidenceId")]
    pub evidence_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct ListAssetsQuery {
    pub cursor: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct GetAssetPath {
    #[serde(rename = "assetId")]
    pub asset_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct ListRisksQuery {
    pub cursor: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct GetRiskPath {
    #[serde(rename = "riskId")]
    pub risk_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct ListPoliciesQuery {
    pub cursor: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct GetPolicyPath {
    #[serde(rename = "policyId")]
    pub policy_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct CreatePolicyVersionPath {
    #[serde(rename = "policyId")]
    pub policy_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct AcknowledgePolicyPath {
    #[serde(rename = "policyId")]
    pub policy_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct ListVendorsQuery {
    pub cursor: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct GetVendorPath {
    #[serde(rename = "vendorId")]
    pub vendor_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct ListQuestionnairesQuery {
    pub cursor: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct GetQuestionnairePath {
    #[serde(rename = "questionnaireId")]
    pub questionnaire_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct ListAuditEvidenceRequestsQuery {
    pub cursor: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct GetAuditEvidenceRequestPath {
    #[serde(rename = "requestId")]
    pub request_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct ListTrustCenterAccessRequestsQuery {
    pub cursor: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct DecideTrustCenterAccessPath {
    #[serde(rename = "accessRequestId")]
    pub access_request_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct ListAiSystemsQuery {
    pub cursor: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct GetAiSystemPath {
    #[serde(rename = "aiSystemId")]
    pub ai_system_id: String,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct ListTrainingAssignmentsQuery {
    pub cursor: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Clone, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct GetTrainingAssignmentPath {
    #[serde(rename = "assignmentId")]
    pub assignment_id: String,
}

