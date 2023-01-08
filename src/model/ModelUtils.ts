import { backCalculatePowerPlantCapacity } from "../components/charts/basic-calculations";
import { roundToEightDP } from "../components/charts/cost-functions";
import { maxDegradationStackReplacementYears } from "../components/charts/opex-calculations";
import { PowerPlantType, StackReplacementType } from "../types";
import { mean, sum } from "../utils";
import { CsvRow, ModelSummaryPerYear } from "./ModelTypes";

// returns powerplantCapacityFactors series
export function calculatePowerPlantCapacityFactors(
  solarData: CsvRow[],
  windData: CsvRow[],
  solarRatio: number,
  windRatio: number,
  location: string,
  solarDegradation: number = 0,
  windDegradation: number = 0,
  year: number = 1
): number[] {
  // padd with zeros for zones where there is no solar data available
  const solarDfValues = solarData.map((r: CsvRow) =>
    r[location] ? r[location] : 0
  );

  const windDfValues = windData.map((r: CsvRow) => r[location]);
  // Degradation values
  const power = year - 1;
  const solarDeg = 1 - solarDegradation / 100;
  const windDeg = 1 - windDegradation / 100;
  if (solarRatio === 1) {
    if (solarDegradation === 0) {
      return solarDfValues;
    }
    return solarDfValues.map(
      (_: number, i: number) =>
        solarDfValues[i] * solarRatio * solarDeg ** power
    );
  } else if (windRatio === 1) {
    if (windDegradation === 0) {
      return windDfValues;
    }
    return windDfValues.map(
      (_: number, i: number) => windDfValues[i] * windRatio * windDeg ** power
    );
  } else {
    return solarDfValues.map(
      (_: number, i: number) =>
        solarDfValues[i] * solarRatio * solarDeg ** power +
        windDfValues[i] * windRatio * windDeg ** power
    );
  }
}

// returns electrolyserCapacityFactors series
export function calculateElectrolyserCapacityFactors(
  oversizeRatio: number,
  electrolyserMaxLoad: number,
  electrolyserMinLoad: number,
  powerPlantCapacityFactors: number[]
): number[] {
  const calculateElectrolyser = (x: number): number => {
    if (x * oversizeRatio > electrolyserMaxLoad) {
      return electrolyserMaxLoad;
    }

    if (x * oversizeRatio < electrolyserMinLoad) {
      return 0;
    }
    return x * oversizeRatio;
  };

  return powerPlantCapacityFactors.map(calculateElectrolyser);
}

function batteryPower(
  battCapacity: number,
  battPower: number,
  battMin: number,
  batteryLosses: number,
  battMax: number,
  elecMinLoad: number,
  elecMaxLoad: number,
  elecCapacity: number,
  electrolyserCapacityFactorPrev: number,
  electroylserCapacityFactorCur: number,
  excessEnergyCur: number,
  netBatteryFlowPrev: number,
  batterySocPrev: number
): number {
  if (battCapacity > 0) {
    if (
      electroylserCapacityFactorCur === 0 &&
      excessEnergyCur +
        Math.min(battPower, (batterySocPrev - battMin) * battCapacity) *
          batteryLosses >
        elecMinLoad * elecCapacity &&
      (electrolyserCapacityFactorPrev > 0 || netBatteryFlowPrev < 0)
    ) {
      if (
        excessEnergyCur +
          Math.min(battPower, (batterySocPrev - battMin) * battCapacity) *
            batteryLosses >
        elecMaxLoad * elecCapacity
      ) {
        return -Math.min(
          battPower,
          (elecMaxLoad * elecCapacity - excessEnergyCur) / batteryLosses
        );
      } else {
        return -Math.min(battPower, (batterySocPrev - battMin) * battCapacity);
      }
    } else if (
      excessEnergyCur > 0 &&
      batterySocPrev + (excessEnergyCur / battCapacity) * batteryLosses >
        battMax
    ) {
      return Math.min(
        battPower,
        Math.abs(battCapacity * (battMax - batterySocPrev))
      );
    } else if (excessEnergyCur > 0) {
      return Math.min(battPower, excessEnergyCur * batteryLosses);
    } else if (
      electroylserCapacityFactorCur * elecCapacity +
        Math.min(battPower, (batterySocPrev - battMin) * battCapacity) *
          batteryLosses <
      elecMinLoad * elecCapacity
    ) {
      return 0;
    } else if (excessEnergyCur === 0 && batterySocPrev <= battMin) {
      return 0;
    } else if (
      excessEnergyCur === 0 &&
      (electrolyserCapacityFactorPrev > 0 ||
        electroylserCapacityFactorCur > 0 ||
        netBatteryFlowPrev < 0) &&
      (elecMaxLoad - electroylserCapacityFactorCur) * elecCapacity >
        (batterySocPrev - battMin) * batteryLosses * battCapacity
    ) {
      return -Math.min(battPower, (batterySocPrev - battMin) * battCapacity);
    } else if (
      excessEnergyCur === 0 &&
      (electrolyserCapacityFactorPrev > 0 ||
        electroylserCapacityFactorCur > 0 ||
        netBatteryFlowPrev < 0)
    ) {
      return -Math.min(
        battPower,
        ((elecMaxLoad - electroylserCapacityFactorCur) * elecCapacity) /
          batteryLosses
      );
    } else if (excessEnergyCur === 0) {
      return 0;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}

function batteryPowerMeth(
  co2_PowDem: number,
  meOH_PowDem: number,
  battPower: number,
  excessGenerationCurr: number,
  generatorActualPowerCurr: number,
  batterySocPrev: number,
  methanolPlantMinimumTurndown: number,
  battMin: number,
  battCapacity: number,
  battMax: number,
  batteryLosses: number
) {
  if (battCapacity > 0) {
    if (
      generatorActualPowerCurr <
        (co2_PowDem + meOH_PowDem) * methanolPlantMinimumTurndown &&
      excessGenerationCurr +
        Math.min(battPower, (batterySocPrev - battMin) * battCapacity) *
          batteryLosses >
        (co2_PowDem + meOH_PowDem) * methanolPlantMinimumTurndown
    ) {
      return (
        excessGenerationCurr -
        Math.min(battPower, (batterySocPrev - battMin) * battCapacity)
      );
    } else if (
      excessGenerationCurr > 0 &&
      batterySocPrev + (excessGenerationCurr / battCapacity) * batteryLosses >
        battMax
    ) {
      return Math.min(
        battPower,
        Math.abs(battCapacity * (battMax - batterySocPrev))
      );
    } else if (excessGenerationCurr > 0) {
      return Math.min(battPower, excessGenerationCurr * batteryLosses);
    } else if (
      generatorActualPowerCurr +
        Math.min(battPower, (batterySocPrev - battMin) * battCapacity) *
          batteryLosses <
      (co2_PowDem + meOH_PowDem) * methanolPlantMinimumTurndown
    ) {
      return 0;
    } else if (excessGenerationCurr === 0 && batterySocPrev <= battMin) {
      return 0;
    } else if (excessGenerationCurr === 0) {
      return 0;
    }
  } else {
    return 0;
  }
}

export function calculateNetBatteryFlowPython(
  powerPlantOversizeRatio: number,
  elecCapacity: number,
  excessGeneration: number[],
  electrolyserCapacityFactors: number[],
  electrolyserMinLoad: number,
  electrolyserMaxLoad: number,
  batteryRatedPower: number,
  batteryEnergy: number,
  batteryMinCharge: number,
  batteryLosses: number
): number[] {
  const size = excessGeneration.length;
  const batteryNetCharge = Array(size).fill(0.0);
  const batterySoc = Array(size).fill(0.0);
  const elecMin = electrolyserMinLoad * elecCapacity;
  const elecMax = electrolyserMaxLoad * elecCapacity;

  batteryNetCharge[0] = Math.min(
    batteryRatedPower,
    excessGeneration[0] * batteryLosses
  );
  batterySoc[0] = batteryNetCharge[0] / batteryEnergy;
  // check for off by 1 error
  for (let hour = 1; hour < size; hour++) {
    const battSoc = batterySoc[hour - 1];
    const spill = excessGeneration[hour];
    const elecCons = electrolyserCapacityFactors[hour] * elecCapacity;
    const battDischargePotential =
      Math.min(
        batteryRatedPower,
        (battSoc - batteryMinCharge) * batteryEnergy
      ) * batteryLosses;
    const elecJustOperating =
      elecCons > 0 ||
      batteryNetCharge[hour - 1] < 0 ||
      electrolyserCapacityFactors[hour - 1] > 0;
    if (
      elecCons === 0 &&
      spill + battDischargePotential > elecMin &&
      elecJustOperating
    ) {
      // When the generation is insufficient alone but combined with battery power can power the electrolyser
      if (spill + battDischargePotential > elecMax) {
        batteryNetCharge[hour] =
          -1 * Math.min(batteryRatedPower, (elecMax - spill) / batteryLosses);
      } else {
        batteryNetCharge[hour] = (-1 * battDischargePotential) / batteryLosses;
      }
    } else if (
      spill > 0 &&
      battSoc + (spill / batteryEnergy) * batteryLosses > 1
    ) {
      // When spilled generation is enough to completely charge the battery
      batteryNetCharge[hour] = Math.min(
        batteryRatedPower,
        Math.max(batteryEnergy * (1.0 - battSoc), 0.0)
      );
    } else if (spill > 0) {
      // Any other cases when there is spilled generation
      batteryNetCharge[hour] = Math.min(
        batteryRatedPower,
        spill * batteryLosses
      );
    } else if (
      elecCons + battDischargePotential < elecMin ||
      (spill === 0 && battSoc <= batteryMinCharge)
    ) {
      //  generation and battery together are insufficient to power the electrolyser or there is no
      //  spilled generation and the battery is empty
      batteryNetCharge[hour] = 0;
    } else if (
      spill === 0 &&
      elecMax - elecCons >
        (battSoc - batteryMinCharge) * batteryLosses * batteryEnergy &&
      elecJustOperating
    ) {
      //  When the electrolyser is operating and the energy to get to max capacity is more than what is stored
      batteryNetCharge[hour] = (-1 * battDischargePotential) / batteryLosses;
    } else if (spill === 0 && elecJustOperating) {
      //  When the stored power is enough to power the electrolyser at max capacity
      batteryNetCharge[hour] =
        -1 * Math.min(batteryRatedPower, (elecMax - elecCons) / batteryLosses);
    } else if (spill === 0) {
      batteryNetCharge[hour] = 0;
    } else {
      throw new Error("Error: battery configuration not accounted for");
    }
    //  Determine the battery state of charge based on the previous state of charge and the net change
    batterySoc[hour] =
      batterySoc[hour - 1] + batteryNetCharge[hour] / batteryEnergy;
  }

  return batteryNetCharge;
}

export function calculateNetBatteryFlowMeth(
  excessGeneration: number[],
  batteryRatedPower: number,
  batteryEnergy: number,
  batteryMinCharge: number,
  batteryLosses: number,
  co2_PowDem: number,
  meOH_PowDem: number,
  generatorActualPower: number[],
  methanolPlantMinimumTurnDown: number
): number[] {
  const size = excessGeneration.length;
  const batteryNetCharge = Array(size).fill(0.0);
  const batterySoc = Array(size).fill(0.0);

  batteryNetCharge[0] = Math.min(
    batteryRatedPower,
    excessGeneration[0] * batteryLosses
  );
  batterySoc[0] = batteryNetCharge[0] / batteryEnergy;
  // check for off by 1 error
  for (let hour = 1; hour < size; hour++) {
    batteryNetCharge[hour] = batteryPowerMeth(
      co2_PowDem,
      meOH_PowDem,
      batteryRatedPower,
      roundToEightDP(excessGeneration[hour]),
      generatorActualPower[hour],
      batterySoc[hour - 1],
      methanolPlantMinimumTurnDown,
      batteryMinCharge,
      batteryEnergy,
      1,
      batteryLosses
    );
    //  Determine the battery state of charge based on the previous state of charge and the net change
    batterySoc[hour] =
      batterySoc[hour - 1] + batteryNetCharge[hour] / batteryEnergy;
  }

  return batteryNetCharge;
}

export function calculateNetBatteryFlow(
  powerPlantOversizeRatio: number,
  elecCapacity: number,
  excessGeneration: number[],
  electrolyserCapacityFactors: number[],
  electrolyserMinLoad: number,
  electrolyserMaxLoad: number,
  batteryRatedPower: number,
  batteryEnergy: number,
  batteryMinCharge: number,
  batteryLosses: number
): number[] {
  const size = excessGeneration.length;
  const batteryNetCharge = Array(size).fill(0.0);
  const batterySoc = Array(size).fill(0.0);

  batteryNetCharge[0] = Math.min(
    batteryRatedPower,
    excessGeneration[0] * batteryLosses
  );
  batterySoc[0] = batteryNetCharge[0] / batteryEnergy;
  // check for off by 1 error
  for (let hour = 1; hour < size; hour++) {
    batteryNetCharge[hour] = batteryPower(
      batteryEnergy,
      batteryRatedPower,
      batteryMinCharge,
      batteryLosses,
      1,
      electrolyserMinLoad,
      electrolyserMaxLoad,
      elecCapacity,
      electrolyserCapacityFactors[hour - 1],
      electrolyserCapacityFactors[hour],
      roundToEightDP(excessGeneration[hour]),
      batteryNetCharge[hour - 1],
      batterySoc[hour - 1]
    );
    //  Determine the battery state of charge based on the previous state of charge and the net change
    batterySoc[hour] =
      batterySoc[hour - 1] + batteryNetCharge[hour] / batteryEnergy;
  }

  return batteryNetCharge;
}

export function calculateHydrogenProduction(
  electrolyserCf: number[],
  hydOutput: number,
  yearlyDegradationRate: number,
  specCons: number
) {
  return electrolyserCf.map(
    (x: number) => (x * hydOutput * (1 - yearlyDegradationRate)) / specCons
  );
}

export function calculateOverloadingModel(
  oversize: number,
  elecMaxLoad: number,
  elecOverloadRecharge: number,
  elecOverload: number,
  generatorCf: number[],
  electrolyserCf: number[]
): number[] {
  const canOverload = generatorCf.map((x) => x * oversize > elecMaxLoad);

  for (let hour = 1; hour < generatorCf.length; hour++) {
    for (
      let hourI = 1;
      hourI < Math.min(hour, elecOverloadRecharge) + 1;
      hourI++
    ) {
      if (canOverload[hour] && canOverload[hour - hourI]) {
        canOverload[hour] = false;
      }
    }
  }
  const maxOverload = elecOverload;

  const electrolyserCfoverload = canOverload.map(
    (canOverload: boolean, i: number) => {
      const energyGenerated = generatorCf[i] * oversize;
      if (canOverload) {
        //Energy_for_overloading
        return Math.min(maxOverload, energyGenerated);
      } else {
        return electrolyserCf[i];
      }
    }
  );

  return electrolyserCfoverload;
}

export function calculateSnapshotForYear(
  powerPlantCapacityFactors: number[],
  electrolyserCapacityFactors: number[],
  hydrogenProduction: number[],
  netBatteryFlow: number[],
  electrolyserNominalCapacity: number,
  powerPlantNominalCapacity: number,
  kgToTonne: number,
  hoursPerYear: number,
  elecMaxLoad: number,
  batteryEfficiency: number
): ModelSummaryPerYear {
  const generatorCapacityFactor = mean(powerPlantCapacityFactors);
  // Time Electrolyser is at its Rated Capacity
  const timeElectrolyser =
    electrolyserCapacityFactors.filter((e) => e === elecMaxLoad).length /
    hoursPerYear;
  //Total Time Electrolyser is Operating
  const totalOpsTime =
    electrolyserCapacityFactors.filter((e) => e > 0).length / hoursPerYear;

  // Achieved Electrolyser Capacity Factor
  const achievedElectrolyserCf = mean(electrolyserCapacityFactors);
  // Energy in to Electrolyser [MWh/yr]
  const energyInElectrolyser =
    sum(electrolyserCapacityFactors) * electrolyserNominalCapacity;
  // Surplus Energy [MWh/yr]
  const surplus =
    sum(powerPlantCapacityFactors) * powerPlantNominalCapacity -
    sum(electrolyserCapacityFactors) * electrolyserNominalCapacity;
  // Hydrogen Output [t/yr]
  const hydrogenFixed =
    sum(hydrogenProduction) * electrolyserNominalCapacity * kgToTonne;
  // Total Battery Output (MWh/yr)
  const totalBatteryOutput =
    sum(netBatteryFlow.filter((num) => num < 0)) *
    -1 *
    (1 - (1 - batteryEfficiency) / 2);

  return {
    powerPlantCapacityFactors: generatorCapacityFactor,
    ratedCapacityTime: timeElectrolyser,
    totalOperatingTime: totalOpsTime,
    electrolyserCapacityFactors: achievedElectrolyserCf,
    electricityConsumed: energyInElectrolyser,
    electricityProduced: surplus,
    electricityConsumedByBattery: totalBatteryOutput,
    hydrogenProduction: hydrogenFixed,
  };
}

export function calculateAmmoniaSnapshotForYear(
  powerPlantCapacityFactors: number[],
  electrolyserCapacityFactors: number[],
  ammoniaCapacityFactors: number[],
  hydrogenProduction: number[],
  ammoniaProduction: number[],
  netBatteryFlow: number[],
  electrolyserNominalCapacity: number,
  powerPlantNominalCapacity: number,
  kgToTonne: number,
  hoursPerYear: number,
  elecMaxLoad: number,
  batteryEfficiency: number
): ModelSummaryPerYear {
  // Time Ammonia PLant is at its Rated Capacity
  const ammoniaRatedCapacityTime =
    ammoniaCapacityFactors.filter((a) => a === elecMaxLoad).length /
    hoursPerYear;
  // Total Time Ammonia Plant is Operating
  const totalAmmoniaOpsTime =
    ammoniaCapacityFactors.filter((a) => a > 0).length / hoursPerYear;
  // Achieved Electrolyser Capacity Factor
  const achievedAmmoniaCf = mean(ammoniaCapacityFactors);
  const nh3UnitOut = sum(ammoniaProduction) / 1000;

  return {
    ...calculateSnapshotForYear(
      powerPlantCapacityFactors,
      electrolyserCapacityFactors,
      hydrogenProduction,
      netBatteryFlow,
      electrolyserNominalCapacity,
      powerPlantNominalCapacity,
      kgToTonne,
      hoursPerYear,
      elecMaxLoad,
      batteryEfficiency
    ),
    ammoniaRatedCapacityTime,
    totalAmmoniaOperatingTime: totalAmmoniaOpsTime,
    ammoniaCapacityFactors: achievedAmmoniaCf,
    ammoniaProduction: nh3UnitOut,
  };
}

export function calculateMethanolSnapshotForYear(
  powerPlantCapacityFactors: number[],
  electrolyserCapacityFactors: number[],
  methanolCapacityFactors: number[],
  hydrogenProduction: number[],
  methanolProduction: number[],
  netBatteryFlow: number[],
  electrolyserNominalCapacity: number,
  powerPlantNominalCapacity: number,
  kgToTonne: number,
  hoursPerYear: number,
  elecMaxLoad: number,
  batteryEfficiency: number
): ModelSummaryPerYear {
  // Time Ammonia PLant is at its Rated Capacity
  const methanolRatedCapacityTime =
    methanolCapacityFactors.filter((a) => a === elecMaxLoad).length /
    hoursPerYear;
  // Total Time Ammonia Plant is Operating
  const totalMethanolOpsTime =
    methanolCapacityFactors.filter((a) => a > 0).length / hoursPerYear;
  // Achieved Electrolyser Capacity Factor
  const achievedMethanolCf = mean(methanolCapacityFactors);
  const meOhUnitOut = sum(methanolProduction) / 1000;

  return {
    ...calculateSnapshotForYear(
      powerPlantCapacityFactors,
      electrolyserCapacityFactors,
      hydrogenProduction,
      netBatteryFlow,
      electrolyserNominalCapacity,
      powerPlantNominalCapacity,
      kgToTonne,
      hoursPerYear,
      elecMaxLoad,
      batteryEfficiency
    ),
    methanolRatedCapacityTime: methanolRatedCapacityTime,
    totalMethanolOperatingTime: totalMethanolOpsTime,
    methanolCapacityFactors: achievedMethanolCf,
    methanolProduction: meOhUnitOut,
  };
}

export function initialiseStackReplacementYears(
  stackReplacementType: StackReplacementType,
  stackDegradation: number,
  maximumDegradationBeforeReplacement: number | undefined,
  projectTimeline: number
): number[] {
  if (stackReplacementType === "Maximum Degradation Level") {
    return maxDegradationStackReplacementYears(
      stackDegradation,
      maximumDegradationBeforeReplacement || 0,
      projectTimeline
    );
  }
  return [];
}

export function backCalculateSolarAndWindCapacities(
  powerPlantOversizeRatio: number,
  electrolyserNominalCapacity: number,
  powerPlantType: PowerPlantType,
  solarToWindPercentage: number
) {
  const powerPlantNominalCapacity = backCalculatePowerPlantCapacity(
    powerPlantOversizeRatio,
    electrolyserNominalCapacity
  );
  let calculatedSolarNominalCapacity = 0;
  let calculatedWindNominalCapacity = 0;

  if (powerPlantType === "Solar") {
    calculatedSolarNominalCapacity = powerPlantNominalCapacity;
    calculatedWindNominalCapacity = 0;
  }

  if (powerPlantType === "Wind") {
    calculatedSolarNominalCapacity = 0;
    calculatedWindNominalCapacity = powerPlantNominalCapacity;
  }

  if (powerPlantType === "Hybrid") {
    calculatedSolarNominalCapacity =
      powerPlantNominalCapacity * (solarToWindPercentage / 100);
    calculatedWindNominalCapacity =
      powerPlantNominalCapacity * (1 - solarToWindPercentage / 100);
  }
  return { calculatedSolarNominalCapacity, calculatedWindNominalCapacity };
}
// TODO recheck if all of this are used more than one place.
export function getExcessGeneration(
  powerplantCapacityFactors: number[],
  oversizeRatio: number,
  electrolyserCapacityFactors: number[],
  electrolyserNominalCapacity: number
) {
  return powerplantCapacityFactors.map(
    (_: number, i: number) =>
      (powerplantCapacityFactors[i] * oversizeRatio -
        electrolyserCapacityFactors[i]) *
      electrolyserNominalCapacity
  );
}

export function getElectrolyserCapacityFactorsWithBattery(
  netBatteryFlow: number[],
  electrolyserCapacityFactors: number[],
  batteryLosses: number,
  excessGeneration: number[],
  electrolyserNominalCapacity: number
) {
  return netBatteryFlow.map((_: number, i: number) => {
    if (netBatteryFlow[i] < 0) {
      return (
        electrolyserCapacityFactors[i] +
        (-1 * netBatteryFlow[i] * batteryLosses + excessGeneration[i]) /
          electrolyserNominalCapacity
      );
    } else {
      return electrolyserCapacityFactors[i];
    }
  });
}

export function getBatteryLosses(batteryEfficiency: number) {
  return 1 - (1 - batteryEfficiency) / 2;
}

export class MaxDegradation {
  private replacementYears: number[];
  private lastStackReplacementYear: number;
  private stackDegradation: number;

  constructor(
    stackDegradation: number,
    maximumDegradationBeforeReplacement: number,
    projectTimeline: number
  ) {
    this.stackDegradation = stackDegradation;
    this.replacementYears = maxDegradationStackReplacementYears(
      stackDegradation,
      maximumDegradationBeforeReplacement,
      projectTimeline
    );
    this.lastStackReplacementYear = 0;
  }

  // just want the same function interface for both degradations
  getStackDegradation(year: number, _: number[]) {
    const power = year - 1 - this.lastStackReplacementYear;
    if (this.replacementYears.includes(year)) {
      this.lastStackReplacementYear = year;
    }
    return 1 - 1 / (1 + this.stackDegradation / 100) ** power;
  }
}

export class CumulativeDegradation {
  private readonly stackDegradation: number;
  private readonly stackLifeTime: number;
  private lastStackReplacementYear: number;
  private currentStackOperatingHours: number;

  constructor(stackDegradation: number, stackLifetime: number) {
    this.stackDegradation = stackDegradation;
    this.stackLifeTime = stackLifetime;
    this.currentStackOperatingHours = 0;
    this.lastStackReplacementYear = 0;
  }

  getStackDegradation(year: number, electrolyserCf: number[]) {
    this.currentStackOperatingHours += electrolyserCf.filter(
      (e) => e > 0
    ).length;
    const power = year - 1 - this.lastStackReplacementYear;
    if (this.currentStackOperatingHours >= this.stackLifeTime) {
      this.currentStackOperatingHours -= this.stackLifeTime;
      this.lastStackReplacementYear = year;
    }
    return 1 - 1 / (1 + this.stackDegradation / 100) ** power;
  }
}
