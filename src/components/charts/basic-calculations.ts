import {PowerPlantType} from "../../types";

export function backCalculateInputFields(
    electrolyserEfficiency: number,
    powerPlantOversizeRatio: number,
    solarToWindPercentage: number,
    currentPowerPlantType: PowerPlantType,
    electrolyserNominalCapacity: number
) {
  let powerPlantType = currentPowerPlantType;
  if (solarToWindPercentage === 100) {
    powerPlantType = "Solar";
  }

  if (solarToWindPercentage === 0) {
    powerPlantType = "Wind";
  }

  const powerPlantNominalCapacity =
    powerPlantOversizeRatio * electrolyserNominalCapacity;
  const solarNominalCapacity =
    powerPlantNominalCapacity * (solarToWindPercentage / 100);

  const windNominalCapacity =
    powerPlantNominalCapacity * (1 - solarToWindPercentage / 100);

  return {
    powerPlantType,
    windNominalCapacity,
    solarNominalCapacity,
  };
}

export function backCalculateElectrolyserCapacity(
  projectScale: number,
  electrolyserEfficiency: number, // value should be a decimal
  electrolyserCf: number,
  hoursPerYear: number // in theory should always be 8760, but we have leap years
): number {
  return (
    projectScale *
    1000 *
    33.33 *
    (1 / electrolyserEfficiency) *
    (1 / hoursPerYear) *
    (1 / electrolyserCf)
  );
}

export function backCalculatePowerPlantCapacity(
  powerPlantOversizeRatio: number,
  electrolyserNominalCapacity: number
): number {
  return powerPlantOversizeRatio * electrolyserNominalCapacity;
}
