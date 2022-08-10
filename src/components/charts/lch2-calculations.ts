import {
  Inputs,
  isGridConnected,
  isPPAAgreement,
  isRetailed,
} from "../../types";
import { fillYearsArray } from "../../utils";

export function generateLCValues(
  data: Inputs,
  powerPlantCAPEX: number,
  electrolyserCAPEX: number,
  batteryCAPEX: number,
  gridConnectionCAPEX: number,
  totalIndirectCosts: number,

  powerPlantOpexCost: number,
  electrolyserOpexCost: number,
  batteryOpexCost: number,
  waterOpexCost: number[],
  gridConnectionOpexPerYear: number[],

  batteryReplacementCostsOverProjectLife: number[],
  stackReplacementCostsOverProjectLife: number[],

  oxygenSalePrice: number[],
  electricityProduced: number[],
  electricityConsumed: number[],
  electricityConsumedByBattery: number[],

  hydrogenProductionCost: number
) {
  const {
    powerPlantConfiguration,
    discountRate,
    projectTimeline,
    additionalUpfrontCosts,
    additionalAnnualCosts,
    principalPPACost = 0,
    averageElectricitySpotPrice,
  } = data;
  const gridConnected: boolean = isGridConnected(powerPlantConfiguration);
  const ppaAgreement: boolean = isPPAAgreement(powerPlantConfiguration);
  const retailed: boolean = isRetailed(powerPlantConfiguration);

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

  const lcOxygenSale = calculateLevelisedCost(oxygenSalePrice);

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

  const retailElectricitySalePrice = retailed
    ? fillYearsArray(
        projectTimeline,
        (i) => electricityProduced[i] * averageElectricitySpotPrice
      )
    : Array(projectTimeline).fill(0);
  const lcElectricitySale = calculateLevelisedCost(retailElectricitySalePrice);

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
    lcElectricitySale,
    lcStackReplacement,
    lcWater,
    lcBattery,
    lcGridConnection,
    lcAdditionalCosts,
    lcOxygenSale,
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
      sum += opexValues[i - 1] / (1 + discountRate / 100) ** i;
    }
    return (sum + additionalCAPEX) / hydrogenProductionCost;
  };
}
