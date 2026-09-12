model FoundationReadinessTier {
  id: "foundation-readiness";
  name: "Foundation Readiness";
  monthlyUsd: 2500;
}

model ManagedReadinessTier {
  id: "managed-readiness";
  name: "Managed Readiness";
  monthlyUsd: 7500;
}

model AssuranceEngineeringTier {
  id: "assurance-engineering";
  name: "Assurance Engineering";
  monthlyUsd: 20000;
}

union ServiceTier {
  foundation: FoundationReadinessTier,
  managed: ManagedReadinessTier,
  assurance: AssuranceEngineeringTier,
}

union PublicationStatus {
  proposed: "proposed",
  approved: "approved",
  retired: "retired",
}

model ServiceTierCatalog {
  schemaVersion: 1;
  publicationStatus: PublicationStatus;
  currency: "USD";
  asOf: string;
  tiers: ServiceTier[];
}
