model NineWeekSpeed { weeks: 9; label: "9 weeks"; baseUsd: 5000; note: string; }
model FiveWeekSpeed { weeks: 5; label: "5 weeks"; baseUsd: 7500; note: string; }
model ThreeWeekSpeed { weeks: 3; label: "3 weeks"; baseUsd: 10500; note: string; }
union Speed { nineWeek: NineWeekSpeed, fiveWeek: FiveWeekSpeed, threeWeek: ThreeWeekSpeed }

model Soc2Standard { id: "soc2"; label: "SOC 2"; amountUsd: 0; }
model Iso27001Standard { id: "iso27001"; label: "ISO 27001"; amountUsd: 750; }
model NistStandard { id: "nist"; label: "NIST CSF / 800-series"; amountUsd: 500; }
model GdprStandard { id: "gdpr"; label: "GDPR"; amountUsd: 750; }
model HipaaStandard { id: "hipaa"; label: "HIPAA"; amountUsd: 1000; }
model PciStandard { id: "pci"; label: "PCI DSS"; amountUsd: 1000; }
model FedRampStandard { id: "fedramp"; label: "FedRAMP readiness"; amountUsd: 1750; }
model CisStandard { id: "cis"; label: "CIS Controls"; amountUsd: 350; }
union Standard { soc2: Soc2Standard, iso27001: Iso27001Standard, nist: NistStandard, gdpr: GdprStandard, hipaa: HipaaStandard, pci: PciStandard, fedramp: FedRampStandard, cis: CisStandard }

model AdvisoryDepth { id: "advisory"; label: "Advisory"; amountUsd: 0; note: string; }
model ManagedDepth { id: "managed"; label: "Managed readiness"; amountUsd: 1500; note: string; }
model RemediationDepth { id: "remediation"; label: "Hands-on remediation"; amountUsd: 3000; note: string; }
union DeliveryDepth { advisory: AdvisoryDepth, managed: ManagedDepth, remediation: RemediationDepth }

model FocusedComplexity { id: "focused"; label: "Focused scope"; amountUsd: 0; note: string; }
model GrowingComplexity { id: "growing"; label: "Growing environment"; amountUsd: 1000; note: string; }
model ComplexComplexity { id: "complex"; label: "Complex / regulated"; amountUsd: 2000; note: string; }
union Complexity { focused: FocusedComplexity, growing: GrowingComplexity, complex: ComplexComplexity }

model StartupStage { id: "startup"; label: "Startup"; multiplier: 0.95; note: string; }
model BusinessStage { id: "business"; label: "Business"; multiplier: 1.0; note: string; }
model EnterpriseStage { id: "enterprise"; label: "Enterprise"; multiplier: 1.12; note: string; }
union CompanyStage { startup: StartupStage, business: BusinessStage, enterprise: EnterpriseStage }

model Employees1To10 { id: "1-10"; label: "1–10 employees"; min: 1; max: 10; amountUsd: 0; }
model Employees11To50 { id: "11-50"; label: "11–50 employees"; min: 11; max: 50; amountUsd: 500; }
model Employees51To200 { id: "51-200"; label: "51–200 employees"; min: 51; max: 200; amountUsd: 1250; }
model Employees201To1000 { id: "201-1000"; label: "201–1,000 employees"; min: 201; max: 1000; amountUsd: 2500; }
model Employees1001Plus { id: "1001-plus"; label: "1,001+ employees"; min: 1001; max: 1000000; amountUsd: 4000; }
union EmployeeBand { oneToTen: Employees1To10, elevenToFifty: Employees11To50, fiftyOneToTwoHundred: Employees51To200, twoHundredOneToOneThousand: Employees201To1000, oneThousandOnePlus: Employees1001Plus }

model TechnologySector { id: "technology"; label: "Technology / SaaS"; amountUsd: 0; }
model ProfessionalServicesSector { id: "professional-services"; label: "Professional services"; amountUsd: 0; }
model FinancialServicesSector { id: "financial-services"; label: "Financial services / fintech"; amountUsd: 0; }
model HealthcareSector { id: "healthcare"; label: "Healthcare / life sciences"; amountUsd: 0; }
model RetailSector { id: "retail"; label: "Retail / ecommerce"; amountUsd: 0; }
model PublicSector { id: "public-sector"; label: "Public sector / defense"; amountUsd: 0; }
model OtherSector { id: "other"; label: "Other"; amountUsd: 0; }
union Sector { technology: TechnologySector, professionalServices: ProfessionalServicesSector, financialServices: FinancialServicesSector, healthcare: HealthcareSector, retail: RetailSector, publicSector: PublicSector, other: OtherSector }

union DefaultStandardId { soc2: "soc2", iso27001: "iso27001" }
model EstimatorDefaults {
  speedWeeks: 5;
  standardIds: DefaultStandardId[];
  deliveryDepthId: "managed";
  complexityId: "growing";
  companyStageId: "business";
  employeeCount: 50;
  sectorId: "technology";
}

model PublicQuoteEstimatorConfig {
  schemaVersion: 2;
  currency: "USD";
  estimateFloorUsd: 5000;
  estimateCeilingUsd: 25000;
  midpointFloorUsd: 5500;
  midpointCeilingUsd: 22000;
  roundToUsd: 500;
  lowerFactor: 0.9;
  upperFactor: 1.12;
  speeds: Speed[];
  standards: Standard[];
  deliveryDepths: DeliveryDepth[];
  complexities: Complexity[];
  companyStages: CompanyStage[];
  employeeBands: EmployeeBand[];
  sectors: Sector[];
  defaults: EstimatorDefaults;
}
