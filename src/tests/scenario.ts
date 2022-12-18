import { InputConfiguration, Inputs, UserInputFields } from "../types";

export const defaultInputData: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: Inputs;
} = {
  location: "WA",
  inputConfiguration: "Basic",
  data: {
    powerPlantConfiguration: "Standalone",
    powerSupplyOption: "Self Build",
    // Technically invalid but needed to make existing tests pass
    powerCapacityConfiguration: "Nominal Capacity",
    powerPlantOversizeRatio: 1,
    solarToWindPercentage: 100,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    batteryEpcCosts: 0,
    batteryEfficiency: 0,
    batteryMinCharge: 0,
    batteryLandProcurementCosts: 0,
    batteryRatedPower: 0,
    batteryCosts: 0,
    batteryOMCost: 0,
    batteryReplacementCost: 0,
    batteryLifetime: 0,
    discountRate: 0,
    batteryStorageDuration: 0,
    electrolyserCostReductionWithScale: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCosts: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserOMCost: 0,
    electrolyserStackReplacement: 0,
    gridConnectionCost: 0,
    electrolyserNominalCapacity: 0,
    solarNominalCapacity: 0,
    windNominalCapacity: 0,
    solarReferenceCapacity: 0,
    windReferenceCapacity: 0,
    electrolyserReferenceCapacity: 0,
    electrolyserPurchaseCost: 0,
    solarFarmBuildCost: 0,
    windFarmBuildCost: 0,
    solarEpcCosts: 0,
    solarLandProcurementCosts: 0,
    solarPVCostReductionWithScale: 0,
    solarReferenceFoldIncrease: 0,
    solarOpex: 0,
    stackReplacementType: "Cumulative Hours",
    stackLifetime: 0,
    stackDegradation: 0,
    maximumDegradationBeforeReplacement: 0,
    powerPlantType: "Solar",
    waterSupplyCost: 0,
    windCostReductionWithScale: 0,
    windEpcCosts: 0,
    windLandProcurementCosts: 0,
    windReferenceFoldIncrease: 0,
    windOpex: 0,
    projectTimeline: 0,
    additionalTransmissionCharges: 0,
    principalPPACost: 0,
    solarDegradation: 0,
    windDegradation: 0,
    electrolyserMaximumLoad: 0,
    electrolyserMinimumLoad: 0,
    timeBetweenOverloading: 0,
    maximumLoadWhenOverloading: 0,
    waterRequirementOfElectrolyser: 0,
    inflationRate: 0,
  },
};

export const standaloneSolarWithBatteryScenario: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: UserInputFields;
} = {
  location: "Port Hedland, WA",
  inputConfiguration: "Advanced",
  data: {
    powerPlantConfiguration: "Standalone",
    powerSupplyOption: "Self Build",
    powerPlantType: "Solar",
    powerCapacityConfiguration: "Nominal Capacity",
    powerPlantOversizeRatio: 1,
    solarToWindPercentage: 100,
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 15,
    windNominalCapacity: 0,
    batteryRatedPower: 2,
    batteryStorageDuration: 4,
    secAtNominalLoad: 53.8,
    electrolyserEfficiency: 100,
    electrolyserMaximumLoad: 100,
    electrolyserMinimumLoad: 10,
    maximumLoadWhenOverloading: 0,
    timeBetweenOverloading: 0,
    stackReplacementType: "Cumulative Hours",
    stackLifetime: 60000,
    stackDegradation: 0,
    maximumDegradationBeforeReplacement: 0,
    waterRequirementOfElectrolyser: 10,
    electrolyserReferenceCapacity: 1000,
    electrolyserPurchaseCost: 1038,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 1,
    electrolyserLandProcurementCosts: 0,
    electrolyserOMCost: 2.5,
    electrolyserStackReplacement: 40,
    waterSupplyCost: 5,
    solarReferenceCapacity: 1000,
    solarFarmBuildCost: 799,
    solarPVCostReductionWithScale: 0,
    solarReferenceFoldIncrease: 0,
    solarEpcCosts: 0,
    solarLandProcurementCosts: 1,
    solarOpex: 17000,
    windReferenceCapacity: 1000,
    windFarmBuildCost: 1000,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCosts: 0,
    windOpex: 25000,
    gridConnectionCost: 0,
    additionalTransmissionCharges: 0,
    principalPPACost: 0,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 10,
    batteryCosts: 848,
    batteryEpcCosts: 0,
    batteryLandProcurementCosts: 5,
    batteryOMCost: 19239,
    batteryReplacementCost: 100,
    additionalUpfrontCosts: 100000,
    additionalAnnualCosts: 10000,
    solarDegradation: 0,
    windDegradation: 0,
    projectTimeline: 20,
    discountRate: 7,
    inflationRate: 2.5,
  },
};

export const standaloneAmmoniaSolarWithBatteryScenario: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: UserInputFields;
} = {
  location: "Port Hedland, WA",
  inputConfiguration: "Advanced",
  data: {
    powerfuel: "ammonia",
    powerPlantConfiguration: "Standalone",
    powerSupplyOption: "Self Build",
    powerPlantType: "Solar",
    powerPlantOversizeRatio: 1,
    solarToWindPercentage: 100,
    batteryRatedPower: 2,
    batteryStorageDuration: 4,
    secAtNominalLoad: 53.8,
    electrolyserEfficiency: 100,
    electrolyserMaximumLoad: 100,
    electrolyserMinimumLoad: 10,
    maximumLoadWhenOverloading: 0,
    timeBetweenOverloading: 0,
    stackReplacementType: "Cumulative Hours",
    stackLifetime: 60000,
    stackDegradation: 0,
    maximumDegradationBeforeReplacement: 0,
    waterRequirementOfElectrolyser: 10,
    electrolyserReferenceCapacity: 1000,
    electrolyserPurchaseCost: 1038,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 1,
    electrolyserLandProcurementCosts: 0,
    electrolyserOMCost: 2.5,
    electrolyserStackReplacement: 40,
    waterSupplyCost: 5,
    solarReferenceCapacity: 1000,
    solarFarmBuildCost: 799,
    solarPVCostReductionWithScale: 0,
    solarReferenceFoldIncrease: 0,
    solarEpcCosts: 0,
    solarLandProcurementCosts: 1,
    solarOpex: 17000,
    windReferenceCapacity: 1000,
    windFarmBuildCost: 1000,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCosts: 0,
    windOpex: 25000,
    gridConnectionCost: 0,
    additionalTransmissionCharges: 0,
    principalPPACost: 0,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 10,
    batteryCosts: 848,
    batteryEpcCosts: 0,
    batteryLandProcurementCosts: 5,
    batteryOMCost: 19239,
    batteryReplacementCost: 100,
    additionalUpfrontCosts: 100000,
    additionalAnnualCosts: 10000,
    solarDegradation: 0,
    windDegradation: 0,
    projectTimeline: 20,
    discountRate: 7,
    inflationRate: 2.5,
    // ammonia
    ammoniaPlantCapacity: 50,
    ammoniaStorageCapacity: 30,
    electrolyserSystemOversizing: 45,
    ammoniaPlantSec: 0.41,
    asuSec: 0.22,
    hydrogenStorageCapacity: 49_000,
    ammoniaPlantMinimumTurndown: 33,
    minimumHydrogenStorage: 10,
    ammoniaSynthesisUnitCost: 520,
    ammoniaStorageCost: 1370,
    airSeparationUnitCost: 251,
    ammoniaEpcCosts: 0,
    ammoniaLandProcurementCosts: 0,
    ammoniaPlantOMCost: 2,
    ammoniaStorageOMCost: 2,
    asuPlantOMCost: 2,
    hydrogenStoragePurchaseCost: 878,
    hydrogenStorageOMCost: 2.5,
  },
};

export const standaloneSolarScenario: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: UserInputFields;
} = {
  location: "Fitzroy, QLD",
  inputConfiguration: "Advanced",
  data: {
    powerPlantConfiguration: "Standalone",
    powerSupplyOption: "Self Build",
    powerPlantType: "Solar",
    powerCapacityConfiguration: "Nominal Capacity",
    powerPlantOversizeRatio: 1,
    solarToWindPercentage: 100,
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 15,
    windNominalCapacity: 0,
    batteryRatedPower: 0,
    batteryStorageDuration: 0,
    secAtNominalLoad: 50,
    electrolyserEfficiency: 100,
    electrolyserMaximumLoad: 100,
    electrolyserMinimumLoad: 10,
    maximumLoadWhenOverloading: 0,
    timeBetweenOverloading: 0,
    stackReplacementType: "Cumulative Hours",
    stackLifetime: 60000,
    stackDegradation: 0,
    maximumDegradationBeforeReplacement: 0,
    waterRequirementOfElectrolyser: 10,
    electrolyserReferenceCapacity: 1000,
    electrolyserPurchaseCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCosts: 0,
    electrolyserOMCost: 2.5,
    electrolyserStackReplacement: 40,
    waterSupplyCost: 5,
    solarDegradation: 0,
    windDegradation: 0,
    solarReferenceCapacity: 1000,
    solarFarmBuildCost: 1000,
    solarPVCostReductionWithScale: 0,
    solarReferenceFoldIncrease: 0,
    solarEpcCosts: 0,
    solarLandProcurementCosts: 0,
    solarOpex: 17000,
    windReferenceCapacity: 1000,
    windFarmBuildCost: 1000,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCosts: 0,
    windOpex: 25000,
    gridConnectionCost: 0,
    additionalTransmissionCharges: 0,
    principalPPACost: 0,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 0,
    batteryCosts: 0,
    batteryEpcCosts: 0,
    batteryLandProcurementCosts: 0,
    batteryOMCost: 0,
    batteryReplacementCost: 100,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    projectTimeline: 20,
    discountRate: 7,
    inflationRate: 2.5,
  },
};

export const standaloneAmmoniaSolarScenario: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: UserInputFields;
} = {
  location: "Fitzroy, QLD",
  inputConfiguration: "Advanced",
  data: {
    powerfuel: "ammonia",
    powerPlantConfiguration: "Standalone",
    powerSupplyOption: "Self Build",
    powerPlantType: "Solar",
    powerPlantOversizeRatio: 1,
    solarToWindPercentage: 100,
    batteryRatedPower: 0,
    batteryStorageDuration: 0,
    secAtNominalLoad: 50,
    electrolyserEfficiency: 100,
    electrolyserMaximumLoad: 100,
    electrolyserMinimumLoad: 10,
    maximumLoadWhenOverloading: 0,
    timeBetweenOverloading: 0,
    stackReplacementType: "Cumulative Hours",
    stackLifetime: 60000,
    stackDegradation: 0,
    maximumDegradationBeforeReplacement: 0,
    waterRequirementOfElectrolyser: 10,
    electrolyserReferenceCapacity: 1000,
    electrolyserPurchaseCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCosts: 0,
    electrolyserOMCost: 2.5,
    electrolyserStackReplacement: 40,
    waterSupplyCost: 5,
    solarDegradation: 0,
    windDegradation: 0,
    solarReferenceCapacity: 1000,
    solarFarmBuildCost: 1000,
    solarPVCostReductionWithScale: 0,
    solarReferenceFoldIncrease: 0,
    solarEpcCosts: 0,
    solarLandProcurementCosts: 0,
    solarOpex: 17000,
    windReferenceCapacity: 1000,
    windFarmBuildCost: 1000,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCosts: 0,
    windOpex: 25000,
    gridConnectionCost: 0,
    additionalTransmissionCharges: 0,
    principalPPACost: 0,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 0,
    batteryCosts: 0,
    batteryEpcCosts: 0,
    batteryLandProcurementCosts: 0,
    batteryOMCost: 0,
    batteryReplacementCost: 100,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    projectTimeline: 20,
    discountRate: 7,
    inflationRate: 2.5,
    // ammonia params
    ammoniaPlantCapacity: 50,
    ammoniaStorageCapacity: 30,
    electrolyserSystemOversizing: 45,
    ammoniaPlantSec: 0.41,
    asuSec: 0.22,
    hydrogenStorageCapacity: 49_000,
    ammoniaPlantMinimumTurndown: 33,
    minimumHydrogenStorage: 10,
    ammoniaSynthesisUnitCost: 520,
    ammoniaStorageCost: 1370,
    airSeparationUnitCost: 251,
    ammoniaEpcCosts: 0,
    ammoniaLandProcurementCosts: 0,
    ammoniaPlantOMCost: 2,
    ammoniaStorageOMCost: 2,
    asuPlantOMCost: 2,
    hydrogenStoragePurchaseCost: 878,
    hydrogenStorageOMCost: 2.5,
  },
};

export const standaloneWindScenario: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: UserInputFields;
} = {
  location: "Central West NSW",
  inputConfiguration: "Advanced",
  data: {
    powerPlantConfiguration: "Standalone",
    powerSupplyOption: "Self Build",
    powerPlantType: "Wind",
    powerCapacityConfiguration: "Nominal Capacity",
    powerPlantOversizeRatio: 1,
    solarToWindPercentage: 100,
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 0,
    windNominalCapacity: 12,
    batteryRatedPower: 0,
    batteryStorageDuration: 0,
    secAtNominalLoad: 50,
    electrolyserEfficiency: 100,
    electrolyserMaximumLoad: 100,
    electrolyserMinimumLoad: 10,
    maximumLoadWhenOverloading: 0,
    timeBetweenOverloading: 0,
    stackReplacementType: "Cumulative Hours",
    stackLifetime: 60000,
    stackDegradation: 0,
    maximumDegradationBeforeReplacement: 0,
    waterRequirementOfElectrolyser: 10,
    electrolyserReferenceCapacity: 1000,
    electrolyserPurchaseCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCosts: 0,
    electrolyserOMCost: 2.5,
    electrolyserStackReplacement: 40,
    waterSupplyCost: 5,
    solarDegradation: 0,
    windDegradation: 0,
    solarReferenceCapacity: 0,
    solarFarmBuildCost: 0,
    solarPVCostReductionWithScale: 0,
    solarReferenceFoldIncrease: 0,
    solarEpcCosts: 0,
    solarLandProcurementCosts: 0,
    solarOpex: 0,
    windReferenceCapacity: 1000,
    windFarmBuildCost: 1000,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCosts: 0,
    windOpex: 25000,
    gridConnectionCost: 0,
    additionalTransmissionCharges: 0,
    principalPPACost: 0,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 0,
    batteryCosts: 0,
    batteryEpcCosts: 0,
    batteryLandProcurementCosts: 0,
    batteryOMCost: 0,
    batteryReplacementCost: 100,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    projectTimeline: 20,
    discountRate: 7,
    inflationRate: 2.5,
  },
};

export const windWithPPAScenario: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: UserInputFields;
} = {
  location: "East Riverina Murray Region",
  inputConfiguration: "Advanced",
  data: {
    powerPlantConfiguration: "Standalone",
    powerSupplyOption: "Power Purchase Agreement (PPA)",
    powerPlantType: "Wind",
    powerCapacityConfiguration: "Nominal Capacity",
    powerPlantOversizeRatio: 1,
    solarToWindPercentage: 100,
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 0,
    windNominalCapacity: 15,
    batteryRatedPower: 0,
    batteryStorageDuration: 0,
    secAtNominalLoad: 50,
    electrolyserEfficiency: 100,
    electrolyserMaximumLoad: 100,
    electrolyserMinimumLoad: 10,
    maximumLoadWhenOverloading: 0,
    timeBetweenOverloading: 0,
    stackReplacementType: "Cumulative Hours",
    stackLifetime: 60000,
    stackDegradation: 0,
    maximumDegradationBeforeReplacement: 0,
    waterRequirementOfElectrolyser: 10,
    electrolyserReferenceCapacity: 1000,
    electrolyserPurchaseCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCosts: 0,
    electrolyserOMCost: 2.5,
    electrolyserStackReplacement: 40,
    waterSupplyCost: 5,
    solarDegradation: 0,
    windDegradation: 0,
    solarReferenceCapacity: 0,
    solarFarmBuildCost: 0,
    solarPVCostReductionWithScale: 0,
    solarReferenceFoldIncrease: 0,
    solarEpcCosts: 0,
    solarLandProcurementCosts: 0,
    solarOpex: 0,
    windReferenceCapacity: 0,
    windFarmBuildCost: 0,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCosts: 0,
    windOpex: 0,
    gridConnectionCost: 100_000,
    additionalTransmissionCharges: 1,
    principalPPACost: 3,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 0,
    batteryCosts: 0,
    batteryEpcCosts: 0,
    batteryLandProcurementCosts: 0,
    batteryOMCost: 0,
    batteryReplacementCost: 100,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    projectTimeline: 20,
    discountRate: 7,
    inflationRate: 2.5,
  },
};

export const hybridBatteryGridOversizeRatioScenario: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: UserInputFields;
} = {
  location: "New England",
  inputConfiguration: "Advanced",
  data: {
    powerPlantType: "Hybrid",
    powerPlantOversizeRatio: 1.5,
    solarToWindPercentage: 200 / 3,
    powerPlantConfiguration: "Grid Connected",
    powerSupplyOption: "Self Build",
    powerCapacityConfiguration: "Oversize Ratio",
    electrolyserNominalCapacity: 10,
    batteryRatedPower: 5,
    batteryStorageDuration: 4,
    secAtNominalLoad: 50,
    electrolyserEfficiency: 100,
    electrolyserMaximumLoad: 100,
    electrolyserMinimumLoad: 10,
    maximumLoadWhenOverloading: 0,
    timeBetweenOverloading: 0,
    stackReplacementType: "Cumulative Hours",
    stackLifetime: 60000,
    stackDegradation: 0,
    maximumDegradationBeforeReplacement: 0,
    waterRequirementOfElectrolyser: 10,
    electrolyserReferenceCapacity: 1000,
    electrolyserPurchaseCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCosts: 0,
    electrolyserOMCost: 2.5,
    electrolyserStackReplacement: 40,
    waterSupplyCost: 5,
    solarDegradation: 0,
    windDegradation: 0,
    solarReferenceCapacity: 1000,
    solarFarmBuildCost: 1000,
    solarPVCostReductionWithScale: 0,
    solarReferenceFoldIncrease: 0,
    solarEpcCosts: 0,
    solarLandProcurementCosts: 0,
    solarOpex: 17000,
    windReferenceCapacity: 1000,
    windFarmBuildCost: 1000,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCosts: 0,
    windOpex: 25000,
    gridConnectionCost: 100000,
    additionalTransmissionCharges: 1,
    principalPPACost: 0,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 10,
    batteryCosts: 446,
    batteryEpcCosts: 0,
    batteryLandProcurementCosts: 0,
    batteryOMCost: 19239,
    batteryReplacementCost: 100,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    projectTimeline: 20,
    discountRate: 7,
    inflationRate: 2.5,
  },
};

export const windWithBatteryAndPPAScenario: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: UserInputFields;
} = {
  location: "South West NSW",
  inputConfiguration: "Advanced",
  data: {
    powerPlantConfiguration: "Standalone",
    powerSupplyOption: "Power Purchase Agreement (PPA)",
    powerPlantType: "Wind",
    powerCapacityConfiguration: "Nominal Capacity",
    powerPlantOversizeRatio: 1,
    solarToWindPercentage: 100,
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 0,
    windNominalCapacity: 15,
    batteryRatedPower: 2,
    batteryStorageDuration: 4,
    secAtNominalLoad: 50,
    electrolyserEfficiency: 100,
    electrolyserMaximumLoad: 100,
    electrolyserMinimumLoad: 10,
    maximumLoadWhenOverloading: 0,
    timeBetweenOverloading: 0,
    stackReplacementType: "Cumulative Hours",
    stackLifetime: 60000,
    stackDegradation: 0,
    maximumDegradationBeforeReplacement: 0,
    waterRequirementOfElectrolyser: 10,
    electrolyserReferenceCapacity: 1000,
    electrolyserPurchaseCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCosts: 0,
    electrolyserOMCost: 2.5,
    electrolyserStackReplacement: 40,
    waterSupplyCost: 5,
    solarDegradation: 0,
    windDegradation: 0,
    solarReferenceCapacity: 0,
    solarFarmBuildCost: 0,
    solarPVCostReductionWithScale: 0,
    solarReferenceFoldIncrease: 0,
    solarEpcCosts: 0,
    solarLandProcurementCosts: 0,
    solarOpex: 0,
    windReferenceCapacity: 0,
    windFarmBuildCost: 0,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCosts: 0,
    windOpex: 0,
    gridConnectionCost: 0,
    additionalTransmissionCharges: 1,
    principalPPACost: 0,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 10,
    batteryCosts: 446,
    batteryEpcCosts: 0,
    batteryLandProcurementCosts: 0,
    batteryOMCost: 19239,
    batteryReplacementCost: 100,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    projectTimeline: 20,
    discountRate: 7,
    inflationRate: 2.5,
  },
};

export const basicSolarScenario: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: UserInputFields;
} = {
  location: "Z11",
  inputConfiguration: "Basic",
  data: {
    powerPlantConfiguration: "Standalone",
    powerSupplyOption: "Self Build",
    powerPlantOversizeRatio: 1.5,
    solarToWindPercentage: 100,
    electrolyserPurchaseCost: 1000,
    projectScale: 100,
    electrolyserEfficiency: 100,
    waterSupplyCost: 5,
    solarFarmBuildCost: 1000,
    windFarmBuildCost: 2000,
    projectTimeline: 20,
    discountRate: 7,
  },
};

export const standaloneSolarWithStackDegradationScenario: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: UserInputFields;
} = {
  location: "Tumut, NSW",
  inputConfiguration: "Advanced",
  data: {
    powerPlantConfiguration: "Standalone",
    powerSupplyOption: "Self Build",
    powerPlantType: "Solar",
    powerCapacityConfiguration: "Nominal Capacity",
    powerPlantOversizeRatio: 1,
    solarToWindPercentage: 100,
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 10,
    windNominalCapacity: 0,
    batteryRatedPower: 0,
    batteryStorageDuration: 0,
    secAtNominalLoad: 50,
    electrolyserEfficiency: 100,
    electrolyserMaximumLoad: 100,
    electrolyserMinimumLoad: 10,
    maximumLoadWhenOverloading: 0,
    timeBetweenOverloading: 0,
    stackReplacementType: "Cumulative Hours",
    stackLifetime: 60000,
    stackDegradation: 1,
    maximumDegradationBeforeReplacement: 0,
    waterRequirementOfElectrolyser: 10,
    electrolyserReferenceCapacity: 1000,
    electrolyserPurchaseCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCosts: 0,
    electrolyserOMCost: 2.5,
    electrolyserStackReplacement: 40,
    waterSupplyCost: 5,
    solarDegradation: 0,
    windDegradation: 0,
    solarReferenceCapacity: 1000,
    solarFarmBuildCost: 1000,
    solarPVCostReductionWithScale: 0,
    solarReferenceFoldIncrease: 0,
    solarEpcCosts: 0,
    solarLandProcurementCosts: 0,
    solarOpex: 17000,
    windReferenceCapacity: 0,
    windFarmBuildCost: 0,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCosts: 0,
    windOpex: 0,
    gridConnectionCost: 0,
    additionalTransmissionCharges: 0,
    principalPPACost: 0,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 0,
    batteryCosts: 0,
    batteryEpcCosts: 0,
    batteryLandProcurementCosts: 0,
    batteryOMCost: 0,
    batteryReplacementCost: 0,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    projectTimeline: 20,
    discountRate: 7,
    inflationRate: 2.5,
  },
};

export const standaloneHybridWithDegradationScenario: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: UserInputFields;
} = {
  location: "South East NSW",
  inputConfiguration: "Advanced",
  data: {
    powerPlantConfiguration: "Standalone",
    powerSupplyOption: "Self Build",
    powerPlantType: "Hybrid",
    powerCapacityConfiguration: "Nominal Capacity",
    powerPlantOversizeRatio: 1,
    solarToWindPercentage: 100,
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 15,
    windNominalCapacity: 12,
    batteryRatedPower: 0,
    batteryStorageDuration: 0,
    secAtNominalLoad: 50,
    electrolyserEfficiency: 100,
    electrolyserMaximumLoad: 100,
    electrolyserMinimumLoad: 10,
    maximumLoadWhenOverloading: 0,
    timeBetweenOverloading: 0,
    stackReplacementType: "Cumulative Hours",
    stackLifetime: 60000,
    stackDegradation: 1,
    maximumDegradationBeforeReplacement: 0,
    waterRequirementOfElectrolyser: 10,
    electrolyserReferenceCapacity: 1000,
    electrolyserPurchaseCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCosts: 0,
    electrolyserOMCost: 2.5,
    electrolyserStackReplacement: 40,
    waterSupplyCost: 5,
    solarDegradation: 1,
    windDegradation: 2,
    solarReferenceCapacity: 1000,
    solarFarmBuildCost: 1000,
    solarPVCostReductionWithScale: 0,
    solarReferenceFoldIncrease: 0,
    solarEpcCosts: 0,
    solarLandProcurementCosts: 0,
    solarOpex: 17000,
    windReferenceCapacity: 1000,
    windFarmBuildCost: 1000,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCosts: 0,
    windOpex: 25000,
    gridConnectionCost: 0,
    additionalTransmissionCharges: 0,
    principalPPACost: 0,
    batteryEfficiency: 0,
    batteryMinCharge: 0,
    batteryLifetime: 0,
    batteryCosts: 0,
    batteryEpcCosts: 0,
    batteryLandProcurementCosts: 0,
    batteryOMCost: 0,
    batteryReplacementCost: 0,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    projectTimeline: 20,
    discountRate: 7,
    inflationRate: 2.5,
  },
};

export const standaloneWindWithBatteryAndDegradationScenario: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: UserInputFields;
} = {
  location: "Southern NSW Tablelands",
  inputConfiguration: "Advanced",
  data: {
    powerPlantConfiguration: "Standalone",
    powerSupplyOption: "Self Build",
    powerPlantType: "Wind",
    powerCapacityConfiguration: "Nominal Capacity",
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 0,
    windNominalCapacity: 15,
    batteryRatedPower: 2,
    batteryStorageDuration: 2,
    secAtNominalLoad: 50,
    electrolyserEfficiency: 100,
    electrolyserMaximumLoad: 100,
    electrolyserMinimumLoad: 10,
    maximumLoadWhenOverloading: 0,
    timeBetweenOverloading: 0,
    stackReplacementType: "Maximum Degradation Level",
    stackLifetime: 0,
    stackDegradation: 1,
    maximumDegradationBeforeReplacement: 10,
    waterRequirementOfElectrolyser: 10,
    electrolyserReferenceCapacity: 1000,
    electrolyserPurchaseCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCosts: 0,
    electrolyserOMCost: 2.5,
    electrolyserStackReplacement: 40,
    waterSupplyCost: 5,
    solarDegradation: 0,
    windDegradation: 1,
    solarReferenceCapacity: 1000,
    solarFarmBuildCost: 1000,
    solarPVCostReductionWithScale: 0,
    solarReferenceFoldIncrease: 0,
    solarEpcCosts: 0,
    solarLandProcurementCosts: 0,
    solarOpex: 17000,
    windReferenceCapacity: 1000,
    windFarmBuildCost: 1000,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCosts: 0,
    windOpex: 25000,
    gridConnectionCost: 0,
    additionalTransmissionCharges: 0,
    principalPPACost: 0,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 10,
    batteryCosts: 542,
    batteryEpcCosts: 0,
    batteryLandProcurementCosts: 0,
    batteryOMCost: 9717,
    batteryReplacementCost: 100,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    projectTimeline: 25,
    discountRate: 7,
    inflationRate: 2.5,
  },
};

export const basicHybridPPAScenario: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: UserInputFields;
} = {
  location: "Z1",
  inputConfiguration: "Basic",
  data: {
    powerSupplyOption: "Power Purchase Agreement (PPA)",
    powerPlantOversizeRatio: 2,
    solarToWindPercentage: 50,
    electrolyserPurchaseCost: 1000,
    projectScale: 100_000,
    electrolyserEfficiency: 50,
    waterSupplyCost: 5,
    principalPPACost: 10,
    projectTimeline: 20,
    discountRate: 7,
  },
};
