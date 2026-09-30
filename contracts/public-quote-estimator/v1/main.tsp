model NineWeekSpeed {
  weeks: 9;
  label: "9 weeks";
  baseUsd: 5000;
  note: string;
}

model FiveWeekSpeed {
  weeks: 5;
  label: "5 weeks";
  baseUsd: 7500;
  note: string;
}

model ThreeWeekSpeed {
  weeks: 3;
  label: "3 weeks";
  baseUsd: 10500;
  note: string;
}

model Soc2Standard {
  id: "soc2";
  label: "SOC 2";
  amountUsd: 0;
}

model Iso27001Standard {
  id: "iso27001";
  label: "ISO 27001";
  amountUsd: 750;
}

model NistStandard {
  id: "nist";
  label: "NIST CSF / 800-series";
  amountUsd: 500;
}

model GdprStandard {
  id: "gdpr";
  label: "GDPR";
  amountUsd: 750;
}

model HipaaStandard {
  id: "hipaa";
  label: "HIPAA";
  amountUsd: 1000;
}

model PciStandard {
  id: "pci";
  label: "PCI DSS";
  amountUsd: 1000;
}

model FedRampStandard {
  id: "fedramp";
  label: "FedRAMP";
  amountUsd: 1750;
}

model CisStandard {
  id: "cis";
  label: "CIS Controls";
  amountUsd: 350;
}

model AdvisoryDepth {
  id: "advisory";
  label: "Advisory";
  amountUsd: 0;
  note: string;
}

model ManagedDepth {
  id: "managed";
  label: "Managed readiness";
  amountUsd: 1500;
  note: string;
}

model RemediationDepth {
  id: "remediation";
  label: "Hands-on remediation";
  amountUsd: 3000;
  note: string;
}

model FocusedComplexity {
  id: "focused";
  label: "Focused scope";
  amountUsd: 0;
  note: string;
}

model GrowingComplexity {
  id: "growing";
  label: "Growing environment";
  amountUsd: 1000;
  note: string;
}

model ComplexComplexity {
  id: "complex";
  label: "Complex / regulated";
  amountUsd: 2000;
  note: string;
}

model EstimatorDefaults {
  speedWeeks: 5;
  standardIds: ["soc2", "iso27001"];
  deliveryDepthId: "managed";
  complexityId: "growing";
}

model PublicQuoteEstimatorConfig {
  schemaVersion: 1;
  currency: "USD";
  estimateFloorUsd: 5000;
  estimateCeilingUsd: 15000;
  midpointFloorUsd: 5500;
  midpointCeilingUsd: 13500;
  roundToUsd: 500;
  lowerFactor: 0.9;
  upperFactor: 1.12;
  speeds: [NineWeekSpeed, FiveWeekSpeed, ThreeWeekSpeed];
  standards: [Soc2Standard, Iso27001Standard, NistStandard, GdprStandard, HipaaStandard, PciStandard, FedRampStandard, CisStandard];
  deliveryDepths: [AdvisoryDepth, ManagedDepth, RemediationDepth];
  complexities: [FocusedComplexity, GrowingComplexity, ComplexComplexity];
  defaults: EstimatorDefaults;
}
