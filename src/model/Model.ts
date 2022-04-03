export type DataModel = {
  // batteryLifetime
  batteryLifetime: number;
  // batteryMinCharge
  batteryMinCharge: number;
  // batteryEfficiency
  batteryEfficiency: number;
  // durationOfStorage
  durationOfStorage: number;
  // batteryRatedPower
  batteryRatedPower: number;
  // timeBetweenOverloading
  timeBetweenOverloading: number;
  // maximumLoadWhenOverloading
  maximumLoadWhenOverloading: number;
  // electrolyserNominalCapacity
  electrolyserNominalCapacity: number;
  // solarNominalCapacity
  solarNominalCapacity: number;
  // windNominalCapacity
  windNominalCapacity: number;
  region: string;
  electrolyserMaximumLoad: number;
  electrolyserMinimumLoad: number;
  // no clue about these 3, need to ask
  specCons: number;
  elecEff: number;
  H2VoltoMass: number;
};

export type CsvRow = {
  [k: string]: number;
};

export type ModelHourlyOperation = {
  [k: string]: number[];
};
export type ModelSummary = {
  [k: string]: number;
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
    this.genCapacity =
      parameters.solarNominalCapacity + parameters.windNominalCapacity;
    this.elecMaxLoad = parameters.electrolyserMaximumLoad / 100;
    this.elecMinLoad = parameters.electrolyserMinimumLoad / 100;
    this.elecEff = parameters.elecEff / 100;
    this.hydOutput = this.parameters.H2VoltoMass * this.MWtokW * this.elecEff; // kg.kWh/m3.MWh
    this.elecOverload = parameters.maximumLoadWhenOverloading / 100;
    this.batteryEnergy =
      parameters.batteryRatedPower * this.parameters.durationOfStorage;
    this.batteryEfficiency = parameters.batteryEfficiency / 100;
    this.battMin = parameters.batteryMinCharge / 100;
  }
  // wrapper around calculate_hourly_operation with passing of all the args.
  // being lazy here
  calculateElectrolyserHourlyOperation(): ModelHourlyOperation {
    return this.calculateHourlyOperation(
      this.genCapacity,
      this.parameters.electrolyserNominalCapacity,
      this.parameters.solarNominalCapacity,
      this.parameters.windNominalCapacity,
      this.parameters.region,
      this.elecMaxLoad,
      this.elecMinLoad,
      this.hydOutput,
      this.parameters.specCons,
      this.elecOverload,
      this.parameters.timeBetweenOverloading,
      this.batteryEnergy,
      this.parameters.durationOfStorage,
      this.batteryEfficiency,
      this.parameters.batteryRatedPower,
      this.battMin
    );
  }
  calculateElectrolyserOutput(
    hourlyOperation: ModelHourlyOperation
  ): ModelSummary {
    const operatingOutputs = this.getTabulatedOutput(
      hourlyOperation.Generator_CF,
      hourlyOperation.Electrolyser_CF,
      hourlyOperation.Hydrogen_prod_fixed,
      hourlyOperation.Hydrogen_prod_variable,
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
    elecCapacity: number,
    genCapacity: number,
    kgtoTonne: number,
    hoursPerYear: number
  ): ModelSummary {
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const mean = (arr: number[]) => sum(arr) / arr.length || 0;
    // Generator Capacity Factor
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

    return {
      "Generator Capacity Factor": generator_capacity_factor,
      "Time Electrolyser is at its Rated Capacity": time_electrolyser,
      "Total Time Electrolyser is Operating": total_ops_time,
      "Achieved Electrolyser Capacity Factor": achieved_electrolyser_cf,
      "Energy in to Electrolyser [MWh/yr]": energy_in_electrolyser,
      "Surplus Energy [MWh/yr]": surplus,
      "Hydrogen Output for Fixed Operation [t/yr]": hydrogen_fixed,
      "Hydrogen Output for Variable Operation [t/yr]": hydrogen_variable,
    };
  }

  // """Private method- Creates a dataframe with a row for each hour of the year and columns Generator_CF,
  //       Electrolyser_CF, Hydrogen_prod_fixed and Hydrogen_prod_var
  //       """
  private calculateHourlyOperation(
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
  ): ModelHourlyOperation {
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
          "Battery storage length not valid. Please enter one of 1, 2, 4 or 8"
        );
      }
      electrolyser_cf = this.battery_model(
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
    }
    // actual hydrogen calc

    const hydrogen_prod_fixed = electrolyser_cf.map(
      (x: number) => (x * hydOutput) / specCons
    );

    const electrolyser_output_polynomial = (x: number) => {
      // """Calculates the specific energy consumption as a function of the electrolyser operating
      //     capacity factor
      //     """
      return 1.25 * x ** 2 - 0.4286 * x + specCons - 0.85;
    };

    const hydrogen_prod_variable = electrolyser_cf.map(
      (x: number) => (x * hydOutput) / electrolyser_output_polynomial(x)
    );
    const working_df = {
      Generator_CF: generator_cf,
      Electrolyser_CF: electrolyser_cf,
      Hydrogen_prod_fixed: hydrogen_prod_fixed,
      Hydrogen_prod_variable: hydrogen_prod_variable,
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
  ): number[] {
    const size = generator_cf.length;
    const excess_generation = generator_cf.map(
      (x: number, i: number) =>
        (generator_cf[i] * oversize - electrolyser_cf[i]) * elecCapacity
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
      (e: number, i: number) => {
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
  ): number[] {
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

  private calculate_costs(
    operating_outputs: ModelSummary,
    specific_consumption_type: "fixed" | "variable",
    solarCapex: number,
    solarCapacity: number,
    windCapex: number,
    windCapacity: number,
    solarOpex: number,
    windOpex: number,
    projectLife: number,
    ppaPrice: number,
    spotPrice: number,
    electrolyserCapex: number,
    elecCapacity: number,
    electrolyserOandM: number,
    electrolyserStackCost: number,
    waterNeeds: number,
    waterCost: number,
    batteryCapex: number[],
    batteryHours: number,
    batteryEnergy: number,
    batteryOpex: number[],
    batteryPower: number,
    battReplacement: number,
    kgtoTonne: number,
    discountRate: number,
    stackLifetime: number
  ) {
    // """Calculates the levelised cost of hydrogen production for the model

    //     Parameters
    //     ----------
    //     specific_consumption_type : str, optional
    //         the method by which the electrolyser specific consumption of energy is calculated. This must be either
    //         "fixed" for a constant value or "variable" for a value that depends on the operating load.

    //     Returns
    //     -------
    //     lcoh
    //         the LCOH in A$/kg rounded to two decimal places
    //     """

    let annual_hydrogen = null;
    if (specific_consumption_type === "variable") {
      annual_hydrogen =
        operating_outputs["Hydrogen Output for Variable Operation [t/yr]"];
    } else if (specific_consumption_type === "fixed") {
      annual_hydrogen =
        operating_outputs["Hydrogen Output for Fixed Operation [t/yr]"];
    } else {
      throw new Error(
        "Specific consumption type not valid, please select either 'variable' or 'fixed'"
      );
    }

    // # Calculate the annual cash flows as in the 'Costings' tab of the excel tool
    // cash_flow_df = pd.DataFrame(index=range(self.projectLife + 1), columns=['Year', 'Gen_CAPEX', 'Elec_CAPEX',
    //                                                                         'Gen_OPEX', 'Elec_OandM', 'Power_cost',
    //                                                                         'Stack_replacement', 'Water_cost',
    //                                                                         'Battery_cost', 'Total'])

    const Year = Array.from(Array(projectLife + 1).keys());
    const gen_capex = solarCapex * solarCapacity + windCapex * windCapacity;
    const gen_opex = solarOpex * solarCapacity + windOpex * windCapacity;
    let Power_cost: number[] = [];
    let Gen_CAPEX: number[] = [];
    let Gen_OPEX: number[] = [];
    if (ppaPrice > 0) {
      Power_cost = buttFirst(
        operating_outputs["Energy in to Electrolyser [MWh/yr]"] * ppaPrice,
        projectLife
      );
    } else {
      Gen_CAPEX = first(gen_capex, projectLife);

      Gen_OPEX = buttFirst(gen_opex, projectLife);

      Power_cost = buttFirst(
        -1 * operating_outputs["Surplus Energy [MWh/yr]"] * spotPrice,
        projectLife
      );
    }

    const Elec_CAPEX = first(electrolyserCapex * elecCapacity, projectLife);
    const Elec_OandM = buttFirst(electrolyserOandM * elecCapacity, projectLife);
    const stack_years = this.find_stack_replacement_years(
      operating_outputs,
      this.hoursPerYear,
      projectLife,
      stackLifetime
    );
    // const cash_flow_df.loc[stack_years, 'Stack_replacement'] = self.electrolyserStackCost * self.elecCapacity
    const Stack_replacement = Array(projectLife).fill(0);
    stack_years.forEach((x: number) => {
      Stack_replacement[x] = electrolyserStackCost * elecCapacity;
    });
    const Water_cost = buttFirst(
      annual_hydrogen * waterNeeds * waterCost,
      projectLife
    );
    const Battery_cost = [
      batteryCapex[batteryHours] * batteryEnergy,
      ...Array(projectLife).fill(batteryOpex[batteryHours] * batteryPower),
    ];
    // TODO figure out wtf?
    Battery_cost[10] += battReplacement * batteryEnergy;

    // cash flow total
    const cash_flow_total = Array(projectLife + 1)
      // do i even need fill?
      .fill(0)
      .map((i: number) => {
        return (
          Gen_CAPEX[i] +
          Elec_CAPEX[i] +
          Gen_OPEX[i] +
          Elec_OandM[i] +
          Power_cost[i] +
          Stack_replacement[i] +
          Water_cost[i] +
          Battery_cost[i]
        );
      });
    //# Calculate the annual discounted cash flows for hydrogen and total costs
    const Hydrogen_kg = buttFirst(annual_hydrogen / kgtoTonne, projectLife);
    const Hydrogen_kg_Discounted = Hydrogen_kg.map((x: number, i: number) => {
      return Hydrogen_kg[i] * (1 / (1 + discountRate)) ** Year[i];
    });
    const cash_flow_discounted = cash_flow_total.map((x: number, i: number) => {
      return cash_flow_total[i] * (1 / (1 + discountRate)) ** Year[i];
    });
    //  Calculate the LCH2 as the total discounted costs divided by the total discounted hydrogen produced over the
    // project lifetime
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

    const lcoh = sum(cash_flow_discounted) / sum(Hydrogen_kg_Discounted);
    return lcoh.toFixed(2);
  }

  private find_stack_replacement_years(
    operating_outputs: ModelSummary,
    hoursPerYear: number,
    projectLife: number,
    stackLifetime: number
  ): number[] {
    // """Private method - Returns a list of the years in which the electrolyser stack will need replacing, defined as
    //the total operating time surpassing a multiple of the stack lifetime.
    //"""

    const op_hours_per_year =
      operating_outputs["Total Time Electrolyser is Operating"] * hoursPerYear;

    const stack_years = [];
    // TODO off by one error? In python range is not inclusive
    for (let year of Array.from(Array(projectLife).keys()).slice(1)) {
      // TODO check for rounding error
      if (
        Math.floor((op_hours_per_year * year) / stackLifetime) -
          Math.floor((op_hours_per_year * (year - 1)) / stackLifetime) ==
        1.0
      ) {
        stack_years.push(year);
      }
    }
    return stack_years;
  }
}

function first(element: number, projectLife: number) {
  return [element].concat(Array(projectLife).fill(0));
}

function buttFirst(element: number, projectLife: number) {
  return [0].concat(Array(projectLife).fill(element));
}
