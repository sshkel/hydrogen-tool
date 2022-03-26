import Papa from "papaparse";

export interface DataModel {
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
}

export class HydrogenModel {
  // consts
  readonly MWtokW = 1000; // kW/MW
  readonly hoursPerYear = 8760;
  readonly kgtoTonne = 1 / 1000;

  // internal
  genCapacity: number;
  elecMaxLoad: number;
  elecMinLoad: number;
  elecEff: number;
  H2VoltoMass: number;
  hydOutput: number;
  specCons: number;
  data: DataModel;
  elecOverload: number;
  elecOverloadRecharge: number;
  batteryEnergy: number;
  batteryHours: number;
  batteryEfficiency: number;
  batteryPower: number;
  battMin: number;
  battLife: number;
  elecCapacity: number;

  constructor(data: DataModel) {
    this.genCapacity = data.solarCapacity + data.windCapacity;
    this.elecCapacity = data.elecCapacity;
    this.elecMaxLoad = data.electrolyserMaximumLoad / 100;
    this.elecMinLoad = data.electrolyserMinimumLoad / 100;
    this.elecEff = data.elecEff / 100;
    this.H2VoltoMass = data.H2VoltoMass;
    this.hydOutput = this.H2VoltoMass * this.MWtokW * this.elecEff; // kg.kWh/m3.MWh
    this.specCons = data.specCons;
    this.elecOverload = data.elecOverload / 100;
    this.elecOverloadRecharge = data.elecOverloadRecharge;
    this.batteryHours = data.batteryHours;
    this.batteryEnergy = data.batteryPower * this.batteryHours;
    this.batteryEfficiency = data.batteryEfficiency / 100;
    this.batteryPower = data.batteryPower;
    this.battMin = data.battMin / 100;
    this.battLife = data.battLifetime;
    this.data = data;
  }
  // wrapper around calculate_hourly_operation with passing of all the args.
  // being lazy here
  async calculate_electrolyser_hourly_operation() {
    return await this.calculate_hourly_operation(
      this.genCapacity,
      this.data.elecCapacity,
      this.data.solarCapacity,
      this.data.windCapacity,
      this.data.location,
      this.elecMaxLoad,
      this.elecMinLoad,
      this.hydOutput,
      this.specCons,
      this.elecOverload,
      this.elecOverloadRecharge,
      this.batteryEnergy,
      this.batteryHours,
      this.batteryEfficiency,
      this.batteryPower,
      this.battMin
    );
  }
  async calculate_electrolyser_output() {
    const working_df = await this.calculate_hourly_operation(
      this.genCapacity,
      this.data.elecCapacity,
      this.data.solarCapacity,
      this.data.windCapacity,
      this.data.location,
      this.elecMaxLoad,
      this.elecMinLoad,
      this.hydOutput,
      this.specCons,
      this.elecOverload,
      this.elecOverloadRecharge,
      this.batteryEnergy,
      this.batteryHours,
      this.batteryEfficiency,
      this.batteryPower,
      this.battMin
    );

    const operating_outputs = this.get_tabulated_output(
      working_df.generator_cf,
      working_df.electrolizer_cf,
      working_df.hydrogen_prod_fixed,
      working_df.hydrogen_prod_variable,
      this.elecCapacity,
      this.genCapacity,
      this.kgtoTonne,
      this.hoursPerYear
    );

    // const operating_outputs = get_tabulated_outputs(working_df);
    return operating_outputs;
  }

  // """Private method- Creates a dataframe with a row for each hour of the year and columns Generator_CF,
  //       Electrolyser_CF, Hydrogen_prod_fixed and Hydrogen_prod_var
  //       """
  private async calculate_hourly_operation(
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
    const generator_cf = await this.readDF(
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
      generator_cf,
      electrolizer_cf,
      hydrogen_prod_fixed,
      hydrogen_prod_variable,
    };

    return working_df;
  }

  battery_model(
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
        elec_cons == 0 &&
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
        (spill == 0 && batt_soc <= battMin)
      ) {
        //  generation and battery together are insufficient to power the electrolyser or there is no
        //  spilled generation and the battery is empty
        battery_net_charge[hour] = 0;
      } else if (
        spill == 0 &&
        elec_max - elec_cons >
          (batt_soc - battMin) * batt_losses * batteryEnergy &&
        elec_just_operating
      ) {
        //  When the electrolyser is operating and the energy to get to max capacity is more than what is stored
        battery_net_charge[hour] =
          (-1 * batt_discharge_potential * 1) / batt_losses;
      } else if (spill == 0 && elec_just_operating) {
        //  When the stored power is enough to power the electrolyser at max capacity
        battery_net_charge[hour] =
          -1 *
          Math.min(batteryPower, ((elec_max - elec_cons) * 1) / batt_losses);
      } else if (spill == 0) {
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
  async readDF(
    genCapacity: number,
    solarCapacity: number,
    windCapacity: number,
    location: string
  ) {
    const solarRatio = solarCapacity / genCapacity;
    const windRatio = windCapacity / genCapacity;

    let solarDf = await this.read_csv(
      "https://hysupply.s3.ap-southeast-2.amazonaws.com/solar-traces.csv"
    );
    let windDf = await this.read_csv(
      "https://hysupply.s3.ap-southeast-2.amazonaws.com/wind-traces.csv"
    );
    const solarDfValues = solarDf.map(
      (r: { [x: string]: number }) => r[location]
    );
    const windDfValues = windDf.map(
      (r: { [x: string]: number }) => r[location]
    );
    if (solarRatio == 1) {
      return solarDfValues;
    } else if (windRatio == 1) {
      return windDfValues;
    } else {
      return solarDfValues.map(
        (e: number, i: number) =>
          solarDfValues[i] * solarRatio + windDfValues[i] * windRatio
      );
    }
  }

  overloading_model(
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
      electrolizer_cf.filter((e) => e == this.elecMaxLoad).length /
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
      "Hydrogen Output for Fixed Operation [t/yr": hydrogen_fixed,
      "Hydrogen Output for Variable Operation [t/yr]": hydrogen_variable,
    };
  }

  async read_csv(file: any, options?: any): Promise<any> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        ...options,
        download: true,
        complete: (results) => {
          const df = results.data;
          resolve(df);
        },
      });
    });
  }
}

// overload -> working correctly :tick:
const example1 = {
  //args or defaults
  elecCapacity: 10,
  solarCapacity: 10,
  windCapacity: 10,
  location: "REZ-N1",

  spot_price: 30,

  // defaults
  batteryPower: 0,
  batteryHours: 0,
  spotPrice: 0,
  ppaPrice: 0,

  // config
  electrolyserMaximumLoad: 100,
  elecReferenceCapacity: 10,
  elecCostReduction: 1.0,
  elecEquip: 1.0,
  elecInstall: 0.0,
  elecLand: 0.0,
  // pem

  electrolyserMinimumLoad: 10,
  elecOverload: 120,
  elecOverloadRecharge: 4,
  specCons: 4.7,
  stackLifetime: 60000,
  electrolyserCapex: 1000,
  electrolyserOandM: 4,
  waterNeeds: 10,

  H2VoltoMass: 0.089,
  elecEff: 83,

  stackDegradation: 0,
  stackDegMax: 0,
  solarDegradation: 0,
  windDegradation: 0,

  batteryEfficiency: 85,
  battMin: 0.0,
  battLifetime: 10,

  solarCapex: 1120,
  solarOpex: 16990,
  windCapex: 1942,
  windOpex: 25000,
  powerplantReferenceCapacity: 1,
  powerplantCostReduction: 1.0,
  powerplantEquip: 1.0,
  powerplantInstall: 0.0,
  powerplantLand: 0.0,
  batteryCapex: { 0: 0, 1: 827, 2: 542, 4: 446, 8: 421 },
  batteryOpex: { 0: 0, 1: 4833, 2: 9717, 4: 19239, 8: 39314 },
  batteryReplacement: 100,
  electrolyserStackCost: 40,
  waterCost: 5,
  discountRate: 4,
  projectLife: 20,
};

// battery -> working correctly :tick:
const example2 = {
  elecCapacity: 10,
  solarCapacity: 15,
  batteryPower: 10,
  batteryHours: 2,
  location: "REZ-N1",

  // defaults
  windCapacity: 0,
  spotPrice: 0,
  ppaPrice: 0,

  // config
  electrolyserMaximumLoad: 100,
  elecReferenceCapacity: 10,
  elecCostReduction: 1.0,
  elecEquip: 1.0,
  elecInstall: 0.0,
  elecLand: 0.0,
  // AE
  electrolyserMinimumLoad: 20,
  elecOverload: 100,
  elecOverloadRecharge: 0,
  specCons: 4.5,
  stackLifetime: 80000,
  electrolyserCapex: 1000,
  electrolyserOandM: 2.5,
  waterNeeds: 10,

  H2VoltoMass: 0.089,
  elecEff: 83,

  stackDegradation: 0,
  stackDegMax: 0,
  solarDegradation: 0,
  windDegradation: 0,

  batteryEfficiency: 85,
  battMin: 0.0,
  battLifetime: 10,

  solarCapex: 1120,
  solarOpex: 16990,
  windCapex: 1942,
  windOpex: 25000,
  powerplantReferenceCapacity: 1,
  powerplantCostReduction: 1.0,
  powerplantEquip: 1.0,
  powerplantInstall: 0.0,
  powerplantLand: 0.0,
  batteryCapex: { 0: 0, 1: 827, 2: 542, 4: 446, 8: 421 },
  batteryOpex: { 0: 0, 1: 4833, 2: 9717, 4: 19239, 8: 39314 },
  batteryReplacement: 100,
  electrolyserStackCost: 40,
  waterCost: 5,
  discountRate: 4,
  projectLife: 20,
};

// normal -> working correctly :tick:
const example3 = {
  elecCapacity: 10,
  solarCapacity: 0,
  windCapacity: 100,

  // defaults
  location: "REZ-N1",
  batteryPower: 0,
  batteryHours: 0,
  spotPrice: 0,
  ppaPrice: 0,

  // config
  electrolyserMaximumLoad: 100,
  elecReferenceCapacity: 10,
  elecCostReduction: 1.0,
  elecEquip: 1.0,
  elecInstall: 0.0,
  elecLand: 0.0,
  // AE: {
  electrolyserMinimumLoad: 20,
  elecOverload: 100,
  elecOverloadRecharge: 0,
  specCons: 4.5,
  stackLifetime: 80000,
  electrolyserCapex: 1000,
  electrolyserOandM: 2.5,
  waterNeeds: 10,

  H2VoltoMass: 0.089,
  elecEff: 83,

  stackDegradation: 0,
  stackDegMax: 0,
  solarDegradation: 0,
  windDegradation: 0,

  batteryEfficiency: 85,
  battMin: 0.0,
  battLifetime: 10,

  solarCapex: 1120,
  solarOpex: 16990,
  windCapex: 1942,
  windOpex: 25000,
  powerplantReferenceCapacity: 1,
  powerplantCostReduction: 1.0,
  powerplantEquip: 1.0,
  powerplantInstall: 0.0,
  powerplantLand: 0.0,
  batteryCapex: { 0: 0, 1: 827, 2: 542, 4: 446, 8: 421 },
  batteryOpex: { 0: 0, 1: 4833, 2: 9717, 4: 19239, 8: 39314 },
  batteryReplacement: 100,
  electrolyserStackCost: 40,
  waterCost: 5,
  discountRate: 4,
  projectLife: 20,
};
const defaultProps = example3;

async function model() {
  // console.log(solarDF);
  const model = new HydrogenModel(defaultProps);
  const out = await model.calculate_electrolyser_output();
  for (const [key, value] of Object.entries(out)) {
    console.log(`${key}: ${value.toFixed(2)}`);
  }
}
