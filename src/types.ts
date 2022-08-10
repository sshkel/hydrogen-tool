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

export interface BasicDefaultInput {
  [k: string]: SliderProps;
}

export interface SliderProps {
  title: string;
  helperText?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface InputFields {
  additionalUpfrontCost?: number;
  additionalAnnualCosts?: number;
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
  electrolyserCostReductionWithScale?: number;
  electrolyserEpcCosts?: number;
  electrolyserLandProcurementCost?: number;
  electrolyserReferenceFoldIncrease?: number;
  electrolyserOMCost?: number;
  electrolyserStackReplacement?: number;
  gridConnectionCost?: number;
  electrolyserNominalCapacity?: number;
  solarNominalCapacity?: number;
  windNominalCapacity?: number;
  solarReferenceCapacity?: number;
  windReferenceCapacity?: number;
  electrolyserReferenceCapacity?: number;
  electrolyserCapitalCost?: number;
  solarFarmBuildCost?: number;
  windFarmBuildCost?: number;
  solarEpcCosts?: number;
  solarLandProcurementCost?: number;
  solarPVCostReductionWithScale?: number;
  solarReferenceFoldIncrease?: number;
  solarDegradation?: number;
  windDegradation?: number;
  solarOpex?: number;
  stackReplacementType?: StackReplacementType;
  stackLifetime?: number;
  stackDegradation?: number;
  maximumDegradationBeforeReplacement?: number;
  technology?: Technology;
  waterSupplyCost?: number;
  windCostReductionWithScale?: number;
  windEpcCosts?: number;
  windLandProcurementCost?: number;
  windReferenceFoldIncrease?: number;
  windOpex?: number;
  projectTimeline?: number;
  additionalTransmissionCharges?: number;
  principalPPACost?: number;
  profile?: SECType;
  electrolyserMaximumLoad?: number;
  electrolyserMinimumLoad?: number;
  timeBetweenOverloading?: number;
  maximumLoadWhenOverloading?: number;
  waterRequirementOfElectrolyser?: number;
  hydrogenSalesMargin?: number;
  oxygenRetailPrice?: number;
  averageElectricitySpotPrice?: number;
  shareOfTotalInvestmentFinancedViaEquity?: number;
  directEquityShare?: number;
  salvageCostShare?: number;
  decommissioningCostShare?: number;
  loanTerm?: number;
  interestOnLoan?: number;
  capitalDepreciationProfile?: DepreciationProfile;
  taxRate?: number;
  inflationRate?: number;
  secAtNominalLoad?: number;
  electrolyserEfficiency?: number;
  powerPlantConfiguration?: PowerPlantConfiguration;
}

export interface SynthesisedInputs {
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
  electrolyserCapitalCost: number;
  solarFarmBuildCost: number;
  windFarmBuildCost: number;
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
  waterSupplyCost: number;
  windCostReductionWithScale: number;
  windEpcCosts: number;
  windLandProcurementCost: number;
  windReferenceFoldIncrease: number;
  windOpex?: number;
  projectTimeline: number;
  additionalTransmissionCharges?: number;
  principalPPACost?: number;
  profile: SECType;
  electrolyserMaximumLoad: number;
  electrolyserMinimumLoad: number;
  timeBetweenOverloading: number;
  maximumLoadWhenOverloading: number;
  waterRequirementOfElectrolyser: number;
  hydrogenSalesMargin: number;
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
  electrolyserEfficiency?: number;
  powerPlantConfiguration: PowerPlantConfiguration;
}
