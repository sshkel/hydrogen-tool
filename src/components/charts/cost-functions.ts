import { fillYearsArray, padArray, startup, sum } from "../../utils";

export const getBaseLog = (n: number, base: number): number =>
  Math.log(n) / Math.log(base);

export const roundToNearestThousand = (n: number) =>
  Math.round(n / 1000) * 1000 || 0;

export const roundToNearestInteger = (n: number) => Math.round(n) || 0;

export const roundToTwoDP = (n: number) => Math.round(n * 100) / 100 || 0;
export const roundToEightDP = (n: number) => parseFloat(n.toFixed(8)) || 0;

export function calculateH2ProductionLC(
  // Calculated values
  totalCapexCost: number,
  totalEpcCost: number,
  totalLandCost: number,
  // Inputs
  projectTimeline: number,
  discountRate: number,
  totalOpex: number[],
  h2Produced: number[]
) {
  const activeLife = projectTimeline + 2;

  const paddedH2Produced = padArray(h2Produced);
  const paddedTotalOpex = padArray(totalOpex);

  const totalInvestmentRequired = startup(
    totalCapexCost + totalEpcCost + totalLandCost,
    projectTimeline
  );

  const totalCost = fillYearsArray(
    activeLife,
    (i: number) => totalInvestmentRequired[i] + paddedTotalOpex[i]
  );

  const applyDiscount = getDiscountFn(discountRate, activeLife);

  const totalCostWithDiscount = applyDiscount(totalCost);
  const h2ProducedKgLCA = applyDiscount(
    fillYearsArray(activeLife, (i: number) => paddedH2Produced[i] * 1000)
  );

  const hydrogenProductionCost = sum(h2ProducedKgLCA);
  const lch2 = sum(totalCostWithDiscount) / hydrogenProductionCost;

  return {
    lch2,
    hydrogenProductionCost,
  };
}

export function getInflationFn(rate: number, years: number) {
  return (values: number[]) => {
    if (values.length !== years) {
      throw new Error(
        `Invalid size of ${values.length} for values to apply inflation. Should be ${years}.`
      );
    }

    return values.map(
      // i corresponds to year
      (x: number, i: number) => {
        // zero-th year is always skipped as it signifies upfront costs rather than actual operations
        if (i === 0) {
          return x;
        }
        return x * (1 + rate) ** i;
      }
    );
  };
}

export function getDiscountFn(rate: number, years: number) {
  return (values: number[]) => {
    if (values.length !== years) {
      throw new Error(
        `Invalid size of ${values.length} for values to apply discount. Should be ${years}.`
      );
    }
    return values.map(
      // i corresponds to year
      (x: number, i: number) => {
        // zero-th year is always skipped as it signifies upfront costs rather than actual operations
        if (i === 0) {
          return x;
        }
        return x / (1 + rate) ** i;
      }
    );
  };
}
