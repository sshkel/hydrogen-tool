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
  additionalUpfrontCosts = 0;
  additionalAnnualCosts = 0;
  batteryEpcCosts = 0;
  batteryEfficiency = 0;
  batteryMinCharge = 0;
  batteryLandProcurementCost = 0;
  batteryRatedPower = 0;
  batteryCosts = 0;
  batteryOMCost = 0;
  batteryReplacementCost = 0;
  batteryLifetime = 0;
  discountRate = 0;
  batteryStorageDuration = 0;
  electrolyserCostReductionWithScale = 0;
  electrolyserEpcCosts = 0;
  electrolyserLandProcurementCost = 0;
  electrolyserReferenceFoldIncrease = 0;
  electrolyserOMCost = 0;
  electrolyserStackReplacement = 0;
  gridConnectionCost = 0;
  electrolyserNominalCapacity = 1;
  solarNominalCapacity = 0;
  windNominalCapacity = 0;
  solarReferenceCapacity = 0;
  windReferenceCapacity = 0;
  electrolyserReferenceCapacity = 0;
  electrolyserCapitalCost = 0;
  solarFarmBuildCost = 0;
  windFarmBuildCost = 0;
  solarEpcCosts = 0;
  solarLandProcurementCost = 0;
  solarPVCostReductionWithScale = 0;
  solarReferenceFoldIncrease = 0;
  solarDegradation = 0;
  windDegradation = 0;
  solarOpex = 0;
  stackReplacementType = "Cumulative Hours" as StackReplacementType;
  stackLifetime = 0;
  stackDegradation = 0;
  maximumDegradationBeforeReplacement = 0;
  technology = "Hybrid" as Technology;
  waterSupplyCost = 0;
  windCostReductionWithScale = 0;
  windEpcCosts = 0;
  windLandProcurementCost = 0;
  windReferenceFoldIncrease = 0;
  windOpex = 0;
  projectTimeline = 0;
  additionalTransmissionCharges = 0;
  principalPPACost = 0;
  profile = "Fixed" as SECType;
  electrolyserMaximumLoad = 100;
  electrolyserMinimumLoad = 10;
  timeBetweenOverloading = 0;
  maximumLoadWhenOverloading = 0;
  waterRequirementOfElectrolyser = 0;
  hydrogenSalesMargin = 0;
  oxygenRetailPrice = 0;
  averageElectricitySpotPrice = 0;
  shareOfTotalInvestmentFinancedViaEquity = 0;
  directEquityShare = 0;
  salvageCostShare = 0;
  decommissioningCostShare = 0;
  loanTerm = 0;
  interestOnLoan = 0;
  capitalDepreciationProfile = "Straight Line" as DepreciationProfile;
  taxRate = 0;
  inflationRate = 0;
  secAtNominalLoad = 1 / 3;
  electrolyserEfficiency = 0;
  powerPlantConfiguration = "Standalone" as PowerPlantConfiguration;
}

export default class SynthesisedInputs extends DefaultInputs {
  constructor(userInputs: UserInputFields) {
    super();
    console.log("This input 1", this);
    let sanitisedUserInputFields: any = { ...userInputs };

    console.log("This input 1", this);

    Object.keys(sanitisedUserInputFields).forEach((key) => {
      if (sanitisedUserInputFields[key] === undefined) {
        delete sanitisedUserInputFields[key];
      }
    });

    console.log("This input 2", sanitisedUserInputFields);
    return { ...this, ...sanitisedUserInputFields };
  }
}
