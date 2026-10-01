import "@typespec/json-schema";
using TypeSpec.JsonSchema;

namespace Canonical.ComplianceRpc.V1;

@id("OperationId")
enum OperationId {
  evidenceUpload: "compliance.evidence.upload",
  evidenceVerify: "compliance.evidence.verify",
  assessmentRun: "compliance.assessment.run",
  findingAcknowledge: "compliance.finding.acknowledge",
  auditRequestCreate: "audit.request.create",
  auditWorkpaperSubmit: "audit.workpaper.submit",
  auditWorkpaperApprove: "audit.workpaper.approve",
  connectionVerify: "integration.connection.verify",
  connectionPermissions: "integration.connection.permissions",
  reportGenerate: "report.generate",
}

@id("ProblemCategory")
enum ProblemCategory {
  validation: "validation",
  authentication: "authentication",
  authorization: "authorization",
  integrity: "integrity",
  conflict: "conflict",
  quota: "quota",
  unavailable: "unavailable",
  internal: "internal",
}

@id("ProblemCode")
enum ProblemCode {
  invalidRequest: "INVALID_REQUEST",
  unauthenticated: "UNAUTHENTICATED",
  forbidden: "FORBIDDEN",
  evidenceDigestMismatch: "EVIDENCE_DIGEST_MISMATCH",
  idempotencyKeyReused: "IDEMPOTENCY_KEY_REUSED",
  connectionPrivilegeDrift: "CONNECTION_PRIVILEGE_DRIFT",
  rateLimited: "RATE_LIMITED",
  serviceUnavailable: "SERVICE_UNAVAILABLE",
  internal: "INTERNAL",
}

@id("AuthStrength")
enum AuthStrength {
  session: "session",
  mfa: "mfa",
  phishingResistant: "phishing-resistant",
  service: "service",
}

@id("RpcRequestMeta")
model RpcRequestMeta {
  requestId: string;
  idempotencyKey?: string;
  deadlineUnixMs?: int64;
  traceparent?: string;
}

/**
 * Caller-controlled RPC envelope. Identity and tenant authority are deliberately
 * absent. The authenticated server constructs RequestContext only after the
 * transport/authentication boundary succeeds.
 */
@id("RpcCall")
model RpcCall {
  specVersion: "canonical.compliance.rpc.call.v1";
  operation: OperationId;
  meta: RpcRequestMeta;
  payload: unknown;
}

@id("RequestContext")
model RequestContext {
  specVersion: "canonical.compliance.rpc.context.v1";
  tenantId: string;
  actorId: string;
  sessionId: string;
  roles: string[];
  scopes: string[];
  authStrength: AuthStrength;
  traceId: string;
}

@id("RemediationHint")
model RemediationHint {
  code: string;
}

@id("RpcProblem")
model RpcProblem {
  specVersion: "canonical.compliance.rpc.problem.v1";
  code: ProblemCode;
  category: ProblemCategory;
  message: string;
  retryable: boolean;
  traceId: string;
  incidentId?: string;
  remediation?: RemediationHint;
}
