import { InputFields, isGridConnected, isPPAAgreement } from "../../types";
import { fillYearsArray, isSolar, isWind, projectYears } from "../../utils";
import { roundToNearestThousand, roundToTwoDP } from "./cost-functions";

export function generateOpexValues(
  data: InputFields,
  electrolyserCAPEX: number,
  batteryCAPEX: number,
  totalOperatingHoursPerYear: number[],
  electricityConsumed: number[],
  electricityConsumedByBattery: number[],
  h2Produced: number[]
) {
  const {
    projectLife,
    technology,
    powerPlantConfiguration,

    principalPPACost = 0,
    additionalTransmissionCharges = 0,

    electrolyserOMCost,
    electrolyserStackReplacement,
    electrolyserWaterCost,
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
          projectLife
        )
      : cumulativeStackReplacementYears(
          totalOperatingHoursPerYear,
          stackLifetime,
          projectLife
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
      projectLife
    );

  const electrolyserOpexPerYear = getOpexPerYearInflationWithAdditionalCost(
    electrolyserOpexCost,
    inflationRate,
    projectLife,
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
    projectLife
  );

  const additionalOpexPerYear = getOpexPerYearInflationConstant(
    additionalAnnualCosts,
    inflationRate,
    projectLife
  );

  // Battery costs
  const batteryOpexCost: number = roundToNearestThousand(
    batteryOMCost * batteryRatedPower
  );
  const actualBatteryReplacementCost =
    (batteryReplacementCost / 100) * batteryCAPEX;
  const shouldAddBatteryReplacementCost = (year: number): boolean =>
    batteryLifetime > 0 && year % batteryLifetime === 0 && year < projectLife;
  const batteryReplacementCostsOverProjectLife =
    getReplacementCostOverProjectLife(
      actualBatteryReplacementCost,
      shouldAddBatteryReplacementCost,
      projectLife
    );

  const batteryOpexPerYear =
    batteryRatedPower > 0
      ? getOpexPerYearInflationWithAdditionalCost(
          batteryOpexCost,
          inflationRate,
          projectLife,
          batteryReplacementCostsOverProjectLife
        )
      : Array(projectLife).fill(0);

  const gridConnectionOpexPerYear: number[] = gridConnected
    ? fillYearsArray(
        projectLife,
        (i) =>
          additionalTransmissionCharges *
          (electricityConsumed[i] + electricityConsumedByBattery[i])
      )
    : Array(projectLife).fill(0);

  // Check for PPA Agreement
  const totalPPACost = ppaAgreement
    ? principalPPACost + additionalTransmissionCharges
    : 0;
  const electricityOpexCost: number[] = fillYearsArray(
    projectLife,
    (i) =>
      totalPPACost * (electricityConsumed[i] + electricityConsumedByBattery[i])
  );
  const electricityPurchaseOpexPerYear = getOpexPerYearInflation(
    electricityOpexCost,
    inflationRate,
    projectLife
  );

  const waterOpexCost: number[] = fillYearsArray(
    projectLife,
    (i) =>
      electrolyserWaterCost * waterRequirementOfElectrolyser * h2Produced[i]
  );
  const waterOpexPerYear = getOpexPerYearInflation(
    waterOpexCost,
    inflationRate,
    projectLife
  );

  const totalOpex = fillYearsArray(
    projectLife,
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
  projectLife: number
): number[] {
  let currentStackDegradation = 0;
  const replacementYears = [];
  for (let year of projectYears(projectLife)) {
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
