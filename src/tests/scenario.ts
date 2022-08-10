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
    powerPlantOversizeRatio: 1,
    solarToWindPercentage: 100,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    batteryEpcCosts: 0,
    batteryEfficiency: 0,
    batteryMinCharge: 0,
    batteryLandProcurementCost: 0,
    batteryRatedPower: 0,
    batteryCosts: 0,
    batteryOMCost: 0,
    batteryReplacementCost: 0,
    batteryLifetime: 0,
    discountRate: 0,
    batteryStorageDuration: 0,
    electrolyserCostReductionWithScale: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCost: 0,
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
    electrolyserCapitalCost: 0,
    solarFarmBuildCost: 0,
    windFarmBuildCost: 0,
    solarEpcCosts: 0,
    solarLandProcurementCost: 0,
    solarPVCostReductionWithScale: 0,
    solarReferenceFoldIncrease: 0,
    solarOpex: 0,
    stackReplacementType: "Cumulative Hours",
    stackLifetime: 0,
    stackDegradation: 0,
    maximumDegradationBeforeReplacement: 0,
    technology: "Solar",
    waterSupplyCost: 0,
    windCostReductionWithScale: 0,
    windEpcCosts: 0,
    windLandProcurementCost: 0,
    windReferenceFoldIncrease: 0,
    windOpex: 0,
    projectTimeline: 0,
    additionalTransmissionCharges: 0,
    principalPPACost: 0,
    profile: "Fixed",
    solarDegradation: 0,
    windDegradation: 0,
    electrolyserMaximumLoad: 0,
    electrolyserMinimumLoad: 0,
    timeBetweenOverloading: 0,
    maximumLoadWhenOverloading: 0,
    waterRequirementOfElectrolyser: 0,
    hydrogenSalesMargin: 0,
    oxygenRetailPrice: 0,
    averageElectricitySpotPrice: 0,
    shareOfTotalInvestmentFinancedViaEquity: 0,
    directEquityShare: 0,
    salvageCostShare: 0,
    decommissioningCostShare: 0,
    loanTerm: 0,
    interestOnLoan: 0,
    capitalDepreciationProfile: "Straight Line",
    taxRate: 0,
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
    technology: "Solar",
    powerPlantOversizeRatio: 1.5,
    solarToWindPercentage: 100,
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 15,
    windNominalCapacity: 0,
    batteryRatedPower: 2,
    batteryStorageDuration: 4,
    profile: "Fixed",
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
    electrolyserCapitalCost: 1038,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 1,
    electrolyserLandProcurementCost: 0,
    electrolyserOMCost: 2.5,
    electrolyserStackReplacement: 40,
    waterSupplyCost: 5,
    solarReferenceCapacity: 1000,
    solarFarmBuildCost: 799,
    solarPVCostReductionWithScale: 0,
    solarReferenceFoldIncrease: 0,
    solarEpcCosts: 0,
    solarLandProcurementCost: 1,
    solarOpex: 17000,
    windReferenceCapacity: 1000,
    windFarmBuildCost: 1000,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCost: 0,
    windOpex: 25000,
    gridConnectionCost: 0,
    additionalTransmissionCharges: 0,
    principalPPACost: 0,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 10,
    batteryCosts: 848,
    batteryEpcCosts: 0,
    batteryLandProcurementCost: 5,
    batteryOMCost: 19239,
    batteryReplacementCost: 100,
    additionalUpfrontCosts: 100000,
    additionalAnnualCosts: 10000,
    hydrogenSalesMargin: 1,
    averageElectricitySpotPrice: 0,
    oxygenRetailPrice: 0,
    solarDegradation: 0,
    windDegradation: 0,
    projectTimeline: 20,
    discountRate: 7,
    shareOfTotalInvestmentFinancedViaEquity: 70,
    directEquityShare: 100,
    loanTerm: 10,
    interestOnLoan: 2.5,
    salvageCostShare: 10,
    decommissioningCostShare: 10,
    inflationRate: 2.5,
    taxRate: 30,
    capitalDepreciationProfile: "Straight Line",
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
    technology: "Solar",
    powerPlantOversizeRatio: 1.5,
    solarToWindPercentage: 100,
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 15,
    windNominalCapacity: 0,
    batteryRatedPower: 0,
    batteryStorageDuration: 0,
    profile: "Fixed",
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
    electrolyserCapitalCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCost: 0,
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
    solarLandProcurementCost: 0,
    solarOpex: 17000,
    windReferenceCapacity: 1000,
    windFarmBuildCost: 1000,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCost: 0,
    windOpex: 25000,
    gridConnectionCost: 0,
    additionalTransmissionCharges: 0,
    principalPPACost: 0,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 0,
    batteryCosts: 0,
    batteryEpcCosts: 0,
    batteryLandProcurementCost: 0,
    batteryOMCost: 0,
    batteryReplacementCost: 100,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    hydrogenSalesMargin: 1,
    averageElectricitySpotPrice: 0,
    oxygenRetailPrice: 0,
    projectTimeline: 20,
    discountRate: 7,
    shareOfTotalInvestmentFinancedViaEquity: 70,
    directEquityShare: 100,
    loanTerm: 10,
    interestOnLoan: 2.5,
    salvageCostShare: 10,
    decommissioningCostShare: 10,
    inflationRate: 2.5,
    taxRate: 30,
    capitalDepreciationProfile: "Straight Line",
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
    technology: "Wind",
    powerPlantOversizeRatio: 1.2,
    solarToWindPercentage: 0,
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 0,
    windNominalCapacity: 12,
    batteryRatedPower: 0,
    batteryStorageDuration: 0,
    profile: "Fixed",
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
    electrolyserCapitalCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCost: 0,
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
    solarLandProcurementCost: 0,
    solarOpex: 0,
    windReferenceCapacity: 1000,
    windFarmBuildCost: 1000,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCost: 0,
    windOpex: 25000,
    gridConnectionCost: 0,
    additionalTransmissionCharges: 0,
    principalPPACost: 0,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 0,
    batteryCosts: 0,
    batteryEpcCosts: 0,
    batteryLandProcurementCost: 0,
    batteryOMCost: 0,
    batteryReplacementCost: 100,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    hydrogenSalesMargin: 1,
    averageElectricitySpotPrice: 0,
    oxygenRetailPrice: 0,
    projectTimeline: 20,
    discountRate: 7,
    shareOfTotalInvestmentFinancedViaEquity: 70,
    directEquityShare: 100,
    loanTerm: 10,
    interestOnLoan: 2.5,
    salvageCostShare: 10,
    decommissioningCostShare: 10,
    inflationRate: 2.5,
    taxRate: 30,
    capitalDepreciationProfile: "Straight Line",
  },
};

export const windWithPPAScenario: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: UserInputFields;
} = {
  location: "Wagga Wagga, NSW",
  inputConfiguration: "Advanced",
  data: {
    powerPlantConfiguration: "PPA Agreement",
    technology: "Wind",
    powerPlantOversizeRatio: 1.5,
    solarToWindPercentage: 0,
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 0,
    windNominalCapacity: 15,
    batteryRatedPower: 0,
    batteryStorageDuration: 0,
    profile: "Fixed",
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
    electrolyserCapitalCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCost: 0,
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
    solarLandProcurementCost: 0,
    solarOpex: 0,
    windReferenceCapacity: 0,
    windFarmBuildCost: 0,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCost: 0,
    windOpex: 0,
    gridConnectionCost: 100_000,
    additionalTransmissionCharges: 1,
    principalPPACost: 3,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 0,
    batteryCosts: 0,
    batteryEpcCosts: 0,
    batteryLandProcurementCost: 0,
    batteryOMCost: 0,
    batteryReplacementCost: 100,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    hydrogenSalesMargin: 1,
    averageElectricitySpotPrice: 0,
    oxygenRetailPrice: 0,
    projectTimeline: 20,
    discountRate: 7,
    shareOfTotalInvestmentFinancedViaEquity: 70,
    directEquityShare: 100,
    loanTerm: 10,
    interestOnLoan: 2.5,
    salvageCostShare: 10,
    decommissioningCostShare: 10,
    inflationRate: 2.5,
    taxRate: 30,
    capitalDepreciationProfile: "Straight Line",
  },
};

export const hybridBatteryGridSurplusRetailScenario: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: UserInputFields;
} = {
  location: "New England",
  inputConfiguration: "Advanced",
  data: {
    technology: "Hybrid",
    powerPlantOversizeRatio: 1.5,
    solarToWindPercentage: 66.66666,
    powerPlantConfiguration: "Grid Connected with Surplus Retailed",
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 10,
    windNominalCapacity: 5,
    batteryRatedPower: 5,
    batteryStorageDuration: 4,
    profile: "Fixed",
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
    electrolyserCapitalCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCost: 0,
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
    solarLandProcurementCost: 0,
    solarOpex: 17000,
    windReferenceCapacity: 1000,
    windFarmBuildCost: 1000,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCost: 0,
    windOpex: 25000,
    gridConnectionCost: 100000,
    additionalTransmissionCharges: 1,
    principalPPACost: 0,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 10,
    batteryCosts: 446,
    batteryEpcCosts: 0,
    batteryLandProcurementCost: 0,
    batteryOMCost: 19239,
    batteryReplacementCost: 100,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    hydrogenSalesMargin: 1,
    averageElectricitySpotPrice: 0,
    oxygenRetailPrice: 0,
    projectTimeline: 20,
    discountRate: 7,
    shareOfTotalInvestmentFinancedViaEquity: 70,
    directEquityShare: 100,
    loanTerm: 10,
    interestOnLoan: 2.5,
    salvageCostShare: 10,
    decommissioningCostShare: 10,
    inflationRate: 2.5,
    taxRate: 30,
    capitalDepreciationProfile: "Straight Line",
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
    powerPlantConfiguration: "PPA Agreement",
    technology: "Wind",
    powerPlantOversizeRatio: 1.5,
    solarToWindPercentage: 0,
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 0,
    windNominalCapacity: 15,
    batteryRatedPower: 2,
    batteryStorageDuration: 4,
    profile: "Fixed",
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
    electrolyserCapitalCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCost: 0,
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
    solarLandProcurementCost: 0,
    solarOpex: 0,
    windReferenceCapacity: 0,
    windFarmBuildCost: 0,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCost: 0,
    windOpex: 0,
    gridConnectionCost: 0,
    additionalTransmissionCharges: 1,
    principalPPACost: 0,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 10,
    batteryCosts: 446,
    batteryEpcCosts: 0,
    batteryLandProcurementCost: 0,
    batteryOMCost: 19239,
    batteryReplacementCost: 100,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    hydrogenSalesMargin: 1,
    averageElectricitySpotPrice: 0,
    oxygenRetailPrice: 0,
    projectTimeline: 20,
    discountRate: 7,
    shareOfTotalInvestmentFinancedViaEquity: 70,
    directEquityShare: 100,
    loanTerm: 10,
    interestOnLoan: 2.5,
    salvageCostShare: 10,
    decommissioningCostShare: 10,
    inflationRate: 2.5,
    taxRate: 30,
    capitalDepreciationProfile: "Straight Line",
  },
};

export const gridSolarWithRetailAndAdditionalRevenueStreamsScenario: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: UserInputFields;
} = {
  location: "Fitzroy, QLD",
  inputConfiguration: "Advanced",
  data: {
    powerPlantConfiguration: "Grid Connected with Surplus Retailed",
    technology: "Solar",
    powerPlantOversizeRatio: 1.5,
    solarToWindPercentage: 100,
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 15,
    windNominalCapacity: 0,
    batteryRatedPower: 0,
    batteryStorageDuration: 0,
    profile: "Fixed",
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
    electrolyserCapitalCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCost: 0,
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
    solarLandProcurementCost: 0,
    solarOpex: 17000,
    windReferenceCapacity: 1000,
    windFarmBuildCost: 1000,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCost: 0,
    windOpex: 25000,
    gridConnectionCost: 0,
    additionalTransmissionCharges: 0,
    principalPPACost: 0,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 0,
    batteryCosts: 0,
    batteryEpcCosts: 0,
    batteryLandProcurementCost: 0,
    batteryOMCost: 0,
    batteryReplacementCost: 100,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    hydrogenSalesMargin: 1,
    averageElectricitySpotPrice: 10,
    oxygenRetailPrice: 10,
    projectTimeline: 20,
    discountRate: 7,
    shareOfTotalInvestmentFinancedViaEquity: 70,
    directEquityShare: 100,
    loanTerm: 10,
    interestOnLoan: 2.5,
    salvageCostShare: 10,
    decommissioningCostShare: 10,
    inflationRate: 2.5,
    taxRate: 30,
    capitalDepreciationProfile: "Straight Line",
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
    technology: "Solar",
    powerPlantOversizeRatio: 1,
    solarToWindPercentage: 100,
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 10,
    windNominalCapacity: 0,
    batteryRatedPower: 0,
    batteryStorageDuration: 0,
    profile: "Fixed",
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
    electrolyserCapitalCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCost: 0,
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
    solarLandProcurementCost: 0,
    solarOpex: 17000,
    windReferenceCapacity: 0,
    windFarmBuildCost: 0,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCost: 0,
    windOpex: 0,
    gridConnectionCost: 0,
    additionalTransmissionCharges: 0,
    principalPPACost: 0,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 0,
    batteryCosts: 0,
    batteryEpcCosts: 0,
    batteryLandProcurementCost: 0,
    batteryOMCost: 0,
    batteryReplacementCost: 0,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    hydrogenSalesMargin: 3,
    averageElectricitySpotPrice: 0,
    oxygenRetailPrice: 10,
    projectTimeline: 20,
    discountRate: 7,
    shareOfTotalInvestmentFinancedViaEquity: 70,
    directEquityShare: 100,
    loanTerm: 10,
    interestOnLoan: 2.5,
    salvageCostShare: 10,
    decommissioningCostShare: 10,
    inflationRate: 2.5,
    taxRate: 30,
    capitalDepreciationProfile: "Straight Line",
  },
};

export const standaloneHybridWithDegradationScenario: {
  location: string;
  inputConfiguration: InputConfiguration;
  data: UserInputFields;
} = {
  location: "Cooma Monaro, NSW",
  inputConfiguration: "Advanced",
  data: {
    powerPlantConfiguration: "Standalone",
    technology: "Hybrid",
    powerPlantOversizeRatio: 1,
    solarToWindPercentage: 57.692307,
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 15,
    windNominalCapacity: 12,
    batteryRatedPower: 0,
    batteryStorageDuration: 0,
    profile: "Fixed",
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
    electrolyserCapitalCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCost: 0,
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
    solarLandProcurementCost: 0,
    solarOpex: 17000,
    windReferenceCapacity: 1000,
    windFarmBuildCost: 1000,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCost: 0,
    windOpex: 25000,
    gridConnectionCost: 0,
    additionalTransmissionCharges: 0,
    principalPPACost: 0,
    batteryEfficiency: 0,
    batteryMinCharge: 0,
    batteryLifetime: 0,
    batteryCosts: 0,
    batteryEpcCosts: 0,
    batteryLandProcurementCost: 0,
    batteryOMCost: 0,
    batteryReplacementCost: 0,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    hydrogenSalesMargin: 1,
    averageElectricitySpotPrice: 0,
    oxygenRetailPrice: 0,
    projectTimeline: 20,
    discountRate: 7,
    shareOfTotalInvestmentFinancedViaEquity: 70,
    directEquityShare: 100,
    loanTerm: 10,
    interestOnLoan: 2.5,
    salvageCostShare: 0,
    decommissioningCostShare: 0,
    inflationRate: 2.5,
    taxRate: 30,
    capitalDepreciationProfile: "Straight Line",
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
    technology: "Wind",
    electrolyserNominalCapacity: 10,
    solarNominalCapacity: 0,
    windNominalCapacity: 15,
    batteryRatedPower: 2,
    batteryStorageDuration: 2,
    profile: "Fixed",
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
    electrolyserCapitalCost: 1000,
    electrolyserCostReductionWithScale: 0,
    electrolyserReferenceFoldIncrease: 0,
    electrolyserEpcCosts: 0,
    electrolyserLandProcurementCost: 0,
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
    solarLandProcurementCost: 0,
    solarOpex: 17000,
    windReferenceCapacity: 1000,
    windFarmBuildCost: 1000,
    windCostReductionWithScale: 0,
    windReferenceFoldIncrease: 0,
    windEpcCosts: 0,
    windLandProcurementCost: 0,
    windOpex: 25000,
    gridConnectionCost: 0,
    additionalTransmissionCharges: 0,
    principalPPACost: 0,
    batteryEfficiency: 90,
    batteryMinCharge: 0,
    batteryLifetime: 10,
    batteryCosts: 542,
    batteryEpcCosts: 0,
    batteryLandProcurementCost: 0,
    batteryOMCost: 9717,
    batteryReplacementCost: 100,
    additionalUpfrontCosts: 0,
    additionalAnnualCosts: 0,
    hydrogenSalesMargin: 1,
    averageElectricitySpotPrice: 0,
    oxygenRetailPrice: 0,
    projectTimeline: 25,
    discountRate: 7,
    shareOfTotalInvestmentFinancedViaEquity: 70,
    directEquityShare: 100,
    loanTerm: 10,
    interestOnLoan: 2.5,
    salvageCostShare: 10,
    decommissioningCostShare: 10,
    inflationRate: 2.5,
    taxRate: 30,
    capitalDepreciationProfile: "MACRs - 3 year Schedule",
  },
};
