import { InputFields } from "../../types";
import { fillYearsArray } from "../../utils";

export function generateLCValues(
  data: InputFields,
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
    discountRate,
    plantLife,
    additionalUpfrontCosts,
    additionalAnnualCosts,
    principalPPACost = 0,
    averageElectricitySpotPrice,
  } = data;
  const ppaAgreement: boolean = data.ppaAgreement === "true";
  const gridConnected: boolean = data.gridConnected === "true";

  const lcPowerPlantCAPEX = powerPlantCAPEX / hydrogenProductionCost;
  const lcElectrolyserCAPEX = electrolyserCAPEX / hydrogenProductionCost;
  const lcIndirectCosts = totalIndirectCosts / hydrogenProductionCost;
  const lcPowerPlantOPEX =
    getSummedDiscountForOpexCost(powerPlantOpexCost, discountRate, plantLife) /
    hydrogenProductionCost;
  const lcElectrolyserOPEX =
    getSummedDiscountForOpexCost(
      electrolyserOpexCost,
      discountRate,
      plantLife
    ) / hydrogenProductionCost;

  const batteryCostPerYear: number[] = fillYearsArray(
    plantLife,
    (i) => batteryOpexCost + batteryReplacementCostsOverProjectLife[i]
  );

  const lcBattery =
    (batteryCAPEX +
      getSummedDiscountForOpexValues(
        batteryCostPerYear,
        discountRate,
        plantLife
      )) /
    hydrogenProductionCost;
  const lcWater =
    getSummedDiscountForOpexValues(waterOpexCost, discountRate, plantLife) /
    hydrogenProductionCost;
  const lcAdditionalCosts =
    (additionalUpfrontCosts +
      getSummedDiscountForOpexCost(
        additionalAnnualCosts,
        discountRate,
        plantLife
      )) /
    hydrogenProductionCost;
  const lcOxygenSale =
    getSummedDiscountForOpexValues(oxygenSalePrice, discountRate, plantLife) /
    hydrogenProductionCost;

  const lcStackReplacement =
    getSummedDiscountForOpexValues(
      stackReplacementCostsOverProjectLife,
      discountRate,
      plantLife
    ) / hydrogenProductionCost;

  const ppaCostOfElectricityConsumed = fillYearsArray(
    plantLife,
    (i) =>
      (electricityConsumed[i] + electricityConsumedByBattery[i]) *
      principalPPACost
  );
  const lcElectricityPurchase = ppaAgreement
    ? getSummedDiscountForOpexValues(
        ppaCostOfElectricityConsumed,
        discountRate,
        plantLife
      ) / hydrogenProductionCost
    : 0;

  // TODO: check in Retail mode
  const retailElectricitySalePrice = fillYearsArray(
    plantLife,
    (i) => electricityProduced[i] * averageElectricitySpotPrice
  );
  const lcElectricitySale =
    getSummedDiscountForOpexValues(
      retailElectricitySalePrice,
      discountRate,
      plantLife
    ) / hydrogenProductionCost;

  const gridOpex = gridConnected
    ? getSummedDiscountForOpexValues(
        gridConnectionOpexPerYear,
        discountRate,
        plantLife
      )
    : 0;
  const lcGridConnection =
    (gridConnectionCAPEX + gridOpex) / hydrogenProductionCost;

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

function getSummedDiscountForOpexCost(
  opex: number,
  discountRate: number,
  years: number
): number {
  let sum = 0;
  for (let i = 1; i <= years; i++) {
    sum += opex / (1 + discountRate / 100) ** i;
  }
  return sum;
}

function getSummedDiscountForOpexValues(
  opexValues: number[],
  discountRate: number,
  years: number
): number {
  let sum = 0;
  for (let i = 1; i <= years; i++) {
    // Need to minus 1 as assuming opexValues is zero indexes
    sum += opexValues[i - 1] / (1 + discountRate / 100) ** i;
  }
  return sum;
}
