import {
  backCalculateElectrolyserCapacity,
  backCalculatePowerPlantCapacity,
} from "../components/charts/basic-calculations";
import { maxDegradationStackReplacementYears } from "../components/charts/opex-calculations";
import { InputConfiguration, StackReplacementType } from "../types";
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
import { SUMMARY_KEYS } from "./consts";

export type HydrogenData = {
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
  elecCapacity: number;
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

  constructor(
    parameters: HydrogenData,
    solarData: CsvRow[],
    windData: CsvRow[]
  ) {
    this.parameters = parameters;
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

    // calculated values
    this.solarNominalCapacity = parameters.solarNominalCapacity;
    this.windNominalCapacity = parameters.windNominalCapacity;
    this.totalNominalPowerPlantCapacity =
      this.solarNominalCapacity + this.windNominalCapacity;
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
    const operatingOutputs = getTabulatedOutput(
      hourlyOperation.Generator_CF,
      hourlyOperation.Electrolyser_CF,
      hourlyOperation.Hydrogen_prod_fixed,
      hourlyOperation.Net_Battery_Flow,
      this.elecCapacity,
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
      mean(hourlyOperation.Electrolyser_CF),
      this.hoursPerYear
    );
    this.totalNominalPowerPlantCapacity = backCalculatePowerPlantCapacity(
      this.parameters.powerPlantOversizeRatio,
      this.elecCapacity
    );

    const operatingOutputs = getTabulatedOutput(
      hourlyOperation.Generator_CF,
      hourlyOperation.Electrolyser_CF,
      hourlyOperation.Hydrogen_prod_fixed,
      hourlyOperation.Net_Battery_Flow,
      this.elecCapacity,
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
      this.totalNominalPowerPlantCapacity / this.elecCapacity,
      this.elecCapacity,
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
      this.elecCapacity,
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
