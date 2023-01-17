import {
  InputConfiguration,
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
  powerPlantOversizeRatio = 1;
  solarToWindPercentage = 100;
  solarNominalCapacity = 0;
  windNominalCapacity = 0;
  solarReferenceCapacity = 10;
  windReferenceCapacity = 10;
  solarFarmBuildCost = 1200;
  windFarmBuildCost = 2000;
  solarEpcCosts = 30;
  solarLandProcurementCosts = 6;
  solarPVCostReductionWithScale = 10;
  solarReferenceFoldIncrease = 10;
  solarOpex = 17_000;
  windCostReductionWithScale = 10;
  windEpcCosts = 30;
  windLandProcurementCosts = 6;
  windReferenceFoldIncrease = 10;
  windOpex = 25_000;
  solarDegradation = 0;
  windDegradation = 0;

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
  // Ammonia
  ammoniaPlantCapacity = 50;
  ammoniaStorageCapacity = 30;
  electrolyserSystemOversizing = 45;
  ammoniaPlantSec = 0.41;
  asuSec = 0.22;
  hydrogenStorageCapacity = 49_000;
  ammoniaPlantMinimumTurndown = 33;
  minimumHydrogenStorage = 10;
  ammoniaSynthesisUnitCost = 520;
  ammoniaStorageCost = 1370;
  airSeparationUnitCost = 251;
  ammoniaEpcCosts = 0;
  ammoniaLandProcurementCosts = 0;
  ammoniaPlantOMCost = 2;
  ammoniaStorageOMCost = 2;
  asuPlantOMCost = 2;
  hydrogenStoragePurchaseCost = 878;
  hydrogenStorageOMCost = 2.5;
  ammoniaPlantCapitalCost = 0;
  // Methanol
  methanolPlantCapacity = 365;
  methanolStorageCapacity = 30;
  methanolPlantUnitCost = 250;
  methanolPlantSec = 0.36;
  methanolPlantMinimumTurndown = 100;
  methanolStorageCost = 227;
  methanolEpcCosts = 0;
  methanolLandProcurementCosts = 0;
  methanolPlantOMCost = 5;
  methanolStorageOMCost = 5;
  ccSec = 0.86;
  ccEpcCosts = 0;
  ccLandProcurementCosts = 0;
  ccPlantOMCost = 5;
  ccPlantCost = 420;
  // Methane
  methanePlantCapacity = 365;
  methaneStorageCapacity = 30;
  methanePlantUnitCost = 250;
  methanePlantSec = 0.36;
  methanePlantMinimumTurndown = 100;
  methaneStorageCost = 227;
  methaneEpcCosts = 0;
  methaneLandProcurementCosts = 0;
  methanePlantOMCost = 5;
  methaneStorageOMCost = 5;
}

export default class SynthesisedInputs extends DefaultInputs {
  constructor(
    userInputs: UserInputFields,
    inputConfiguration: InputConfiguration
  ) {
    super();
    let savedData = JSON.parse(localStorage.getItem("savedData") || "{}");
    let sanitisedUserInputFields: any = { ...userInputs };

    if (savedData["inputConfiguration"] !== inputConfiguration) {
      // Don't read from local storage if configuration does not match
      savedData = {};
    }

    Object.keys(sanitisedUserInputFields).forEach((key) => {
      if (savedData[key] === undefined) {
        delete savedData[key];
      }
      if (sanitisedUserInputFields[key] === undefined) {
        delete sanitisedUserInputFields[key];
      }
    });

    const form = {
      inputConfiguration: inputConfiguration,
      ...this,
      ...savedData,
      ...sanitisedUserInputFields,
    };
    localStorage.setItem("savedData", JSON.stringify(form));

    return form;
  }
}
