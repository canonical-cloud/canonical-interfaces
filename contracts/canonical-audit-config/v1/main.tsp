import "@typespec/json-schema";
using TypeSpec.JsonSchema;

namespace Canonical.AuditConfig.V1;

@id("AuditEnvironment")
enum AuditEnvironment {
  test: "test",
  staging: "staging",
  production: "production",
}

@id("InteractionMode")
enum InteractionMode {
  interactive: "interactive",
  nonInteractive: "non-interactive",
}

@id("SecretReferenceScheme")
enum SecretReferenceScheme {
  env: "env",
  sops: "sops",
  file: "file",
  vault: "vault",
}

@id("PublishingProvider")
enum PublishingProvider {
  disabled: "disabled",
  cloudflareR2: "cloudflare-r2",
}

@id("PublicationVisibility")
enum PublicationVisibility {
  private: "private",
  authenticated: "authenticated",
  public: "public",
}

@id("ServiceProvider")
enum ServiceProvider {
  github: "github",
  aws: "aws",
  gcp: "gcp",
  azure: "azure",
  cloudflare: "cloudflare",
  supabase: "supabase",
  neondb: "neondb",
  vercel: "vercel",
  upstash: "upstash",
  kubernetes: "kubernetes",
  sentry: "sentry",
  datadog: "datadog",
  other: "other",
}

@id("ServiceKind")
enum ServiceKind {
  organization: "organization",
  cloud: "cloud",
  edge: "edge",
  databasePlatform: "database-platform",
  hosting: "hosting",
  cacheMessaging: "cache-messaging",
  orchestrator: "orchestrator",
  observability: "observability",
  other: "other",
}

@id("AuditReportFormat")
enum AuditReportFormat {
  json: "json",
  markdown: "markdown",
  html: "html",
}

@id("ToolchainPolicy")
model ToolchainPolicy {
  @pattern("^[0-9]+\\.[0-9]+\\.[0-9]+([+-][0-9A-Za-z.-]+)?$")
  canonical_cli: string;
  validator: "oresoftware/typespec-json-schema-validator";
  @pattern("^[0-9a-f]{40}$")
  validator_revision: string;
  validator_receipt_schema: "ores.tjsv.config-instance/v1";
  config_bridge: "oresoftware/ores-cli";
  @pattern("^[0-9a-f]{40}$")
  config_bridge_revision: string;
  require_exact_cli_version: true;
  runtime_schema_drift: "warn";
}

@id("FrameworkSelection")
model FrameworkSelection {
  soc2: boolean;
  nist_csf_2_0: boolean;
  nist_sp_800_53_rev5: boolean;
  iso_iec_27001_2022: boolean;
}

@id("InteractionPolicy")
model InteractionPolicy {
  default_mode: InteractionMode;
  prompt_for_missing: boolean;
  allow_interactive_override: boolean;
  fail_on_missing_required: boolean;
}

@id("SecurityPolicy")
model SecurityPolicy {
  allow_mutations: false;
  allow_plaintext_secrets: false;
  secret_reference_schemes: SecretReferenceScheme[];
  redact_logs: boolean;
  redact_reports: boolean;
  record_secret_fingerprints: boolean;
}

@id("RepositoryLayout")
model RepositoryLayout {
  private: true;
  evidence_dir: "evidence";
  workpapers_dir: "workpapers";
  reports_dir: "reports";
  manifests_dir: "manifests";
  customer_dir: "customer";
}

@id("PublishingPolicy")
model PublishingPolicy {
  enabled: boolean;
  provider: PublishingProvider;
  source_dir: "customer";
  visibility: PublicationVisibility;
  custom_domain?: string;
  r2_bucket?: string;
  r2_prefix?: string;
  access_policy?: string;
  cache_control?: string;
  include_git_commit_sha: boolean;
  publish_integrity_manifest: boolean;
}

@id("ServiceSettings")
model ServiceSettings {
  organization?: string;
  api_base_url?: string;
  account_id?: string;
  regions?: string[];
  profile?: string;
  project_ids?: string[];
  tenant_id?: string;
  subscription_ids?: string[];
  project_refs?: string[];
  team_id?: string;
  contexts?: string[];
  site?: string;
  resource_ids?: string[];
}

@id("ServiceConnection")
model ServiceConnection {
  id: string;
  provider: ServiceProvider;
  kind: ServiceKind;
  enabled: boolean;
  read_only: true;
  auth_refs: string[];
  collect: string[];
  settings: ServiceSettings;
}

@id("EvidencePolicy")
model EvidencePolicy {
  content_addressed: boolean;
  hash: "sha256";
  retain_raw_provider_payloads: boolean;
  write_normalized_evidence: boolean;
  write_collection_manifest: boolean;
  write_provenance: boolean;
}

@id("ReportPolicy")
model ReportPolicy {
  formats: AuditReportFormat[];
  include_framework_crosswalk: boolean;
  include_evidence_gaps: boolean;
  include_remediation: boolean;
  include_limitations: boolean;
}

@id("GitPolicy")
model GitPolicy {
  commit_generated_reports: boolean;
  commit_raw_secrets: false;
  require_clean_worktree: boolean;
  sign_manifest: boolean;
}

@id("SecretSources")
model SecretSources {
  sops_age_file?: string;
  local_env_file?: string;
  vault_paths?: string[];
}

@id("CanonicalAuditConfig")
model CanonicalAuditConfig {
  schema_version: "canonical.audit-config.v1";
  toolchain: ToolchainPolicy;
  customer_id: string;
  display_name: string;
  environment: AuditEnvironment;
  audit_mode: "read-only";
  frameworks: FrameworkSelection;
  interaction: InteractionPolicy;
  security: SecurityPolicy;
  repository: RepositoryLayout;
  publishing: PublishingPolicy;
  services: ServiceConnection[];
  evidence: EvidencePolicy;
  reports: ReportPolicy;
  git: GitPolicy;
  secret_sources?: SecretSources;
}
