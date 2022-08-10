import {
  CsvRow,
  DataModel,
  HydrogenModel,
  ModelSummaryPerYear,
} from "../../model/Model";
import outputs1 from "../resources/example1-outputs.json";
import workingdf1 from "../resources/example1-workingdf.json";
import outputs2 from "../resources/example2-outputs.json";
import workingdf2 from "../resources/example2-workingdf.json";
import outputs3 from "../resources/example3-outputs.json";
import workingdf3 from "../resources/example3-workingdf.json";
import { readLocalCsv } from "../resources/loader";

const PROJECT_LIFE = 20;

describe("Hydrogen Model", () => {
  let solar: CsvRow[];
  let wind: CsvRow[];
  beforeAll(async () => {
    solar = await readLocalCsv(__dirname + "/../resources/solar-traces.csv");
    wind = await readLocalCsv(__dirname + "/../resources/wind-traces.csv");
  });

  it("works for overload model", () => {
    // overload -> working correctly :tick:
    const example1: DataModel = {
      //args or defaults
      electrolyserNominalCapacity: 10,
      solarNominalCapacity: 10,
      windNominalCapacity: 10,
      location: "North West NSW",

      // spot_price: 30,

      // defaults
      batteryRatedPower: 0,
      batteryStorageDuration: 0,
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
      maximumLoadWhenOverloading: 120,
      timeBetweenOverloading: 4,
      specCons: 4.7,
      stackLifetime: 60000,
      // electrolyserCapex: 1000,
      // electrolyserOandM: 4,
      // waterNeeds: 10,

      elecEff: 83,

      stackReplacementType: "Cumulative Hours",
      stackDegradation: 0,
      // stackDegMax: 0,
      solarDegradation: 0,
      windDegradation: 0,

      batteryEfficiency: 85,
      batteryMinCharge: 0.0,
      batteryLifetime: 10,
      // solarCapex: 1120,
      // solarOpex: 16990,
      // windCapex: 1942,
      // windOpex: 25000,
      // powerplantReferenceCapacity: 1,
      // powerplantCostReduction: 1.0,
      // powerplantEquip: 1.0,
      // powerplantInstall: 0.0,
      // powerplantLand: 0.0,
      // batteryCapex: { 0: 0, 1: 827, 2: 542, 4: 446, 8: 421 },
      // batteryOpex: { 0: 0, 1: 4833, 2: 9717, 4: 19239, 8: 39314 },
      // batteryReplacement: 100,
      // electrolyserStackCost: 40,
      // waterCost: 5,
      // discountRate: 4,
      // projectTimeline: 20,
      inputConfiguration: "Advanced",
      powerPlantOversizeRatio: 1,
      solarToWindPercentage: 50,
    };
    const model = new HydrogenModel(example1, solar, wind);
    compareToModel(model, outputs1, workingdf1);
  });
  it("works for battery model", () => {
    // battery -> working correctly :tick:
    const example2: DataModel = {
      electrolyserNominalCapacity: 10,
      solarNominalCapacity: 15,
      batteryRatedPower: 10,
      batteryStorageDuration: 2,
      location: "North West NSW",

      // defaults
      windNominalCapacity: 0,
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
      maximumLoadWhenOverloading: 100,
      timeBetweenOverloading: 0,
      specCons: 4.5,
      stackLifetime: 80000,
      // electrolyserCapex: 1000,
      // electrolyserOandM: 2.5,
      // waterNeeds: 10,

      elecEff: 83,

      stackReplacementType: "Cumulative Hours",
      stackDegradation: 0,
      // stackDegMax: 0,
      solarDegradation: 0,
      windDegradation: 0,

      batteryEfficiency: 85,
      batteryMinCharge: 0.0,
      batteryLifetime: 10,
      // solarCapex: 1120,
      // solarOpex: 16990,
      // windCapex: 1942,
      // windOpex: 25000,
      // powerplantReferenceCapacity: 1,
      // powerplantCostReduction: 1.0,
      // powerplantEquip: 1.0,
      // powerplantInstall: 0.0,
      // powerplantLand: 0.0,
      // batteryCapex: { 0: 0, 1: 827, 2: 542, 4: 446, 8: 421 },
      // batteryOpex: { 0: 0, 1: 4833, 2: 9717, 4: 19239, 8: 39314 },
      // batteryReplacement: 100,
      // electrolyserStackCost: 40,
      // waterCost: 5,
      // discountRate: 4,
      // projectTimeline: 20,
      inputConfiguration: "Advanced",
      powerPlantOversizeRatio: 1,
      solarToWindPercentage: 50,
    };
    const model = new HydrogenModel(example2, solar, wind);

    compareToModel(model, outputs2, workingdf2);
  });
  it("works for normal model", () => {
    // normal -> working correctly :tick:
    const example3: DataModel = {
      electrolyserNominalCapacity: 10,
      solarNominalCapacity: 0,
      windNominalCapacity: 100,

      // defaults
      location: "North West NSW",
      batteryRatedPower: 0,
      batteryStorageDuration: 0,
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
      maximumLoadWhenOverloading: 100,
      timeBetweenOverloading: 0,
      specCons: 4.5,
      stackLifetime: 80000,
      // electrolyserCapex: 1000,
      // electrolyserOandM: 2.5,
      // waterNeeds: 10,

      elecEff: 83,

      stackReplacementType: "Cumulative Hours",
      stackDegradation: 0,
      // stackDegMax: 0,
      solarDegradation: 0,
      windDegradation: 0,

      batteryEfficiency: 85,
      batteryMinCharge: 0.0,
      batteryLifetime: 10,
      inputConfiguration: "Advanced",
      powerPlantOversizeRatio: 1,
      solarToWindPercentage: 50,
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
      */
      // projectTimeline: 20,
    };
    const model = new HydrogenModel(example3, solar, wind);
    compareToModel(model, outputs3, workingdf3);
  });
});
function compareToModel(
  model: HydrogenModel,
  outputs: ModelSummaryPerYear,
  workingdf: { [key: string]: { [key: string]: number } }
) {
  const project_output = model.calculateHydrogenModel(PROJECT_LIFE);

  const hourly_outputs = model.getHourlyOperations();

  Object.keys(hourly_outputs).forEach((key: string) => {
    Object.values(workingdf[key]).forEach((x: number, i: number) =>
      expect(hourly_outputs[key][i]).toBeCloseTo(x, 9)
    );
  });

  Object.keys(project_output).forEach((key: string) => {
    // Check first year results only since no degradation
    expect(project_output[key][0]).toBeCloseTo(outputs[key], 8);
  });
}
