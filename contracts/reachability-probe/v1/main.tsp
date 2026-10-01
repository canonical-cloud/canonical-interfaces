import "@typespec/json-schema";
using TypeSpec.JsonSchema;

namespace Canonical.ReachabilityProbe.V1;

@id("ReachabilityObservation")
enum ReachabilityObservation {
  connected: "connected",
  refused: "refused",
  timedOut: "timed_out",
  unreachable: "unreachable",
  unresolved: "unresolved",
}

@id("ReachabilityTarget")
model ReachabilityTarget {
  targetId: string;
  host: string;
  port: int32;
}

@id("ReachabilityProbePlan")
model ReachabilityProbePlan {
  specVersion: "canonical.worker.reachability-probe.v1";
  authorizationRefSha256: string;
  planSha256: string;
  perspectiveId: string;
  trustZone: string;
  timeoutSeconds: int32;
  concurrency: int32;
  targets: ReachabilityTarget[];
}

@id("ReachabilityProbeResult")
model ReachabilityProbeResult {
  targetId: string;
  observation: ReachabilityObservation;
  elapsedMillis: int64;
}

@id("ReachabilityProbeResultSet")
model ReachabilityProbeResultSet {
  specVersion: "canonical.worker.reachability-probe-result.v1";
  planSha256: string;
  perspectiveId: string;
  runnerIdentitySha256: string;
  observedAt: string;
  results: ReachabilityProbeResult[];
}
