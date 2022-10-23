import { HOURS_PER_YEAR } from "../../model/consts";
import { Inputs, PowerPlantType } from "../../types";

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
  recalculatedInputs.electrolyserNominalCapacity = electrolyserNominalCapacity;

  if (solarToWindPercentage === 100) {
    recalculatedInputs.powerPlantType = "Solar";
  }

  if (solarToWindPercentage === 0) {
    recalculatedInputs.powerPlantType = "Wind";
  }

  const powerPlantNominalCapacity =
    powerPlantOversizeRatio * electrolyserNominalCapacity;
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

export function backCalculateSolarAndWindCapacity(
  synthesisedData: Inputs,
  powerPlantOversizeRatio: number,
  electrolyserNominalCapacity: number,
  solarToWindPercentage: number,
  powerPlantType: PowerPlantType
): Inputs {
  const recalculatedInputs = { ...synthesisedData };
  const powerPlantNominalCapacity = backCalculatePowerPlantCapacity(
    powerPlantOversizeRatio,
    electrolyserNominalCapacity
  );

  if (powerPlantType === "Solar") {
    recalculatedInputs.solarNominalCapacity = powerPlantNominalCapacity;
    recalculatedInputs.windNominalCapacity = 0;
  }

  if (powerPlantType === "Wind") {
    recalculatedInputs.solarNominalCapacity = 0;
    recalculatedInputs.windNominalCapacity = powerPlantNominalCapacity;
  }

  if (powerPlantType === "Hybrid") {
    recalculatedInputs.solarNominalCapacity =
      powerPlantNominalCapacity * (solarToWindPercentage / 100);
    recalculatedInputs.windNominalCapacity =
      powerPlantNominalCapacity * (1 - solarToWindPercentage / 100);
  }

  return recalculatedInputs;
}

export function backCalculatePowerPlantCapacity(
  powerPlantOversizeRatio: number,
  electrolyserNominalCapacity: number
): number {
  return powerPlantOversizeRatio * electrolyserNominalCapacity;
}
