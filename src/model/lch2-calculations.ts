import {
  PowerPlantConfiguration,
  PowerSupplyOption,
  isGridConnected,
  isPPAAgreement,
} from "../types";
import { fillYearsArray } from "../utils";

export function generateLCBreakdown(
  powerPlantConfiguration: PowerPlantConfiguration,
  powerSupplyOption: PowerSupplyOption,
  powerPlantCAPEX: number,
  hydrogenProductionCost: number,
  electrolyserCAPEX: number,
  totalIndirectCosts: number,
  projectTimeline: number,
  powerPlantOpexCost: number,
  electrolyserOpexCost: number,
  additionalAnnualCosts: number,
  discountRate: number,
  batteryOpexCost: number,
  batteryReplacementCostsOverProjectLife: number[],
  batteryCAPEX: number,
  waterOpexCost: number[],
  additionalUpfrontCosts: number,
  stackReplacementCostsOverProjectLife: number[],
  electricityConsumed: number[],
  electricityConsumedByBattery: number[],
  principalPPACost: number,
  gridConnectionOpexPerYear: number[],
  gridConnectionCAPEX: number
) {
  const gridConnected: boolean = isGridConnected(powerPlantConfiguration);
  const ppaAgreement: boolean = isPPAAgreement(powerSupplyOption);

  const lcPowerPlantCAPEX = powerPlantCAPEX / hydrogenProductionCost;
  const lcElectrolyserCAPEX = electrolyserCAPEX / hydrogenProductionCost;
  const lcIndirectCosts = totalIndirectCosts / hydrogenProductionCost;

  const powerPlantOpexPerYear = Array(projectTimeline).fill(powerPlantOpexCost);
  const electrolyserOpexPerYear =
    Array(projectTimeline).fill(electrolyserOpexCost);
  const additionalAnnualCostsPerYear = Array(projectTimeline).fill(
    additionalAnnualCosts
  );

  const calculateLevelisedCost = getLevelisedCostCalculation(
    discountRate,
    projectTimeline,
    hydrogenProductionCost
  );

  const lcPowerPlantOPEX = calculateLevelisedCost(powerPlantOpexPerYear);
  const lcElectrolyserOPEX = calculateLevelisedCost(electrolyserOpexPerYear);

  const batteryCostPerYear: number[] = fillYearsArray(
    projectTimeline,
    (i) => batteryOpexCost + batteryReplacementCostsOverProjectLife[i]
  );

  const lcBattery = calculateLevelisedCost(batteryCostPerYear, batteryCAPEX);
  const lcWater = calculateLevelisedCost(waterOpexCost);

  const lcAdditionalCosts = calculateLevelisedCost(
    additionalAnnualCostsPerYear,
    additionalUpfrontCosts
  );

  const lcStackReplacement = calculateLevelisedCost(
    stackReplacementCostsOverProjectLife
  );

  const ppaCostOfElectricityConsumed = fillYearsArray(
    projectTimeline,
    (i) =>
      (electricityConsumed[i] + electricityConsumedByBattery[i]) *
      principalPPACost
  );
  const lcElectricityPurchase = ppaAgreement
    ? calculateLevelisedCost(ppaCostOfElectricityConsumed)
    : 0;

  const lcGridConnection =
    gridConnected || ppaAgreement
      ? calculateLevelisedCost(gridConnectionOpexPerYear, gridConnectionCAPEX)
      : 0;
  return {
    lcPowerPlantCAPEX,
    lcElectrolyserCAPEX,
    lcIndirectCosts,
    lcPowerPlantOPEX,
    lcElectrolyserOPEX,
    lcElectricityPurchase,
    lcStackReplacement,
    lcWater,
    lcBattery,
    lcGridConnection,
    lcAdditionalCosts,
  };
}

export function generateAmmoniaLCH2Breakdown(
  h2StorageCAPEX: number,
  ammoniaPlantCAPEX: number,
  h2StorageOpexCost: number,
  ammoniaPlantOpexCost: number,
  hydrogenProductionCost: number,
  projectTimeline: number,
  discountRate: number
) {
  const lcH2StorageCAPEX = h2StorageCAPEX / hydrogenProductionCost;
  const lcAmmoniaPlantCAPEX = ammoniaPlantCAPEX / hydrogenProductionCost;

  const h2StorageOpexPerYear = Array(projectTimeline).fill(h2StorageOpexCost);
  const ammoniaPlantOpexPerYear =
    Array(projectTimeline).fill(ammoniaPlantOpexCost);

  const calculateLevelisedCost = getLevelisedCostCalculation(
    discountRate,
    projectTimeline,
    hydrogenProductionCost
  );

  const lcH2StorageOPEX = calculateLevelisedCost(h2StorageOpexPerYear);
  const lcAmmoniaPlantOPEX = calculateLevelisedCost(ammoniaPlantOpexPerYear);

  return {
    lcH2StorageCAPEX,
    lcAmmoniaPlantCAPEX,
    lcH2StorageOPEX,
    lcAmmoniaPlantOPEX,
  };
}

export function generateMeLCH2Breakdown(
  h2StorageCAPEX: number,
  mePlantCAPEX: number,
  ccCAPEX: number,
  h2StorageOpexCost: number,
  mePlantOpexCost: number,
  ccOpexCost: number,
  hydrogenProductionCost: number,
  projectTimeline: number,
  discountRate: number
) {
  const lcH2StorageCAPEX = h2StorageCAPEX / hydrogenProductionCost;
  const lcMePlantCAPEX = mePlantCAPEX / hydrogenProductionCost;
  const lcCarbonCaptureCAPEX = ccCAPEX / hydrogenProductionCost;

  const h2StorageOpexPerYear = Array(projectTimeline).fill(h2StorageOpexCost);
  const mePlantOpexPerYear = Array(projectTimeline).fill(mePlantOpexCost);
  const ccOpexPerYear = Array(projectTimeline).fill(ccOpexCost);

  const calculateLevelisedCost = getLevelisedCostCalculation(
    discountRate,
    projectTimeline,
    hydrogenProductionCost
  );

  const lcH2StorageOPEX = calculateLevelisedCost(h2StorageOpexPerYear);
  const lcMePlantOPEX = calculateLevelisedCost(mePlantOpexPerYear);
  const lcCarbonCaptureOPEX = calculateLevelisedCost(ccOpexPerYear);

  return {
    lcH2StorageCAPEX,
    lcMePlantCAPEX: lcMePlantCAPEX,
    lcCarbonCaptureCAPEX,
    lcH2StorageOPEX,
    lcMePlantOPEX: lcMePlantOPEX,
    lcCarbonCaptureOPEX,
  };
}

function getLevelisedCostCalculation(
  discountRate: number,
  years: number,
  hydrogenProductionCost: number
) {
  return (opexValues: number[], additionalCAPEX: number = 0) => {
    let sum = 0;
    for (let i = 1; i <= years; i++) {
      // Need to minus 1 as assuming opexValues is zero indexes
      sum += opexValues[i - 1] / (1 + discountRate) ** i;
    }
    return (sum + additionalCAPEX) / hydrogenProductionCost;
  };
}
