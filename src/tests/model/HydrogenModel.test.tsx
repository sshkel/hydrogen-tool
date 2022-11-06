import {HydrogenData, HydrogenModel} from "../../model/HydrogenModel";
import {CsvRow, ModelSummaryPerYear, ProjectModelSummary} from "../../model/ModelTypes";
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
    const example1: HydrogenData = {
      //args or defaults
      electrolyserNominalCapacity: 10,
      solarNominalCapacity: 10,
      windNominalCapacity: 10,
      location: "North West NSW",
      powerPlantType: "Hybrid",
      powerCapacityConfiguration: "Nominal Capacity",
      batteryRatedPower: 0,
      batteryStorageDuration: 0,
      electrolyserMaximumLoad: 100,
      electrolyserMinimumLoad: 10,
      maximumLoadWhenOverloading: 120,
      timeBetweenOverloading: 4,
      secAtNominalLoad: 4.7,
      stackLifetime: 60000,

      electrolyserEfficiency: 83,

      stackReplacementType: "Cumulative Hours",
      stackDegradation: 0,
      solarDegradation: 0,
      windDegradation: 0,
      batteryEfficiency: 85,
      batteryMinCharge: 0.0,
      batteryLifetime: 10,
      inputConfiguration: "Advanced",
      powerPlantOversizeRatio: 1,
      solarToWindPercentage: 50,
      projectScale: 10000,
      // Dummy params
      additionalAnnualCosts: 0,
      additionalTransmissionCharges: 0,
      additionalUpfrontCosts: 0,
      batteryCosts: 0,
      batteryEpcCosts: 0,
      batteryLandProcurementCosts: 0,
      batteryOMCost: 0,
      batteryReplacementCost: 0,
      discountRate: 0,
      electrolyserCostReductionWithScale: 0,
      electrolyserEpcCosts: 0,
      electrolyserLandProcurementCosts: 0,
      electrolyserOMCost: 0,
      electrolyserPurchaseCost: 0,
      electrolyserReferenceCapacity: 0,
      electrolyserReferenceFoldIncrease: 0,
      electrolyserStackReplacement: 0,
      gridConnectionCost: 0,
      inflationRate: 0,
      maximumDegradationBeforeReplacement: 0,
      powerPlantConfiguration: "Standalone",
      powerSupplyOption: "Self Build",
      principalPPACost: 0,
      projectTimeline: 0,
      solarEpcCosts: 0,
      solarFarmBuildCost: 0,
      solarLandProcurementCosts: 0,
      solarOpex: 0,
      solarPVCostReductionWithScale: 0,
      solarReferenceCapacity: 0,
      solarReferenceFoldIncrease: 0,
      waterRequirementOfElectrolyser: 0,
      waterSupplyCost: 0,
      windCostReductionWithScale: 0,
      windEpcCosts: 0,
      windFarmBuildCost: 0,
      windLandProcurementCosts: 0,
      windOpex: 0,
      windReferenceCapacity: 0,
      windReferenceFoldIncrease: 0
    };
    const model = new HydrogenModel(example1, solar, wind);
    compareToModel(model, outputs1, workingdf1);
  });
  it("works for battery model", () => {
    // battery -> working correctly :tick:
    const example2: HydrogenData = {
      electrolyserNominalCapacity: 10,
      solarNominalCapacity: 15,
      batteryRatedPower: 10,
      batteryStorageDuration: 2,
      location: "North West NSW",
      windNominalCapacity: 0,
      powerPlantType: "Solar",
      powerCapacityConfiguration: "Nominal Capacity",
      electrolyserMaximumLoad: 100,
      electrolyserMinimumLoad: 20,
      maximumLoadWhenOverloading: 100,
      timeBetweenOverloading: 0,
      secAtNominalLoad: 4.5,
      stackLifetime: 80000,
      electrolyserEfficiency: 83,
      stackReplacementType: "Cumulative Hours",
      stackDegradation: 0,
      solarDegradation: 0,
      windDegradation: 0,
      batteryEfficiency: 85,
      batteryMinCharge: 0.0,
      batteryLifetime: 10,
      inputConfiguration: "Advanced",
      powerPlantOversizeRatio: 1,
      solarToWindPercentage: 50,
      projectScale: 10000,
      //dummy params
      // Dummy params
      additionalAnnualCosts: 0,
      additionalTransmissionCharges: 0,
      additionalUpfrontCosts: 0,
      batteryCosts: 0,
      batteryEpcCosts: 0,
      batteryLandProcurementCosts: 0,
      batteryOMCost: 0,
      batteryReplacementCost: 0,
      discountRate: 0,
      electrolyserCostReductionWithScale: 0,
      electrolyserEpcCosts: 0,
      electrolyserLandProcurementCosts: 0,
      electrolyserOMCost: 0,
      electrolyserPurchaseCost: 0,
      electrolyserReferenceCapacity: 0,
      electrolyserReferenceFoldIncrease: 0,
      electrolyserStackReplacement: 0,
      gridConnectionCost: 0,
      inflationRate: 0,
      maximumDegradationBeforeReplacement: 0,
      powerPlantConfiguration: "Standalone",
      powerSupplyOption: "Self Build",
      principalPPACost: 0,
      projectTimeline: 0,
      solarEpcCosts: 0,
      solarFarmBuildCost: 0,
      solarLandProcurementCosts: 0,
      solarOpex: 0,
      solarPVCostReductionWithScale: 0,
      solarReferenceCapacity: 0,
      solarReferenceFoldIncrease: 0,
      waterRequirementOfElectrolyser: 0,
      waterSupplyCost: 0,
      windCostReductionWithScale: 0,
      windEpcCosts: 0,
      windFarmBuildCost: 0,
      windLandProcurementCosts: 0,
      windOpex: 0,
      windReferenceCapacity: 0,
      windReferenceFoldIncrease: 0
    };
    const model = new HydrogenModel(example2, solar, wind);

    compareToModel(model, outputs2, workingdf2);
  });
  it("works for normal model", () => {
    // normal -> working correctly :tick:
    const example3: HydrogenData = {
      electrolyserNominalCapacity: 10,
      solarNominalCapacity: 0,
      windNominalCapacity: 100,
      powerPlantType: "Wind",
      powerCapacityConfiguration: "Nominal Capacity",
      location: "North West NSW",
      batteryRatedPower: 0,
      batteryStorageDuration: 0,
      electrolyserMaximumLoad: 100,
      electrolyserMinimumLoad: 20,
      maximumLoadWhenOverloading: 100,
      timeBetweenOverloading: 0,
      secAtNominalLoad: 4.5,
      stackLifetime: 80000,
      electrolyserEfficiency: 83,
      stackReplacementType: "Cumulative Hours",
      stackDegradation: 0,
      solarDegradation: 0,
      windDegradation: 0,
      batteryEfficiency: 85,
      batteryMinCharge: 0.0,
      batteryLifetime: 10,
      inputConfiguration: "Advanced",
      powerPlantOversizeRatio: 1,
      solarToWindPercentage: 50,
      projectScale: 10000,
      //dummy params
      // Dummy params
      additionalAnnualCosts: 0,
      additionalTransmissionCharges: 0,
      additionalUpfrontCosts: 0,
      batteryCosts: 0,
      batteryEpcCosts: 0,
      batteryLandProcurementCosts: 0,
      batteryOMCost: 0,
      batteryReplacementCost: 0,
      discountRate: 0,
      electrolyserCostReductionWithScale: 0,
      electrolyserEpcCosts: 0,
      electrolyserLandProcurementCosts: 0,
      electrolyserOMCost: 0,
      electrolyserPurchaseCost: 0,
      electrolyserReferenceCapacity: 0,
      electrolyserReferenceFoldIncrease: 0,
      electrolyserStackReplacement: 0,
      gridConnectionCost: 0,
      inflationRate: 0,
      maximumDegradationBeforeReplacement: 0,
      powerPlantConfiguration: "Standalone",
      powerSupplyOption: "Self Build",
      principalPPACost: 0,
      projectTimeline: 0,
      solarEpcCosts: 0,
      solarFarmBuildCost: 0,
      solarLandProcurementCosts: 0,
      solarOpex: 0,
      solarPVCostReductionWithScale: 0,
      solarReferenceCapacity: 0,
      solarReferenceFoldIncrease: 0,
      waterRequirementOfElectrolyser: 0,
      waterSupplyCost: 0,
      windCostReductionWithScale: 0,
      windEpcCosts: 0,
      windFarmBuildCost: 0,
      windLandProcurementCosts: 0,
      windOpex: 0,
      windReferenceCapacity: 0,
      windReferenceFoldIncrease: 0
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

  const hourlyTranslation: { [key: string]: string } = {
    powerplantCapacityFactors: "Generator_CF",
    electrolyserCapacityFactors: "Electrolyser_CF",
    hydrogenProduction: "Hydrogen_prod_fixed",
    netBatteryFLow: "Net_Battery_Flow",
  }

  Object.keys(hourly_outputs).forEach((key: string) => {
    if (Object.keys(hourlyTranslation).includes(key)) {
      Object.values(workingdf[hourlyTranslation[key]]).forEach((x: number, i: number) =>

          expect(hourly_outputs[key][i]).toBeCloseTo(x, 9)
      );
    }
  });

  const summaryTranslations = {
    electricityConsumed: "Energy in to Electrolyser [MWh/yr]",
    electricityProduced: "Surplus Energy [MWh/yr]",
    electricityConsumedByBattery: "Total Battery Output [MWh/yr]",
    totalOperatingTime: "Total Time Electrolyser is Operating",
    hydrogenProduction: "Hydrogen Output [t/yr]",
    powerPlantCapacityFactors: "Generator Capacity Factor",
    ratedCapacityTime: "Time Electrolyser is at its Rated Capacity",
    electrolyserCapacityFactors: "Achieved Electrolyser Capacity Factor"
  }

  Object.keys(project_output).forEach((key: string) => {
        if (Object.keys(summaryTranslations).includes(key)) {
          // Check first year results only since no degradation
          expect(project_output[key as keyof ProjectModelSummary][0]).toBeCloseTo(outputs[summaryTranslations[key as keyof ProjectModelSummary]], 8);
        }
      }
  );
}
