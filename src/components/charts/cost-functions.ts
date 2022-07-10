import { decomissioning, first, padArray, sum } from "../../model/Utils";
import { DepreciationProfile } from "../../types";

export const getBaseLog = (n: number, base: number): number =>
  Math.log(n) / Math.log(base);

export const roundToNearestThousand = (n: number) =>
  Math.round(n / 1000) * 1000 || 0;

const roundToTwoDP = (n: number) => Math.round(n * 100) / 100 || 0;

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

// Return a list of the OPEX per year for 1..$years inclusive, using the formula (cost * (1 + inflationRate)^year)
export const getOpexPerYearInflationConstant = (
  cost: number,
  inflationRate: number,
  years: number
): number[] => {
  return [...Array(years).keys()].map((i) =>
    roundToTwoDP(cost * (1 + inflationRate / 100) ** (i + 1))
  );
};

// Return a list of the OPEX per year for 1..$years inclusive, using the formula (costPerYear  * (1 + inflationRate)^year)
export const getOpexPerYearInflation = (
  costPerYear: number[],
  inflationRate: number,
  years: number
): number[] => {
  return [...Array(years).keys()].map((i) =>
    roundToTwoDP(costPerYear[i] * (1 + inflationRate / 100) ** (i + 1))
  );
};

export const getOpexPerYearInflationWithAdditionalCost = (
  cost: number,
  inflationRate: number,
  years: number,
  additionalCostsByYear: number[]
): number[] => {
  return [...Array(years).keys()].map((i) => {
    const year = i + 1;
    const extras = additionalCostsByYear[i];

    return roundToTwoDP((cost + extras) * (1 + inflationRate / 100) ** year);
  });
};

export function maxDegradationStackReplacementYears(
  stackDegradation: number,
  maximumDegradationBeforeReplacement: number,
  projectLife: number
): number[] {
  let runningYear = 1;
  const replacementYears = [];
  for (let year of projectYears(projectLife)) {
    // TODO Explain this calculation here
    const stackDegradationForYear =
      1 - 1 / (1 + stackDegradation) ** runningYear;
    if (stackDegradationForYear > maximumDegradationBeforeReplacement) {
      runningYear = 1;
      replacementYears.push(year);
    } else {
      runningYear++;
    }
  }
  return replacementYears;
}

export function cumulativeStackReplacementYearsConstant(
  // operating_outputs["Total Time Electrolyser is Operating"] * hoursPerYear;
  operatingHoursPerYear: number,
  stackLifetime: number,
  projectLife: number
): number[] {
  // """Private method - Returns a list of the years in which the electrolyser stack will need replacing, defined as
  //the total operating time surpassing a multiple of the stack lifetime.
  //The final year is never included for stack replacement, so is excluded from the iteration.
  //"""
  let currentStackLifetime: number = stackLifetime;

  const candidateReplacementYears = projectYears(projectLife - 1);
  if (stackLifetime <= operatingHoursPerYear) {
    return candidateReplacementYears;
  }

  const stackReplacementYears = [];
  // Don't include final project year as there is no need for stack replacement
  for (let year of candidateReplacementYears) {
    currentStackLifetime -= operatingHoursPerYear;
    if (currentStackLifetime <= 0) {
      stackReplacementYears.push(year);
      currentStackLifetime += stackLifetime;
    }
  }

  return stackReplacementYears;
}

export function cumulativeStackReplacementYears(
  // array of size projectLife with operating hours per year
  operatingHoursPerYear: number[],
  stackLifetime: number,
  projectLife: number
): number[] {
  // """Private method - Returns a list of the years in which the electrolyser stack will need replacing, defined as
  //the total operating time surpassing a multiple of the stack lifetime.
  //The final year is never included for stack replacement, so is excluded from the iteration.
  //"""
  let currentStackLifetime: number = stackLifetime;

  const candidateReplacementYears = projectYears(projectLife - 1);

  const stackReplacementYears = [];
  // Don't include final project year as there is no need for stack replacement
  for (let year of candidateReplacementYears) {
    // Account for zero indexing in operating hours per year
    currentStackLifetime -= operatingHoursPerYear[year - 1] * 8760;
    if (currentStackLifetime <= 0) {
      stackReplacementYears.push(year);
      currentStackLifetime += stackLifetime;
    }
  }

  return stackReplacementYears;
}

export function cashFlowAnalysis(
  annualSales: number[],
  totalOpex: number[],
  totalCapexCost: number,
  totalEpcCost: number,
  totalLandCost: number,
  shareOfTotalInvestmentFinancedViaEquity: number,
  directEquityShare: number,
  salvageCostShare: number,
  decommissioningCostShare: number,
  loanTerm: number,
  interestOnLoan: number,
  capitalDepreciationProfile: DepreciationProfile,
  taxRate: number,
  projectLife: number,
  inflationRate: number
) {
  const inflation = applyInflation(inflationRate);

  // net investments
  // direct equity payment

  const totalInvestmentRequired = totalCapexCost + totalEpcCost + totalLandCost;
  const totalEquity = roundToNearestThousand(
    totalInvestmentRequired * shareOfTotalInvestmentFinancedViaEquity
  );

  const directEquityCost = roundToNearestThousand(
    totalEquity * directEquityShare
  );
  const directEquityPayment = first(directEquityCost, projectLife);
  // indirect equity
  const indirectEquityShare = 1 - directEquityShare;
  // Equity supported externally (grants etc) - Indirect equity is considered as a positive cash flow
  const indrectEquityCost = roundToNearestThousand(
    totalEquity * indirectEquityShare
  );
  const indirectEquity = first(indrectEquityCost, projectLife);
  const shareOfTotalInvestmentFinancedViaLoan =
    1 - shareOfTotalInvestmentFinancedViaEquity;
  // cost financed via loan
  const totalLoan =
    totalInvestmentRequired * shareOfTotalInvestmentFinancedViaLoan;
  const costFinancedViaLoan = first(totalLoan, projectLife);

  // salvage cost
  const totalSalvageCost = totalInvestmentRequired * salvageCostShare;
  const salvageCost = decomissioning(totalSalvageCost, projectLife);

  // decomissioning cost
  const decomissioningCost = decomissioning(
    totalInvestmentRequired * decommissioningCostShare,
    projectLife
  );

  // cost of setting up or decommissioning the project
  const netInvestment = directEquityPayment.map(
    (_: number, i: number) =>
      directEquityPayment[i] +
      indirectEquity[i] +
      decomissioningCost[i] -
      salvageCost[i]
  );

  // loan liabilities
  // loan repayment
  const loanRepayment = totalLoan / loanTerm;
  const totalLoanRepayment = padArray(
    projectYears(projectLife).map((year: number) => {
      if (year <= loanTerm) {
        return loanRepayment;
      }
      return 0;
    })
  );
  // interest paid on loan
  const interestPaidOnLoan = padArray(
    projectYears(projectLife).map((year: number) => {
      if (year <= loanTerm) {
        return loanRepayment * (1 + interestOnLoan) ** year - loanRepayment;
      }
      return 0;
    })
  );
  // fixed opex
  const totalOpexWithInflation = inflation(padArray(totalOpex));
  // depreciation
  const incomePreDepreciation = projectYearsWithStartupAndDecommissioning(
    projectLife
  ).map(
    (_: number, i: number) =>
      annualSales[i] -
      netInvestment[i] -
      totalLoanRepayment[i] -
      interestPaidOnLoan[i] -
      totalOpexWithInflation[i]
  );
  const totalDepreciableCapex = totalCapexCost + totalEpcCost;
  const conversionFactors = getConversionFactors(
    capitalDepreciationProfile,
    projectLife
  );
  const depreciation = conversionFactors.map(
    (_: number, i: number) => totalDepreciableCapex * conversionFactors[i]
  );

  // tax liabilities
  const taxableIncome = incomePreDepreciation.map(
    (_: number, i: number) =>
      // TODO check if this formula is right (currently matches Excel)
      incomePreDepreciation[i] - depreciation[i] + totalLoanRepayment[i]
  );

  const tax = taxableIncome.map((_: number, i: number) => {
    if (taxableIncome[i] < 0) {
      return 0;
    }
    return taxableIncome[i] * taxRate;
  });
  // net cash flows
  // after tax and depreciation
  const incomeAfterTaxAndDepreciation = incomePreDepreciation.map(
    (_: number, i: number) => incomePreDepreciation[i] - tax[i]
  );
  const cumulativeSum = (
    (sum: number) => (value: number) =>
      (sum += value)
  )(0);
  const cumulativeCashFlow = incomeAfterTaxAndDepreciation.map(cumulativeSum);

  return {
    directEquityPayment,
    indirectEquity,
    costFinancedViaLoan,
    salvageCost,
    decomissioningCost,
    totalLoanRepayment,
    interestPaidOnLoan,
    totalOpexWithInflation,
    incomePreDepreciation,
    depreciation,
    taxableIncome,
    tax,
    incomeAfterTaxAndDepreciation,
    cumulativeCashFlow,
  };
}

export function sales(
  oxygenSales: number[],
  averageElectricitySpotPrice: number,
  inflationRate: number,
  totalCapexCost: number,
  totalEpcCost: number,
  totalLandCost: number,
  projectLife: number,
  discountRate: number,
  salesMargin: number,
  totalOpex: number[],
  h2Produced: number[],
  electricityProduced: number[]
) {
  const inflation = applyInflation(inflationRate);
  const electricitySales = electricityProduced.map(
    (_: number, i: number) =>
      electricityProduced[i] * averageElectricitySpotPrice
  );

  const totalInvestmentRequired = first(
    totalCapexCost + totalEpcCost + totalLandCost,
    projectLife
  );
  const paddedOpex = padArray(totalOpex);
  const discount = applyDiscount(discountRate);
  const totalCost = totalInvestmentRequired.map((_: number, i: number) => {
    return (
      totalInvestmentRequired[i] +
      paddedOpex[i] -
      oxygenSales[i] -
      electricitySales[i]
    );
  });
  const totalCostWithDiscount = discount(totalCost);
  const h2ProducedKgLCA = discount(
    h2Produced.map((_: number, i: number) => h2Produced[i] * 1000)
  );
  const hydrogenProductionCost = sum(h2ProducedKgLCA);
  const lch2 = sum(totalCostWithDiscount) / hydrogenProductionCost;

  const h2RetailPrice = lch2 + salesMargin;
  // The values can be used to create sales graphs.
  const inflatedElectricitySales = inflation(electricitySales);
  const inflatedOxygenSales = inflation(oxygenSales);
  const inflatedh2Sales = inflation(
    h2Produced.map((x) => x * 1000 * h2RetailPrice)
  );
  const annualSales = inflatedh2Sales.map(
    (_: number, i: number) =>
      inflatedh2Sales[i] + inflatedElectricitySales[i] + inflatedOxygenSales[i]
  );
  return {
    lch2,
    h2RetailPrice,
    totalCost,
    totalCostWithDiscount,
    h2ProducedKgLCA,
    h2Sales: inflatedh2Sales,
    electricitySales: inflatedElectricitySales,
    oxygenSales: inflatedOxygenSales,
    annualSales,
    hydrogenProductionCost,
  };
}

export function applyInflation(rate: number) {
  return (values: number[]) =>
    values.map(
      // i corresponds to year
      (x: number, i: number) => {
        // zero-th year is always skipped as it signifies upfront costs rather than actual operations
        if (i === 0) {
          return x;
        }
        // TODO: Check is passing in array size of PROJECT_YEARS + 1 (to account for 0th year, but going up to project life)
        return x * (1 + rate) ** i;
      }
    );
}

export function applyDiscount(rate: number) {
  return (values: number[]) =>
    values.map(
      // i corresponds to year
      (x: number, i: number) => {
        // zero-th year is always skipped as it signifies upfront costs rather than actual operations
        if (i === 0) {
          return x;
        }
        // TODO: Check is passing in array size of PROJECT_YEARS + 1 (to account for 0th year, but going up to project life)
        return x / (1 + rate) ** i;
      }
    );
}

export function getSummedDiscountForOpexCost(
  opex: number,
  discountRate: number,
  years: number
): number {
  let sum = 0;
  for (let i = 1; i <= years; i++) {
    sum += opex / (1 + discountRate / 100) ** i;
  }
  return sum;
}

export function getSummedDiscountForOpexValues(
  opexValues: number[],
  discountRate: number,
  years: number
): number {
  let sum = 0;
  for (let i = 1; i <= years; i++) {
    // Need to minus 1 as assuming opexValues is zero indexes
    sum += opexValues[i - 1] / (1 + discountRate / 100) ** i;
  }
  return sum;
}

function getConversionFactors(
  capitalDepreciationProfile: DepreciationProfile,
  projectLife: number
) {
  let selectedModel = null;
  // come from conversion factors tab
  // can probs use the formula instead of hardcoded table
  switch (capitalDepreciationProfile) {
    // TODO when default to straight line it breaks with undefined
    case "Straight Line": {
      selectedModel = Array(projectLife).fill(1 / projectLife);
      break;
    }
    case "MACRs - 3 year Schedule": {
      selectedModel = [0.3333, 0.4445, 0.1481, 0.0741];
      break;
    }
    case "MACRs - 5 year Schedule": {
      selectedModel = [0.2, 0.32, 0.192, 0.1152, 0.1152, 0.0576];
      break;
    }
    case "MACRs - 7 year Schedule": {
      selectedModel = [0.1429, 0.1749, 0.1249, 0.0893, 0.892, 0.893, 0.0446];
      break;
    }
    case "MACRs - 10 year Schedule": {
      selectedModel = [
        0.1, 0.18, 0.144, 0.1152, 0.0922, 0.0737, 0.0655, 0.0655, 0.0656,
        0.0655, 0.0328,
      ];
      break;
    }
    case "MACRs - 15 year Schedule": {
      selectedModel = [
        0.05, 0.095, 0.0855, 0.077, 0.0693, 0.0623, 0.059, 0.059, 0.0591, 0.059,
        0.0591, 0.059, 0.0591, 0.059, 0.0591, 0.0295,
      ];
      break;
    }
    case "MACRs - 20 year Schedule": {
      selectedModel = [
        0.0375, 0.0722, 0.0668, 0.0618, 0.0571, 0.0529, 0.0489, 0.0452, 0.0446,
        0.0446, 0.0446, 0.0446, 0.0446, 0.0446, 0.0446, 0.0446, 0.0446, 0.0446,
        0.0446, 0.0446, 0.0223,
      ];
      break;
    }
    default: {
      throw new Error("Unknown depreciation profile");
    }
  }
  const padding = projectLife - selectedModel.length;
  return padArray(selectedModel.concat(Array(padding).fill(0)));
}

export function projectYears(projectLife: number): number[] {
  // gives you array of years starting from 1 and ending in projectLife inclusive
  return Array.from({ length: projectLife }, (_, i) => i + 1);
}

function projectYearsWithStartupAndDecommissioning(
  projectLife: number
): number[] {
  // gives you array of years starting from start-up, including projectLife years and then decommissioning
  return Array.from({ length: projectLife + 2 });
}
export function getReplacementCostOverProjectLife(
  cost: number,
  isReplacementYear: (year: number) => boolean,
  projectLife: number
): number[] {
  const costArray: number[] = new Array(projectLife).fill(0);
  for (let year = 1; year <= projectLife; year++) {
    if (isReplacementYear(year)) {
      costArray[year - 1] = cost;
    }
  }
  return costArray;
}
