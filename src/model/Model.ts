export type DataModel = {
  // batteryLifetime
  battLifetime: number;
  // batteryMinCharge
  battMin: number;
  // batteryEfficiency
  batteryEfficiency: number;
  // durationOfStorage
  batteryHours: number;
  // batteryRatedPower
  batteryPower: number;
  // timeBetweenOverloading
  elecOverloadRecharge: number;
  // maximumLoadWhenOverloading
  elecOverload: number;
  // electrolyserNominalCapacity
  elecCapacity: number;
  // solarNominalCapacity
  solarCapacity: number;
  // windNominalCapacity
  windCapacity: number;
  location: string;
  electrolyserMaximumLoad: number;
  electrolyserMinimumLoad: number;
  // no clue about these 3, need to ask
  specCons: number;
  elecEff: number;
  H2VoltoMass: number;
};

export type CsvRow = {
  [x: string]: number;
};

export class HydrogenModel {
  // consts
  readonly MWtokW = 1000; // kW/MW
  readonly hoursPerYear = 8760;
  readonly kgtoTonne = 1 / 1000;

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
  // data from renewables
  solarData: CsvRow[];
  windData: CsvRow[];

  constructor(parameters: DataModel, solarData: CsvRow[], windData: CsvRow[]) {
    this.parameters = parameters;
    this.solarData = solarData;
    this.windData = windData;

    // calculated values
    this.genCapacity = parameters.solarCapacity + parameters.windCapacity;
    this.elecMaxLoad = parameters.electrolyserMaximumLoad / 100;
    this.elecMinLoad = parameters.electrolyserMinimumLoad / 100;
    this.elecEff = parameters.elecEff / 100;
    this.hydOutput = this.parameters.H2VoltoMass * this.MWtokW * this.elecEff; // kg.kWh/m3.MWh
    this.elecOverload = parameters.elecOverload / 100;
    this.batteryEnergy = parameters.batteryPower * this.parameters.batteryHours;
    this.batteryEfficiency = parameters.batteryEfficiency / 100;
    this.battMin = parameters.battMin / 100;
  }
  // wrapper around calculate_hourly_operation with passing of all the args.
  // being lazy here
  calculate_electrolyser_hourly_operation(): { [key: string]: number[] } {
    return this.calculate_hourly_operation(
      this.genCapacity,
      this.parameters.elecCapacity,
      this.parameters.solarCapacity,
      this.parameters.windCapacity,
      this.parameters.location,
      this.elecMaxLoad,
      this.elecMinLoad,
      this.hydOutput,
      this.parameters.specCons,
      this.elecOverload,
      this.parameters.elecOverloadRecharge,
      this.batteryEnergy,
      this.parameters.batteryHours,
      this.batteryEfficiency,
      this.parameters.batteryPower,
      this.battMin
    );
  }
  calculate_electrolyser_output(): { [key: string]: number } {
    const working_df = this.calculate_hourly_operation(
      this.genCapacity,
      this.parameters.elecCapacity,
      this.parameters.solarCapacity,
      this.parameters.windCapacity,
      this.parameters.location,
      this.elecMaxLoad,
      this.elecMinLoad,
      this.hydOutput,
      this.parameters.specCons,
      this.elecOverload,
      this.parameters.elecOverloadRecharge,
      this.batteryEnergy,
      this.parameters.batteryHours,
      this.batteryEfficiency,
      this.parameters.batteryPower,
      this.battMin
    );

    const operating_outputs = this.get_tabulated_output(
      working_df.Generator_CF,
      working_df.Electrolyser_CF,
      working_df.Hydrogen_prod_fixed,
      working_df.Hydrogen_prod_variable,
      this.parameters.elecCapacity,
      this.genCapacity,
      this.kgtoTonne,
      this.hoursPerYear
    );

    return operating_outputs;
  }

  // """Private method- Creates a dataframe with a row for each hour of the year and columns Generator_CF,
  //       Electrolyser_CF, Hydrogen_prod_fixed and Hydrogen_prod_var
  //       """
  private calculate_hourly_operation(
    genCapacity: number,
    elecCapacity: number,
    solarCapacity: number,
    windCapacity: number,
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
    battMin: number
  ) {
    const oversize = genCapacity / elecCapacity;
    const generator_cf = this.parseData(
      this.solarData,
      this.windData,
      genCapacity,
      solarCapacity,
      windCapacity,
      location
    );

    // normal electrolyser calculation
    const calculate_electroliser = (x: number): number => {
      if (x * oversize > elecMaxLoad) {
        return elecMaxLoad;
      }

      if (x * oversize < elecMinLoad) {
        return 0;
      }
      return x * oversize;
    };

    let electrolizer_cf = generator_cf.map(calculate_electroliser);

    // overload calculation
    if (elecOverload > elecMaxLoad && elecOverloadRecharge > 0) {
      electrolizer_cf = this.overloading_model(
        oversize,
        elecMaxLoad,
        elecOverloadRecharge,
        elecOverload,
        generator_cf,
        electrolizer_cf
      );
    }

    // // battery model calc
    if (batteryEnergy > 0) {
      const hours = [1, 2, 4, 8];
      if (!hours.includes(batteryHours)) {
        throw new Error(
          "Battery storage length not valid. Please enter one of 1, 2, 4 or 8"
        );
      }
      electrolizer_cf = this.battery_model(
        oversize,
        elecCapacity,
        generator_cf,
        electrolizer_cf,
        batteryEfficiency,
        elecMinLoad,
        elecMaxLoad,
        batteryPower,
        batteryEnergy,
        battMin
      );
    }
    // actual hydrogen calc

    const hydrogen_prod_fixed = electrolizer_cf.map(
      (x: number) => (x * hydOutput) / specCons
    );

    const electrolyser_output_polynomial = (x: number) => {
      // """Calculates the specific energy consumption as a function of the electrolyser operating
      //     capacity factor
      //     """
      return 1.25 * x ** 2 - 0.4286 * x + specCons - 0.85;
    };

    const hydrogen_prod_variable = electrolizer_cf.map(
      (x: number) => (x * hydOutput) / electrolyser_output_polynomial(x)
    );
    const working_df = {
      Generator_CF: generator_cf,
      Electrolyser_CF: electrolizer_cf,
      Hydrogen_prod_fixed: hydrogen_prod_fixed,
      Hydrogen_prod_variable: hydrogen_prod_variable,
    };

    return working_df;
  }

  private battery_model(
    oversize: number,
    elecCapacity: number,
    generator_cf: number[],
    electrolizer_cf: number[],
    batteryEfficiency: number,
    elecMinLoad: number,
    elecMaxLoad: number,
    batteryPower: number,
    batteryEnergy: number,
    battMin: number
  ) {
    const size = generator_cf.length;
    const excess_generation = generator_cf.map(
      (x: number, i: number) =>
        (generator_cf[i] * oversize - electrolizer_cf[i]) * elecCapacity
    );
    const battery_net_charge = [0.0 * size];
    const battery_soc = [0.0 * size];
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
      const elec_cons = electrolizer_cf[hour] * elecCapacity;
      const batt_discharge_potential =
        Math.min(batteryPower, (batt_soc - battMin) * batteryEnergy) *
        batt_losses;
      const elec_just_operating =
        elec_cons > 0 ||
        battery_net_charge[hour - 1] < 0 ||
        electrolizer_cf[hour - 1] > 0;
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
      (e: number, i: number) => {
        if (battery_net_charge[i] < 0) {
          return (
            electrolizer_cf[i] +
            (-1 * battery_net_charge[i] * batt_losses + excess_generation[i]) /
              elecCapacity
          );
        } else {
          return electrolizer_cf[i];
        }
      }
    );

    return electrolyser_cf_batt;
  }

  // returns Generator_CF series
  private parseData(
    solarData: CsvRow[],
    windData: CsvRow[],
    genCapacity: number,
    solarCapacity: number,
    windCapacity: number,
    location: string
  ) {
    const solarRatio = solarCapacity / genCapacity;
    const windRatio = windCapacity / genCapacity;
    const solarDfValues = solarData.map((r: CsvRow) => r[location]);
    const windDfValues = windData.map((r: CsvRow) => r[location]);
    if (solarRatio === 1) {
      return solarDfValues;
    } else if (windRatio === 1) {
      return windDfValues;
    } else {
      return solarDfValues.map(
        (e: number, i: number) =>
          solarDfValues[i] * solarRatio + windDfValues[i] * windRatio
      );
    }
  }

  private overloading_model(
    oversize: number,
    elecMaxLoad: number,
    elecOverloadRecharge: number,
    elecOverload: number,
    generator_cf: number[],
    electrolizer_cf: number[]
  ) {
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
          return electrolizer_cf[i];
        }
      }
    );

    return electrolyser_CF_overload;
  }

  get_tabulated_output(
    generator_cf: number[],
    electrolizer_cf: number[],
    hydrogen_prod_fixed: number[],
    hydrogen_prod_variable: number[],
    elecCapacity: number,
    genCapacity: number,
    kgtoTonne: number,
    hoursPerYear: number
  ) {
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const mean = (arr: number[]) => sum(arr) / arr.length || 0;
    // Generator Capacity Factor
    const generator_capacity_factor = mean(generator_cf);
    // Time Electrolyser is at its Rated Capacity"
    const time_electroliser =
      electrolizer_cf.filter((e) => e === this.elecMaxLoad).length /
      hoursPerYear;
    //Total Time Electrolyser is Operating
    const total_ops_time =
      electrolizer_cf.filter((e) => e > 0).length / hoursPerYear;

    // Achieved Electrolyser Capacity Factor
    const achieved_electroliser_cf = mean(electrolizer_cf);
    // Energy in to Electrolyser [MWh/yr]
    const energy_in_electroliser = sum(electrolizer_cf) * elecCapacity;
    // Surplus Energy [MWh/yr]
    const surplus =
      sum(generator_cf) * genCapacity - sum(electrolizer_cf) * elecCapacity;
    // Hydrogen Output for Fixed Operation [t/yr]
    const hydrogen_fixed = sum(hydrogen_prod_fixed) * elecCapacity * kgtoTonne;
    // Hydrogen Output for Variable Operation [t/yr]
    const hydrogen_variable =
      sum(hydrogen_prod_variable) * elecCapacity * kgtoTonne;

    return {
      "Generator Capacity Factor": generator_capacity_factor,
      "Time Electrolyser is at its Rated Capacity": time_electroliser,
      "Total Time Electrolyser is Operating": total_ops_time,
      "Achieved Electrolyser Capacity Factor": achieved_electroliser_cf,
      "Energy in to Electrolyser [MWh/yr]": energy_in_electroliser,
      "Surplus Energy [MWh/yr]": surplus,
      "Hydrogen Output for Fixed Operation [t/yr]": hydrogen_fixed,
      "Hydrogen Output for Variable Operation [t/yr]": hydrogen_variable,
    };
  }
}
