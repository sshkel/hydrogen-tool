import { Inputs, isGridConnected, isPPAAgreement } from "../../types";
import { fillYearsArray, isSolar, isWind, projectYears } from "../../utils";
import { roundToNearestThousand, roundToTwoDP } from "./cost-functions";

export function generateOpexValues(
  data: Inputs,
  electrolyserCAPEX: number,
  batteryCAPEX: number,
  totalOperatingHoursPerYear: number[],
  electricityConsumed: number[],
  electricityConsumedByBattery: number[],
  h2Produced: number[]
) {
  const {
    projectTimeline,
    technology,
    powerPlantConfiguration,

    principalPPACost = 0,
    additionalTransmissionCharges = 0,

    electrolyserOMCost,
    electrolyserStackReplacement,
    waterSupplyCost,
    waterRequirementOfElectrolyser,

    solarOpex = 0,
    solarNominalCapacity,
    windOpex = 0,
    windNominalCapacity,

    additionalAnnualCosts,

    batteryOMCost = 0,
    batteryRatedPower = 0,
    batteryLifetime = 0,
    batteryReplacementCost = 0,

    stackReplacementType,
    stackDegradation,
    maximumDegradationBeforeReplacement,
    stackLifetime,

    inflationRate,
  } = data;

  const gridConnected: boolean = isGridConnected(powerPlantConfiguration);
  const ppaAgreement: boolean = isPPAAgreement(powerPlantConfiguration);

  // Stack Lifetime needed for opex calculations
  const stackReplacementYears: number[] =
    stackReplacementType === "Maximum Degradation Level"
      ? maxDegradationStackReplacementYears(
          stackDegradation,
          maximumDegradationBeforeReplacement,
          projectTimeline
        )
      : cumulativeStackReplacementYears(
          totalOperatingHoursPerYear,
          stackLifetime,
          projectTimeline
        );

  const electrolyserStackReplacementCost =
    (electrolyserStackReplacement / 100) * electrolyserCAPEX;

  const electrolyserOpexCost = roundToNearestThousand(
    (electrolyserOMCost / 100) * electrolyserCAPEX
  );

  const stackReplacementCostsOverProjectLife =
    getReplacementCostOverProjectLife(
      electrolyserStackReplacementCost,
      (year: number) => stackReplacementYears.includes(year),
      projectTimeline
    );

  const electrolyserOpexPerYear = getOpexPerYearInflationWithAdditionalCost(
    electrolyserOpexCost,
    inflationRate,
    projectTimeline,
    stackReplacementCostsOverProjectLife
  );

  const solarOpexCost = isSolar(technology)
    ? roundToNearestThousand(solarOpex * solarNominalCapacity)
    : 0;
  const windOpexCost = isWind(technology)
    ? roundToNearestThousand(windOpex * windNominalCapacity)
    : 0;

  const powerPlantOpexCost = solarOpexCost + windOpexCost;
  const powerPlantOpexPerYear = getOpexPerYearInflationConstant(
    powerPlantOpexCost,
    inflationRate,
    projectTimeline
  );

  const additionalOpexPerYear = getOpexPerYearInflationConstant(
    additionalAnnualCosts,
    inflationRate,
    projectTimeline
  );

  // Battery costs
  const batteryOpexCost: number = roundToNearestThousand(
    batteryOMCost * batteryRatedPower
  );
  const actualBatteryReplacementCost =
    (batteryReplacementCost / 100) * batteryCAPEX;
  const shouldAddBatteryReplacementCost = (year: number): boolean =>
    batteryLifetime > 0 &&
    year % batteryLifetime === 0 &&
    year < projectTimeline;
  const batteryReplacementCostsOverProjectLife =
    getReplacementCostOverProjectLife(
      actualBatteryReplacementCost,
      shouldAddBatteryReplacementCost,
      projectTimeline
    );

  const batteryOpexPerYear =
    batteryRatedPower > 0
      ? getOpexPerYearInflationWithAdditionalCost(
          batteryOpexCost,
          inflationRate,
          projectTimeline,
          batteryReplacementCostsOverProjectLife
        )
      : Array(projectTimeline).fill(0);

  const gridConnectionOpexPerYear: number[] = gridConnected
    ? fillYearsArray(
        projectTimeline,
        (i) =>
          additionalTransmissionCharges *
          (electricityConsumed[i] + electricityConsumedByBattery[i])
      )
    : Array(projectTimeline).fill(0);

  // Check for PPA Agreement
  const totalPPACost = ppaAgreement
    ? principalPPACost + additionalTransmissionCharges
    : 0;
  const electricityOpexCost: number[] = fillYearsArray(
    projectTimeline,
    (i) =>
      totalPPACost * (electricityConsumed[i] + electricityConsumedByBattery[i])
  );
  const electricityPurchaseOpexPerYear = getOpexPerYearInflation(
    electricityOpexCost,
    inflationRate,
    projectTimeline
  );

  const waterOpexCost: number[] = fillYearsArray(
    projectTimeline,
    (i) => waterSupplyCost * waterRequirementOfElectrolyser * h2Produced[i]
  );
  const waterOpexPerYear = getOpexPerYearInflation(
    waterOpexCost,
    inflationRate,
    projectTimeline
  );

  const totalOpex = fillYearsArray(
    projectTimeline,
    (i: number) =>
      electrolyserOpexCost +
      powerPlantOpexCost +
      batteryOpexCost +
      electricityOpexCost[i] +
      waterOpexCost[i] +
      gridConnectionOpexPerYear[i] +
      additionalAnnualCosts +
      stackReplacementCostsOverProjectLife[i] +
      batteryReplacementCostsOverProjectLife[i]
  );

  return {
    electrolyserOpexCost,
    electrolyserOpexPerYear,
    powerPlantOpexCost,
    powerPlantOpexPerYear,

    batteryOpexCost,
    batteryOpexPerYear,
    waterOpexCost,
    waterOpexPerYear,

    electricityPurchaseOpexPerYear,

    stackReplacementCostsOverProjectLife,
    batteryReplacementCostsOverProjectLife,

    additionalOpexPerYear,
    gridConnectionOpexPerYear,
    totalOpex,
  };
}

export function cumulativeStackReplacementYears(
  // array of size projectTimeline with operating hours per year
  operatingHoursPerYear: number[],
  stackLifetime: number,
  projectTimeline: number
): number[] {
  // """Private method - Returns a list of the years in which the electrolyser stack will need replacing, defined as
  //the total operating time surpassing a multiple of the stack lifetime.
  //The final year is never included for stack replacement, so is excluded from the iteration.
  //"""
  let currentStackLifetime: number = stackLifetime;

  const candidateReplacementYears = projectYears(projectTimeline - 1);

  const stackReplacementYears = [];
  // Don't include final project year as there is no need for stack replacement
  for (let year of candidateReplacementYears) {
    // Account for zero indexing in operating hours per year
    currentStackLifetime -= operatingHoursPerYear[year - 1];
    if (currentStackLifetime <= 0) {
      stackReplacementYears.push(year);
      currentStackLifetime += stackLifetime;
    }
  }

  return stackReplacementYears;
}

export function maxDegradationStackReplacementYears(
  stackDegradation: number,
  maximumDegradationBeforeReplacement: number,
  projectTimeline: number
): number[] {
  let currentStackDegradation = 0;
  const replacementYears = [];
  for (let year of projectYears(projectTimeline)) {
    if (currentStackDegradation >= maximumDegradationBeforeReplacement) {
      replacementYears.push(year);
      currentStackDegradation = 0;
    } else {
      currentStackDegradation += stackDegradation;
    }
  }
  return replacementYears;
}

export function getReplacementCostOverProjectLife(
  cost: number,
  isReplacementYear: (year: number) => boolean,
  projectTimeline: number
): number[] {
  const costArray: number[] = new Array(projectTimeline).fill(0);
  for (let year = 1; year <= projectTimeline; year++) {
    if (isReplacementYear(year)) {
      costArray[year - 1] = cost;
    }
  }
  return costArray;
}

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
