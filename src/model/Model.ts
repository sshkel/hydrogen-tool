import { maxDegradationStackReplacementYears } from "../components/charts/opex-calculations";
import { StackReplacementType } from "../types";
import { mean, sum } from "../utils";
import {
  BATTERY_OUTPUT,
  ELECTROLYSER_CF,
  ENERGY_INPUT,
  ENERGY_OUTPUT,
  HYDROGEN_OUTPUT_FIXED,
  HYDROGEN_OUTPUT_VARIABLE,
  POWER_PLANT_CF,
  RATED_CAPACITY_TIME,
  SUMMARY_KEYS,
  TOTAL_OPERATING_TIME,
} from "./consts";

export type DataModel = {
  batteryLifetime: number;
  batteryMinCharge: number;
  batteryEfficiency: number;
  batteryStorageDuration: number;
  batteryRatedPower: number;
  timeBetweenOverloading: number;
  maximumLoadWhenOverloading: number;
  electrolyserNominalCapacity: number;
  solarNominalCapacity: number;
  windNominalCapacity: number;
  location: string;
  electrolyserMaximumLoad: number;
  electrolyserMinimumLoad: number;
  specCons: number;
  elecEff: number;
  // degradation parameters
  stackReplacementType: StackReplacementType;
  stackLifetime?: number;
  maximumDegradationBeforeReplacement?: number;
  solarDegradation: number;
  windDegradation: number;
  stackDegradation: number;
};

export type CsvRow = {
  [k: string]: number;
};

export type ModelHourlyOperation = {
  [k: string]: number[];
};
export type ModelSummaryPerYear = {
  [k: string]: number;
};

export type ProjectModelSummary = {
  [k: string]: number[];
};

export class HydrogenModel {
  // consts
  readonly MWtokW = 1000; // kW/MW
  readonly hoursPerYear = 8760;
  readonly kgtoTonne = 1 / 1000;
  readonly H2VoltoMass = 0.089;
  readonly secAtNominalLoad = 33.33; // kWh/kg

  // calculated params
  genCapacity: number;
  elecMaxLoad: number;
  elecMinLoad: number;
  elecEff: number;
  hydOutput: number;
  parameters: DataModel;
  elecOverload: number;
  batteryEnergy: number;
  batteryEfficiency: number;
  battMin: number;
  stackReplacementYears: number[];
  stackLifetime?: number;
  lastStackReplacementYear: number;
  currentStackOperatingHours: number;
  // data from renewables
  solarData: CsvRow[];
  windData: CsvRow[];
  specCons: number;

  // parameters to expose to working data
  hourlyOperationsInYearOne: ModelHourlyOperation;

  constructor(parameters: DataModel, solarData: CsvRow[], windData: CsvRow[]) {
    this.parameters = parameters;
    // Loaded data
    this.solarData = solarData;
    this.windData = windData;

    // Stack replacement logic for degradation
    this.stackReplacementYears = [];
    this.stackLifetime =
      parameters.stackReplacementType === "Cumulative Hours"
        ? parameters.stackLifetime
        : undefined;
    this.currentStackOperatingHours = 0;
    this.lastStackReplacementYear = 0;
    this.hourlyOperationsInYearOne = {};

    // calculated values
    this.genCapacity =
      parameters.solarNominalCapacity + parameters.windNominalCapacity;
    this.elecMaxLoad = parameters.electrolyserMaximumLoad / 100;
    this.elecMinLoad = parameters.electrolyserMinimumLoad / 100;
    this.elecEff = parameters.elecEff / 100;
    this.hydOutput = this.H2VoltoMass * this.MWtokW * this.elecEff; // kg.kWh/m3.MWh
    this.elecOverload = parameters.maximumLoadWhenOverloading / 100;
    this.batteryEnergy =
      parameters.batteryRatedPower * this.parameters.batteryStorageDuration;
    this.batteryEfficiency = parameters.batteryEfficiency / 100;
    this.battMin = parameters.batteryMinCharge / 100;
    this.specCons = this.parameters.specCons * this.H2VoltoMass;
  }

  calculateHydrogenModel(projectTimeline: number): ProjectModelSummary {
    const { stackDegradation, solarDegradation, windDegradation } =
      this.parameters;
    const projectSummary =
      stackDegradation + solarDegradation + windDegradation === 0
        ? this.calculateHydrogenModelWithoutDegradation(projectTimeline)
        : this.calculateHydrogenModelWithDegradation(projectTimeline);

    return projectSummary;
  }

  /**
   * NOTE: This must be called after #calculateHydrogenModel to be properly populated
   * @returns hourly operations for first year of project life
   */
  getHourlyOperations(): ModelHourlyOperation {
    return this.hourlyOperationsInYearOne;
  }

  private calculateHydrogenModelWithoutDegradation(
    projectTimeline: number
  ): ProjectModelSummary {
    const year = 1;
    const hourlyOperation = this.calculateElectrolyserHourlyOperation(year);
    this.hourlyOperationsInYearOne = hourlyOperation;
    const operatingOutputs = this.getTabulatedOutput(
      hourlyOperation.Generator_CF,
      hourlyOperation.Electrolyser_CF,
      hourlyOperation.Hydrogen_prod_fixed,
      hourlyOperation.Hydrogen_prod_variable,
      hourlyOperation.Net_Battery_Flow,
      this.parameters.electrolyserNominalCapacity,
      this.genCapacity,
      this.kgtoTonne,
      this.hoursPerYear
    );

    let projectSummary: ProjectModelSummary = {};
    SUMMARY_KEYS.forEach((key) => {
      projectSummary[key] = Array(projectTimeline).fill(operatingOutputs[key]);
    });

    return projectSummary;
  }

  private calculateHydrogenModelWithDegradation(
    projectTimeline: number
  ): ProjectModelSummary {
    this.stackReplacementYears = this.initialiseStackReplacementYears(
      this.parameters,
      projectTimeline
    );
    let year = 1;
    // Calculate first year separately
    const hourlyOperation = this.calculateElectrolyserHourlyOperation(year);
    this.hourlyOperationsInYearOne = hourlyOperation;
    const operatingOutputs = this.calculateElectrolyserOutput(hourlyOperation);

    let modelSummaryPerYear: ModelSummaryPerYear[] = [];
    modelSummaryPerYear.push(operatingOutputs);

    for (year = 2; year <= projectTimeline; year++) {
      const hourlyOperationsByYear =
        this.calculateElectrolyserHourlyOperation(year);
      modelSummaryPerYear.push(
        this.calculateElectrolyserOutput(hourlyOperationsByYear)
      );
    }

    let projectSummary: ProjectModelSummary = {};

    SUMMARY_KEYS.forEach((key) => {
      projectSummary[key] = [];
    });

    modelSummaryPerYear.forEach((yearSummary) => {
      SUMMARY_KEYS.forEach((key) => {
        projectSummary[key].push(yearSummary[key]);
      });
    });

    return projectSummary;
  }

  // wrapper around calculate_hourly_operation with passing of all the args.
  // being lazy here
  private calculateElectrolyserHourlyOperation(
    year: number
  ): ModelHourlyOperation {
    return this.calculateHourlyOperation(
      this.genCapacity / this.parameters.electrolyserNominalCapacity,
      this.parameters.electrolyserNominalCapacity,
      this.parameters.solarNominalCapacity / this.genCapacity,
      this.parameters.windNominalCapacity / this.genCapacity,
      this.parameters.solarDegradation,
      this.parameters.windDegradation,
      this.parameters.stackDegradation,
      this.parameters.location,
      this.elecMaxLoad,
      this.elecMinLoad,
      this.hydOutput,
      this.specCons,
      this.elecOverload,
      this.parameters.timeBetweenOverloading,
      this.batteryEnergy,
      this.parameters.batteryStorageDuration,
      this.batteryEfficiency,
      this.parameters.batteryRatedPower,
      this.battMin,
      year
    );
  }

  private calculateElectrolyserOutput(
    hourlyOperation: ModelHourlyOperation
  ): ModelSummaryPerYear {
    const operatingOutputs = this.getTabulatedOutput(
      hourlyOperation.Generator_CF,
      hourlyOperation.Electrolyser_CF,
      hourlyOperation.Hydrogen_prod_fixed,
      hourlyOperation.Hydrogen_prod_variable,
      hourlyOperation.Net_Battery_Flow,
      this.parameters.electrolyserNominalCapacity,
      this.genCapacity,
      this.kgtoTonne,
      this.hoursPerYear
    );

    return operatingOutputs;
  }

  private getTabulatedOutput(
    generatorCapFactor: number[],
    electrolyserCapFactor: number[],
    hydrogenProdFixed: number[],
    hydrogenProdVariable: number[],
    netBatteryFlow: number[],
    elecCapacity: number,
    genCapacity: number,
    kgtoTonne: number,
    hoursPerYear: number
  ): ModelSummaryPerYear {
    const generatorCapacityFactor = mean(generatorCapFactor);
    // Time Electrolyser is at its Rated Capacity"
    const timeElectrolyser =
      electrolyserCapFactor.filter((e) => e === this.elecMaxLoad).length /
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
    // Hydrogen Output for Fixed Operation [t/yr]
    const hydrogenFixed = sum(hydrogenProdFixed) * elecCapacity * kgtoTonne;
    // Hydrogen Output for Variable Operation [t/yr]
    const hydrogenVariable =
      sum(hydrogenProdVariable) * elecCapacity * kgtoTonne;
    // Total Battery Output (MWh/yr)
    const totalBatteryOutput =
      sum(netBatteryFlow.filter((num) => num < 0)) *
      -1 *
      (1 - (1 - this.batteryEfficiency) / 2);

    let summary: ModelSummaryPerYear = {};
    summary[POWER_PLANT_CF] = generatorCapacityFactor;
    summary[RATED_CAPACITY_TIME] = timeElectrolyser;
    summary[TOTAL_OPERATING_TIME] = totalOpsTime;
    summary[ELECTROLYSER_CF] = achievedElectrolyserCf;
    summary[ENERGY_INPUT] = energyInElectrolyser;
    summary[ENERGY_OUTPUT] = surplus;
    summary[BATTERY_OUTPUT] = totalBatteryOutput;
    // TODO: Return one based on profile
    summary[HYDROGEN_OUTPUT_FIXED] = hydrogenFixed;
    summary[HYDROGEN_OUTPUT_VARIABLE] = hydrogenVariable;

    return summary;
  }

  private calculateBasicHourlyOperation(
    projectScale: number,
    electrolyserEfficiency: number,
    oversizeRatio: number,
    solarToWindPercentage: number,
    location: string
  ) {
    const windToSolarPercentage = 100 - solarToWindPercentage;
    // const solarDegradation = 0;
    // const windDegradation = 0;
    const year = 1;

    const generatorCf = calculateGeneratorCf(
      this.solarData,
      this.windData,
      solarToWindPercentage / 100,
      windToSolarPercentage / 100,
      location,
      this.parameters.solarDegradation,
      this.parameters.windDegradation,
      year
    );

    let electrolyserCf = calculateElectrolyserCf(
      oversizeRatio,
      this.elecMaxLoad,
      this.elecMinLoad,
      generatorCf
    );

    let electrolyserCfMean = mean(electrolyserCf);

    const backcalculatedElectrolyserNominalCapacity =
      projectScale *
      1000 *
      this.secAtNominalLoad *
      (1 / electrolyserEfficiency) *
      (1 / this.hoursPerYear) *
      (1 / electrolyserCfMean);
  }

  // """Private method- Creates a dataframe with a row for each hour of the year and columns Generator_CF,
  //       Electrolyser_CF, Hydrogen_prod_fixed and Hydrogen_prod_var
  //       """
  private calculateHourlyOperation(
    oversizeRatio: number,
    elecCapacity: number,
    solarRatio: number,
    windRatio: number,
    solarDegradation: number,
    windDegradation: number,
    stackDegradation: number,
    location: string,
    elecMaxLoad: number,
    elecMinLoad: number,
    hydOutput: number,
    specCons: number,
    elecOverload: number,
    elecOverloadRecharge: number,
    batteryEnergy: number,
    batteryHours: number,
    batteryEfficiency: number,
    batteryPower: number,
    battMin: number,
    year: number
  ): ModelHourlyOperation {
    const generatorCf = calculateGeneratorCf(
      this.solarData,
      this.windData,
      solarRatio,
      windRatio,
      location,
      solarDegradation,
      windDegradation,
      year
    );

    // normal electrolyser calculation
    let electrolyserCf = calculateElectrolyserCf(
      oversizeRatio,
      elecMaxLoad,
      elecMinLoad,
      generatorCf
    );

    let batteryNetCharge: number[] = new Array(8760).fill(0);

    // overload calculation
    if (elecOverload > elecMaxLoad && elecOverloadRecharge > 0) {
      electrolyserCf = calculateOverloadingModel(
        oversizeRatio,
        elecMaxLoad,
        elecOverloadRecharge,
        elecOverload,
        generatorCf,
        electrolyserCf
      );
    }

    // // battery model calc
    if (batteryEnergy > 0) {
      const hours = [1, 2, 4, 8];
      if (!hours.includes(batteryHours)) {
        throw new Error(
          `Battery storage length not valid. Please enter one of 1, 2, 4 or 8. Current value is ${batteryHours}`
        );
      }
      const batteryModel = calculateBatteryModel(
        oversizeRatio,
        elecCapacity,
        generatorCf,
        electrolyserCf,
        batteryEfficiency,
        elecMinLoad,
        elecMaxLoad,
        batteryPower,
        batteryEnergy,
        battMin
      );
      electrolyserCf = batteryModel.electrolyser_cf;
      batteryNetCharge = batteryModel.battery_net_charge;
    }

    let yearlyDegradationRate: number = 0;

    // Stack degradation calculation
    if (stackDegradation > 0) {
      // Cumulative hour degradation logic if defined
      if (this.stackLifetime) {
        this.currentStackOperatingHours += electrolyserCf.filter(
          (e) => e > 0
        ).length;
        if (this.currentStackOperatingHours >= this.stackLifetime) {
          this.currentStackOperatingHours -= this.stackLifetime;
          this.stackReplacementYears.push(year);
        }
      }
      const power = year - 1 - this.lastStackReplacementYear;

      if (this.stackReplacementYears.includes(year)) {
        this.lastStackReplacementYear = year;
      }
      yearlyDegradationRate = 1 - 1 / (1 + stackDegradation / 100) ** power;
    }

    const hydrogenProdFixed = calculateFixedHydrogenProduction(
      electrolyserCf,
      hydOutput,
      yearlyDegradationRate,
      specCons
    );

    const hydrogenProdVariable = calculateVariableHydrogenProduction(
      specCons,
      electrolyserCf,
      hydOutput,
      yearlyDegradationRate
    );

    const workingDf = {
      Generator_CF: generatorCf,
      Electrolyser_CF: electrolyserCf,
      Hydrogen_prod_fixed: hydrogenProdFixed,
      Hydrogen_prod_variable: hydrogenProdVariable,
      Net_Battery_Flow: batteryNetCharge,
    };

    return workingDf;
  }

  private initialiseStackReplacementYears(
    parameters: DataModel,
    projectTimeline: number
  ): number[] {
    if (parameters.stackReplacementType === "Maximum Degradation Level") {
      return maxDegradationStackReplacementYears(
        parameters.stackDegradation,
        parameters.maximumDegradationBeforeReplacement || 0,
        projectTimeline
      );
    }
    return [];
  }
}

// returns Generator_CF series
function calculateGeneratorCf(
  solarData: CsvRow[],
  windData: CsvRow[],
  solarRatio: number,
  windRatio: number,
  location: string,
  solarDegradation: number = 0,
  windDegradation: number = 0,
  year: number = 1
): number[] {
  const solarDfValues = solarData.map((r: CsvRow) => r[location]);
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
function calculateElectrolyserCf(
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

function calculateBatteryModel(
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

function calculateVariableHydrogenProduction(
  specCons: number,
  electrolyserCf: number[],
  hydOutput: number,
  yearlyDegradationRate: number
) {
  const electrolyser_output_polynomial = (x: number) => {
    // """Calculates the specific energy consumption as a function of the electrolyser operating
    //     capacity factor
    //     """
    return 1.25 * x ** 2 - 0.4286 * x + specCons - 0.85;
  };

  const hydrogenProdVariable = electrolyserCf.map(
    (x: number) =>
      ((x * hydOutput) / electrolyser_output_polynomial(x)) *
      (1 - yearlyDegradationRate)
  );
  return hydrogenProdVariable;
}

function calculateFixedHydrogenProduction(
  electrolyserCf: number[],
  hydOutput: number,
  yearlyDegradationRate: number,
  specCons: number
) {
  return electrolyserCf.map(
    (x: number) => (x * hydOutput * (1 - yearlyDegradationRate)) / specCons
  );
}

function calculateOverloadingModel(
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
