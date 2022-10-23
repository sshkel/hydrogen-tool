import { generateLCValues } from "../../../components/charts/lch2-calculations";
import { Inputs } from "../../../types";
import { defaultInputData } from "../../scenario";

describe("LCH2 calculations", () => {
  it("calculates LC for electricity sales when averageElectricitySpotPrice provided", () => {
    const data: Inputs = {
      ...defaultInputData.data,
      powerPlantConfiguration: "Grid Connected",
      gridConnectionCost: 10,
      projectTimeline: 10,
      averageElectricitySpotPrice: 1,
    };

    const valuesForProjectLife = Array(10).fill(1);

    const { lcElectricitySale } = generateLCValues(
      data,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      valuesForProjectLife,
      valuesForProjectLife,
      valuesForProjectLife,
      valuesForProjectLife,
      valuesForProjectLife,
      valuesForProjectLife,
      valuesForProjectLife,
      valuesForProjectLife,
      1
    );

    expect(lcElectricitySale).toEqual(10);
  });
});
