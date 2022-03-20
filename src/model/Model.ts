import { DataFrame, readCSV, Series } from "danfojs-node";
interface DataModel {
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

  constructor(data: DataModel) {
    this.genCapacity = data.solarCapacity + data.windCapacity;
    this.elecMaxLoad = data.elecMaxLoad / 100;
    this.elecMinLoad = data.elecMinLoad / 100;
    this.elecEff = data.elecEff / 100;
    this.H2VoltoMass = data.H2VoltoMass;
    this.hydOutput = this.H2VoltoMass * this.MWtokW * this.elecEff; // kg.kWh/m3.MWh
    this.specCons = data.specCons;
    this.elecOverload = data.elecOverload/100,
    this.elecOverloadRecharge = data.elecOverloadRecharge;
    this.batteryHours = data.batteryHours
    this.batteryEnergy = data.batteryPower * this.batteryHours
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
      this.batteryHours
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
  ) {
    const oversize = genCapacity / elecCapacity;
    var working_df = await this.readDF(
      genCapacity,
      solarCapacity,
      windCapacity,
      location
    );

    // normal electrolyser calculation
    const calculate_electroliser = (x: number) => {
      if (x * oversize > elecMaxLoad) {
        return elecMaxLoad;
      }

      if (x * oversize < elecMinLoad) {
        return 0;
      }
      return x * oversize;
    };
    working_df.column("Generator_CF").apply(calculate_electroliser)
    working_df.addColumn("Electrolyser_CF", working_df.column("Generator_CF").apply(
      calculate_electroliser
    ), {inplace:true})  
    
    // overload calculation
    if (elecOverload > elecMaxLoad && elecOverloadRecharge > 0) {
      const electrolyzer_cf = this.overloading_model(
        working_df,
        oversize,
        elecMaxLoad,
        elecOverloadRecharge,
        elecOverload
      );
      const temp = working_df.drop({ columns:["Electrolyser_CF"]} );
      working_df = temp.addColumn("Electrolyser_CF", electrolyzer_cf)
    }
    // battery model calc
    
    
    if (batteryEnergy > 0){
      const hours = [1, 2, 4, 8]
      if (!hours.includes(batteryHours)){
                throw new Error("Battery storage length not valid. Please enter one of 1, 2, 4 or 8");
      }

      working_df['Electrolyser_CF'] = this.battery_model(oversize, working_df,elecCapacity)
    }
    // actual hydrogen calc
    const Hydrogen_prod_fixed = working_df["Electrolyser_CF"].mul(hydOutput).div(specCons)
    working_df.addColumn("Hydrogen_prod_fixed",Hydrogen_prod_fixed,{inplace:true})
    

    const electrolyser_output_polynomial = (x: number) => {
      // """Calculates the specific energy consumption as a function of the electrolyser operating
      //     capacity factor
      //     """
      return 1.25 * x ** 2 - 0.4286 * x + specCons - 0.85;
    };

    working_df.addColumn("Hydrogen_prod_variable",working_df["Electrolyser_CF"].apply(
      (x: number) => (x * hydOutput) / electrolyser_output_polynomial(x)
    ),{inplace:true})


    return working_df;
  }
  battery_model(oversize: number, cf_profile_df: DataFrame, elecCapacity:number): Series {
   cf_profile_df = cf_profile_df.resetIndex()
   const index_name = cf_profile_df.columns[0]
   const excess_generation = cf_profile_df["Generator_CF"].mul(oversize).sub(cf_profile_df['Electrolyser_CF'].mul(elecCapacity))
   cf_profile_df = cf_profile_df.addColumn("Excess_Generation", excess_generation)
   console.log( cf_profile_df.size)
   cf_profile_df["Battery_Net_Charge"] = 0.0
   cf_profile_df.print()
   return new Series()
  }
// returns Generator_CF series
  async readDF(
    genCapacity: number,
    solarCapacity: number,
    windCapacity: number,
    location: string
  ) {
    let solarDf = await readCSV(
      "/Users/stanisshkel/work/hydrogen-tool/src/data/solar-traces.csv",
    );
    let windDf = await readCSV(
      "/Users/stanisshkel/work/hydrogen-tool/src/data/wind-traces.csv"
    );
    const solarRatio = solarCapacity / genCapacity;
    const windRatio = windCapacity / genCapacity;
  
    if (solarRatio == 1) {
      return new DataFrame({"Generator_CF":solarDf[location].values});
    } else if (windRatio == 1) {
      return new DataFrame({"Generator_CF":windDf[location].values});
    } else {
      const solarProportion = solarDf[location].mul(solarRatio);
      const windProportion = windDf[location].mul(windRatio)
      return new DataFrame({"Generator_CF":solarProportion.add(windProportion).values})
    }
  }

    overloading_model(
      cf_profile_df: DataFrame,
      oversize: number,
      elecMaxLoad: number,
      elecOverloadRecharge: number,
      elecOverload: number
    ){
      let cooldown_remain = 0;
      const overload = (row:number[]):number => {
        const Generator_CF = 0;
        const Electrolyser_CF =1;
        // check if we can trigger an overload
        if (row[Generator_CF] * oversize > elecMaxLoad) {
          // trigger an overload if not in cooldown
          // TODO check for fencepost error
          if (cooldown_remain == 0) {
            cooldown_remain = elecOverloadRecharge;
            // TODO this is using different cols in df generator_cf vs electrolyser_cf
            // fix it up
            const energyGenerated = row[Generator_CF] * oversize;
            const energy_for_overloading = Math.min(elecOverload, energyGenerated);
            return energy_for_overloading;
          } else {
            // decrement cooldown period
            cooldown_remain--;
            return row[Electrolyser_CF];
          }
        }
        return row[Electrolyser_CF];
      };
      //Electrolyser_CF_overload
      // double check axis
      const electrolyser_CF_overload =  cf_profile_df.apply(overload,{axis:1}).values;
      return new Series(electrolyser_CF_overload);
    }
}

const defaultProps = {
  elecCapacity: 10,
  solarCapacity: 10,
  windCapacity: 10,
  location: "REZ-N1",
  elecMaxLoad: 100,
  elecMinLoad: 10,
  specCons: 4.5,
  elecEff: 83,
  H2VoltoMass: 0.089,
  elecOverload:120,
  elecOverloadRecharge: 4,
  batteryHours: 2, 
  batteryPower:10
};

async function model() {
  const model = new HydrogenModel(defaultProps);
  const out = await model.calculate_electrolyser_output();
  out.print();
}

model();
