import { InputFields } from "../../types";
import {
  calculateBatteryCapex,
  calculateCapex,
  getIndirectCost,
} from "./cost-functions";

const isSolar = (tech: string): boolean => tech !== "Wind";
const isWind = (tech: string): boolean => tech !== "Solar";

export function generateCapexValues(data: InputFields) {
  const {
    technology,
    electrolyserNominalCapacity,
    electrolyserReferenceCapacity,
    electrolyserReferencePurchaseCost,
    electrolyserCostReductionWithScale,
    electrolyserReferenceFoldIncrease,

    solarNominalCapacity,
    solarReferenceCapacity,
    solarPVFarmReferenceCost,
    solarPVCostReductionWithScale,
    solarReferenceFoldIncrease,

    windNominalCapacity,
    windReferenceCapacity,
    windFarmReferenceCost,
    windCostReductionWithScale,
    windReferenceFoldIncrease,

    batteryRatedPower = 0,
    batteryStorageDuration = 0,
    batteryCosts = 0,

    electrolyserEpcCosts,
    electrolyserLandProcurementCost,
    solarEpcCosts,
    solarLandProcurementCost,
    windEpcCosts,
    windLandProcurementCost,
    batteryEpcCosts,
    batteryLandProcurementCost,
  } = data;

  const electrolyserCAPEX = calculateCapex(
    electrolyserNominalCapacity,
    electrolyserReferenceCapacity,
    electrolyserReferencePurchaseCost,
    electrolyserCostReductionWithScale,
    electrolyserReferenceFoldIncrease
  );

  const solarCAPEX = isSolar(technology)
    ? calculateCapex(
        solarNominalCapacity,
        solarReferenceCapacity,
        solarPVFarmReferenceCost,
        solarPVCostReductionWithScale,
        solarReferenceFoldIncrease
      )
    : 0;
  const windCAPEX = isWind(technology)
    ? calculateCapex(
        windNominalCapacity,
        windReferenceCapacity,
        windFarmReferenceCost,
        windCostReductionWithScale,
        windReferenceFoldIncrease
      )
    : 0;
  const powerPlantCAPEX = solarCAPEX + windCAPEX;

  const batteryNominalCapacity = batteryRatedPower * batteryStorageDuration;
  const batteryCAPEX = calculateBatteryCapex(
    batteryRatedPower,
    batteryNominalCapacity,
    batteryCosts
  );

  const electrolyserEpcCost = getIndirectCost(
    electrolyserCAPEX,
    electrolyserEpcCosts
  );
  const electrolyserLandCost = getIndirectCost(
    electrolyserCAPEX,
    electrolyserLandProcurementCost
  );

  const solarEpcCost = getIndirectCost(solarCAPEX, solarEpcCosts);
  const solarLandCost = getIndirectCost(solarCAPEX, solarLandProcurementCost);

  const windEpcCost = getIndirectCost(windCAPEX, windEpcCosts);
  const windLandCost = getIndirectCost(windCAPEX, windLandProcurementCost);

  const powerPlantEpcCost = solarEpcCost + windEpcCost;
  const powerPlantLandCost = solarLandCost + windLandCost;

  const batteryEpcCost = getIndirectCost(batteryCAPEX, batteryEpcCosts);
  const batteryLandCost = getIndirectCost(
    batteryCAPEX,
    batteryLandProcurementCost
  );

  const totalIndirectCosts =
    electrolyserEpcCost +
    electrolyserLandCost +
    powerPlantEpcCost +
    powerPlantLandCost;

  return {
    electrolyserCAPEX,
    powerPlantCAPEX,
    batteryCAPEX,
    electrolyserEpcCost,
    electrolyserLandCost,
    powerPlantEpcCost,
    powerPlantLandCost,
    batteryEpcCost,
    batteryLandCost,
    totalIndirectCosts,
  };
}
