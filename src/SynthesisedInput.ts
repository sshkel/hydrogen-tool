import {
  Inputs,
  PowerCapacityConfiguration,
  PowerPlantConfiguration,
  PowerPlantType,
  PowerSupplyOption,
  StackReplacementType,
  UserInputFields,
} from "./types";

class DefaultInputs implements Inputs {
  // Electrolyser
  electrolyserNominalCapacity = 1;
  electrolyserEfficiency = 100;
  electrolyserReferenceCapacity = 1000;
  electrolyserCostReductionWithScale = 10;
  electrolyserReferenceFoldIncrease = 10;
  electrolyserEpcCosts = 30;
  electrolyserLandProcurementCosts = 6;
  electrolyserPurchaseCost = 1500;
  electrolyserOMCost = 2.5;
  electrolyserStackReplacement = 40;
  electrolyserMaximumLoad = 100;
  electrolyserMinimumLoad = 10;
  timeBetweenOverloading = 0;
  maximumLoadWhenOverloading = 0;
  waterRequirementOfElectrolyser = 15;
  secAtNominalLoad = 33.33;

  // Battery
  batteryEpcCosts = 0;
  batteryEfficiency = 0;
  batteryMinCharge = 0;
  batteryLandProcurementCosts = 0;
  batteryRatedPower = 0;
  batteryCosts = 0;
  batteryOMCost = 0;
  batteryReplacementCost = 0;
  batteryLifetime = 0;
  batteryStorageDuration = 0;

  // Power Plant
  powerPlantConfiguration = "Standalone" as PowerPlantConfiguration;
  powerPlantType = "Hybrid" as PowerPlantType;
  powerSupplyOption = "Self Build" as PowerSupplyOption;
  powerCapacityConfiguration = "Oversize Ratio" as PowerCapacityConfiguration;
  solarNominalCapacity = 0;
  windNominalCapacity = 0;
  solarReferenceCapacity = 10;
  windReferenceCapacity = 10;
  solarFarmBuildCost = 1200;
  windFarmBuildCost = 2000;
  powerPlantOversizeRatio = 1;
  solarToWindPercentage = 100;
  solarEpcCosts = 30;
  solarLandProcurementCosts = 6;
  solarPVCostReductionWithScale = 10;
  solarReferenceFoldIncrease = 10;
  solarDegradation = 0;
  windDegradation = 0;
  solarOpex = 17_000;
  windCostReductionWithScale = 10;
  windEpcCosts = 30;
  windLandProcurementCosts = 6;
  windReferenceFoldIncrease = 10;
  windOpex = 25_000;

  // Stack
  stackReplacementType = "Cumulative Hours" as StackReplacementType;
  stackLifetime = 80_000;
  stackDegradation = 0;
  maximumDegradationBeforeReplacement = 0;

  // Grid connection and PPA
  additionalTransmissionCharges = 0;
  principalPPACost = 0;
  gridConnectionCost = 0;
  waterSupplyCost = 5;

  // Additional costs
  additionalUpfrontCosts = 0;
  additionalAnnualCosts = 0;

  // Cost analysis
  projectTimeline = 20;
  discountRate = 7;
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
