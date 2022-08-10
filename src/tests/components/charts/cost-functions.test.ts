import {
  calculateLoanBalance,
  getBaseLog,
  getConversionFactors,
  getInflationFn,
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

  it("can apply inflation based on rate and input cost", () => {
    const inflationFn = getInflationFn(0.5, 9);
    const input = [...Array(9).keys()].map((_) => 1);
    const inflationValues = inflationFn(input);
    expect(inflationValues).toHaveLength(9);
    expect(inflationValues).toEqual([
      1, 1.5, 2.25, 3.375, 5.0625, 7.59375, 11.390625, 17.0859375, 25.62890625,
    ]);
  });

  it("calculates loan balance correctly", () => {
    const totalLoan = 7_500_000;
    const loanRepayment = 750_000;
    const projectTimeline = 20;
    const result = calculateLoanBalance(
      totalLoan,
      projectTimeline,
      loanRepayment
    );
    const expected = [
      0, 7_500_000, 6750000, 6000000, 5250000, 4500000, 3750000, 3000000,
      2250000, 1500000, 750000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
    expect(result.length).toEqual(projectTimeline + 2);
    expect(result).toEqual(expected);
  });

  it("handles when project life exceeds requested conversion factors", () => {
    const projectTimeline = 10;
    const conversionFactors = getConversionFactors(
      "MACRs - 3 year Schedule",
      projectTimeline
    );
    const expected = [0, 0.3333, 0.4445, 0.1481, 0.0741, 0, 0, 0, 0, 0, 0, 0];
    expect(conversionFactors.length).toEqual(projectTimeline + 2);
    expect(conversionFactors).toEqual(expected);
  });

  it("handles when project life equals requested conversion factors", () => {
    const projectTimeline = 6;
    const conversionFactors = getConversionFactors(
      "MACRs - 5 year Schedule",
      projectTimeline
    );
    const expected = [0, 0.2, 0.32, 0.192, 0.1152, 0.1152, 0.0576, 0];
    expect(conversionFactors.length).toEqual(projectTimeline + 2);
    expect(conversionFactors).toEqual(expected);
  });

  it("handles when project life is less than requested conversion factors", () => {
    const projectTimeline = 8;
    const conversionFactors = getConversionFactors(
      "MACRs - 10 year Schedule",
      projectTimeline
    );
    const expected = [
      0, 0.1, 0.18, 0.144, 0.1152, 0.0922, 0.0737, 0.0655, 0.0655, 0,
    ];
    expect(conversionFactors.length).toEqual(projectTimeline + 2);
    expect(conversionFactors).toEqual(expected);
  });
});
