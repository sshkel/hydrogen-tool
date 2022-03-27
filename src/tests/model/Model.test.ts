import { DataModel, HydrogenModel } from "../../model/Model";
// import fs from "fs";
import Papa from "papaparse";
// import workingdf1 from "./resources/example1-workingdf.json";
// import outputs1 from "./resources/example1-outputs.json";

describe("Hydrogen Model", () => {
  it("works for overload model", async () => {
    // overload -> working correctly :tick:
    const example1: DataModel = {
      //args or defaults
      elecCapacity: 10,
      solarCapacity: 10,
      windCapacity: 10,
      location: "North West NSW",

      // spot_price: 30,

      // defaults
      batteryPower: 0,
      batteryHours: 0,
      // spotPrice: 0,
      // ppaPrice: 0,

      // config
      electrolyserMaximumLoad: 100,
      // elecReferenceCapacity: 10,
      // elecCostReduction: 1.0,
      // elecEquip: 1.0,
      // elecInstall: 0.0,
      // elecLand: 0.0,
      // pem

      electrolyserMinimumLoad: 10,
      elecOverload: 120,
      elecOverloadRecharge: 4,
      specCons: 4.7,
      // stackLifetime: 60000,
      // electrolyserCapex: 1000,
      // electrolyserOandM: 4,
      // waterNeeds: 10,

      H2VoltoMass: 0.089,
      elecEff: 83,

      // stackDegradation: 0,
      // stackDegMax: 0,
      // solarDegradation: 0,
      // windDegradation: 0,

      batteryEfficiency: 85,
      battMin: 0.0,
      battLifetime: 10,
      /*
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
      */
    };
    // const generator_cf = Object.values(workingdf1["Generator_CF"]);
    // const solar = await readCSV("../resources/solar-traces.csv");
    console.log("helo");
    const model = new HydrogenModel(example1, [], []);

    const output = model.calculate_electrolyser_output();
  });
  it("works for battery model", () => {
    // battery -> working correctly :tick:
    const example2: DataModel = {
      elecCapacity: 10,
      solarCapacity: 15,
      batteryPower: 10,
      batteryHours: 2,
      location: "North West NSW",

      // defaults
      windCapacity: 0,
      // spotPrice: 0,
      // ppaPrice: 0,

      // config
      electrolyserMaximumLoad: 100,
      // elecReferenceCapacity: 10,
      // elecCostReduction: 1.0,
      // elecEquip: 1.0,
      // elecInstall: 0.0,
      // elecLand: 0.0,
      // AE
      electrolyserMinimumLoad: 20,
      elecOverload: 100,
      elecOverloadRecharge: 0,
      specCons: 4.5,
      // stackLifetime: 80000,
      // electrolyserCapex: 1000,
      // electrolyserOandM: 2.5,
      // waterNeeds: 10,

      H2VoltoMass: 0.089,
      elecEff: 83,

      // stackDegradation: 0,
      // stackDegMax: 0,
      // solarDegradation: 0,
      // windDegradation: 0,

      batteryEfficiency: 85,
      battMin: 0.0,
      battLifetime: 10,
      /*
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
      */
    };
  });
  it("works for normal model", () => {
    // normal -> working correctly :tick:
    const example3: DataModel = {
      elecCapacity: 10,
      solarCapacity: 0,
      windCapacity: 100,

      // defaults
      location: "North West NSW",
      batteryPower: 0,
      batteryHours: 0,
      // spotPrice: 0,
      // ppaPrice: 0,

      // config
      electrolyserMaximumLoad: 100,
      // elecReferenceCapacity: 10,
      // elecCostReduction: 1.0,
      // elecEquip: 1.0,
      // elecInstall: 0.0,
      // elecLand: 0.0,
      // AE: {
      electrolyserMinimumLoad: 20,
      elecOverload: 100,
      elecOverloadRecharge: 0,
      specCons: 4.5,
      // stackLifetime: 80000,
      // electrolyserCapex: 1000,
      // electrolyserOandM: 2.5,
      // waterNeeds: 10,

      H2VoltoMass: 0.089,
      elecEff: 83,

      // stackDegradation: 0,
      // stackDegMax: 0,
      // solarDegradation: 0,
      // windDegradation: 0,

      batteryEfficiency: 85,
      battMin: 0.0,
      battLifetime: 10,
      /*
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
      */
    };
  });
});

async function readCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve) => {
    const fileStream = fs.createReadStream(filePath);
    console.log("reading");
    Papa.parse(fileStream, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const df = results.data;
        console.log("resolving");
        resolve(df);
      },
    });
  });
}
