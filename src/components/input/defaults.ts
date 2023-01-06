class Defaults {
  private defaultInputs: { [k: string]: number };

  constructor() {
    const savedData =
      localStorage.getItem("savedData") !== null
        ? JSON.parse(localStorage.getItem("savedData")!)
        : undefined;

    this.defaultInputs = savedData || {
      electrolyserNominalCapacity: 10,
      secAtNominalLoad: 50,
      electrolyserEfficiency: 50,
      waterRequirementOfElectrolyser: 15,
      electrolyserMaximumLoad: 100,
      electrolyserMinimumLoad: 10,
      maximumLoadWhenOverloading: 0,
      timeBetweenOverloading: 0,
      stackDegradation: 0.0,
      stackLifetime: 80_000,
      maximumDegradationBeforeReplacement: 0,
      electrolyserReferenceCapacity: 1000,
      electrolyserPurchaseCost: 1000,
      electrolyserCostReductionWithScale: 10,
      electrolyserReferenceFoldIncrease: 10,
      electrolyserEpcCosts: 30,
      electrolyserLandProcurementCosts: 6,
      electrolyserOMCost: 2.5,
      electrolyserStackReplacement: 40,
      waterSupplyCost: 5,
      solarNominalCapacity: 10,
      windNominalCapacity: 10,
      powerPlantOversizeRatio: 2,
      solarToWindPercentage: 50,
      solarDegradation: 0,
      windDegradation: 0,
      solarFarmBuildCost: 1200,
      solarReferenceCapacity: 1000,
      solarPVCostReductionWithScale: 10,
      solarReferenceFoldIncrease: 10,
      windFarmBuildCost: 2000,
      windReferenceCapacity: 1000,
      windCostReductionWithScale: 10,
      windReferenceFoldIncrease: 10,
      solarEpcCosts: 30,
      solarLandProcurementCosts: 6,
      windEpcCosts: 30,
      windLandProcurementCosts: 6,
      solarOpex: 17000,
      windOpex: 25000,
      principalPPACost: 0,
      gridConnectionCost: 0,
      additionalTransmissionCharges: 0,
      batteryRatedPower: 0,
      batteryStorageDuration: 0,
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
      projectTimeline: 20,
      discountRate: 7,
      inflationRate: 2.5,
      projectScale: 100_000,
      // TODO work out if these default are correct for ammonia
      ammoniaPlantCapacity: 50,
      ammoniaStorageCapacity: 30,
      electrolyserSystemOversizing: 45,
      ammoniaPlantSec: 0.6,
      asuSec: 0.22,
      hydrogenStorageCapacity: 50_000,
      ammoniaPlantMinimumTurndown: 50,
      minimumHydrogenStorage: 10,
      ammoniaSynthesisUnitCost: 0,
      ammoniaStorageCost: 0,
      airSeparationUnitCost: 0,
      ammoniaEpcCosts: 0,
      ammoniaLandProcurementCosts: 0,
      ammoniaPlantOMCost: 2,
      ammoniaStorageOMCost: 0,
      asuPlantOMCost: 0,
      hydrogenStoragePurchaseCost: 0,
      hydrogenStorageOMCost: 0,
      ammoniaPlantCapitalCost: 900,
    };
  }

  get(key: string) {
    return this.defaultInputs[key];
  }

  set(key: string, value: number) {
    this.defaultInputs[key] = value;
  }
}

// Use as singleton given defaults are global per app context for now.
// This should be parameterised if this ever changes per location
export const DefaultInputs = new Defaults();
