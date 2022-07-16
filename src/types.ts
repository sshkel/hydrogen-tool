export type Technology = "Solar" | "Wind" | "Hybrid";
export type SECType = "Fixed" | "Variable";
export type StackReplacementType =
  | "Cumulative Hours"
  | "Maximum Degradation Level";

export type DepreciationProfile =
  | "Straight Line"
  | "MACRs - 3 year Schedule"
  | "MACRs - 5 year Schedule"
  | "MACRs - 7 year Schedule"
  | "MACRs - 10 year Schedule"
  | "MACRs - 15 year Schedule"
  | "MACRs - 20 year Schedule";

export type PowerPlantConfiguration =
  | "Standalone"
  | "Grid Connected"
  | "PPA Agreement"
  | "Grid Connected with Surplus Retailed";

export type ChartData = { label: string; data: number[] };

export const isPPAAgreement = (
  powerPlantConfiguration: PowerPlantConfiguration
) => powerPlantConfiguration === "PPA Agreement";
export const isGridConnected = (
  powerPlantConfiguration: PowerPlantConfiguration
) =>
  powerPlantConfiguration === "Grid Connected" ||
  powerPlantConfiguration === "Grid Connected with Surplus Retailed";
export const isRetailed = (powerPlantConfiguration: PowerPlantConfiguration) =>
  powerPlantConfiguration === "Grid Connected with Surplus Retailed";

export interface InputFields {
  additionalUpfrontCosts: number;
  additionalAnnualCosts: number;
  batteryEpcCosts?: number;
  batteryEfficiency: number;
  batteryMinCharge?: number;
  batteryLandProcurementCost?: number;
  batteryRatedPower?: number;
  batteryCosts?: number;
  batteryOMCost?: number;
  batteryReplacementCost?: number;
  batteryLifetime?: number;
  discountRate: number;
  batteryStorageDuration?: number;
  electrolyserCostReductionWithScale: number;
  electrolyserEpcCosts: number;
  electrolyserLandProcurementCost: number;
  electrolyserReferenceFoldIncrease: number;
  electrolyserOMCost: number;
  electrolyserStackReplacement: number;
  gridConnectionCost: number;
  electrolyserNominalCapacity: number;
  solarNominalCapacity: number;
  windNominalCapacity: number;
  solarReferenceCapacity: number;
  windReferenceCapacity: number;
  electrolyserReferenceCapacity: number;
  electrolyserReferencePurchaseCost: number;
  solarPVFarmReferenceCost: number;
  windFarmReferenceCost: number;
  solarEpcCosts: number;
  solarLandProcurementCost: number;
  solarPVCostReductionWithScale: number;
  solarReferenceFoldIncrease: number;
  solarDegradation: number;
  windDegradation: number;
  solarOpex?: number;
  stackReplacementType: StackReplacementType;
  stackLifetime: number;
  stackDegradation: number;
  maximumDegradationBeforeReplacement: number;
  technology: Technology;
  electrolyserWaterCost: number;
  windCostReductionWithScale: number;
  windEpcCosts: number;
  windLandProcurementCost: number;
  windReferenceFoldIncrease: number;
  windOpex?: number;
  plantLife: number;
  additionalTransmissionCharges?: number;
  principalPPACost?: number;
  profile: SECType;
  location: string;
  electrolyserMaximumLoad: number;
  electrolyserMinimumLoad: number;
  timeBetweenOverloading: number;
  maximumLoadWhenOverloading: number;
  waterRequirementOfElectrolyser: number;
  salesMargin: number;
  oxygenRetailPrice: number;
  averageElectricitySpotPrice: number;
  shareOfTotalInvestmentFinancedViaEquity: number;
  directEquityShare: number;
  salvageCostShare: number;
  decommissioningCostShare: number;
  loanTerm: number;
  interestOnLoan: number;
  capitalDepreciationProfile: DepreciationProfile;
  taxRate: number;
  inflationRate: number;
  secAtNominalLoad?: number;
  secCorrectionFactor?: number;
  powerPlantConfiguration: PowerPlantConfiguration;
}
