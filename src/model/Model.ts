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
    this.solarData = solarData;
    this.windData = windData;
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

  calculateHydrogenModel(plantLife: number): ProjectModelSummary {
    const { stackDegradation, solarDegradation, windDegradation } =
      this.parameters;
    const projectSummary =
      stackDegradation + solarDegradation + windDegradation === 0
        ? this.calculateHydrogenModelWithoutDegradation(plantLife)
        : this.calculateHydrogenModelWithDegradation(plantLife);

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
    plantLife: number
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
      projectSummary[key] = Array(plantLife).fill(operatingOutputs[key]);
    });

    return projectSummary;
  }

  private calculateHydrogenModelWithDegradation(
    plantLife: number
  ): ProjectModelSummary {
    this.stackReplacementYears = this.initialiseStackReplacementYears(
      this.parameters,
      plantLife
    );
    let year = 1;
    // Calculate first year separately
    const hourlyOperation = this.calculateElectrolyserHourlyOperation(year);
    this.hourlyOperationsInYearOne = hourlyOperation;
    const operatingOutputs = this.calculateElectrolyserOutput(hourlyOperation);

    let modelSummaryPerYear: ModelSummaryPerYear[] = [];
    modelSummaryPerYear.push(operatingOutputs);

    for (year = 2; year <= plantLife; year++) {
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
      this.genCapacity,
      this.parameters.electrolyserNominalCapacity,
      this.parameters.solarNominalCapacity,
      this.parameters.windNominalCapacity,
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
    const generator_capacity_factor = mean(generatorCapFactor);
    // Time Electrolyser is at its Rated Capacity"
    const time_electrolyser =
      electrolyserCapFactor.filter((e) => e === this.elecMaxLoad).length /
      hoursPerYear;
    //Total Time Electrolyser is Operating
    const total_ops_time =
      electrolyserCapFactor.filter((e) => e > 0).length / hoursPerYear;

    // Achieved Electrolyser Capacity Factor
    const achieved_electrolyser_cf = mean(electrolyserCapFactor);
    // Energy in to Electrolyser [MWh/yr]
    const energy_in_electrolyser = sum(electrolyserCapFactor) * elecCapacity;
    // Surplus Energy [MWh/yr]
    const surplus =
      sum(generatorCapFactor) * genCapacity -
      sum(electrolyserCapFactor) * elecCapacity;
    // Hydrogen Output for Fixed Operation [t/yr]
    const hydrogen_fixed = sum(hydrogenProdFixed) * elecCapacity * kgtoTonne;
    // Hydrogen Output for Variable Operation [t/yr]
    const hydrogen_variable =
      sum(hydrogenProdVariable) * elecCapacity * kgtoTonne;
    // Total Battery Output (MWh/yr)
    const totalBatteryOutput =
      sum(netBatteryFlow.filter((num) => num < 0)) *
      -1 *
      (1 - (1 - this.batteryEfficiency) / 2);

    let summary: ModelSummaryPerYear = {};
    summary[POWER_PLANT_CF] = generator_capacity_factor;
    summary[RATED_CAPACITY_TIME] = time_electrolyser;
    summary[TOTAL_OPERATING_TIME] = total_ops_time;
    summary[ELECTROLYSER_CF] = achieved_electrolyser_cf;
    summary[ENERGY_INPUT] = energy_in_electrolyser;
    summary[ENERGY_OUTPUT] = surplus;
    summary[BATTERY_OUTPUT] = totalBatteryOutput;
    summary[HYDROGEN_OUTPUT_FIXED] = hydrogen_fixed;
    summary[HYDROGEN_OUTPUT_VARIABLE] = hydrogen_variable;

    return summary;
  }

  // """Private method- Creates a dataframe with a row for each hour of the year and columns Generator_CF,
  //       Electrolyser_CF, Hydrogen_prod_fixed and Hydrogen_prod_var
  //       """
  private calculateHourlyOperation(
    genCapacity: number,
    elecCapacity: number,
    solarCapacity: number,
    windCapacity: number,
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
    const oversize = genCapacity / elecCapacity;
    const generator_cf = this.parseData(
      this.solarData,
      this.windData,
      genCapacity,
      solarCapacity,
      windCapacity,
      solarDegradation,
      windDegradation,
      year,
      location
    );

    // normal electrolyser calculation
    const calculate_electrolyser = (x: number): number => {
      if (x * oversize > elecMaxLoad) {
        return elecMaxLoad;
      }

      if (x * oversize < elecMinLoad) {
        return 0;
      }
      return x * oversize;
    };

    let electrolyser_cf = generator_cf.map(calculate_electrolyser);
    let battery_net_charge: number[] = new Array(8760).fill(0);

    // overload calculation
    if (elecOverload > elecMaxLoad && elecOverloadRecharge > 0) {
      electrolyser_cf = this.overloading_model(
        oversize,
        elecMaxLoad,
        elecOverloadRecharge,
        elecOverload,
        generator_cf,
        electrolyser_cf
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
      const battery_model = this.battery_model(
        oversize,
        elecCapacity,
        generator_cf,
        electrolyser_cf,
        batteryEfficiency,
        elecMinLoad,
        elecMaxLoad,
        batteryPower,
        batteryEnergy,
        battMin
      );
      electrolyser_cf = battery_model.electrolyser_cf;
      battery_net_charge = battery_model.battery_net_charge;
    }

    let yearlyDegradationRate: number = 0;

    // Stack degradation calculation
    if (stackDegradation > 0) {
      // Cumulative hour degradation logic if defined
      if (this.stackLifetime) {
        this.currentStackOperatingHours += electrolyser_cf.filter(
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

    // actual hydrogen calc
    const hydrogen_prod_fixed = electrolyser_cf.map(
      (x: number) => (x * hydOutput * (1 - yearlyDegradationRate)) / specCons
    );

    const electrolyser_output_polynomial = (x: number) => {
      // """Calculates the specific energy consumption as a function of the electrolyser operating
      //     capacity factor
      //     """
      return 1.25 * x ** 2 - 0.4286 * x + specCons - 0.85;
    };

    const hydrogen_prod_variable = electrolyser_cf.map(
      (x: number) =>
        ((x * hydOutput) / electrolyser_output_polynomial(x)) *
        (1 - yearlyDegradationRate)
    );
    const working_df = {
      Generator_CF: generator_cf,
      Electrolyser_CF: electrolyser_cf,
      Hydrogen_prod_fixed: hydrogen_prod_fixed,
      Hydrogen_prod_variable: hydrogen_prod_variable,
      Net_Battery_Flow: battery_net_charge,
    };

    return working_df;
  }

  private battery_model(
    oversize: number,
    elecCapacity: number,
    generator_cf: number[],
    electrolyser_cf: number[],
    batteryEfficiency: number,
    elecMinLoad: number,
    elecMaxLoad: number,
    batteryPower: number,
    batteryEnergy: number,
    battMin: number
  ): { electrolyser_cf: number[]; battery_net_charge: number[] } {
    const size = generator_cf.length;
    const excess_generation = generator_cf.map(
      (_: number, i: number) =>
        (generator_cf[i] * oversize - electrolyser_cf[i]) * elecCapacity
    );
    const battery_net_charge = Array(size).fill(0.0);
    const battery_soc = Array(size).fill(0.0);
    const batt_losses = 1 - (1 - batteryEfficiency) / 2;
    const elec_min = elecMinLoad * elecCapacity;
    const elec_max = elecMaxLoad * elecCapacity;

    battery_net_charge[0] = Math.min(
      batteryPower,
      excess_generation[0] * batt_losses
    );
    battery_soc[0] = battery_net_charge[0] / batteryEnergy;
    // check for off by 1 error
    for (let hour = 1; hour < size; hour++) {
      const batt_soc = battery_soc[hour - 1];
      const spill = excess_generation[hour];
      const elec_cons = electrolyser_cf[hour] * elecCapacity;
      const batt_discharge_potential =
        Math.min(batteryPower, (batt_soc - battMin) * batteryEnergy) *
        batt_losses;
      const elec_just_operating =
        elec_cons > 0 ||
        battery_net_charge[hour - 1] < 0 ||
        electrolyser_cf[hour - 1] > 0;
      if (
        elec_cons === 0 &&
        spill + batt_discharge_potential > elec_min &&
        elec_just_operating
      ) {
        // When the generation is insufficient alone but combined with battery power can power the electrolyser
        if (spill + batt_discharge_potential > elec_max) {
          battery_net_charge[hour] =
            -1 * Math.min(batteryPower, ((elec_max - spill) * 1) / batt_losses);
        } else {
          battery_net_charge[hour] =
            (-1 * batt_discharge_potential * 1) / batt_losses;
        }
      } else if (
        spill > 0 &&
        batt_soc + (spill / batteryEnergy) * batt_losses > 1
      ) {
        // When spilled generation is enough to completely charge the battery
        battery_net_charge[hour] = Math.min(
          batteryPower,
          Math.max(batteryEnergy * (1.0 - batt_soc), 0.0)
        );
      } else if (spill > 0) {
        // Any other cases when there is spilled generation
        battery_net_charge[hour] = Math.min(batteryPower, spill * batt_losses);
      } else if (
        elec_cons + batt_discharge_potential < elec_min ||
        (spill === 0 && batt_soc <= battMin)
      ) {
        //  generation and battery together are insufficient to power the electrolyser or there is no
        //  spilled generation and the battery is empty
        battery_net_charge[hour] = 0;
      } else if (
        spill === 0 &&
        elec_max - elec_cons >
          (batt_soc - battMin) * batt_losses * batteryEnergy &&
        elec_just_operating
      ) {
        //  When the electrolyser is operating and the energy to get to max capacity is more than what is stored
        battery_net_charge[hour] =
          (-1 * batt_discharge_potential * 1) / batt_losses;
      } else if (spill === 0 && elec_just_operating) {
        //  When the stored power is enough to power the electrolyser at max capacity
        battery_net_charge[hour] =
          -1 *
          Math.min(batteryPower, ((elec_max - elec_cons) * 1) / batt_losses);
      } else if (spill === 0) {
        battery_net_charge[hour] = 0;
      } else {
        throw new Error("Error: battery configuration not accounted for");
      }
      //  Determine the battery state of charge based on the previous state of charge and the net change
      battery_soc[hour] =
        battery_soc[hour - 1] + battery_net_charge[hour] / batteryEnergy;
    }
    const electrolyser_cf_batt = battery_net_charge.map(
      (_: number, i: number) => {
        if (battery_net_charge[i] < 0) {
          return (
            electrolyser_cf[i] +
            (-1 * battery_net_charge[i] * batt_losses + excess_generation[i]) /
              elecCapacity
          );
        } else {
          return electrolyser_cf[i];
        }
      }
    );

    return { electrolyser_cf: electrolyser_cf_batt, battery_net_charge };
  }

  // returns Generator_CF series
  private parseData(
    solarData: CsvRow[],
    windData: CsvRow[],
    genCapacity: number,
    solarCapacity: number,
    windCapacity: number,
    solarDegradation: number,
    windDegradation: number,
    year: number,
    location: string
  ): number[] {
    const solarRatio = solarCapacity / genCapacity;
    const windRatio = windCapacity / genCapacity;
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

  private overloading_model(
    oversize: number,
    elecMaxLoad: number,
    elecOverloadRecharge: number,
    elecOverload: number,
    generator_cf: number[],
    electrolyser_cf: number[]
  ): number[] {
    const can_overload = generator_cf.map((x) => x * oversize > elecMaxLoad);

    for (let hour = 1; hour < generator_cf.length; hour++) {
      for (
        let hour_i = 1;
        hour_i < Math.min(hour, elecOverloadRecharge) + 1;
        hour_i++
      ) {
        if (can_overload[hour] && can_overload[hour - hour_i]) {
          can_overload[hour] = false;
        }
      }
    }
    const maxOverload = elecOverload;

    const electrolyser_CF_overload = can_overload.map(
      (canOverload: boolean, i: number) => {
        const energy_generated = generator_cf[i] * oversize;
        if (canOverload) {
          //Energy_for_overloading
          return Math.min(maxOverload, energy_generated);
        } else {
          return electrolyser_cf[i];
        }
      }
    );

    return electrolyser_CF_overload;
  }

  private initialiseStackReplacementYears(
    parameters: DataModel,
    projectLife: number
  ): number[] {
    if (parameters.stackReplacementType === "Maximum Degradation Level") {
      return maxDegradationStackReplacementYears(
        parameters.stackDegradation,
        parameters.maximumDegradationBeforeReplacement || 0,
        projectLife
      );
    }
    return [];
  }
}
