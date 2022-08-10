import { generateLCValues } from "../../../components/charts/lch2-calculations";
import { SynthesisedInputs } from "../../../types";
import { defaultInputData } from "../../scenario";

describe("LCH2 calculations", () => {
  it("calculates LC for electricity sales when in retail mode", () => {
    const data: SynthesisedInputs = {
      ...defaultInputData.data,
      powerPlantConfiguration: "Grid Connected with Surplus Retailed",
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

  it("does not calculates LC for electricity sales when standalone", () => {
    const data: SynthesisedInputs = {
      ...defaultInputData.data,
      powerPlantConfiguration: "Standalone",
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

    expect(lcElectricitySale).toEqual(0);
  });

  it("does not calculates LC for electricity sales when grid connected without surplus retail", () => {
    const data: SynthesisedInputs = {
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

    expect(lcElectricitySale).toEqual(0);
  });
});
