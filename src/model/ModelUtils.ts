import { mean, sum } from "../utils";
import { CsvRow, ModelSummaryPerYear } from "./ModelTypes";
import {
  BATTERY_OUTPUT,
  ELECTROLYSER_CF,
  ENERGY_INPUT,
  ENERGY_OUTPUT,
  HYDROGEN_OUTPUT,
  POWER_PLANT_CF,
  RATED_CAPACITY_TIME,
  TOTAL_OPERATING_TIME,
} from "./consts";

// returns Generator_CF series
export function calculateGeneratorCf(
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
// returns Electrolyser_CF series
export function calculateElectrolyserCf(
  oversizeRatio: number,
  elecMaxLoad: number,
  elecMinLoad: number,
  generatorCf: number[]
): number[] {
  const calculateElectrolyser = (x: number): number => {
    if (x * oversizeRatio > elecMaxLoad) {
      return elecMaxLoad;
    }

    if (x * oversizeRatio < elecMinLoad) {
      return 0;
    }
    return x * oversizeRatio;
  };

  return generatorCf.map(calculateElectrolyser);
}
export function calculateBatteryModel(
  oversize: number,
  elecCapacity: number,
  generatorCf: number[],
  electrolyserCf: number[],
  batteryEfficiency: number,
  elecMinLoad: number,
  elecMaxLoad: number,
  batteryPower: number,
  batteryEnergy: number,
  battMin: number
): { electrolyser_cf: number[]; battery_net_charge: number[] } {
  const size = generatorCf.length;
  const excessGeneration = generatorCf.map(
    (_: number, i: number) =>
      (generatorCf[i] * oversize - electrolyserCf[i]) * elecCapacity
  );
  const batteryNetCharge = Array(size).fill(0.0);
  const batterySoc = Array(size).fill(0.0);
  const battLosses = 1 - (1 - batteryEfficiency) / 2;
  const elecMin = elecMinLoad * elecCapacity;
  const elecMax = elecMaxLoad * elecCapacity;

  batteryNetCharge[0] = Math.min(
    batteryPower,
    excessGeneration[0] * battLosses
  );
  batterySoc[0] = batteryNetCharge[0] / batteryEnergy;
  // check for off by 1 error
  for (let hour = 1; hour < size; hour++) {
    const battSoc = batterySoc[hour - 1];
    const spill = excessGeneration[hour];
    const elecCons = electrolyserCf[hour] * elecCapacity;
    const battDischargePotential =
      Math.min(batteryPower, (battSoc - battMin) * batteryEnergy) * battLosses;
    const elecJustOperating =
      elecCons > 0 ||
      batteryNetCharge[hour - 1] < 0 ||
      electrolyserCf[hour - 1] > 0;
    if (
      elecCons === 0 &&
      spill + battDischargePotential > elecMin &&
      elecJustOperating
    ) {
      // When the generation is insufficient alone but combined with battery power can power the electrolyser
      if (spill + battDischargePotential > elecMax) {
        batteryNetCharge[hour] =
          -1 * Math.min(batteryPower, ((elecMax - spill) * 1) / battLosses);
      } else {
        batteryNetCharge[hour] = (-1 * battDischargePotential * 1) / battLosses;
      }
    } else if (
      spill > 0 &&
      battSoc + (spill / batteryEnergy) * battLosses > 1
    ) {
      // When spilled generation is enough to completely charge the battery
      batteryNetCharge[hour] = Math.min(
        batteryPower,
        Math.max(batteryEnergy * (1.0 - battSoc), 0.0)
      );
    } else if (spill > 0) {
      // Any other cases when there is spilled generation
      batteryNetCharge[hour] = Math.min(batteryPower, spill * battLosses);
    } else if (
      elecCons + battDischargePotential < elecMin ||
      (spill === 0 && battSoc <= battMin)
    ) {
      //  generation and battery together are insufficient to power the electrolyser or there is no
      //  spilled generation and the battery is empty
      batteryNetCharge[hour] = 0;
    } else if (
      spill === 0 &&
      elecMax - elecCons > (battSoc - battMin) * battLosses * batteryEnergy &&
      elecJustOperating
    ) {
      //  When the electrolyser is operating and the energy to get to max capacity is more than what is stored
      batteryNetCharge[hour] = (-1 * battDischargePotential * 1) / battLosses;
    } else if (spill === 0 && elecJustOperating) {
      //  When the stored power is enough to power the electrolyser at max capacity
      batteryNetCharge[hour] =
        -1 * Math.min(batteryPower, ((elecMax - elecCons) * 1) / battLosses);
    } else if (spill === 0) {
      batteryNetCharge[hour] = 0;
    } else {
      throw new Error("Error: battery configuration not accounted for");
    }
    //  Determine the battery state of charge based on the previous state of charge and the net change
    batterySoc[hour] =
      batterySoc[hour - 1] + batteryNetCharge[hour] / batteryEnergy;
  }
  const electrolyserCfBatt = batteryNetCharge.map((_: number, i: number) => {
    if (batteryNetCharge[i] < 0) {
      return (
        electrolyserCf[i] +
        (-1 * batteryNetCharge[i] * battLosses + excessGeneration[i]) /
          elecCapacity
      );
    } else {
      return electrolyserCf[i];
    }
  });

  return {
    electrolyser_cf: electrolyserCfBatt,
    battery_net_charge: batteryNetCharge,
  };
}
export function calculateFixedHydrogenProduction(
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
      const energy_generated = generatorCf[i] * oversize;
      if (canOverload) {
        //Energy_for_overloading
        return Math.min(maxOverload, energy_generated);
      } else {
        return electrolyserCf[i];
      }
    }
  );

  return electrolyserCfoverload;
}

export function getTabulatedOutput(
  generatorCapFactor: number[],
  electrolyserCapFactor: number[],
  hydrogenProdFixed: number[],
  netBatteryFlow: number[],
  elecCapacity: number,
  genCapacity: number,
  kgtoTonne: number,
  hoursPerYear: number,
  elecMaxLoad: number,
  batteryEfficiency: number
): ModelSummaryPerYear {
  const generatorCapacityFactor = mean(generatorCapFactor);
  // Time Electrolyser is at its Rated Capacity"
  const timeElectrolyser =
    electrolyserCapFactor.filter((e) => e === elecMaxLoad).length /
    hoursPerYear;
  //Total Time Electrolyser is Operating
  const totalOpsTime =
    electrolyserCapFactor.filter((e) => e > 0).length / hoursPerYear;

  // Achieved Electrolyser Capacity Factor
  const achievedElectrolyserCf = mean(electrolyserCapFactor);
  // Energy in to Electrolyser [MWh/yr]
  const energyInElectrolyser = sum(electrolyserCapFactor) * elecCapacity;
  // Surplus Energy [MWh/yr]
  const surplus =
    sum(generatorCapFactor) * genCapacity -
    sum(electrolyserCapFactor) * elecCapacity;
  // Hydrogen Output [t/yr]
  const hydrogenFixed = sum(hydrogenProdFixed) * elecCapacity * kgtoTonne;
  // Total Battery Output (MWh/yr)
  const totalBatteryOutput =
    sum(netBatteryFlow.filter((num) => num < 0)) *
    -1 *
    (1 - (1 - batteryEfficiency) / 2);

  let summary: ModelSummaryPerYear = {};
  summary[POWER_PLANT_CF] = generatorCapacityFactor;
  summary[RATED_CAPACITY_TIME] = timeElectrolyser;
  summary[TOTAL_OPERATING_TIME] = totalOpsTime;
  summary[ELECTROLYSER_CF] = achievedElectrolyserCf;
  summary[ENERGY_INPUT] = energyInElectrolyser;
  summary[ENERGY_OUTPUT] = surplus;
  summary[BATTERY_OUTPUT] = totalBatteryOutput;
  summary[HYDROGEN_OUTPUT] = hydrogenFixed;

  return summary;
}
