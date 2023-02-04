import {
  CarbonCaptureSource,
  InputConfiguration,
  PowerCapacityConfiguration,
  PowerPlantConfiguration,
  PowerPlantType,
  PowerSupplyOption,
  StackReplacementType,
} from "../../types";

type InputMap = { [k: string]: number | string };

const DEFAULT_MAP: InputMap = {
  electrolyserNominalCapacity: 10,
  secAtNominalLoad: 50,
  electrolyserEfficiency: 50,
  waterRequirementOfElectrolyser: 15,
  electrolyserMaximumLoad: 100,
  electrolyserMinimumLoad: 10,
  maximumLoadWhenOverloading: 100,
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
  projectScale: 100,
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
  // TODO work out if these default are correct for methanol
  methanolPlantCapacity: 350,
  methanolPlantUnitCost: 250,
  carbonCapturePlantUnitCost: 0,
  methanolStorageCapacity: 30,
  methanolPlantSec: 0.36,
  methanolPlantMinimumTurndown: 100,
  methanolStorageCost: 227,
  methanolEpcCosts: 0,
  methanolLandProcurementCosts: 0,
  methanolPlantOMCost: 5,
  methanolStorageOMCost: 5,
  ccSec: 0.86,
  ccPlantCost: 420,
  ccEpcCosts: 0,
  ccLandProcurementCosts: 0,
  ccPlantOMCost: 5,
  // TODO work out if these default are correct for methane
  methanePlantCapacity: 350,
  methanePlantUnitCost: 250,
  methaneStorageCapacity: 30,
  methanePlantSec: 0.36,
  methanePlantMinimumTurndown: 100,
  methaneStorageCost: 227,
  methaneEpcCosts: 0,
  methaneLandProcurementCosts: 0,
  methanePlantOMCost: 5,
  methaneStorageOMCost: 5,
  carbonCaptureSource: "Fermentation Plant" as CarbonCaptureSource,
  stackReplacementType: "Cumulative Hours" as StackReplacementType,
  powerPlantConfiguration: "Standalone" as PowerPlantConfiguration,
  powerPlantType: "Wind" as PowerPlantType,
  powerSupplyOption: "Self Build" as PowerSupplyOption,
  powerCapacityConfiguration: "Oversize Ratio" as PowerCapacityConfiguration,
};

class Defaults {
  private defaultInputs: InputMap;

  constructor() {
    if (sessionStorage.getItem("savedData") !== null) {
      const savedData = JSON.parse(sessionStorage.getItem("savedData")!);
      this.defaultInputs = {
        ...DEFAULT_MAP,
        ...savedData,
      };
    } else {
      this.defaultInputs = DEFAULT_MAP;
    }
  }

  get(key: string): number | string {
    return this.defaultInputs[key];
  }

  getNumber(key: string): number {
    return this.defaultInputs[key] as number;
  }

  set(key: string, value: number | string) {
    this.defaultInputs[key] = value;
  }

  all() {
    return this.defaultInputs;
  }
}

// Use as singleton given defaults are global per app context for now.
// This should be parameterised if this ever changes per location
export const DefaultInputs = new Defaults();

export function getDefaultInputs(
  powerfuel: string,
  inputConfiguration: InputConfiguration,
  inputKeys: string[]
): InputMap {
  // fetch saved data or {}
  // if inputConfiguration === 'Basic' and savedData.inputConfiguration === 'Advanced', drop saved state as we don't want advanced state corruping basic case
  // given powerfuel, get from saved data or fall back to map indexed by powerfuel

  const sessionStoragedata: InputMap = JSON.parse(
    sessionStorage.getItem("savedData") || "{}"
  );
  const savedData: InputMap =
    sessionStorage["inputConfiguration"] === "Advanced" &&
    inputConfiguration === "Basic"
      ? {}
      : sessionStoragedata;

  const defaults: InputMap = {};

  // TODO: Pass in powerfuel if defaults differ for each
  inputKeys.forEach((key) => {
    defaults[key] = savedData[key] || DEFAULT_MAP[key];
  });

  return defaults;
}
