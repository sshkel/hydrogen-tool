import { projectYears } from "../../model/Utils";
export const getBaseLog = (n: number, base: number): number =>
  Math.log(n) / Math.log(base);

export const roundToNearestThousand = (n: number) =>
  Math.round(n / 1000) * 1000 || 0;

export const calculateCapex = (
  nominalCapacity: number,
  referenceCapacity: number,
  referencePurchaseCost: number,
  costReductionWithScale: number,
  referenceFoldIncrease: number
): number => {
  const foldIncreaseInCapacity = getBaseLog(
    (nominalCapacity * 1000) / referenceCapacity,
    referenceFoldIncrease
  );

  const capitalCostReductionFactor =
    1 - (1 - costReductionWithScale / 100) ** foldIncreaseInCapacity;

  const scaledPurchaseCost =
    referencePurchaseCost * (1 - capitalCostReductionFactor);

  const capexCost = nominalCapacity * 1000 * scaledPurchaseCost;

  return roundToNearestThousand(capexCost);
};

export const calculateBatteryCapex = (
  ratedPower: number = 0,
  nominalCapacity: number = 0,
  cost: number = 0
): number => {
  if (ratedPower === 0) {
    return 0;
  }
  const capexCost = nominalCapacity * cost * 1000;
  return roundToNearestThousand(capexCost);
};

export const getIndirectCost = (
  capex: number,
  costAsPercentageOfCapex: number = 0
) => roundToNearestThousand(capex * (costAsPercentageOfCapex / 100));

// Return a list of the OPEX per year for 1..$years inclusive, using the formula (cost * (1 + discountRate)^year)
export const getOpexPerYear = (
  cost: number,
  discountRate: number,
  years: number
): number[] =>
  [...Array(years).keys()].map(
    (i) => cost * (1 + discountRate / 100) ** (i + 1)
  );

export const getOpexPerYearWithAdditionalCostPredicate = (
  cost: number,
  discountRate: number,
  years: number,
  shouldIncludeAdditionalCost: (year: number) => boolean,
  additionalCost: number
): number[] => {
  return [...Array(years).keys()].map((i) => {
    const year = i + 1;
    const extras = shouldIncludeAdditionalCost(year) ? additionalCost : 0;

    return cost * (1 + discountRate / 100) ** year + extras;
  });
};

// VisibleForTesting
export function maxDegradationStackReplacementYears(
  yearlyElecDegradation: number,
  maxElexDegradation: number,
  projectLife: number
): number[] {
  let runningYear = 1;
  const replacementYears = [];
  for (let year of projectYears(projectLife)) {
    const stackDegradationForYear =
      1 - 1 / (1 + yearlyElecDegradation) ** runningYear;
    if (stackDegradationForYear > maxElexDegradation) {
      runningYear = 1;
      replacementYears.push(year);
    } else {
      runningYear++;
    }
  }
  return replacementYears;
}

export function cumulativeStackReplacementYears(
  // operating_outputs["Total Time Electrolyser is Operating"] * hoursPerYear;
  operatingHoursPerYear: number,
  stackLifetime: number,
  projectLife: number
): number[] {
  // """Private method - Returns a list of the years in which the electrolyser stack will need replacing, defined as
  //the total operating time surpassing a multiple of the stack lifetime.
  //"""

  const stackReplacementYears = [];
  for (let year of projectYears(projectLife)) {
    // TODO check for rounding error. should be fine because floors?
    // This is a funny way of calculating this if we are doing it iteratively
    // Fix it with a simpler version
    if (
      Math.floor((operatingHoursPerYear * year) / stackLifetime) -
        Math.floor((operatingHoursPerYear * (year - 1)) / stackLifetime) ===
      1.0
    ) {
      stackReplacementYears.push(year);
    }
  }
  return stackReplacementYears;
}
