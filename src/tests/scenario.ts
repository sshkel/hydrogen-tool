import { InputFields } from "../types";

export const solarPvWithBatteryScenario: InputFields = {
  location: "Port Hedland, WA",
  ppaAgreement: "false",
  technology: "Solar",
  electrolyserNominalCapacity: 10,
  solarNominalCapacity: 15,
  windNominalCapacity: 0,
  batteryRatedPower: 2,
  durationOfStorage: 4,
  batteryNominalCapacity: 8,
  profile: "Fixed",
  secAtNominalLoad: 53.8,
  secCorrectionFactor: 100,
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
  electrolyserReferencePurchaseCost: 1038,
  electrolyserCostReductionWithScale: 0,
  electrolyserReferenceFoldIncrease: 0,
  electrolyserEpcCosts: 1,
  electrolyserLandProcurementCost: 0,
  electrolyserOMCost: 2.5,
  electrolyserStackReplacement: 40,
  electrolyserWaterCost: 5,
  solarReferenceCapacity: 1000,
  solarPVFarmReferenceCost: 799,
  solarPVCostReductionWithScale: 0,
  solarReferenceFoldIncrease: 0,
  solarEpcCosts: 0,
  solarLandProcurementCost: 1,
  solarOpex: 17000,
  windReferenceCapacity: 1000,
  windFarmReferenceCost: 1000,
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
  salesMargin: 1,
  averageElectricitySpotPrice: 0,
  oxygenRetailPrice: 0,
  plantLife: 20,
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
};
