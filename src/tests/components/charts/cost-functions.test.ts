import {
  applyInflation,
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
      1001, 1002, 1003, 1004.01, 1005.01, 1006.02, 1007.02, 1008.03, 1009.04,
      1010.05,
    ];

    expect(opex).toEqual(expected);
  });

  it("rounds input cost for opex per year to nearest thousand", () => {
    const opex = getOpexPerYear(500, 0.1, 10);
    expect(opex).toHaveLength(10);
    const expected = [
      1001, 1002, 1003, 1004.01, 1005.01, 1006.02, 1007.02, 1008.03, 1009.04,
      1010.05,
    ];

    expect(opex).toEqual(expected);
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
      1001, 1002, 1003, 1004.01, 1015.06, 1006.02, 1007.02, 1008.03, 1009.04,
      1020.15,
    ];

    expect(opex).toEqual(expected);
  });

  it("rounds input cost for opex per year with additional costs to nearest thousand", () => {
    const opex = getOpexPerYearWithAdditionalCostPredicate(
      1001,
      0.1,
      10,
      (x) => x % 5 === 0,
      10
    );
    expect(opex).toHaveLength(10);
    const expected = [
      1001, 1002, 1003, 1004.01, 1015.06, 1006.02, 1007.02, 1008.03, 1009.04,
      1020.15,
    ];

    expect(opex).toEqual(expected);
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

  it("can apply inflation based on rate and input cost", () => {
    const inflationFn = applyInflation(0.5);
    const input = [...Array(9).keys()].map((_) => 1);
    const inflationValues = inflationFn(input);
    expect(inflationValues).toHaveLength(9);
    expect(inflationValues).toEqual([
      1, 1.5, 2.25, 3.375, 5.0625, 7.59375, 11.390625, 17.0859375, 25.62890625,
    ]);
  });
});
