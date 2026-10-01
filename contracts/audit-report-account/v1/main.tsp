import "@typespec/json-schema";
using TypeSpec.JsonSchema;

namespace Canonical.AuditReportAccount.V1;

@id("AuditReportOwnerKind")
enum AuditReportOwnerKind {
  user: "user",
  org: "org",
}

@id("AuditReportSource")
enum AuditReportSource {
  canonicalCli: "canonical-cli",
  canonicalCompanyAuditor: "canonical-company-auditor",
  ci: "ci",
}

@id("AuditReportReceiptStatus")
enum AuditReportReceiptStatus {
  accepted: "accepted",
  duplicate: "duplicate",
}

@id("AuditReportProblemCode")
enum AuditReportProblemCode {
  invalidRequest: "invalid-request",
  invalidDigest: "invalid-digest",
  unauthorizedOwner: "unauthorized-owner",
  reportConflict: "report-conflict",
  rateLimited: "rate-limited",
  storageUnavailable: "storage-unavailable",
  internal: "internal",
}

@id("AuditReportOwner")
model AuditReportOwner {
  kind: AuditReportOwnerKind;
  id: string;
}

@id("AuditReportCreateMetadata")
model AuditReportCreateMetadata {
  specVersion: "canonical.audit.report.metadata.v1";
  owner: AuditReportOwner;
  programId: string;
  programVersion: string;
  programDigest: string;
  reportDigest: string;
  createdAt: string;
  source: AuditReportSource;
  labels?: string[];
}

@id("AuditReportRecord")
model AuditReportRecord {
  specVersion: "canonical.audit.report.record.v1";
  reportId: string;
  owner: AuditReportOwner;
  subjectId: string;
  programId: string;
  programVersion: string;
  programDigest: string;
  reportDigest: string;
  createdAt: string;
  receivedAt: string;
  source: AuditReportSource;
  labels?: string[];
}

@id("AuditReportReceipt")
model AuditReportReceipt {
  specVersion: "canonical.audit.report.receipt.v1";
  reportId: string;
  owner: AuditReportOwner;
  reportDigest: string;
  status: AuditReportReceiptStatus;
  duplicate: boolean;
  receivedAt: string;
}

@id("AuditReportProblem")
model AuditReportProblem {
  specVersion: "canonical.audit.report.problem.v1";
  code: AuditReportProblemCode;
  message: string;
  requestId: string;
}
