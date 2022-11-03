import {
  backCalculateElectrolyserCapacity, backCalculateInputFields,
  backCalculatePowerPlantCapacity,
} from "../components/charts/basic-calculations";
import {
  calculatePerYearOpex,
  getOpex,
} from "../components/charts/opex-calculations";
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
  calculateSummary, initialiseStackReplacementYears,
} from "./ModelUtils";
import {
  BATTERY_OUTPUT,
  ELECTROLYSER_CF,
  ENERGY_INPUT,
  ENERGY_OUTPUT, HOURS_PER_YEAR, HYDROGEN_OUTPUT, POWER_PLANT_CF, RATED_CAPACITY_TIME,
  SUMMARY_KEYS,
  TOTAL_OPERATING_TIME
} from "./consts";

import {getCapex, getEpcCosts} from "../components/charts/capex-calculations";
import {roundToNearestInteger, roundToTwoDP, sales} from "../components/charts/cost-functions";
import {generateLCBreakdown} from "../components/charts/lch2-calculations";

export type HydrogenData = {
  additionalAnnualCosts: number;
  additionalTransmissionCharges: number | undefined;
  additionalUpfrontCosts: number;
  batteryCosts: number | undefined;
  batteryEfficiency: number;
  batteryEpcCosts: number | undefined;
  batteryLandProcurementCosts: number | undefined;
  batteryLifetime: number | undefined;
  batteryMinCharge: number | undefined;
  batteryOMCost: number | undefined;
  batteryRatedPower: number | undefined;
  batteryReplacementCost: number | undefined;
  batteryStorageDuration: number | undefined;
  discountRate: number;
  electrolyserCostReductionWithScale: number;
  electrolyserEfficiency: number | undefined;
  electrolyserEpcCosts: number;
  electrolyserLandProcurementCosts: number;
  electrolyserMaximumLoad: number;
  electrolyserMinimumLoad: number;
  electrolyserNominalCapacity: number;
  electrolyserOMCost: number;
  electrolyserPurchaseCost: number;
  electrolyserReferenceCapacity: number;
  electrolyserReferenceFoldIncrease: number;
  electrolyserStackReplacement: number;
  gridConnectionCost: number | undefined;
  inflationRate: number;
  inputConfiguration: InputConfiguration;
  location: string;
  maximumDegradationBeforeReplacement: number;
  maximumLoadWhenOverloading: number;
  powerCapacityConfiguration: PowerCapacityConfiguration;
  powerPlantConfiguration: PowerPlantConfiguration;
  powerPlantOversizeRatio: number;
  powerPlantType: PowerPlantType;
  powerSupplyOption: PowerSupplyOption;
  principalPPACost: number | undefined;
  projectScale: number;
  projectTimeline: number;
  secAtNominalLoad: number | undefined;
  solarDegradation: number;
  solarEpcCosts: number;
  solarFarmBuildCost: number;
  solarLandProcurementCosts: number;
  solarNominalCapacity: number;
  solarOpex: number | undefined;
  solarPVCostReductionWithScale: number;
  solarReferenceCapacity: number;
  solarReferenceFoldIncrease: number;
  solarToWindPercentage: number;
  stackDegradation: number;
  stackLifetime: number;
  stackReplacementType: StackReplacementType;
  timeBetweenOverloading: number;
  waterRequirementOfElectrolyser: number;
  waterSupplyCost: number;
  windCostReductionWithScale: number;
  windDegradation: number;
  windEpcCosts: number;
  windFarmBuildCost: number;
  windLandProcurementCosts: number;
  windNominalCapacity: number;
  windOpex: number | undefined;
  windReferenceCapacity: number;
  windReferenceFoldIncrease: number;
};

export class HydrogenModel {
  // consts
  readonly MWtokW = 1000; // kW/MW
  readonly kgtoTonne = 1 / 1000;
  readonly H2VoltoMass = 0.089; // kg/m3

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
  private discountRate: number;
  private additionalTransmissionCharges: number;
  private batteryCosts: number;
  private batteryLifetime: number;
  private batteryMinCharge: number;
  private windOpex: number;
  private solarOpex: number;
  private principalPPACost: number;
  private gridConnectionCost: number;
  private batteryOMCost: number;
  private batteryReplacementCost: number;
  private batteryRatedPower: number;
  private batteryStorageDuration: number;
  private electrolyserEfficiency: number;
  private secAtNominalLoad: number;

  constructor(
      parameters: HydrogenData,
      solarData: CsvRow[],
      windData: CsvRow[]
  ) {
    this.parameters = parameters;

    this.additionalTransmissionCharges = parameters.additionalTransmissionCharges ?? 0;
    this.batteryCosts = parameters.batteryCosts ?? 0;
    this.batteryLifetime = parameters.batteryLifetime ?? 0;
    this.batteryMinCharge = parameters.batteryMinCharge ?? 0;
    this.batteryOMCost = parameters.batteryOMCost ?? 0;
    this.batteryReplacementCost = parameters.batteryReplacementCost ?? 0;
    this.batteryRatedPower = parameters.batteryRatedPower ?? 0;
    this.batteryStorageDuration = parameters.batteryStorageDuration ?? 0;
    this.electrolyserEfficiency = parameters.electrolyserEfficiency ?? 0;
    this.gridConnectionCost = parameters.gridConnectionCost ?? 0;
    this.principalPPACost = parameters.principalPPACost ?? 0;
    this.secAtNominalLoad = parameters.secAtNominalLoad ?? 0;
    this.solarOpex = parameters.solarOpex ?? 0;
    this.windOpex = parameters.windOpex ?? 0;
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
    this.elecEff = this.electrolyserEfficiency / 100;
    this.hydOutput = this.H2VoltoMass * this.MWtokW * this.elecEff; // kg.kWh/m3.MWh
    this.elecOverload = parameters.maximumLoadWhenOverloading / 100;
    this.batteryEnergy =
        this.batteryRatedPower * this.batteryStorageDuration;
    this.batteryEfficiency = parameters.batteryEfficiency / 100;
    this.battMin = this.batteryMinCharge / 100;
    this.specCons = this.secAtNominalLoad * this.H2VoltoMass;
    this.discountRate = this.parameters.discountRate / 100;
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
        this.batteryRatedPower,
        this.batteryStorageDuration,
        this.batteryCosts,
        this.gridConnectionCost
    );

    const {
      electrolyserEpcCost,
      electrolyserLandCost,
      powerPlantEpcCost,
      powerPlantLandCost,
      batteryEpcCost,
      batteryLandCost,
    } = getEpcCosts(
        electrolyserCAPEX,
        this.parameters.electrolyserEpcCosts,
        this.parameters.electrolyserLandProcurementCosts,
        solarCAPEX,
        this.parameters.solarEpcCosts,
        this.parameters.solarLandProcurementCosts,
        windCAPEX,
        this.parameters.windEpcCosts,
        this.parameters.windLandProcurementCosts,
        batteryCAPEX,
        this.parameters.batteryEpcCosts,
        this.parameters.batteryLandProcurementCosts
    );
    const indirectCostBreakdown = {
      "Electrolyser EPC": electrolyserEpcCost,
      "Electrolyser Land": electrolyserLandCost,
      "Power Plant EPC": powerPlantEpcCost,
      "Power Plant Land": powerPlantLandCost,
      "Battery EPC": batteryEpcCost,
      "Battery Land": batteryLandCost,
    };

    const totalCapexCost =
        electrolyserCAPEX +
        powerPlantCAPEX +
        batteryCAPEX +
        this.parameters.additionalUpfrontCosts +
        gridConnectionCAPEX; // Cost values for sales calculation
    const totalEpcCost = electrolyserEpcCost + powerPlantEpcCost + batteryEpcCost;
    const totalLandCost =
        electrolyserLandCost + powerPlantLandCost + batteryLandCost;
    const totalIndirectCosts =
        electrolyserEpcCost +
        electrolyserLandCost +
        powerPlantEpcCost +
        powerPlantLandCost;

    const capitalCostBreakdown = {
      "Electrolyser System": electrolyserCAPEX,
      "Power Plant": powerPlantCAPEX,
      Battery: batteryCAPEX,
      "Grid Connection": gridConnectionCAPEX,
      "Additional Upfront Costs": this.parameters.additionalUpfrontCosts,
      "Indirect Costs": totalIndirectCosts,
    };

    const {
      electricityOpexCost,
      electrolyserOpexCost,
      powerPlantOpexCost,
      batteryOpexCost,
      waterOpexCost,
      stackReplacementCostsOverProjectLife,
      batteryReplacementCostsOverProjectLife,
      gridConnectionOpexPerYear,
      totalOpex,
    } = getOpex(
        this.parameters.powerPlantConfiguration,
        this.parameters.powerSupplyOption,
        this.parameters.stackReplacementType,
        this.parameters.stackDegradation,
        this.parameters.maximumDegradationBeforeReplacement,
        this.parameters.projectTimeline,
        totalOperatingHours,
        this.parameters.stackLifetime,
        this.parameters.electrolyserStackReplacement,
        electrolyserCAPEX,
        this.parameters.electrolyserOMCost,
        this.parameters.powerPlantType,
        this.solarOpex,
        this.solarNominalCapacity,
        this.windOpex,
        this.windNominalCapacity,
        this.batteryOMCost,
        this.batteryRatedPower,
        this.batteryReplacementCost,
        batteryCAPEX,
        this.batteryLifetime,
        this.additionalTransmissionCharges,
        electricityConsumed,
        electricityConsumedByBattery,
        this.principalPPACost,
        this.parameters.waterSupplyCost,
        this.parameters.waterRequirementOfElectrolyser,
        h2Produced,
        this.parameters.additionalAnnualCosts
    );


    const {
      electrolyserOpexPerYear,
      powerPlantOpexPerYear,
      batteryOpexPerYear,
      waterOpexPerYear,
      electricityPurchaseOpexPerYear,
      additionalOpexPerYear,
    } = calculatePerYearOpex(
        electrolyserOpexCost,
        this.parameters.inflationRate,
        this.parameters.projectTimeline,
        stackReplacementCostsOverProjectLife,
        electricityOpexCost,
        powerPlantOpexCost,
        this.parameters.additionalAnnualCosts,
        this.batteryRatedPower,
        batteryOpexCost,
        batteryReplacementCostsOverProjectLife,
        waterOpexCost
    );
    const operatingCosts: {
      projectTimeline: number;
      costs: { [key: string]: number[] };
    } = {
      projectTimeline: this.parameters.projectTimeline,
      costs: {
        "Electrolyser OPEX": electrolyserOpexPerYear,
        "Power Plant OPEX": powerPlantOpexPerYear,
        "Battery OPEX": batteryOpexPerYear,
        "Additional Annual Costs": additionalOpexPerYear,
        "Water Costs": waterOpexPerYear,
        "Electricity Purchase": electricityPurchaseOpexPerYear,
      },
    };

    const {lch2, hydrogenProductionCost} = sales(
        totalCapexCost,
        totalEpcCost,
        totalLandCost,
        this.parameters.projectTimeline,
        this.discountRate,
        totalOpex,
        h2Produced
    );

    // LCH2 calculations
    const {
      lcPowerPlantCAPEX,
      lcElectrolyserCAPEX,
      lcIndirectCosts,
      lcPowerPlantOPEX,
      lcElectrolyserOPEX,
      lcElectricityPurchase,
      lcStackReplacement,
      lcWater,
      lcBattery,
      lcGridConnection,
      lcAdditionalCosts,
    } = generateLCBreakdown(
        this.parameters.powerPlantConfiguration,
        this.parameters.powerSupplyOption,
        powerPlantCAPEX,
        hydrogenProductionCost,
        electrolyserCAPEX,
        totalIndirectCosts,
        this.parameters.projectTimeline,
        powerPlantOpexCost,
        electrolyserOpexCost,
        this.parameters.additionalAnnualCosts,
        this.discountRate,
        batteryOpexCost,
        batteryReplacementCostsOverProjectLife,
        batteryCAPEX,
        waterOpexCost,
        this.parameters.additionalUpfrontCosts,
        stackReplacementCostsOverProjectLife,
        electricityConsumed,
        electricityConsumedByBattery,
        this.principalPPACost,
        gridConnectionOpexPerYear,
        gridConnectionCAPEX
    );

    const lch2BreakdownData: { [key: string]: number } = {
      "Power Plant CAPEX": lcPowerPlantCAPEX,
      "Electrolyser CAPEX": lcElectrolyserCAPEX,
      "Indirect Costs": lcIndirectCosts,
      "Power Plant OPEX": lcPowerPlantOPEX,
      "Electrolyser O&M": lcElectrolyserOPEX,
      "Electricity Purchase": lcElectricityPurchase,
      "Stack Replacement": lcStackReplacement,
      "Water Cost": lcWater,
      "Battery Cost": lcBattery,
      "Grid Connection Cost": lcGridConnection,
      "Additional Costs": lcAdditionalCosts,
    };

    const summaryTableData: { [key: string]: number } = {
      "Power Plant Capacity Factor": roundToTwoDP(
          mean(summary[`${POWER_PLANT_CF}`].map((x) => x * 100))
      ),

      "Time Electrolyser is at its Maximum Capacity (% of hrs/yr)": roundToTwoDP(
          mean(summary[`${RATED_CAPACITY_TIME}`].map((x) => x * 100))
      ),
      "Total Time Electrolyser is Operating (% of hrs/yr)": roundToTwoDP(
          mean(summary[`${TOTAL_OPERATING_TIME}`].map((x) => x * 100))
      ),

      "Electrolyser Capacity Factor": roundToTwoDP(
          mean(summary[`${ELECTROLYSER_CF}`].map((x) => x * 100))
      ),

      "Energy Consumed by Electrolyser (MWh/yr)": roundToNearestInteger(
          mean(electricityConsumed)
      ),

      "Excess Energy Not Utilised by Electrolyser (MWh/yr)":
          roundToNearestInteger(mean(electricityProduced)),

      "Hydrogen Output (t/yr)": roundToNearestInteger(mean(h2Produced)),
      "LCH2 ($/kg)": roundToTwoDP(lch2),
    };

    return {
      durationCurves,
      hourlyCapFactors,
      indirectCostBreakdown,
      capitalCostBreakdown,
      operatingCosts,
      lch2BreakdownData,
      summaryTableData
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

    return stackDegradation + solarDegradation + windDegradation === 0
        ? this.calculateHydrogenModelWithoutDegradation(projectTimeline)
        : this.calculateHydrogenModelWithDegradation(projectTimeline);

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
    const operatingOutputs = calculateSummary(
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
    this.stackReplacementYears = initialiseStackReplacementYears(
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
        this.stackLifetime,
        this.solarData,
        this.windData,
        this.hoursPerYear,
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
        this.batteryStorageDuration,
        this.batteryEfficiency,
        this.batteryRatedPower,
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

    const operatingOutputs = calculateSummary(
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
        this.stackLifetime,
        this.solarData,
        this.windData,
        this.hoursPerYear,
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
        this.batteryStorageDuration,
        this.batteryEfficiency,
        this.batteryRatedPower,
        this.battMin,
        year
    );
  }

  private calculateElectrolyserOutput(
    hourlyOperation: ModelHourlyOperation
  ): ModelSummaryPerYear {
    return calculateSummary(
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


  }

  // """Private method- Creates a dataframe with a row for each hour of the year and columns Generator_CF,
  //       Electrolyser_CF, Hydrogen_prod_fixed and Hydrogen_prod_var
  //       """
  private calculateHourlyOperation(
      stackLifetime: number | undefined,
      solarData: CsvRow[],
      windData: CsvRow[],
      hoursPerYear: number,
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
        solarData,
        windData,
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

    let batteryNetCharge: number[] = new Array(hoursPerYear).fill(0);

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
        stackLifetime
    );

    const hydrogenProdFixed = calculateFixedHydrogenProduction(
      electrolyserCf,
      hydOutput,
      yearlyDegradationRate,
      specCons
    );

    return {
      Generator_CF: generatorCf,
      Electrolyser_CF: electrolyserCf,
      Hydrogen_prod_fixed: hydrogenProdFixed,
      Net_Battery_Flow: batteryNetCharge,
    };
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

}
