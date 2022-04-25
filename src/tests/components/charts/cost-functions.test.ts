import {
  calculateBatteryCapex,
  calculateCapex,
  cumulativeStackReplacementYears,
  getBaseLog,
  getIndirectCost,
  getOpexPerYear,
  getOpexPerYearWithAdditionalCostPredicate,
  roundToNearestThousand,
} from "../../../components/charts/cost-functions";

describe("Cost function calculations", () => {
  it("calculates log bases", () => {
    expect(getBaseLog(25, 5)).toBeCloseTo(2);
    expect(getBaseLog(1000, 10)).toBeCloseTo(3);
  });

  it("rounds to the nearest thousand", () => {
    expect(roundToNearestThousand(5)).toEqual(0);
    expect(roundToNearestThousand(500)).toEqual(1000);
    expect(roundToNearestThousand(123456)).toEqual(123000);
    expect(roundToNearestThousand(5678901)).toEqual(5679000);
  });

  it("calculates capex", () => {
    const capex = calculateCapex(10, 10, 10, 10, 10);

    expect(capex).toEqual(73000);
  });

  it("calculates battery capex", () => {
    const capex = calculateBatteryCapex(10, 10, 10);

    expect(capex).toEqual(100000);
  });

  it("calculates indirect cost", () => {
    const cost = getIndirectCost(350000, 1);

    expect(cost).toEqual(4000);
  });

  it("calculates opex per year", () => {
    const opex = getOpexPerYear(1000, 0.1, 10);
    expect(opex).toHaveLength(10);
    const expected = [
      1000.9999999999999, 1002.0009999999997, 1003.0030009999997,
      1004.0060040009995, 1005.0100100050004, 1006.0150200150053,
      1007.0210350350202, 1008.0280560700552, 1009.036084126125,
      1010.0451202102512,
    ];

    opex.forEach((val, index) => {
      expect(val).toBeCloseTo(expected[index], 8);
    });
  });

  it("calculates opex per year with additional costs", () => {
    const opex = getOpexPerYearWithAdditionalCostPredicate(
      1000,
      0.1,
      10,
      (x) => x % 5 === 0,
      10
    );
    expect(opex).toHaveLength(10);
    const expected = [
      1000.9999999999999, 1002.0009999999997, 1003.0030009999997,
      1004.0060040009995, 1015.0100100050004, 1006.0150200150053,
      1007.0210350350202, 1008.0280560700552, 1009.036084126125,
      1020.0451202102512,
    ];

    opex.forEach((val, index) => {
      expect(val).toBeCloseTo(expected[index], 8);
    });
  });

  it("calculates opex per year with additional costs", () => {
    const opex = getOpexPerYearWithAdditionalCostPredicate(
      1000,
      0.1,
      10,
      (x) => x % 5 === 0,
      10
    );
    expect(opex).toHaveLength(10);
    const expected = [
      1000.9999999999999, 1002.0009999999997, 1003.0030009999997,
      1004.0060040009995, 1015.0100100050004, 1006.0150200150053,
      1007.0210350350202, 1008.0280560700552, 1009.036084126125,
      1020.0451202102512,
    ];

    opex.forEach((val, index) => {
      expect(val).toBeCloseTo(expected[index], 8);
    });
  });

  it("returns years where stack is needed to replace", () => {
    const stackReplacementYears = cumulativeStackReplacementYears(1, 5, 100);
    expect(stackReplacementYears).toHaveLength(20);
    const expected = [...Array(20).keys()].map((i) => 5 * (i + 1));

    expect(stackReplacementYears).toEqual(expected);
  });

  it("returns years where stack is needed to replace with boundary cases", () => {
    const stackReplacementYears = cumulativeStackReplacementYears(2, 5, 20);
    expect(stackReplacementYears).toHaveLength(8);
    expect(stackReplacementYears).toEqual([3, 5, 8, 10, 13, 15, 18, 20]);
  });

  it("handles when operating hours per year exceed stack lifetime", () => {
    const stackReplacementYears = cumulativeStackReplacementYears(2, 1, 10);
    expect(stackReplacementYears).toHaveLength(10);
    const expected = [...Array(10).keys()].map((i) => i + 1);

    expect(stackReplacementYears).toEqual(expected);
  });

  it("handles when operating hours per year are equal to stack lifetime", () => {
    const stackReplacementYears = cumulativeStackReplacementYears(1, 1, 10);
    expect(stackReplacementYears).toHaveLength(10);
    const expected = [...Array(10).keys()].map((i) => i + 1);

    expect(stackReplacementYears).toEqual(expected);
  });
});
