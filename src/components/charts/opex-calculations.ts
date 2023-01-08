import {
  PowerPlantConfiguration,
  PowerSupplyOption,
  StackReplacementType,
  isGridConnected,
  isPPAAgreement,
} from "../../types";
import { fillYearsArray, isSolar, isWind, projectYears } from "../../utils";
import { roundToNearestThousand, roundToTwoDP } from "./cost-functions";

export function getOpex(
  powerPlantConfiguration: PowerPlantConfiguration,
  powerSupplyOption: PowerSupplyOption,
  stackReplacementType: StackReplacementType,
  stackDegradation: number,
  maximumDegradationBeforeReplacement: number,
  projectTimeline: number,
  totalOperatingHoursPerYear: number[],
  stackLifetime: number,
  electrolyserStackReplacement: number,
  electrolyserCAPEX: number,
  electrolyserOMCost: number,
  powerPlantType: string,
  solarOpex: number,
  solarNominalCapacity: number,
  windOpex: number,
  windNominalCapacity: number,
  batteryOMCost: number,
  batteryRatedPower: number,
  batteryReplacementCost: number,
  batteryCAPEX: number,
  batteryLifetime: number,
  additionalTransmissionCharges: number,
  electricityConsumed: number[],
  electricityConsumedByBattery: number[],
  principalPPACost: number,
  waterSupplyCost: number,
  waterRequirementOfElectrolyser: number,
  h2Produced: number[]
) {
  const gridConnected: boolean = isGridConnected(powerPlantConfiguration);
  const ppaAgreement: boolean = isPPAAgreement(powerSupplyOption);

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

  const electrolyserStackReplacementCost = roundToNearestThousand(
    (electrolyserStackReplacement / 100) * electrolyserCAPEX
  );

  const electrolyserOpexCost = roundToNearestThousand(
    (electrolyserOMCost / 100) * electrolyserCAPEX
  );

  const stackReplacementCostsOverProjectLife =
    getReplacementCostOverProjectLife(
      electrolyserStackReplacementCost,
      (year: number) => stackReplacementYears.includes(year),
      projectTimeline
    );

  const solarOpexCost =
    isSolar(powerPlantType) && !ppaAgreement
      ? roundToNearestThousand(solarOpex * solarNominalCapacity)
      : 0;
  const windOpexCost =
    isWind(powerPlantType) && !ppaAgreement
      ? roundToNearestThousand(windOpex * windNominalCapacity)
      : 0;

  const powerPlantOpexCost = solarOpexCost + windOpexCost;

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

  const waterOpexCost: number[] = fillYearsArray(
    projectTimeline,
    (i) => waterSupplyCost * waterRequirementOfElectrolyser * h2Produced[i]
  );

  return {
    electricityOpexCost,
    electrolyserOpexCost,
    powerPlantOpexCost,
    batteryOpexCost,
    waterOpexCost,
    stackReplacementCostsOverProjectLife,
    batteryReplacementCostsOverProjectLife,
    gridConnectionOpexPerYear,
  };
}

export function getTotalHydrogenOpex(
  projectTimeline: number,
  electrolyserOpexCost: number,
  powerPlantOpexCost: number,
  batteryOpexCost: number,
  electricityOpexCost: number[],
  waterOpexCost: number[],
  gridConnectionOpexPerYear: number[],
  additionalAnnualCosts: number,
  stackReplacementCostsOverProjectLife: number[],
  batteryReplacementCostsOverProjectLife: number[]
) {
  return fillYearsArray(
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
}

export function getTotalP2XOpex(
  projectTimeline: number,
  electrolyserOpexCost: number,
  powerPlantOpexCost: number,
  batteryOpexCost: number,
  electricityOpexCost: number[],
  waterOpexCost: number[],
  gridConnectionOpexPerYear: number[],
  additionalAnnualCosts: number,
  stackReplacementCostsOverProjectLife: number[],
  batteryReplacementCostsOverProjectLife: number[],
  h2StorageOpexCost: number,
  p2XOpexCost: number
) {
  return fillYearsArray(
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
      batteryReplacementCostsOverProjectLife[i] +
      h2StorageOpexCost +
      p2XOpexCost
  );
}

export function getP2XOpex(
  hydrogenStorageCapacity: number,
  hydrogenStoragePurchaseCost: number,
  hydrogenStorageOMCost: number,
  plantCapacity: number,
  storageCapacity: number,
  secondaryUnitCapacity: number,
  synthesisUnitPurchaseCost: number,
  storagePurchaseCost: number,
  secondaryUnitPurchaseCost: number,
  plantOMCostPercentage: number,
  storageOMCostPercentage: number,
  secondaryUnitPlantOMCostPercentage: number
) {
  const plantOpexCost =
    ((plantCapacity * synthesisUnitPurchaseCost * plantOMCostPercentage) /
      100) *
    1000;
  const storageUnitOpexCost =
    (plantCapacity *
      storageCapacity *
      storagePurchaseCost *
      (storageOMCostPercentage / 100) *
      1000) /
    365;
  const secondaryUnitOpexCost =
    (secondaryUnitCapacity *
      secondaryUnitPurchaseCost *
      365 *
      secondaryUnitPlantOMCostPercentage) /
    100;

  const h2StorageOpexCost = roundToNearestThousand(
    (hydrogenStorageCapacity *
      hydrogenStoragePurchaseCost *
      hydrogenStorageOMCost) /
      100
  );

  return {
    h2StorageOpexCost,
    plantOpexCost,
    storageUnitOpexCost,
    secondaryUnitOpexCost,
  };
}

export function calculatePerYearOpex(
  electrolyserOpexCost: number,
  inflationRate: number,
  projectTimeline: number,
  stackReplacementCostsOverProjectLife: number[],
  electricityOpexCost: number[],
  powerPlantOpexCost: number,
  additionalAnnualCosts: number,
  batteryRatedPower: number,
  batteryOpexCost: number,
  batteryReplacementCostsOverProjectLife: number[],
  waterOpexCost: number[]
) {
  const electrolyserOpexPerYear = getOpexPerYearInflationWithAdditionalCost(
    electrolyserOpexCost,
    inflationRate,
    projectTimeline,
    stackReplacementCostsOverProjectLife
  );

  const electricityPurchaseOpexPerYear = getOpexPerYearInflation(
    electricityOpexCost,
    inflationRate,
    projectTimeline
  );

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
  const batteryOpexPerYear =
    batteryRatedPower > 0
      ? getOpexPerYearInflationWithAdditionalCost(
          batteryOpexCost,
          inflationRate,
          projectTimeline,
          batteryReplacementCostsOverProjectLife
        )
      : Array(projectTimeline).fill(0);

  const waterOpexPerYear = getOpexPerYearInflation(
    waterOpexCost,
    inflationRate,
    projectTimeline
  );
  return {
    electrolyserOpexPerYear,
    powerPlantOpexPerYear,
    batteryOpexPerYear,
    waterOpexPerYear,
    electricityPurchaseOpexPerYear,
    additionalOpexPerYear,
  };
}

export function calculateAmmoniaPerYearOpex(
  h2StorageOpexCost: number,
  ammoniaOpexCost: number,
  inflationRate: number,
  projectTimeline: number
) {
  const h2StorageOpexPerYear = getOpexPerYearInflationConstant(
    h2StorageOpexCost,
    inflationRate,
    projectTimeline
  );
  const ammoniaOpexPerYear = getOpexPerYearInflationConstant(
    ammoniaOpexCost,
    inflationRate,
    projectTimeline
  );

  return {
    h2StorageOpexPerYear,
    ammoniaOpexPerYear,
  };
}

export function calculateMethanolPerYearOpex(
  h2StorageOpexCost: number,
  methanolOpexCost: number,
  ccOpexCost: number,
  inflationRate: number,
  projectTimeline: number
) {
  const h2StorageOpexPerYear = getOpexPerYearInflationConstant(
    h2StorageOpexCost,
    inflationRate,
    projectTimeline
  );
  const methanolOpexPerYear = getOpexPerYearInflationConstant(
    methanolOpexCost,
    inflationRate,
    projectTimeline
  );
  const ccOpexPerYear = getOpexPerYearInflationConstant(
    ccOpexCost,
    inflationRate,
    projectTimeline
  );

  return {
    h2StorageOpexPerYear,
    methanolOpexPerYear,
    ccOpexPerYear,
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
