import { DepreciationProfile } from "../../types";
import { fillYearsArray, padArray, startup, sum } from "../../utils";

export const getBaseLog = (n: number, base: number): number =>
  Math.log(n) / Math.log(base);

export const roundToNearestThousand = (n: number) =>
  Math.round(n / 1000) * 1000 || 0;

export const roundToTwoDP = (n: number) => Math.round(n * 100) / 100 || 0;

export function calculateLoanBalance(
  totalLoan: number,
  projectTimeline: number,
  loanRepayment: number
) {
  const loanBalance: number[] = [0, totalLoan];

  for (let i = 1; i <= projectTimeline; i++) {
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

export function getConversionFactors(
  capitalDepreciationProfile: DepreciationProfile,
  projectTimeline: number
) {
  let selectedModel = null;
  // come from conversion factors tab
  // can probs use the formula instead of hardcoded table
  switch (capitalDepreciationProfile) {
    // TODO when default to straight line it breaks with undefined
    case "Straight Line": {
      selectedModel = Array(projectTimeline).fill(1 / projectTimeline);
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
  const padding = projectTimeline - selectedModel.length;

  if (padding > 0) {
    selectedModel.push(...Array(padding).fill(0));
  } else {
    selectedModel = selectedModel.slice(0, projectTimeline);
  }

  return padArray(selectedModel);
}
