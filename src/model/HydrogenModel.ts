import {
  backCalculateElectrolyserCapacity,
  backCalculatePowerPlantCapacity,
} from "../components/charts/basic-calculations";
import { maxDegradationStackReplacementYears } from "../components/charts/opex-calculations";
import { InputConfiguration, StackReplacementType } from "../types";
import { mean, sum } from "../utils";
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
  calculateVariableHydrogenProduction,
} from "./ModelUtils";
import {
  BATTERY_OUTPUT,
  ELECTROLYSER_CF,
  ENERGY_INPUT,
  ENERGY_OUTPUT,
  HOURS_PER_YEAR,
  HYDROGEN_OUTPUT_FIXED,
  HYDROGEN_OUTPUT_VARIABLE,
  POWER_PLANT_CF,
  RATED_CAPACITY_TIME,
  SUMMARY_KEYS,
  TOTAL_OPERATING_TIME,
} from "./consts";

export type DataModel = {
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
  readonly hoursPerYear = HOURS_PER_YEAR;
  readonly kgtoTonne = 1 / 1000;
  readonly H2VoltoMass = 0.089;
  readonly secAtNominalLoad = 33.33; // kWh/kg

  // calculated params
  genCapacity: number;
  elecCapacity: number;
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
    // Loaded data
    this.solarData = solarData;
    this.windData = windData;

    // Stack replacement logic for degradation
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
    this.elecCapacity = parameters.electrolyserNominalCapacity;
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

  calculateHydrogenModel(projectTimeline: number): ProjectModelSummary {
    const {
      stackDegradation,
      solarDegradation,
      windDegradation,
      inputConfiguration,
    } = this.parameters;

    if (inputConfiguration === "Basic") {
      return this.calculateBasicHydrogenModel(projectTimeline);
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
    const operatingOutputs = this.getTabulatedOutput(
      hourlyOperation.Generator_CF,
      hourlyOperation.Electrolyser_CF,
      hourlyOperation.Hydrogen_prod_fixed,
      hourlyOperation.Hydrogen_prod_variable,
      hourlyOperation.Net_Battery_Flow,
      this.elecCapacity,
      this.genCapacity,
      this.kgtoTonne,
      this.hoursPerYear
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
      this.parameters.powerPlantOversizeRatio,
      this.elecCapacity,
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

    this.elecCapacity = backCalculateElectrolyserCapacity(
      this.parameters.projectScale,
      this.elecEff,
      mean(hourlyOperation.Electrolyser_CF)
    );
    this.genCapacity = backCalculatePowerPlantCapacity(
      this.parameters.powerPlantOversizeRatio,
      this.elecCapacity
    );

    const operatingOutputs = this.getTabulatedOutput(
      hourlyOperation.Generator_CF,
      hourlyOperation.Electrolyser_CF,
      hourlyOperation.Hydrogen_prod_fixed,
      hourlyOperation.Hydrogen_prod_variable,
      hourlyOperation.Net_Battery_Flow,
      this.elecCapacity,
      this.genCapacity,
      this.kgtoTonne,
      this.hoursPerYear
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
      this.genCapacity / this.elecCapacity,
      this.elecCapacity,
      this.parameters.solarNominalCapacity / this.genCapacity,
      this.parameters.windNominalCapacity / this.genCapacity,
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
      this.elecCapacity,
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
    const generatorCapacityFactor = mean(generatorCapFactor);
    // Time Electrolyser is at its Rated Capacity"
    const timeElectrolyser =
      electrolyserCapFactor.filter((e) => e === this.elecMaxLoad).length /
      hoursPerYear;
    //Total Time Electrolyser is Operating
    const totalOpsTime =
      electrolyserCapFactor.filter((e) => e > 0).length / hoursPerYear;

    // Achieved Electrolyser Capacity Factor
    const achievedElectrolyserCf = mean(electrolyserCapFactor);
    // Energy in to Electrolyser [MWh/yr]
    const energyInElectrolyser = sum(electrolyserCapFactor) * elecCapacity;
    // Surplus Energy [MWh/yr]
    const surplus =
      sum(generatorCapFactor) * genCapacity -
      sum(electrolyserCapFactor) * elecCapacity;
    // Hydrogen Output for Fixed Operation [t/yr]
    const hydrogenFixed = sum(hydrogenProdFixed) * elecCapacity * kgtoTonne;
    // Hydrogen Output for Variable Operation [t/yr]
    const hydrogenVariable =
      sum(hydrogenProdVariable) * elecCapacity * kgtoTonne;
    // Total Battery Output (MWh/yr)
    const totalBatteryOutput =
      sum(netBatteryFlow.filter((num) => num < 0)) *
      -1 *
      (1 - (1 - this.batteryEfficiency) / 2);

    let summary: ModelSummaryPerYear = {};
    summary[POWER_PLANT_CF] = generatorCapacityFactor;
    summary[RATED_CAPACITY_TIME] = timeElectrolyser;
    summary[TOTAL_OPERATING_TIME] = totalOpsTime;
    summary[ELECTROLYSER_CF] = achievedElectrolyserCf;
    summary[ENERGY_INPUT] = energyInElectrolyser;
    summary[ENERGY_OUTPUT] = surplus;
    summary[BATTERY_OUTPUT] = totalBatteryOutput;
    // TODO: Return one based on profile
    summary[HYDROGEN_OUTPUT_FIXED] = hydrogenFixed;
    summary[HYDROGEN_OUTPUT_VARIABLE] = hydrogenVariable;

    return summary;
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

    const hydrogenProdVariable = calculateVariableHydrogenProduction(
      specCons,
      electrolyserCf,
      hydOutput,
      yearlyDegradationRate
    );

    const workingDf = {
      Generator_CF: generatorCf,
      Electrolyser_CF: electrolyserCf,
      Hydrogen_prod_fixed: hydrogenProdFixed,
      Hydrogen_prod_variable: hydrogenProdVariable,
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
    parameters: DataModel,
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
