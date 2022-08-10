import { Inputs, isGridConnected, isPPAAgreement } from "../../types";
import { isSolar, isWind } from "../../utils";
import { getBaseLog, roundToNearestThousand } from "./cost-functions";

export function generateCapexValues(data: Inputs) {
  const {
    technology,
    powerPlantConfiguration,

    electrolyserNominalCapacity,
    electrolyserReferenceCapacity,
    electrolyserCapitalCost,
    electrolyserCostReductionWithScale,
    electrolyserReferenceFoldIncrease,

    solarNominalCapacity,
    solarReferenceCapacity,
    solarFarmBuildCost,
    solarPVCostReductionWithScale,
    solarReferenceFoldIncrease,

    windNominalCapacity,
    windReferenceCapacity,
    windFarmBuildCost,
    windCostReductionWithScale,
    windReferenceFoldIncrease,

    batteryRatedPower = 0,
    batteryStorageDuration = 0,
    batteryCosts = 0,

    gridConnectionCost = 0,

    electrolyserEpcCosts,
    electrolyserLandProcurementCost,
    solarEpcCosts,
    solarLandProcurementCost,
    windEpcCosts,
    windLandProcurementCost,
    batteryEpcCosts,
    batteryLandProcurementCost,
  } = data;

  const gridConnected: boolean = isGridConnected(powerPlantConfiguration);
  const ppaAgreement: boolean = isPPAAgreement(powerPlantConfiguration);

  const electrolyserCAPEX = calculateCapex(
    electrolyserNominalCapacity,
    electrolyserReferenceCapacity,
    electrolyserCapitalCost,
    electrolyserCostReductionWithScale,
    electrolyserReferenceFoldIncrease
  );

  const solarCAPEX = isSolar(technology)
    ? calculateCapex(
        solarNominalCapacity,
        solarReferenceCapacity,
        solarFarmBuildCost,
        solarPVCostReductionWithScale,
        solarReferenceFoldIncrease
      )
    : 0;
  const windCAPEX = isWind(technology)
    ? calculateCapex(
        windNominalCapacity,
        windReferenceCapacity,
        windFarmBuildCost,
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

  const gridConnectionCAPEX =
    gridConnected || ppaAgreement ? gridConnectionCost : 0;

  const totalIndirectCosts =
    electrolyserEpcCost +
    electrolyserLandCost +
    powerPlantEpcCost +
    powerPlantLandCost;

  return {
    electrolyserCAPEX,
    powerPlantCAPEX,
    batteryCAPEX,
    gridConnectionCAPEX,
    electrolyserEpcCost,
    electrolyserLandCost,
    powerPlantEpcCost,
    powerPlantLandCost,
    batteryEpcCost,
    batteryLandCost,
    totalIndirectCosts,
  };
}

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
  ratedPower: number = 0,
  nominalCapacity: number = 0,
  cost: number = 0
): number => {
  if (ratedPower === 0) {
    return 0;
  }
  const capexCost = nominalCapacity * cost * 1000;
  return roundToNearestThousand(capexCost);
};

export const getIndirectCost = (
  capex: number,
  costAsPercentageOfCapex: number = 0
) => roundToNearestThousand(capex * (costAsPercentageOfCapex / 100));
