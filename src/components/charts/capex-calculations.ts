import {
  PowerPlantConfiguration,
  PowerSupplyOption,
  isGridConnected,
  isPPAAgreement,
} from "../../types";
import { isSolar, isWind } from "../../utils";
import { getBaseLog, roundToNearestThousand } from "./cost-functions";

export const calculateCapex = (
  nominalCapacity: number,
  referenceCapacity: number,
  referencePurchaseCost: number,
  costReductionWithScale: number,
  referenceFoldIncrease: number
): number => {
  const foldIncreaseInCapacity = getBaseLog(
    (nominalCapacity * 1000) / referenceCapacity,
    referenceFoldIncrease
  );

  const capitalCostReductionFactor =
    1 - (1 - costReductionWithScale / 100) ** foldIncreaseInCapacity;

  const scaledPurchaseCost =
    referencePurchaseCost * (1 - capitalCostReductionFactor);

  const capexCost = nominalCapacity * 1000 * scaledPurchaseCost;

  return roundToNearestThousand(capexCost);
};

export const calculateBatteryCapex = (
  totalBatteryCapacity: number = 0,
  cost: number = 0
): number => {
  if (totalBatteryCapacity === 0) {
    return 0;
  }
  const capexCost = totalBatteryCapacity * cost * 1000;
  return roundToNearestThousand(capexCost);
};

export const getIndirectCost = (
  capex: number,
  costAsPercentageOfCapex: number = 0
) => roundToNearestThousand(capex * (costAsPercentageOfCapex / 100));

export function getCapex(
  powerPlantConfiguration: PowerPlantConfiguration,
  powerSupplyOption: PowerSupplyOption,
  electrolyserNominalCapacity: number,
  electrolyserReferenceCapacity: number,
  electrolyserPurchaseCost: number,
  electrolyserCostReductionWithScale: number,
  electrolyserReferenceFoldIncrease: number,
  powerPlantType: string,
  solarNominalCapacity: number,
  solarReferenceCapacity: number,
  solarFarmBuildCost: number,
  solarPVCostReductionWithScale: number,
  solarReferenceFoldIncrease: number,
  windNominalCapacity: number,
  windReferenceCapacity: number,
  windFarmBuildCost: number,
  windCostReductionWithScale: number,
  windReferenceFoldIncrease: number,
  batteryRatedPower: number,
  batteryStorageDuration: number,
  batteryCosts: number,
  gridConnectionCost: number
) {
  const gridConnected: boolean = isGridConnected(powerPlantConfiguration);
  const ppaAgreement: boolean = isPPAAgreement(powerSupplyOption);

  const electrolyserCAPEX = calculateCapex(
    electrolyserNominalCapacity,
    electrolyserReferenceCapacity,
    electrolyserPurchaseCost,
    electrolyserCostReductionWithScale,
    electrolyserReferenceFoldIncrease
  );

  const solarCAPEX =
    isSolar(powerPlantType) && !ppaAgreement
      ? calculateCapex(
          solarNominalCapacity,
          solarReferenceCapacity,
          solarFarmBuildCost,
          solarPVCostReductionWithScale,
          solarReferenceFoldIncrease
        )
      : 0;
  const windCAPEX =
    isWind(powerPlantType) && !ppaAgreement
      ? calculateCapex(
          windNominalCapacity,
          windReferenceCapacity,
          windFarmBuildCost,
          windCostReductionWithScale,
          windReferenceFoldIncrease
        )
      : 0;

  const powerPlantCAPEX = solarCAPEX + windCAPEX;

  const totalBatteryCapacity = batteryRatedPower * batteryStorageDuration;
  const batteryCAPEX = calculateBatteryCapex(
    totalBatteryCapacity,
    batteryCosts
  );
  const gridConnectionCAPEX =
    gridConnected || ppaAgreement ? gridConnectionCost : 0;
  return {
    electrolyserCAPEX,
    solarCAPEX,
    windCAPEX,
    batteryCAPEX,
    powerPlantCAPEX,
    gridConnectionCAPEX,
  };
}

export function getEpcCosts(
  electrolyserCAPEX: number,
  electrolyserEpcCosts: number,
  electrolyserLandProcurementCosts: number,
  solarCAPEX: number,
  solarEpcCosts: number,
  solarLandProcurementCosts: number,
  windCAPEX: number,
  windEpcCosts: number,
  windLandProcurementCosts: number,
  batteryCAPEX: number,
  batteryEpcCosts: number | undefined,
  batteryLandProcurementCosts: number | undefined
) {
  const electrolyserEpcCost = getIndirectCost(
    electrolyserCAPEX,
    electrolyserEpcCosts
  );
  const electrolyserLandCost = getIndirectCost(
    electrolyserCAPEX,
    electrolyserLandProcurementCosts
  );

  const solarEpcCost = getIndirectCost(solarCAPEX, solarEpcCosts);
  const solarLandCost = getIndirectCost(solarCAPEX, solarLandProcurementCosts);

  const windEpcCost = getIndirectCost(windCAPEX, windEpcCosts);
  const windLandCost = getIndirectCost(windCAPEX, windLandProcurementCosts);

  const powerPlantEpcCost = solarEpcCost + windEpcCost;
  const powerPlantLandCost = solarLandCost + windLandCost;

  const batteryEpcCost = getIndirectCost(batteryCAPEX, batteryEpcCosts);
  const batteryLandCost = getIndirectCost(
    batteryCAPEX,
    batteryLandProcurementCosts
  );
  return {
    electrolyserEpcCost,
    electrolyserLandCost,
    powerPlantEpcCost,
    powerPlantLandCost,
    batteryEpcCost,
    batteryLandCost,
  };
}
