export type PowerPlantType = "Solar" | "Wind" | "Hybrid";
export type StackReplacementType =
  | "Cumulative Hours"
  | "Maximum Degradation Level";

export type PowerPlantConfiguration = "Standalone" | "Grid Connected";

export type PowerSupplyOption = "Self Build" | "Power Purchase Agreement (PPA)";

export type PowerCapacityConfiguration = "Nominal Capacity" | "Oversize Ratio";

export type ChartData = { label: string; data: number[] };

export type InputConfiguration = "Basic" | "Advanced";

export const isPPAAgreement = (powerSupplyOption: PowerSupplyOption) =>
  powerSupplyOption === "Power Purchase Agreement (PPA)";
export const isGridConnected = (
  powerPlantConfiguration: PowerPlantConfiguration
) => powerPlantConfiguration === "Grid Connected";

export interface DefaultInput {
  [k: string]: InputProps;
}

export interface InputProps {
  id?: string;
  title: string;
  helperText?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  adornmentLabel?: string | JSX.Element;
}

export interface UserInputFields {
  powerfuel?: string;
  projectScale?: number;
  powerPlantOversizeRatio?: number;
  solarToWindPercentage?: number;
  additionalUpfrontCosts?: number;
  additionalAnnualCosts?: number;
  batteryEpcCosts?: number;
  batteryEfficiency?: number;
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
  electrolyserPurchaseCost: number;
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
  electrolyserMaximumLoad?: number;
  electrolyserMinimumLoad?: number;
  timeBetweenOverloading?: number;
  maximumLoadWhenOverloading?: number;
  waterRequirementOfElectrolyser?: number;
  inflationRate?: number;
  secAtNominalLoad?: number;
  electrolyserEfficiency?: number;
  powerPlantConfiguration?: PowerPlantConfiguration;
  powerSupplyOption?: PowerSupplyOption;
  powerCapacityConfiguration?: PowerCapacityConfiguration;
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
  powerSupplyOption: PowerSupplyOption;
  powerCapacityConfiguration: PowerCapacityConfiguration;
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
  waterSupplyCost: number;

  // Additional costs
  additionalUpfrontCosts: number;
  additionalAnnualCosts: number;

  // Cost analysis
  projectTimeline: number;
  discountRate: number;
  inflationRate: number;

  // Ammonia
  ammoniaPlantCapacity?: number;
  ammoniaStorageCapacity?: number;
  electrolyserSystemOversizing?: number;
  ammoniaPlantSec?: number;
  asuSec?: number;
  hydrogenStorageCapacity?: number;
  ammoniaPlantMinimumTurndown?: number;
  minimumHydrogenStorage?: number;
  // operating costs
  ammoniaSynthesisUnitCost?: number;
  ammoniaStorageCost?: number;
  airSeparationUnitCost?: number;
  ammoniaEpcCosts?: number;
  ammoniaLandProcurementCosts?: number;
  ammoniaPlantOMCost?: number;
  ammoniaStorageOMCost?: number;
  asuPlantOMCost?: number;
}


export interface Model {
  produceResults(): any
}
