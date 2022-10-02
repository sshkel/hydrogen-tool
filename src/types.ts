export type PowerPlantType = "Solar" | "Wind" | "Hybrid";
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

export type InputConfiguration = "Basic" | "Advanced";

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

export interface AdvancedDefaultInput {
  [k: string]: InputNumberFieldProps;
}

export interface SliderProps {
  title: string;
  helperText?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface InputNumberFieldProps {
  title: string;
  id?: string;
  defaultValue?: string | number;
  value?: number;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  adornmentLabel?: string | JSX.Element;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export interface UserInputFields {
  projectScale?: number;
  powerPlantOversizeRatio?: number;
  solarToWindPercentage?: number;
  additionalUpfrontCosts?: number;
  additionalAnnualCosts?: number;
  batteryEpcCosts?: number;
  batteryEfficiency: number;
  batteryMinCharge?: number;
  batteryLandProcurementCosts?: number;
  batteryRatedPower?: number;
  batteryCosts?: number;
  batteryOMCost?: number;
  batteryReplacementCost?: number;
  batteryLifetime?: number;
  discountRate: number;
  batteryStorageDuration?: number;
  electrolyserCostReductionWithScale?: number;
  electrolyserEpcCosts?: number;
  electrolyserLandProcurementCosts?: number;
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
  electrolyserPurchaseCost?: number;
  solarFarmBuildCost?: number;
  windFarmBuildCost?: number;
  solarEpcCosts?: number;
  solarLandProcurementCosts?: number;
  solarPVCostReductionWithScale?: number;
  solarReferenceFoldIncrease?: number;
  solarDegradation?: number;
  windDegradation?: number;
  solarOpex?: number;
  stackReplacementType?: StackReplacementType;
  stackLifetime?: number;
  stackDegradation?: number;
  maximumDegradationBeforeReplacement?: number;
  powerPlantType?: PowerPlantType;
  waterSupplyCost?: number;
  windCostReductionWithScale?: number;
  windEpcCosts?: number;
  windLandProcurementCosts?: number;
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

export interface Inputs {
  // Electrolyser
  electrolyserNominalCapacity: number;
  electrolyserReferenceCapacity: number;
  electrolyserEfficiency?: number;
  electrolyserCostReductionWithScale: number;
  electrolyserReferenceFoldIncrease: number;
  electrolyserEpcCosts: number;
  electrolyserLandProcurementCosts: number;
  electrolyserPurchaseCost: number;
  electrolyserOMCost: number;
  electrolyserStackReplacement: number;
  electrolyserMaximumLoad: number;
  electrolyserMinimumLoad: number;
  timeBetweenOverloading: number;
  maximumLoadWhenOverloading: number;
  waterRequirementOfElectrolyser: number;
  secAtNominalLoad?: number;
  profile: SECType;

  // Battery
  batteryEpcCosts?: number;
  batteryEfficiency: number;
  batteryMinCharge?: number;
  batteryLandProcurementCosts?: number;
  batteryRatedPower?: number;
  batteryCosts?: number;
  batteryOMCost?: number;
  batteryReplacementCost?: number;
  batteryLifetime?: number;
  batteryStorageDuration?: number;

  // Power Plant
  powerPlantConfiguration: PowerPlantConfiguration;
  powerPlantType: PowerPlantType;
  solarNominalCapacity: number;
  windNominalCapacity: number;
  solarReferenceCapacity: number;
  windReferenceCapacity: number;
  solarFarmBuildCost: number;
  windFarmBuildCost: number;
  powerPlantOversizeRatio: number;
  solarToWindPercentage: number;
  solarEpcCosts: number;
  solarLandProcurementCosts: number;
  solarPVCostReductionWithScale: number;
  solarReferenceFoldIncrease: number;
  solarDegradation: number;
  windDegradation: number;
  solarOpex?: number;
  windCostReductionWithScale: number;
  windEpcCosts: number;
  windLandProcurementCosts: number;
  windReferenceFoldIncrease: number;
  windOpex?: number;

  // Stack
  stackReplacementType: StackReplacementType;
  stackLifetime: number;
  stackDegradation: number;
  maximumDegradationBeforeReplacement: number;

  // Grid connection and PPA
  additionalTransmissionCharges?: number;
  principalPPACost?: number;
  gridConnectionCost: number;
  averageElectricitySpotPrice: number;
  waterSupplyCost: number;

  // Additional costs
  additionalUpfrontCosts: number;
  additionalAnnualCosts: number;

  // Cost analysis
  projectTimeline: number;
  hydrogenSalesMargin: number;
  oxygenRetailPrice: number;
  discountRate: number;
  shareOfTotalInvestmentFinancedViaEquity: number;
  directEquityShare: number;
  salvageCostShare: number;
  decommissioningCostShare: number;
  loanTerm: number;
  interestOnLoan: number;
  capitalDepreciationProfile: DepreciationProfile;
  taxRate: number;
  inflationRate: number;
}
