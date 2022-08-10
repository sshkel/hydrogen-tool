import { HOURS_PER_YEAR } from "../../model/consts";
import { Inputs, UserInputFields } from "../../types";

export function backcalculateInputFields(
  synthesisedData: Inputs,
  userInput: UserInputFields,
  electrolyserCf: number
): Inputs {
  const recalculatedInputs = { ...synthesisedData };
  const {
    electrolyserEfficiency = 1,
    powerPlantOversizeRatio = 1,
    solarToWindPercentage = 100,
  } = synthesisedData;

  const electrolyserNominalCapacity =
    userInput.projectScale ||
    0 *
      1000 *
      33.33 *
      (1 / electrolyserEfficiency) *
      (1 / HOURS_PER_YEAR) *
      (1 / electrolyserCf);

  const powerPlantNominalCapacity =
    powerPlantOversizeRatio * electrolyserNominalCapacity;

  if (solarToWindPercentage === 100) {
    recalculatedInputs.technology = "Solar";
  }

  if (solarToWindPercentage === 0) {
    recalculatedInputs.technology = "Wind";
  }

  recalculatedInputs.electrolyserNominalCapacity = electrolyserNominalCapacity;
  recalculatedInputs.solarNominalCapacity =
    powerPlantNominalCapacity * (solarToWindPercentage / 100);
  recalculatedInputs.windNominalCapacity =
    powerPlantNominalCapacity * (1 - solarToWindPercentage / 100);

  return recalculatedInputs;
}
