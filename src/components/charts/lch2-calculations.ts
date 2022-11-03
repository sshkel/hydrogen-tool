import {
  PowerPlantConfiguration,
  PowerSupplyOption,
  isGridConnected,
  isPPAAgreement,
} from "../../types";
import { fillYearsArray } from "../../utils";

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
