import {
  applyInflation,
  calculateBatteryCapex,
  calculateCapex,
  calculateLoanBalance,
  cumulativeStackReplacementYearsConstant,
  getBaseLog,
  getIndirectCost,
  getOpexPerYearInflationConstant,
  getOpexPerYearInflationWithAdditionalCost,
  maxDegradationStackReplacementYears,
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
    const stackReplacementYears = cumulativeStackReplacementYearsConstant(
      1,
      5,
      100
    );
    // 100th year should not be included
    expect(stackReplacementYears).toHaveLength(19);
    const expected = [...Array(19).keys()].map((i) => 5 * (i + 1));

    expect(stackReplacementYears).toEqual(expected);
  });

  it("returns years where stack needs replacement with boundary cases", () => {
    const stackReplacementYears = cumulativeStackReplacementYearsConstant(
      2,
      5,
      20
    );
    expect(stackReplacementYears).toHaveLength(7);
    expect(stackReplacementYears).toEqual([3, 5, 8, 10, 13, 15, 18]);
  });

  it("handles when operating hours per year exceed stack lifetime", () => {
    const stackReplacementYears = cumulativeStackReplacementYearsConstant(
      2,
      1,
      10
    );
    // Final year still not included
    expect(stackReplacementYears).toHaveLength(9);
    const expected = [...Array(9).keys()].map((i) => i + 1);

    expect(stackReplacementYears).toEqual(expected);
  });

  it("handles when operating hours per year are equal to stack lifetime", () => {
    const stackReplacementYears = cumulativeStackReplacementYearsConstant(
      1,
      1,
      10
    );
    // Final year still not included
    expect(stackReplacementYears).toHaveLength(9);
    const expected = [...Array(9).keys()].map((i) => i + 1);

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

  it("Electrolyser degradation works for basic case", () => {
    const maxElecDegradation = 0.6;
    const yearlyElecDegradation = 0.1;
    const projectLife = 20;
    const actual = maxDegradationStackReplacementYears(
      yearlyElecDegradation,
      maxElecDegradation,
      projectLife
    );
    const expected = [10, 20];
    // electrolyser replacement at years 10 and 20 as degrades more than 60 percent
    expect(actual).toEqual(expected);
  });

  it("Electrolyser degradation works for no replacements", () => {
    const maxElecDegradation = 0.7;
    const yearlyElecDegradation = 0.1;
    const projectLife = 10;
    const actual = maxDegradationStackReplacementYears(
      yearlyElecDegradation,
      maxElecDegradation,
      projectLife
    );
    const expected: number[] = [];
    // electrolyser replacement at years 10 and 20 as degrades more than 60 percent
    expect(actual).toEqual(expected);
  });

  it("Explodes loan balance correctly", () => {
    const totalLoan = 7_500_000;
    const loanRepayment = 750_000;
    const projectLife = 20;
    const result = calculateLoanBalance(totalLoan, projectLife, loanRepayment);
    const expected = [
      7_500_000, 6750000, 6000000, 5250000, 4500000, 3750000, 3000000, 2250000,
      1500000, 750000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
    expect(result.length).toEqual(projectLife + 2);
    expect(result).toEqual(expected);
  });
});
