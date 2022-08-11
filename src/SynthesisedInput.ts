import {
  DepreciationProfile,
  Inputs,
  PowerPlantConfiguration,
  SECType,
  StackReplacementType,
  Technology,
  UserInputFields,
} from "./types";

class DefaultInputs implements Inputs {
  // Electrolyser
  electrolyserNominalCapacity = 1;
  electrolyserEfficiency = 0;
  electrolyserReferenceCapacity = 10;
  electrolyserCostReductionWithScale = 10;
  electrolyserReferenceFoldIncrease = 1;
  electrolyserEpcCosts = 0;
  electrolyserLandProcurementCost = 0;
  electrolyserPurchaseCost = 1000;
  electrolyserOMCost = 2.5;
  electrolyserStackReplacement = 40;
  electrolyserMaximumLoad = 100;
  electrolyserMinimumLoad = 10;
  timeBetweenOverloading = 0;
  maximumLoadWhenOverloading = 100;
  waterRequirementOfElectrolyser = 10;
  secAtNominalLoad = 33.33;
  profile = "Fixed" as SECType;

  // Battery
  batteryEpcCosts = 0;
  batteryEfficiency = 0;
  batteryMinCharge = 0;
  batteryLandProcurementCost = 0;
  batteryRatedPower = 0;
  batteryCosts = 0;
  batteryOMCost = 0;
  batteryReplacementCost = 0;
  batteryLifetime = 0;
  batteryStorageDuration = 0;

  // Power Plant
  powerPlantConfiguration = "Standalone" as PowerPlantConfiguration;
  technology = "Hybrid" as Technology;
  solarNominalCapacity = 0;
  windNominalCapacity = 0;
  solarReferenceCapacity = 10;
  windReferenceCapacity = 10;
  solarFarmBuildCost = 1200;
  windFarmBuildCost = 1950;
  powerPlantOversizeRatio = 1;
  solarToWindPercentage = 50;
  solarEpcCosts = 0;
  solarLandProcurementCost = 0;
  solarPVCostReductionWithScale = 10;
  solarReferenceFoldIncrease = 1;
  solarDegradation = 0;
  windDegradation = 0;
  solarOpex = 17_000;
  windCostReductionWithScale = 10;
  windEpcCosts = 0;
  windLandProcurementCost = 0;
  windReferenceFoldIncrease = 1;
  windOpex = 25_000;

  // Stack
  stackReplacementType = "Cumulative Hours" as StackReplacementType;
  stackLifetime = 60_000;
  stackDegradation = 0;
  maximumDegradationBeforeReplacement = 0;

  // Grid connection and PPA
  additionalTransmissionCharges = 0;
  principalPPACost = 0;
  gridConnectionCost = 0;
  averageElectricitySpotPrice = 0;
  waterSupplyCost = 0;

  // Additional costs
  additionalUpfrontCosts = 0;
  additionalAnnualCosts = 0;

  // Cost analysis
  projectTimeline = 0;
  hydrogenSalesMargin = 0;
  oxygenRetailPrice = 0;
  discountRate = 0;
  shareOfTotalInvestmentFinancedViaEquity = 0;
  directEquityShare = 100;
  salvageCostShare = 0;
  decommissioningCostShare = 0;
  loanTerm = 10;
  interestOnLoan = 2.5;
  capitalDepreciationProfile = "Straight Line" as DepreciationProfile;
  taxRate = 30;
  inflationRate = 2.5;
}

export default class SynthesisedInputs extends DefaultInputs {
  constructor(userInputs: UserInputFields) {
    super();
    let sanitisedUserInputFields: any = { ...userInputs };

    Object.keys(sanitisedUserInputFields).forEach((key) => {
      if (sanitisedUserInputFields[key] === undefined) {
        delete sanitisedUserInputFields[key];
      }
    });

    return { ...this, ...sanitisedUserInputFields };
  }
}
