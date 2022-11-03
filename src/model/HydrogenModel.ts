import {
  backCalculateElectrolyserCapacity, backCalculateInputFields,
  backCalculatePowerPlantCapacity,
} from "../components/charts/basic-calculations";
import { maxDegradationStackReplacementYears } from "../components/charts/opex-calculations";
import {
  InputConfiguration,
  PowerCapacityConfiguration, PowerPlantConfiguration,
  PowerPlantType, PowerSupplyOption,
  StackReplacementType,
} from "../types";
import { mean } from "../utils";
import {
  CsvRow,
  ModelHourlyOperation,
  ModelSummaryPerYear,
  ProjectModelSummary,
} from "./ModelTypes";
import {
  calculateBatteryModel,
  calculateElectrolyserCf,
  calculateFixedHydrogenProduction,
  calculateGeneratorCf,
  calculateOverloadingModel,
  getTabulatedOutput,
} from "./ModelUtils";
import {
  BATTERY_OUTPUT,
  ELECTROLYSER_CF,
  ENERGY_INPUT,
  ENERGY_OUTPUT, HOURS_PER_YEAR, HYDROGEN_OUTPUT, POWER_PLANT_CF, RATED_CAPACITY_TIME,
  SUMMARY_KEYS,
  TOTAL_OPERATING_TIME
} from "./consts";

import {getCapex} from "../components/charts/capex-calculations";

export type HydrogenData = {
  gridConnectionCost: number;
  batteryCosts: number;
  windCostReductionWithScale: number;
  windReferenceFoldIncrease: number;
  windFarmBuildCost: number;
  windReferenceCapacity: number;
  solarReferenceFoldIncrease: number;
  solarPVCostReductionWithScale: number;
  solarFarmBuildCost: number;
  solarReferenceCapacity: number;
  electrolyserReferenceFoldIncrease: number;
  electrolyserCostReductionWithScale: number;
  electrolyserPurchaseCost: number;
  electrolyserReferenceCapacity: number;
  powerSupplyOption: PowerSupplyOption;
  powerPlantConfiguration: PowerPlantConfiguration;
  projectTimeline: number;
  powerPlantType: PowerPlantType;
  powerCapacityConfiguration: PowerCapacityConfiguration;
  inputConfiguration: InputConfiguration;
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
  powerPlantOversizeRatio: number;
  solarToWindPercentage: number;
  projectScale: number;
  location: string;
  electrolyserMaximumLoad: number;
  electrolyserMinimumLoad: number;
  secAtNominalLoad: number;
  electrolyserEfficiency: number;
  // degradation parameters
  stackReplacementType: StackReplacementType;
  stackLifetime?: number;
  maximumDegradationBeforeReplacement?: number;
  solarDegradation: number;
  windDegradation: number;
  stackDegradation: number;
};

export class HydrogenModel {
  // consts
  readonly MWtokW = 1000; // kW/MW
  readonly kgtoTonne = 1 / 1000;
  readonly H2VoltoMass = 0.089; // kg/m3
  readonly secAtNominalLoad = 33.33; // kWh/kg

  // calculated params
  totalNominalPowerPlantCapacity: number;
  electrolyserNominalCapacity: number;
  elecMaxLoad: number;
  elecMinLoad: number;
  elecEff: number;
  hydOutput: number;
  parameters: HydrogenData;
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
  // calculated based on number of CSV rows
  hoursPerYear: number;
  specCons: number;

  // parameters to expose to working data
  hourlyOperationsInYearOne: ModelHourlyOperation;
  solarNominalCapacity: number;
  windNominalCapacity: number;
  powerPlantOversizeRatio: any;
  powerPlantType: PowerPlantType;

  constructor(
    parameters: HydrogenData,
    solarData: CsvRow[],
    windData: CsvRow[]
  ) {
    this.parameters = parameters;
    this.powerPlantType = parameters.powerPlantType;

    // Loaded data
    this.solarData = solarData;
    this.windData = windData;
    this.hoursPerYear = solarData.length;

    // Stack replacement logic for degradation
    this.stackReplacementYears = [];
    this.stackLifetime =
      parameters.stackReplacementType === "Cumulative Hours"
        ? parameters.stackLifetime
        : undefined;
    this.currentStackOperatingHours = 0;
    this.lastStackReplacementYear = 0;
    this.hourlyOperationsInYearOne = {};

    this.solarNominalCapacity = parameters.solarNominalCapacity;
    this.windNominalCapacity = parameters.windNominalCapacity;
    this.electrolyserNominalCapacity = parameters.electrolyserNominalCapacity;

    this.powerPlantOversizeRatio =
      parameters.powerCapacityConfiguration === "Oversize Ratio"
        ? parameters.powerPlantOversizeRatio
        : (this.solarNominalCapacity + this.windNominalCapacity) /
          this.electrolyserNominalCapacity;

    // calculated values
    if (
      parameters.inputConfiguration === "Advanced" &&
      parameters.powerCapacityConfiguration === "Oversize Ratio"
    ) {
      const powerPlantNominalCapacity = backCalculatePowerPlantCapacity(
        this.powerPlantOversizeRatio,
        this.parameters.electrolyserNominalCapacity
      );

      if (this.parameters.powerPlantType === "Solar") {
        this.solarNominalCapacity = powerPlantNominalCapacity;
        this.windNominalCapacity = 0;
      }

      if (this.parameters.powerPlantType === "Wind") {
        this.solarNominalCapacity = 0;
        this.windNominalCapacity = powerPlantNominalCapacity;
      }

      if (this.parameters.powerPlantType === "Hybrid") {
        this.solarNominalCapacity =
          powerPlantNominalCapacity *
          (this.parameters.solarToWindPercentage / 100);
        this.windNominalCapacity =
          powerPlantNominalCapacity *
          (1 - this.parameters.solarToWindPercentage / 100);
      }
    }

    this.totalNominalPowerPlantCapacity =
      this.solarNominalCapacity + this.windNominalCapacity;

    this.elecMaxLoad = parameters.electrolyserMaximumLoad / 100;
    this.elecMinLoad = parameters.electrolyserMinimumLoad / 100;
    this.elecEff = parameters.electrolyserEfficiency / 100;
    this.hydOutput = this.H2VoltoMass * this.MWtokW * this.elecEff; // kg.kWh/m3.MWh
    this.elecOverload = parameters.maximumLoadWhenOverloading / 100;
    this.batteryEnergy =
        parameters.batteryRatedPower * this.parameters.batteryStorageDuration;
    this.batteryEfficiency = parameters.batteryEfficiency / 100;
    this.battMin = parameters.batteryMinCharge / 100;
    this.specCons = this.parameters.secAtNominalLoad * this.H2VoltoMass;
  }


  produceResults() {

    let summary: ProjectModelSummary =
        this.calculateHydrogenModel(this.parameters.projectTimeline);

    // OPEX values
    const electricityProduced: number[] = summary[`${ENERGY_OUTPUT}`];
    const electricityConsumed: number[] = summary[`${ENERGY_INPUT}`];
    const electricityConsumedByBattery: number[] = summary[`${BATTERY_OUTPUT}`];
    const totalOperatingHours: number[] = summary[`${TOTAL_OPERATING_TIME}`].map(
        (hours) => hours * HOURS_PER_YEAR
    );

    const h2Produced = summary[`${HYDROGEN_OUTPUT}`];

    let hourlyOperations = this.getHourlyOperations();

    const durationCurves = {
      "Power Plant Duration Curve": hourlyOperations.Generator_CF,
      "Electrolyser Duration Curve": hourlyOperations.Electrolyser_CF,
    };
    const hourlyCapFactors = {
      Electrolyser: hourlyOperations.Electrolyser_CF,
      "Power Plant": hourlyOperations.Generator_CF,
    };



    const {
      electrolyserCAPEX,
      solarCAPEX,
      windCAPEX,
      batteryCAPEX,
      powerPlantCAPEX,
      gridConnectionCAPEX,
    } = getCapex(
        this.parameters.powerPlantConfiguration,
        this.parameters.powerSupplyOption,
        this.electrolyserNominalCapacity,
        this.parameters.electrolyserReferenceCapacity,
        this.parameters.electrolyserPurchaseCost,
        this.parameters.electrolyserCostReductionWithScale,
        this.parameters.electrolyserReferenceFoldIncrease,
        this.parameters.powerPlantType,
        this.solarNominalCapacity,
        this.parameters.solarReferenceCapacity,
        this.parameters.solarFarmBuildCost,
        this.parameters.solarPVCostReductionWithScale,
        this.parameters.solarReferenceFoldIncrease,
        this.windNominalCapacity,
        this.parameters.windReferenceCapacity,
        this.parameters.windFarmBuildCost,
        this.parameters.windCostReductionWithScale,
        this.parameters.windReferenceFoldIncrease,
        this.parameters.batteryRatedPower,
        this.parameters.batteryStorageDuration,
        this.parameters.batteryCosts,
        this.parameters.gridConnectionCost
    );


    return {
      durationCurves: durationCurves,
      hourlyCapFactors: hourlyCapFactors,
    }
  }

  calculateHydrogenModel(projectTimeline: number): ProjectModelSummary {
    const {
      stackDegradation,
      solarDegradation,
      windDegradation,
      inputConfiguration,
    } = this.parameters;

    if (inputConfiguration === "Basic") {
      const projectSummary = this.calculateBasicHydrogenModel(projectTimeline);
      const {
        electrolyserEfficiency = 1,
        powerPlantOversizeRatio = 1,
        solarToWindPercentage = 100,
        powerPlantType: currentPowerPlantType,
      } = this.parameters;
      const result = backCalculateInputFields(
          electrolyserEfficiency,
          powerPlantOversizeRatio,
          solarToWindPercentage,
          currentPowerPlantType,
          this.parameters.projectScale,
          mean(projectSummary[ELECTROLYSER_CF]),
          this.hoursPerYear
      );

      this.powerPlantType = result.powerPlantType;
      this.windNominalCapacity = result.windNominalCapacity;
      this.solarNominalCapacity = result.solarNominalCapacity;
      this.electrolyserNominalCapacity = result.electrolyserNominalCapacity;
      return projectSummary;

    }

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
    const hourlyOperation =
      this.calculateAdvancedElectrolyserHourlyOperation(year);
    this.hourlyOperationsInYearOne = hourlyOperation;
    const operatingOutputs = getTabulatedOutput(
      hourlyOperation.Generator_CF,
      hourlyOperation.Electrolyser_CF,
      hourlyOperation.Hydrogen_prod_fixed,
      hourlyOperation.Net_Battery_Flow,
      this.electrolyserNominalCapacity,
      this.totalNominalPowerPlantCapacity,
      this.kgtoTonne,
      this.hoursPerYear,
      this.elecMaxLoad,
      this.batteryEfficiency
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
    const hourlyOperation =
      this.calculateAdvancedElectrolyserHourlyOperation(year);
    this.hourlyOperationsInYearOne = hourlyOperation;
    const operatingOutputs = this.calculateElectrolyserOutput(hourlyOperation);

    let modelSummaryPerYear: ModelSummaryPerYear[] = [];
    modelSummaryPerYear.push(operatingOutputs);

    for (year = 2; year <= projectTimeline; year++) {
      const hourlyOperationsByYear =
        this.calculateAdvancedElectrolyserHourlyOperation(year);
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

  private calculateBasicHydrogenModel(
    projectTimeline: number
  ): ProjectModelSummary {
    const hourlyOperation = this.calculateHourlyOperation(
      this.powerPlantOversizeRatio,
      this.electrolyserNominalCapacity,
      this.parameters.solarToWindPercentage / 100,
      1 - this.parameters.solarToWindPercentage / 100,
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
      1
    );

    this.hourlyOperationsInYearOne = hourlyOperation;

    this.electrolyserNominalCapacity = backCalculateElectrolyserCapacity(
      this.parameters.projectScale,
      this.elecEff,
      mean(hourlyOperation.Electrolyser_CF),
      this.hoursPerYear
    );
    this.totalNominalPowerPlantCapacity = backCalculatePowerPlantCapacity(
      this.powerPlantOversizeRatio,
      this.electrolyserNominalCapacity
    );

    const operatingOutputs = getTabulatedOutput(
      hourlyOperation.Generator_CF,
      hourlyOperation.Electrolyser_CF,
      hourlyOperation.Hydrogen_prod_fixed,
      hourlyOperation.Net_Battery_Flow,
      this.electrolyserNominalCapacity,
      this.totalNominalPowerPlantCapacity,
      this.kgtoTonne,
      this.hoursPerYear,
      this.elecMaxLoad,
      this.batteryEfficiency
    );

    let projectSummary: ProjectModelSummary = {};
    SUMMARY_KEYS.forEach((key) => {
      projectSummary[key] = Array(projectTimeline).fill(operatingOutputs[key]);
    });

    return projectSummary;
  }

  // wrapper around calculate_hourly_operation with passing of all the args.
  // being lazy here
  private calculateAdvancedElectrolyserHourlyOperation(
    year: number
  ): ModelHourlyOperation {
    return this.calculateHourlyOperation(
      this.totalNominalPowerPlantCapacity / this.electrolyserNominalCapacity,
      this.electrolyserNominalCapacity,
      this.solarNominalCapacity / this.totalNominalPowerPlantCapacity,
      this.windNominalCapacity / this.totalNominalPowerPlantCapacity,
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
    const operatingOutputs = getTabulatedOutput(
      hourlyOperation.Generator_CF,
      hourlyOperation.Electrolyser_CF,
      hourlyOperation.Hydrogen_prod_fixed,
      hourlyOperation.Net_Battery_Flow,
      this.electrolyserNominalCapacity,
      this.totalNominalPowerPlantCapacity,
      this.kgtoTonne,
      this.hoursPerYear,
      this.elecMaxLoad,
      this.batteryEfficiency
    );

    return operatingOutputs;
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

    let batteryNetCharge: number[] = new Array(this.hoursPerYear).fill(0);

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

    // Stack degradation calculation
    const yearlyDegradationRate = this.calculateStackDegradation(
      stackDegradation,
      electrolyserCf,
      year,
      this.stackLifetime
    );

    const hydrogenProdFixed = calculateFixedHydrogenProduction(
      electrolyserCf,
      hydOutput,
      yearlyDegradationRate,
      specCons
    );

    const workingDf = {
      Generator_CF: generatorCf,
      Electrolyser_CF: electrolyserCf,
      Hydrogen_prod_fixed: hydrogenProdFixed,
      Net_Battery_Flow: batteryNetCharge,
    };

    return workingDf;
  }
  // TODO refactor Tara's dirty state setting
  private calculateStackDegradation(
    stackDegradation: number,
    electrolyserCf: number[],
    year: number,
    stackLifetime: number | undefined
  ): number {
    if (stackDegradation > 0) {
      // Cumulative hour degradation logic if defined
      if (stackLifetime) {
        this.currentStackOperatingHours += electrolyserCf.filter(
          (e) => e > 0
        ).length;
        if (this.currentStackOperatingHours >= stackLifetime) {
          this.currentStackOperatingHours -= stackLifetime;
          this.stackReplacementYears.push(year);
        }
      }
      const power = year - 1 - this.lastStackReplacementYear;

      if (this.stackReplacementYears.includes(year)) {
        this.lastStackReplacementYear = year;
      }
      return 1 - 1 / (1 + stackDegradation / 100) ** power;
    }
    return 0;
  }

  private initialiseStackReplacementYears(
    parameters: HydrogenData,
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
