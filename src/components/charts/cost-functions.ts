import { DepreciationProfile } from "../../types";
import {
  decomissioning,
  dropPadding,
  fillYearsArray,
  padArray,
  startup,
  sum,
} from "../../utils";

export const getBaseLog = (n: number, base: number): number =>
  Math.log(n) / Math.log(base);

export const roundToNearestThousand = (n: number) =>
  Math.round(n / 1000) * 1000 || 0;

export const roundToTwoDP = (n: number) => Math.round(n * 100) / 100 || 0;

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
  const activeLife = projectLife + 2;
  const applyInflation = getInflationFn(inflationRate, activeLife);
  const paddedAnnualSales = padArray(annualSales);

  // net investments
  // direct equity payment

  const totalInvestmentRequired = totalCapexCost + totalEpcCost + totalLandCost;
  const totalEquity = roundToNearestThousand(
    totalInvestmentRequired * shareOfTotalInvestmentFinancedViaEquity
  );

  const directEquityCost = roundToNearestThousand(
    totalEquity * directEquityShare
  );
  const directEquityPayment = startup(directEquityCost, projectLife);
  // indirect equity
  const indirectEquityShare = 1 - directEquityShare;
  // Equity supported externally (grants etc) - Indirect equity is considered as a positive cash flow
  const indrectEquityCost = roundToNearestThousand(
    totalEquity * indirectEquityShare
  );
  const indirectEquity = startup(indrectEquityCost, projectLife);
  const shareOfTotalInvestmentFinancedViaLoan =
    1 - shareOfTotalInvestmentFinancedViaEquity;
  // cost financed via loan
  const totalLoan =
    totalInvestmentRequired * shareOfTotalInvestmentFinancedViaLoan;
  const costFinancedViaLoan = startup(totalLoan, projectLife);

  // salvage cost
  const totalSalvageCost = totalInvestmentRequired * salvageCostShare;
  const salvageCost = decomissioning(totalSalvageCost, projectLife);

  // decomissioning cost
  const decomissioningCost = decomissioning(
    totalInvestmentRequired * decommissioningCostShare,
    projectLife
  );

  // cost of setting up or decommissioning the project
  const netInvestment = fillYearsArray(
    activeLife,
    (i: number) =>
      directEquityPayment[i] +
      indirectEquity[i] +
      decomissioningCost[i] -
      salvageCost[i]
  );

  // loan liabilities
  // const totalLoanCostValues = first(totalLoan, projectLife);
  // loan repayment
  const loanRepayment = totalLoan / loanTerm;
  const totalLoanRepayment = fillYearsArray(activeLife, (year: number) => {
    if (year === 0 || year === activeLife - 1 || year > loanTerm) {
      return 0;
    }
    return loanRepayment;
  });

  const loanBalance = calculateLoanBalance(
    totalLoan,
    projectLife,
    loanRepayment
  );

  const interestPaidOnLoan = loanBalance.map(
    (balance: number) => balance * interestOnLoan
  );

  // fixed opex
  const totalOpexWithInflation = applyInflation(padArray(totalOpex));
  // depreciation
  const incomePreDepreciation = fillYearsArray(
    activeLife,
    (i: number) =>
      paddedAnnualSales[i] -
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
  const depreciation = fillYearsArray(
    activeLife,
    (i: number) => totalDepreciableCapex * conversionFactors[i]
  );

  // tax liabilities
  const taxableIncome = fillYearsArray(
    activeLife,
    (i: number) =>
      incomePreDepreciation[i] - depreciation[i] + interestPaidOnLoan[i]
  );

  const tax = fillYearsArray(activeLife, (i: number) => {
    if (taxableIncome[i] < 0) {
      return 0;
    }
    return taxableIncome[i] * taxRate;
  });

  // net cash flows
  // after tax and depreciation
  const incomeAfterTaxAndDepreciation = fillYearsArray(
    activeLife,
    (i: number) => incomePreDepreciation[i] - tax[i]
  );

  const cumulativeSum = (
    (sum: number) => (value: number) =>
      (sum += value)
  )(0);
  const cumulativeCashFlow = incomeAfterTaxAndDepreciation.map(cumulativeSum);

  return {
    cumulativeCashFlow,
  };
}

export function calculateLoanBalance(
  totalLoan: number,
  projectLife: number,
  loanRepayment: number
) {
  const loanBalance: number[] = [0, totalLoan];

  for (let i = 1; i <= projectLife; i++) {
    const newBalance = loanBalance[i] - loanRepayment;
    if (newBalance > 0) {
      loanBalance.push(newBalance);
    } else {
      loanBalance.push(0);
    }
  }
  return loanBalance;
}

export function sales(
  // Calculated values
  totalCapexCost: number,
  totalEpcCost: number,
  totalLandCost: number,
  // Inputs
  projectLife: number,
  discountRate: number,
  salesMargin: number,
  averageElectricitySpotPrice: number,
  inflationRate: number,
  // Values per year of project life
  oxygenSales: number[],
  totalOpex: number[],
  h2Produced: number[],
  electricityProduced: number[]
) {
  const activeLife = projectLife + 2;

  const paddedH2Produced = padArray(h2Produced);
  const paddedElectricityProduced = padArray(electricityProduced);
  const paddedTotalOpex = padArray(totalOpex);
  const paddedOxygenSales = padArray(oxygenSales);

  const electricitySales = fillYearsArray(
    activeLife,
    (i: number) => paddedElectricityProduced[i] * averageElectricitySpotPrice
  );

  const totalInvestmentRequired = startup(
    totalCapexCost + totalEpcCost + totalLandCost,
    projectLife
  );

  const totalCost = fillYearsArray(
    activeLife,
    (i: number) =>
      totalInvestmentRequired[i] +
      paddedTotalOpex[i] -
      paddedOxygenSales[i] -
      electricitySales[i]
  );

  const applyInflation = getInflationFn(inflationRate, activeLife);
  const applyDiscount = getDiscountFn(discountRate, activeLife);

  const totalCostWithDiscount = applyDiscount(totalCost);
  const h2ProducedKgLCA = applyDiscount(
    fillYearsArray(activeLife, (i: number) => paddedH2Produced[i] * 1000)
  );

  const hydrogenProductionCost = sum(h2ProducedKgLCA);
  const lch2 = sum(totalCostWithDiscount) / hydrogenProductionCost;
  const h2RetailPrice = lch2 + salesMargin;

  // The values can be used to create sales graphs.
  const inflatedElectricitySales = applyInflation(electricitySales);
  const inflatedOxygenSales = applyInflation(paddedOxygenSales);
  const inflatedh2Sales = applyInflation(
    paddedH2Produced.map((x) => x * 1000 * h2RetailPrice)
  );
  const paddedAnnualSales = inflatedh2Sales.map(
    (_: number, i: number) =>
      inflatedh2Sales[i] + inflatedElectricitySales[i] + inflatedOxygenSales[i]
  );

  return {
    lch2,
    h2RetailPrice,
    totalCost,
    totalCostWithDiscount,
    hydrogenProductionCost,
    // Drop padding to account for sales graphs tracking project years
    h2Sales: dropPadding(inflatedh2Sales),
    electricitySales: dropPadding(inflatedElectricitySales),
    oxygenSales: dropPadding(inflatedOxygenSales),
    annualSales: dropPadding(paddedAnnualSales),
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

  // TODO: Add test for when project life doesn't match schedule
  if (padding < 0) {
    throw new Error(`Invalid capital depriciation profile ${capitalDepreciationProfile}.
                      Project life must be at least ${selectedModel.length} years and current project life is ${projectLife}.`);
  }

  selectedModel.push(...Array(padding).fill(0));
  return padArray(selectedModel);
}
