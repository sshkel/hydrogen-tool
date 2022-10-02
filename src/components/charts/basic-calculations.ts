import { HOURS_PER_YEAR } from "../../model/consts";
import { Inputs } from "../../types";

export function backCalculateInputFields(
  synthesisedData: Inputs,
  projectScale: number,
  electrolyserCf: number
): Inputs {
  const recalculatedInputs = { ...synthesisedData };
  const {
    electrolyserEfficiency = 1,
    powerPlantOversizeRatio = 1,
    solarToWindPercentage = 100,
  } = synthesisedData;

  const electrolyserNominalCapacity = backCalculateElectrolyserCapacity(
    projectScale,
    electrolyserEfficiency / 100,
    electrolyserCf
  );

  const powerPlantNominalCapacity =
    powerPlantOversizeRatio * electrolyserNominalCapacity;

  if (solarToWindPercentage === 100) {
    recalculatedInputs.powerPlantType = "Solar";
  }

  if (solarToWindPercentage === 0) {
    recalculatedInputs.powerPlantType = "Wind";
  }

  recalculatedInputs.electrolyserNominalCapacity = electrolyserNominalCapacity;
  recalculatedInputs.solarNominalCapacity =
    powerPlantNominalCapacity * (solarToWindPercentage / 100);
  recalculatedInputs.windNominalCapacity =
    powerPlantNominalCapacity * (1 - solarToWindPercentage / 100);

  return recalculatedInputs;
}

export function backCalculateElectrolyserCapacity(
  projectScale: number,
  electrolyserEfficiency: number, // value should be a decimal
  electrolyserCf: number
): number {
  return (
    projectScale *
    1000 *
    33.33 *
    (1 / electrolyserEfficiency) *
    (1 / HOURS_PER_YEAR) *
    (1 / electrolyserCf)
  );
}

export function backCalculatePowerPlantCapacity(
  powerPlantOversizeRatio: number,
  electrolyserNominalCapacity: number
): number {
  return powerPlantOversizeRatio * electrolyserNominalCapacity;
}
