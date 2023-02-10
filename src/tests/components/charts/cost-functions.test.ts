import {
  getBaseLog,
  getInflationFn,
  roundToNearestThousand,
} from "../../../model/cost-functions";

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
});
