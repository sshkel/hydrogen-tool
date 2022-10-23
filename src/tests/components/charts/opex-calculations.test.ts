import {
  cumulativeStackReplacementYears,
  generateOpexValues,
  getOpexPerYearInflationConstant,
  getOpexPerYearInflationWithAdditionalCost,
  maxDegradationStackReplacementYears,
} from "../../../components/charts/opex-calculations";
import { Inputs } from "../../../types";
import { defaultInputData } from "../../scenario";

describe("Opex calculations", () => {
  it("calculates opex per year", () => {
    const opex = getOpexPerYearInflationConstant(1000, 0.1, 10);
    expect(opex).toHaveLength(10);
    const expected = [
      1001, 1002, 1003, 1004.01, 1005.01, 1006.02, 1007.02, 1008.03, 1009.04,
      1010.05,
    ];

    expect(opex).toEqual(expected);
  });

  it("calculates opex per year with additional costs", () => {
    const opex = getOpexPerYearInflationWithAdditionalCost(
      1000,
      0.1,
      10,
      [0, 0, 0, 0, 10, 0, 0, 0, 0, 10]
    );
    expect(opex).toHaveLength(10);
    const expected = [
      1001, 1002, 1003, 1004.01, 1015.06, 1006.02, 1007.02, 1008.03, 1009.04,
      1020.15,
    ];

    expect(opex).toEqual(expected);
  });

  it("returns years where stack is needs replacement", () => {
    const stackReplacementYears = cumulativeStackReplacementYears(
      Array(100).fill(1),
      5,
      100
    );
    // 100th year should not be included
    expect(stackReplacementYears).toHaveLength(19);
    const expected = [...Array(19).keys()].map((i) => 5 * (i + 1));

    expect(stackReplacementYears).toEqual(expected);
  });

  it("returns years where stack needs replacement with boundary cases", () => {
    const stackReplacementYears = cumulativeStackReplacementYears(
      Array(20).fill(2),
      5,
      20
    );
    expect(stackReplacementYears).toHaveLength(7);
    expect(stackReplacementYears).toEqual([3, 5, 8, 10, 13, 15, 18]);
  });

  it("handles when operating hours per year exceed stack lifetime", () => {
    const stackReplacementYears = cumulativeStackReplacementYears(
      Array(10).fill(2),
      1,
      10
    );
    // Final year still not included
    expect(stackReplacementYears).toHaveLength(9);
    const expected = [...Array(9).keys()].map((i) => i + 1);

    expect(stackReplacementYears).toEqual(expected);
  });

  it("handles when operating hours per year are equal to stack lifetime", () => {
    const stackReplacementYears = cumulativeStackReplacementYears(
      Array(10).fill(1),
      1,
      10
    );
    // Final year still not included
    expect(stackReplacementYears).toHaveLength(9);
    const expected = [...Array(9).keys()].map((i) => i + 1);

    expect(stackReplacementYears).toEqual(expected);
  });

  it("handles when operating hours per year fluctuate due to degradation", () => {
    const stackReplacementYears = cumulativeStackReplacementYears(
      [1, 2, 3, 4, 5, 5, 4, 3, 2, 1],
      10,
      10
    );
    // Final year still not included
    expect(stackReplacementYears).toHaveLength(2);

    expect(stackReplacementYears).toEqual([4, 6]);
  });

  it("handles electrolyser degradation for basic case", () => {
    const maxElecDegradation = 0.6;
    const yearlyElecDegradation = 0.1;
    const projectTimeline = 20;
    const actual = maxDegradationStackReplacementYears(
      yearlyElecDegradation,
      maxElecDegradation,
      projectTimeline
    );
    const expected = [7, 14];
    // electrolyser replacement at years 7 and 14 as degrades more than 60 percent
    expect(actual).toEqual(expected);
  });

  it("handles electrolyser degradation when no replacements", () => {
    const maxElecDegradation = 0.7;
    const yearlyElecDegradation = 0.1;
    const projectTimeline = 7;
    const actual = maxDegradationStackReplacementYears(
      yearlyElecDegradation,
      maxElecDegradation,
      projectTimeline
    );
    const expected: number[] = [];
    // electrolyser replacement at years 7 and 14 as degrades more than 60 percent
    expect(actual).toEqual(expected);
  });

  it("calculates grid connection opex when grid connected", () => {
    const data: Inputs = {
      ...defaultInputData.data,
      powerPlantConfiguration: "Grid Connected",
      projectTimeline: 10,
      additionalTransmissionCharges: 10,
    };

    const valuesForProjectLife = Array(10).fill(1);
    const { gridConnectionOpexPerYear } = generateOpexValues(
      data,
      0,
      0,
      valuesForProjectLife,
      valuesForProjectLife,
      valuesForProjectLife,
      valuesForProjectLife
    );
    expect(gridConnectionOpexPerYear).toEqual(Array(10).fill(20));
  });

  it("does not calculates grid connection opex when PPA agreement", () => {
    const data: Inputs = {
      ...defaultInputData.data,
      powerPlantConfiguration: "Standalone",
      powerSupplyOption: "Power Purchase Agreement (PPA)",
      projectTimeline: 10,
      additionalTransmissionCharges: 10,
    };

    const valuesForProjectLife = Array(10).fill(1);
    const { gridConnectionOpexPerYear } = generateOpexValues(
      data,
      0,
      0,
      valuesForProjectLife,
      valuesForProjectLife,
      valuesForProjectLife,
      valuesForProjectLife
    );
    expect(gridConnectionOpexPerYear).toEqual(Array(10).fill(0));
  });

  it("does not calculates grid connection opex when standalone", () => {
    const data: Inputs = {
      ...defaultInputData.data,
      powerPlantConfiguration: "Standalone",
      projectTimeline: 10,
      additionalTransmissionCharges: 10,
    };

    const valuesForProjectLife = Array(10).fill(1);
    const { gridConnectionOpexPerYear } = generateOpexValues(
      data,
      0,
      0,
      valuesForProjectLife,
      valuesForProjectLife,
      valuesForProjectLife,
      valuesForProjectLife
    );
    expect(gridConnectionOpexPerYear).toEqual(Array(10).fill(0));
  });
});
