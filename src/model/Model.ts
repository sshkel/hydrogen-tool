import { DataFrame, readCSV } from "danfojs-node";
interface DataModel {
  battLifetime: number;
  battMin: number;
  batteryEfficiency: number;
  batteryHours: number;
  batteryPower: number;
  elecOverloadRecharge: number;
  elecOverload: number;
  elecCapacity: number;
  solarCapacity: number;
  windCapacity: number;
  location: string;
  elecMaxLoad: number;
  elecMinLoad: number;
  specCons: number;
  elecEff: number;
  H2VoltoMass: number;
}

class HydrogenModel {
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

  constructor(data: DataModel) {
    this.genCapacity = data.solarCapacity + data.windCapacity;
    this.elecMaxLoad = data.elecMaxLoad / 100;
    this.elecMinLoad = data.elecMinLoad / 100;
    this.elecEff = data.elecEff / 100;
    this.H2VoltoMass = data.H2VoltoMass;
    this.hydOutput = this.H2VoltoMass * this.MWtokW * this.elecEff; // kg.kWh/m3.MWh
    this.specCons = data.specCons;
    (this.elecOverload = data.elecOverload / 100),
      (this.elecOverloadRecharge = data.elecOverloadRecharge);
    this.batteryHours = data.batteryHours;
    this.batteryEnergy = data.batteryPower * this.batteryHours;
    this.batteryEfficiency = data.batteryEfficiency / 100;
    this.batteryPower = data.batteryPower;
    this.battMin = data.battMin / 100;
    this.battLife = data.battLifetime;
    this.data = data;
  }

  calculate_electrolyser_output() {
    const working_df = this.calculate_hourly_operation(
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

    // const operating_outputs = get_tabulated_outputs(working_df);
    return working_df;
  }

  // """Private method- Creates a dataframe with a row for each hour of the year and columns Generator_CF,
  //       Electrolyser_CF, Hydrogen_prod_fixed and Hydrogen_prod_var
  //       """
  async calculate_hourly_operation(
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

    this.save_as_df({ generator_cf });

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
    // this.save_as_df(working_df);
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
        generator_cf[i] * oversize - electrolizer_cf[i] * elecCapacity
    );
    const battery_Net_Charge = [0.0 * size];
    const Battery_SOC = [0.0 * size];
    const batt_losses = 1 - (1 - batteryEfficiency) / 2;
    const elec_min = elecMinLoad * elecCapacity;
    const elec_max = elecMaxLoad * elecCapacity;

    battery_Net_Charge[0] = Math.min(
      batteryPower,
      excess_generation[0] * batt_losses
    );
    Battery_SOC[0] = battery_Net_Charge[0] / batteryEnergy;
    // check for off by 1 error
    for (let hour = 1; hour < size; hour++) {
      const batt_soc = Battery_SOC[hour - 1];
      const spill = excess_generation[hour];
      const elec_cons = electrolizer_cf[hour] * elecCapacity;
      const batt_discharge_potential =
        Math.min(batteryPower, (batt_soc - battMin) * batteryEnergy) *
        batt_losses;
      const elec_just_operating =
        elec_cons > 0 ||
        battery_Net_Charge[hour - 1] < 0 ||
        electrolizer_cf[hour - 1] > 0;

      if (
        elec_cons == 0 &&
        spill + batt_discharge_potential > elec_min &&
        elec_just_operating
      ) {
        // When the generation is insufficient alone but combined with battery power can power the electrolyser
        if (spill + batt_discharge_potential > elec_max) {
          battery_Net_Charge[hour] =
            -1 * Math.min(batteryPower, ((elec_max - spill) * 1) / batt_losses);
        } else {
          battery_Net_Charge[hour] =
            (-1 * batt_discharge_potential * 1) / batt_losses;
        }
      } else if (
        spill > 0 &&
        batt_soc + (spill / batteryEnergy) * batt_losses > 1
      ) {
        // When spilled generation is enough to completely charge the battery
        battery_Net_Charge[hour] = Math.min(
          batteryPower,
          Math.max(batteryEnergy * (1.0 - batt_soc), 0.0)
        );
      } else if (spill > 0) {
        // Any other cases when there is spilled generation
        battery_Net_Charge[hour] = Math.min(batteryPower, spill * batt_losses);
      } else if (
        elec_cons + batt_discharge_potential < elec_min ||
        (spill == 0 && batt_soc <= battMin)
      ) {
        //  generation and battery together are insufficient to power the electrolyser or there is no
        //  spilled generation and the battery is empty
        battery_Net_Charge[hour] = 0;
      } else if (
        spill == 0 &&
        elec_max - elec_cons >
          (batt_soc - battMin) * batt_losses * batteryEnergy &&
        elec_just_operating
      ) {
        //  When the electrolyser is operating and the energy to get to max capacity is more than what is stored
        battery_Net_Charge[hour] =
          (-1 * batt_discharge_potential * 1) / batt_losses;
      } else if (spill == 0 && elec_just_operating) {
        //  When the stored power is enough to power the electrolyser at max capacity
        battery_Net_Charge[hour] =
          -1 *
          Math.min(batteryPower, ((elec_max - elec_cons) * 1) / batt_losses);
      } else if (spill == 0) {
        battery_Net_Charge[hour] = 0;
      } else {
        throw new Error("Error: battery configuration not accounted for");
      }
      //  Determine the battery state of charge based on the previous state of charge and the net change
      Battery_SOC[hour] =
        Battery_SOC[hour - 1] + battery_Net_Charge[hour] / batteryEnergy;
    }
    const Electrolyser_CF_batt = battery_Net_Charge.map(
      (e: number, i: number) => {
        if (battery_Net_Charge[i] < 0) {
          return (
            electrolizer_cf[i] +
            (-1 * battery_Net_Charge[i] * batt_losses + excess_generation[0]) /
              elecCapacity
          );
        } else {
          return electrolizer_cf[i];
        }
      }
    );

    //nani??
    //cf_profile_df.set_index(index_name, inplace=True)
    return Electrolyser_CF_batt;
  }
  // returns Generator_CF series
  async readDF(
    genCapacity: number,
    solarCapacity: number,
    windCapacity: number,
    location: string
  ) {
    let solarDf = await readCSV(
      "/Users/stanisshkel/work/hydrogen-tool/src/data/solar-traces.csv"
    );
    let windDf = await readCSV(
      "/Users/stanisshkel/work/hydrogen-tool/src/data/wind-traces.csv"
    );
    const solarRatio = solarCapacity / genCapacity;
    const windRatio = windCapacity / genCapacity;
    console.log(location);
    const solarDfValues = solarDf[location].values;
    const windDfValues = windDf[location].values;
    if (solarRatio == 1) {
      return solarDfValues;
    } else if (windRatio == 1) {
      return windDfValues;
    } else {
      return solarDfValues;

      // solarDfValues.map(
      //   (e: number, i: number) =>
      //     solarDfValues[i] * solarRatio + windDfValues[i] * windRatio
      // );
    }
  }

  as_df(thing: object) {
    const df = new DataFrame(thing);
    df.print();
  }

  save_as_df(thing: object) {
    const df = new DataFrame(thing);
    df.toJSON({ filePath: "./output/js.json" });
  }

  overloading_model(
    oversize: number,
    elecMaxLoad: number,
    elecOverloadRecharge: number,
    elecOverload: number,
    generator_cf: number[],
    electrolizer_cf: number[]
  ) {
    let cooldown_remain = 0;
    const overload = (e: number, index: number): number => {
      const Generator_CF = 0;
      const Electrolyser_CF = 1;
      // check if we can trigger an overload
      if (generator_cf[index] * oversize > elecMaxLoad) {
        // trigger an overload if not in cooldown
        // TODO check for fencepost error
        if (cooldown_remain == 0) {
          cooldown_remain = elecOverloadRecharge;
          // TODO this is using different cols in df generator_cf vs electrolyser_cf
          // fix it up
          const energyGenerated = generator_cf[index] * oversize;
          const energy_for_overloading = Math.min(
            elecOverload,
            energyGenerated
          );
          return energy_for_overloading;
        } else {
          // decrement cooldown period
          cooldown_remain--;
          return electrolizer_cf[index];
        }
      }
      return electrolizer_cf[index];
    };
    //Electrolyser_CF_overload
    // double check axis
    const electrolyser_CF_overload = generator_cf.map(overload);
    return electrolyser_CF_overload;
  }
}
// overload
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
  elecMaxLoad: 100,
  elecReferenceCapacity: 10,
  elecCostReduction: 1.0,
  elecEquip: 1.0,
  elecInstall: 0.0,
  elecLand: 0.0,
  // pem

  elecMinLoad: 10,
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

// battery
const example2 = {
  elecCapacity: 10,
  solarCapacity: 15,
  batteryPower: 10,
  battery_hours: 2,
  location: "REZ-N1",

  // defaults
  windCapacity: 0,
  batteryHours: 0,
  spotPrice: 0,
  ppaPrice: 0,

  // config
  elecMaxLoad: 100,
  elecReferenceCapacity: 10,
  elecCostReduction: 1.0,
  elecEquip: 1.0,
  elecInstall: 0.0,
  elecLand: 0.0,
  // AE
  elecMinLoad: 20,
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
// normal
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
  elecMaxLoad: 100,
  elecReferenceCapacity: 10,
  elecCostReduction: 1.0,
  elecEquip: 1.0,
  elecInstall: 0.0,
  elecLand: 0.0,
  // AE: {
  elecMinLoad: 20,
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
const defaultProps = example1;

async function model() {
  const model = new HydrogenModel(defaultProps);
  const out = await model.calculate_electrolyser_output();
}

model();
