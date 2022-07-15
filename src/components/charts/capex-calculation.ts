import { Technology } from "../../types";
import {
  calculateBatteryCapex,
  calculateCapex,
  getIndirectCost,
} from "./cost-functions";

const isSolar = (tech: string): boolean => tech !== "Wind";
const isWind = (tech: string): boolean => tech !== "Solar";

export function generateCapexValues(
  technology: Technology,
  electrolyserNominalCapacity: number,
  electrolyserReferenceCapacity: number,
  electrolyserReferencePurchaseCost: number,
  electrolyserCostReductionWithScale: number,
  electrolyserReferenceFoldIncrease: number,

  solarNominalCapacity: number,
  solarReferenceCapacity: number,
  solarPVFarmReferenceCost: number,
  solarPVCostReductionWithScale: number,
  solarReferenceFoldIncrease: number,

  windNominalCapacity: number,
  windReferenceCapacity: number,
  windFarmReferenceCost: number,
  windCostReductionWithScale: number,
  windReferenceFoldIncrease: number,

  batteryRatedPower: number,
  batteryStorageDuration: number,
  batteryCosts: number,

  electrolyserEpcCosts: number,
  electrolyserLandProcurementCost: number,
  solarEpcCosts: number,
  solarLandProcurementCost: number,
  windEpcCosts: number,
  windLandProcurementCost: number,
  batteryEpcCosts: number,
  batteryLandProcurementCost: number
) {
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
