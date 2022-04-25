import {
  first,
  decomissioning,
  projectYears,
  activeYears,
  padArray,
} from "../../model/Utils";
import { DepreciationProfile } from "../../types";

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
  // sales
  const salesTotal = inflation(annualSales);

  // net investments
  // direct equity payment

  const totalInvestmentRequired = totalCapexCost + totalEpcCost + totalLandCost;
  const totalEquity = roundToNearestThousand(
    totalInvestmentRequired * shareOfTotalInvestmentFinancedViaEquity
  );
  const directEquityPayment = first(
    roundToNearestThousand(totalEquity * directEquityShare),
    projectLife
  );
  // indirect equity
  const indirectEquityShare = 1 - directEquityShare;
  // Equity supported externally (grants etc) - Indirect equity is considered as a positive cash flow
  const indirectEquity = first(
    roundToNearestThousand(totalEquity * indirectEquityShare),
    projectLife
  );
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

  // cost of setting up the project
  const netInvestment = directEquityPayment.map(
    (_: number, i: number) =>
      directEquityPayment[i] +
      decomissioningCost[i] -
      // TODO check if costFinancedViaLoan should be positive since it's money you get in and repay later every year
      costFinancedViaLoan[i] -
      indirectEquity[i] -
      salvageCost[i]
  );

  // loan liabilities
  // loan repayment
  const loanRepayment = totalLoan / loanTerm;
  const totalLoanRepayment = padArray(
    projectYears(projectLife).map((year: number) => {
      if (year < loanTerm) {
        return loanRepayment;
      }
      return 0;
    })
  );
  // interest paid on loan
  const interestPaidOnLoan = padArray(
    projectYears(projectLife).map((year: number) => {
      if (year < loanTerm) {
        return loanRepayment * (1 + interestOnLoan) ** year - loanRepayment;
      }
      return 0;
    })
  );
  // fixed opex
  const totalOpexWithInflation = inflation(padArray(totalOpex));
  // depreciation
  const incomePreDepreciation = directEquityPayment.map(
    (_: number, i: number) => {
      return (
        salesTotal[i] -
        netInvestment[i] -
        totalLoanRepayment[i] -
        interestPaidOnLoan[i] -
        totalOpexWithInflation[i]
      );
    }
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
      // TODO check that if totalLoanRepayment should include total interest paid
      incomePreDepreciation[i] - depreciation[i] - totalLoanRepayment[i]
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
  h2RetailPrice: number,
  oxygenRetailPrice: number,
  averageElectricitySpotPrice: number,
  h2Produced: number[],
  electricityProduced: number[],
  electricityConsumed: number[]
) {
  // The values can be used to create sales graphs.
  const h2Sales = h2Produced.map((x) => x * 1000 * h2RetailPrice);

  const electricitySales = electricityProduced.map(
    (_: number, i: number) =>
      (electricityProduced[i] - electricityConsumed[i]) *
      averageElectricitySpotPrice
  );
  const oxygenSales = h2Produced.map(
    (_: number, i: number) => 8 * h2Produced[i] * oxygenRetailPrice
  );

  const annualSales = h2Sales.map(
    (_: number, i: number) => h2Sales[i] + electricitySales[i] + oxygenSales[i]
  );
  return {
    h2Sales,
    electricitySales,
    oxygenSales,
    annualSales,
  };
}

function applyInflation(rate: number) {
  return (values: number[]) => {
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
