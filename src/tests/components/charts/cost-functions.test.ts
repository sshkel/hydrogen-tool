import {
  calculateLoanBalance,
  getBaseLog,
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
