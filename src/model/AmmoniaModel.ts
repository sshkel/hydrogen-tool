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
  calculateElectrolyserCapacityFactors,
  calculateHydrogenProduction,
  calculatePowerPlantCapacityFactors,
  calculateOverloadingModel,
  calculateSummary, initialiseStackReplacementYears,
} from "./ModelUtils";
import {
  HOURS_PER_YEAR,

} from "./consts";

import {getCapex, getEpcCosts} from "../components/charts/capex-calculations";
import {roundToNearestInteger, roundToTwoDP, sales} from "../components/charts/cost-functions";
import {generateLCBreakdown} from "../components/charts/lch2-calculations";

export type AmmoniaData = {
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
  // AMMONIA
  // system sizing
  ammoniaPlantCapacity: number; // raw input
  electrolyserSystemOversizing: number; // raw input %
  // specific electricity consumption sec
  ammoniaPlantSec: number; // raw input
  asuSec: number; // raw input
  hydrogenStorageCapacity: number; // raw input
  // ammonia plant load range
  ammoniaPlantMinimumTurndown: number; // raw input %
  // electrolyster and hydrogen storage paramteres
  // other operation factors
  minimumHydrogenStorage: number;
};

export class AmmoniaModel {
  // consts
  private readonly MWtokW = 1000; // kW/MW
  private readonly kgtoTonne = 1 / 1000;
  private readonly H2VoltoMass = 0.089; // kg/m3

  private readonly discountRate: number;
  private readonly additionalTransmissionCharges: number;
  private readonly batteryCosts: number;
  private readonly batteryLifetime: number;
  private readonly batteryMinCharge: number;
  private readonly windOpex: number;
  private readonly solarOpex: number;
  private readonly principalPPACost: number;
  private readonly gridConnectionCost: number;
  private readonly batteryOMCost: number;
  private readonly batteryReplacementCost: number;
  private readonly batteryRatedPower: number;
  private readonly batteryStorageDuration: number;
  private readonly electrolyserEfficiency: number;
  private readonly secAtNominalLoad: number;

  // calculated params
  private readonly elecMaxLoad: number;
  private readonly elecMinLoad: number;
  private readonly elecEff: number;
  private readonly hydOutput: number;
  private readonly parameters: AmmoniaData;
  private readonly elecOverload: number;
  private readonly batteryEnergy: number;
  private readonly batteryEfficiency: number;
  private readonly battMin: number;
  private readonly stackLifetime?: number;
  // data from renewables
  private readonly solarData: CsvRow[];
  private readonly windData: CsvRow[];
  // calculated based on number of CSV rows
  private readonly hoursPerYear: number;
  private readonly specCons: number;

  private stackReplacementYears: number[];
  private hourlyOperationsInYearOne: ModelHourlyOperation;
  private solarNominalCapacity: number;
  private windNominalCapacity: number;
  private powerPlantOversizeRatio: number;
  private powerPlantType: PowerPlantType;
  private lastStackReplacementYear: number;
  private currentStackOperatingHours: number;

  // ammonia
  private ammoniaPlantPowerDemand: number;
  private airSeparationUnitCapacity: number;
  private airSeparationUnitPowerDemand: number;
  private hydrogenOutput: number;

  // parameters to expose to working data
  electrolyserNominalCapacity: number;
  totalNominalPowerPlantCapacity: number;


  constructor(
      parameters: AmmoniaData,
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


    // ammonia
    this.ammoniaPlantPowerDemand = ammonia_plant_power_demand(
        this.parameters.ammoniaPlantCapacity,
        this.parameters.ammoniaPlantSec,
        this.hoursPerYear
    );
    this.airSeparationUnitCapacity = air_separation_unit_capacity(
        this.parameters.ammoniaPlantCapacity
    );
    this.airSeparationUnitPowerDemand = air_separation_unit_power_demand(
        this.airSeparationUnitCapacity,
        this.parameters.asuSec
    );
    this.hydrogenOutput = hydrogen_output(
        this.parameters.ammoniaPlantCapacity
    );
    this.electrolyserNominalCapacity = nominal_electrolyser_capacity(
        this.hydrogenOutput,
        this.secAtNominalLoad,
        this.parameters.electrolyserSystemOversizing / 100
    );
    this.solarNominalCapacity = nominal_solar_capacity(
        this.ammoniaPlantPowerDemand,
        this.airSeparationUnitPowerDemand,
        this.electrolyserNominalCapacity,
        this.parameters.solarToWindPercentage / 100,
        this.parameters.powerPlantOversizeRatio
    );
    this.windNominalCapacity = nominal_wind_capacity(
        this.ammoniaPlantPowerDemand,
        this.airSeparationUnitPowerDemand,
        this.electrolyserNominalCapacity,
        1 - this.parameters.solarToWindPercentage / 100,
        this.parameters.powerPlantOversizeRatio
    );
    this.totalNominalPowerPlantCapacity =
        this.solarNominalCapacity + this.windNominalCapacity;
  }


  produceResults() {

    let summary: ProjectModelSummary =
        this.calculateHydrogenModel(this.parameters.projectTimeline);

    let hourlyOperations = this.getHourlyOperations();

    const durationCurves = {
      "Power Plant Duration Curve": hourlyOperations.powerplantCapacityFactors,
      "Electrolyser Duration Curve": hourlyOperations.electrolyserCapacityFactors,
      Ammonia: hourlyOperations.ammoniaCapacityFactors,
    };
    const hourlyCapFactors = {
      Electrolyser: hourlyOperations.electrolyserCapacityFactors,
      "Power Plant": hourlyOperations.powerplantCapacityFactors,
      Ammonia: hourlyOperations.ammoniaCapacityFactors,
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

    const totalOperatingHours: number[] = summary.totalOperatingTime.map(
        (hours) => hours * HOURS_PER_YEAR
    );
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
        summary.electricityConsumed,
        summary.electricityConsumedByBattery,
        this.principalPPACost,
        this.parameters.waterSupplyCost,
        this.parameters.waterRequirementOfElectrolyser,
        summary.hydrogenProduction,
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
        summary.hydrogenProduction
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
        summary.electricityConsumed,
        summary.electricityConsumedByBattery,
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
          mean(summary.powerPlantCapacityFactors.map((x) => x * 100))
      ),

      "Time Electrolyser is at its Maximum Capacity (% of hrs/yr)": roundToTwoDP(
          mean(summary.ratedCapacityTime.map((x) => x * 100))
      ),
      "Total Time Electrolyser is Operating (% of hrs/yr)": roundToTwoDP(
          mean(summary.totalOperatingTime.map((x) => x * 100))
      ),

      "Electrolyser Capacity Factor": roundToTwoDP(
          mean(summary.electrolyserCapacityFactors.map((x) => x * 100))
      ),

      "Energy Consumed by Electrolyser (MWh/yr)": roundToNearestInteger(
          mean(summary.electricityConsumed)
      ),

      "Excess Energy Not Utilised by Electrolyser (MWh/yr)":
          roundToNearestInteger(mean(summary.electricityProduced)),

      "Hydrogen Output (t/yr)": roundToNearestInteger(mean(summary.hydrogenProduction)),
      "LCH2 ($/kg)": roundToTwoDP(lch2),
    };

    return {
      electrolyserNominalCapacity: this.electrolyserNominalCapacity,
      powerPlantNominalCapacity: this.powerPlantNominalCapacity,
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
          mean(projectSummary.electrolyserCapacityFactors),
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
        hourlyOperation.powerplantCapacityFactors,
        hourlyOperation.electrolyserCapacityFactors,
        hourlyOperation.hydrogenProduction,
        hourlyOperation.netBatteryFLow,
        this.electrolyserNominalCapacity,
        this.powerPlantNominalCapacity,
        this.kgtoTonne,
        this.hoursPerYear,
        this.elecMaxLoad,
        this.batteryEfficiency
    );

    let projectSummary: ProjectModelSummary = {
      electricityConsumed: [],
      electricityProduced: [],
      electricityConsumedByBattery: [],
      totalOperatingTime: [],
      hydrogenProduction: [],
      powerPlantCapacityFactors: [],
      ratedCapacityTime: [],
      electrolyserCapacityFactors: [],
    };
    Object.keys(projectSummary).forEach((key) => {
      projectSummary[key as keyof ProjectModelSummary] = Array(projectTimeline).fill(operatingOutputs[key]);
    });

    return projectSummary;
  }

  private calculateHydrogenModelWithDegradation(
    projectTimeline: number
  ): ProjectModelSummary {
    this.stackReplacementYears = initialiseStackReplacementYears(
        this.parameters.stackReplacementType,
        this.parameters.stackDegradation,
        this.parameters.maximumDegradationBeforeReplacement,
        projectTimeline
    );
    let year = 1;
    // Calculate first year separately
    const hourlyOperation =
        this.calculateAdvancedElectrolyserHourlyOperation(year);
    this.hourlyOperationsInYearOne = hourlyOperation;
    const calculateElectrolyserOutput = (hourlyOperation: ModelHourlyOperation) => {
      return calculateSummary(
          hourlyOperation.powerplantCapacityFactors,
          hourlyOperation.electrolyserCapacityFactors,
          hourlyOperation.hydrogenProduction,
          hourlyOperation.netBatteryFLow,
          this.electrolyserNominalCapacity,
          this.powerPlantNominalCapacity,
          this.kgtoTonne,
          this.hoursPerYear,
          this.elecMaxLoad,
          this.batteryEfficiency
      );
    }
    const operatingOutputs = calculateElectrolyserOutput(hourlyOperation);

    let modelSummaryPerYear: ModelSummaryPerYear[] = [];
    modelSummaryPerYear.push(operatingOutputs);

    for (year = 2; year <= projectTimeline; year++) {
      const hourlyOperationsByYear =
          this.calculateAdvancedElectrolyserHourlyOperation(year);
      modelSummaryPerYear.push(
          calculateElectrolyserOutput(hourlyOperationsByYear)
      );
    }

    let projectSummary: ProjectModelSummary = {
      electricityConsumed: [],
      electricityProduced: [],
      electricityConsumedByBattery: [],
      totalOperatingTime: [],
      hydrogenProduction: [],
      powerPlantCapacityFactors: [],
      ratedCapacityTime: [],
      electrolyserCapacityFactors: [],
    };


    modelSummaryPerYear.forEach((yearSummary) => {
      Object.keys(projectSummary).forEach((key) => {
        projectSummary[key as keyof ProjectModelSummary].push(yearSummary[key]);
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
      mean(hourlyOperation.electrolyserCapacityFactors),
      this.hoursPerYear
    );
    this.totalNominalPowerPlantCapacity = backCalculatePowerPlantCapacity(
      this.powerPlantOversizeRatio,
      this.electrolyserNominalCapacity
    );

    const operatingOutputs = calculateSummary(
      hourlyOperation.powerplantCapacityFactors,
      hourlyOperation.electrolyserCapacityFactors,
        hourlyOperation.hydrogenProduction,
        hourlyOperation.netBatteryFLow,
        this.electrolyserNominalCapacity,
        this.powerPlantNominalCapacity,
        this.kgtoTonne,
        this.hoursPerYear,
        this.elecMaxLoad,
        this.batteryEfficiency
    );

    let projectSummary: ProjectModelSummary = {
      electricityConsumed: [],
      electricityProduced: [],
      electricityConsumedByBattery: [],
      totalOperatingTime: [],
      hydrogenProduction: [],
      powerPlantCapacityFactors: [],
      ratedCapacityTime: [],
      electrolyserCapacityFactors: [],
    };

    Object.keys(operatingOutputs).forEach((key) => {
      projectSummary[key as keyof ProjectModelSummary] = Array(projectTimeline).fill(operatingOutputs[key]);
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
        this.powerPlantNominalCapacity / this.electrolyserNominalCapacity,
        this.electrolyserNominalCapacity,
        this.solarNominalCapacity / this.powerPlantNominalCapacity,
        this.windNominalCapacity / this.powerPlantNominalCapacity,
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

  // """Private method- Creates a dataframe with a row for each hour of the year and columns powerplantCapacityFactors,
  //       electrolyserCapacityFactors, hydrogenProduction and Hydrogen_prod_var
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
    const powerplantCapacityFactors = calculatePowerPlantCapacityFactors(
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
    let electrolyserCapacityFactors = calculateElectrolyserCapacityFactors(
      oversizeRatio,
      elecMaxLoad,
      elecMinLoad,
      powerplantCapacityFactors
    );

    let netBatteryFLow: number[] = new Array(hoursPerYear).fill(0);

    // overload calculation
    if (elecOverload > elecMaxLoad && elecOverloadRecharge > 0) {
      electrolyserCapacityFactors = calculateOverloadingModel(
        oversizeRatio,
        elecMaxLoad,
        elecOverloadRecharge,
        elecOverload,
        powerplantCapacityFactors,
        electrolyserCapacityFactors
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
        powerplantCapacityFactors,
        electrolyserCapacityFactors,
        batteryEfficiency,
        elecMinLoad,
        elecMaxLoad,
        batteryPower,
        batteryEnergy,
        battMin
      );
      electrolyserCapacityFactors = batteryModel.electrolyser_cf;
      netBatteryFLow = batteryModel.battery_net_charge;
      // additiona calcs for ammonia with battery
      electrolyserCapacityFactors = calculateGeneratorCapFactors(
          powerplantCapacityFactors,
          netBatteryFLow,
          electrolyserCapacityFactors,
          batteryEfficiency,
          this.powerPlantNominalCapacity,
          this.electrolyserNominalCapacity,
          this.airSeparationUnitPowerDemand,
          this.ammoniaPlantPowerDemand
      );
    }

    // Stack degradation calculation
    const yearlyDegradationRate = this.calculateStackDegradation(
        stackDegradation,
        electrolyserCapacityFactors,
        year,
        stackLifetime
    );

    const hydrogenProduction = calculateHydrogenProduction(
      electrolyserCapacityFactors,
      hydOutput,
      yearlyDegradationRate,
      specCons
    );
    const ammoniaCapacityFactors = calculateNH3CapFactors(
        hydrogenProduction,
        this.parameters.ammoniaPlantCapacity,
        this.parameters.hydrogenStorageCapacity,
        this.parameters.ammoniaPlantMinimumTurndown,
        this.parameters.minimumHydrogenStorage,
        this.hydrogenOutput,
        this.airSeparationUnitCapacity,
        this.hoursPerYear
    );

    return {
      powerplantCapacityFactors,
      electrolyserCapacityFactors,
      hydrogenProduction,
      netBatteryFLow,
      ammoniaCapacityFactors
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


// Functions transcribed from ammonia model

function ammonia_plant_power_demand(
    ammonia_plant_capacity: number, // size of ammonia plant
    ammonia_plant_sec: number, // electricity required to produce 1 kg of ammonia
    hoursPerYear: number
) {
  return (
      (ammonia_plant_capacity / hoursPerYear) *
      1_000_000 *
      (ammonia_plant_sec / 1000)
  );
}

function air_separation_unit_capacity(
    ammonia_plant_capacity: number // size of ammonia plant
) {
  return ((ammonia_plant_capacity * 1000) / 365) * (28.134 / 34.181);
}

function air_separation_unit_power_demand(
    air_separation_unit_capacity: number, // size of air separation unit
    asu_sec: number // electricity required to produce 1kg of Nitrogen
) {
  return (air_separation_unit_capacity / 24) * asu_sec;
}

function hydrogen_output(
    ammonia_plant_capacity: number // size of ammonia plant
) {
  return ammonia_plant_capacity * (1000 / 365) * (6.047 / 34.181);
}

function nominal_electrolyser_capacity(
    hydrogen_output: number, // quantity of Hydrogen required per day
    sec_at_nominal_load: number, // amount of electricity required to produce 1kg of hydrogen
    electrolyser_system_oversizing: number // % electrolyser is oversized against minimum required
) {
  return (
      (hydrogen_output / 24) *
      sec_at_nominal_load *
      (1 + electrolyser_system_oversizing)
  );
}

// if hybrid we multiply by the split otherwise we leave it out or we can make it 1
function nominal_solar_capacity(
    ammonia_plant_power_demand: number, // power required for ammonia plant
    air_separation_unit_power_demand: number, // power required for ASU
    nominal_electrolyser_capacity: number, // Power required for Electrolyser
    hybrid_generator_split: number, // % of hybrid plant made up of solar
    renewable_energy_plant_oversizing: number // % oversizing of renewable energy plant
) {
  return (
      (ammonia_plant_power_demand +
          air_separation_unit_power_demand +
          nominal_electrolyser_capacity) *
      (1 + renewable_energy_plant_oversizing) *
      hybrid_generator_split
  );
}

// if hybrid we multiply by the split otherwise we leave it out or we can make it 1
function nominal_wind_capacity(
    ammonia_plant_power_demand: number, // power required for ammonia plant
    air_separation_unit_power_demand: number, // power required for ASU
    nominal_electrolyser_capacity: number, // Power required for Electrolyser
    hybrid_generator_split: number, // % of hybrid plant made up of solar
    renewable_energy_plant_oversizing: number // % oversizing of renewable energy plant
) {
  return (
      (ammonia_plant_power_demand +
          air_separation_unit_power_demand +
          nominal_electrolyser_capacity) *
      (1 + renewable_energy_plant_oversizing) *
      hybrid_generator_split
  );
}

// kTPA
function asu_plant_capacity(
    air_separation_unit_capacity: number // size of air separation unit
) {
  return air_separation_unit_capacity * (365 / 1000);
}

function ammonia_plant_CAPEX(
    ammonia_plant_capacity: number, // size of ammonia plant
    ammonia_storage_capacity: number, // size of ammonia storage
    asu_plant_capacity: number, // size of asu
    ammonia_synthesis_unit_purchase_cost: number, // cost per T ofr Ammonia Synthesis Unit
    ammonia_storage_purchase_cost: number, // cost per T for Ammonia Storage
    asu_purchase_cost: number // cost per T for ASU
) {
  return (
      ammonia_plant_capacity * 1000 * ammonia_synthesis_unit_purchase_cost +
      ((ammonia_storage_capacity * 1000) / 365) * ammonia_storage_purchase_cost +
      asu_plant_capacity * asu_purchase_cost * 365
  );
}

function ammonia_plant_epc(
    ammonia_plant_epc: number, // % of capex
    ammonia_plant_CAPEX: number // total capex of Ammonia plant
) {
  return ammonia_plant_epc * ammonia_plant_CAPEX;
}

function ammonia_plant_land_procurement_cost(
    ammonia_plant_land_procurement_cost: number, // % of capex
    ammonia_plant_CAPEX: number // total capex of Ammonia plant
) {
  return ammonia_plant_land_procurement_cost * ammonia_plant_CAPEX;
}

function ammonia_plant_indirect_costs(
    ammonia_plant_epc: number, // total epc cost
    ammonia_plant_land_procurement_cost: number // total land procurement cost
) {
  return ammonia_plant_epc + ammonia_plant_land_procurement_cost;
}

function ammonia_synthesis_unit_OandM(
    ammonia_plant_capacity: number, // size of ammonia plant
    asu_synthesis_unit_purchase_cost: number, // cost per T for Ammoni Synthesis Unit
    ammonia_synthesis_unit_OandM: number // % of CAPEX
) {
  return (
      ammonia_synthesis_unit_OandM *
      ammonia_plant_capacity *
      1000 *
      asu_synthesis_unit_purchase_cost
  );
}

function ammonia_storage_unit_OandM(
    ammonia_plant_capacity: number, // size of ammonia plant
    ammonia_storage_capacity: number, // size of ammonia storage tank
    ammonia_storage_purchase_cost: number, // Cost per T for mmonia Storage unit
    ammonia_storage_unit_OandM: number // % of CAPEX
) {
  return (
      ammonia_storage_unit_OandM *
      ammonia_storage_capacity *
      ammonia_plant_capacity *
      (1000 / 365) *
      ammonia_storage_purchase_cost
  );
}

function asu_OandM(
    asu_plant_capacity: number, // size of ASU
    asu_purchase_cost: number, // Cost per T for ASU
    asu_OandM: number // % of CAPEX
) {
  return asu_OandM * asu_plant_capacity * 365 * asu_purchase_cost;
}
// TODO I think there is a typo in the first param, the cells don't add up
function ammonia_plant_OandM(
    asu_plant_capacity: number, // size of ASU
    asu_purchase_cost: number, // cost per T for ASU
    asu_OandM: number
) {
  return asu_plant_capacity + asu_purchase_cost + asu_OandM;
}

function hydrogen_storage_purchase_cost(
    hydrogen_storage_capacity: number, // size of hydrogen storage tank
    hydrogen_storage_purchase_cost: number // Cost per kg for Hydrogen Storage
) {
  return hydrogen_storage_capacity * hydrogen_storage_purchase_cost;
}

function electrolyser_hydrogen_storage_system_capex_cost(
    hydrogen_storage_capacity: number, // size of hydrogen storage tank
    hydrogen_storage_purchase_cost: number, // cost per kg for hydrogen storage
    nominal_electrolyser_capacity: number, // size of electrolyser
    scaled_purchase_cost_of_electrolyser: number // Price per kW for Electrolyser
) {
  return (
      nominal_electrolyser_capacity *
      1000 *
      scaled_purchase_cost_of_electrolyser +
      hydrogen_storage_purchase_cost * hydrogen_storage_capacity
  );
}

function hydrogen_storage_OandM(
    hydrogen_storage_capacity: number, // size of asu
    hydrogen_storage_purchase_cost: number, // Cost per T for ASU
    hydrogen_storage_OandM: number // % of CAPEX
) {
  return (
      hydrogen_storage_capacity *
      hydrogen_storage_purchase_cost *
      hydrogen_storage_OandM
  );
}

function indirect_costs(
    ammonia_plant_indirect_costs: number, // indirect_cost_for ammonia plant
    electrolyser_and_hydrogen_storage_indirect_costs: number, // indirect costs for electrolyser and h2 storage
    epc_costs: number, // power plant EPC costs
    land_procurement_cost: number, // power plant land procurement costs
    battery_storage_indirect_costs: number // indirect costs for battery if selected
) {
  return (
      ammonia_plant_indirect_costs +
      electrolyser_and_hydrogen_storage_indirect_costs +
      epc_costs +
      land_procurement_cost +
      battery_storage_indirect_costs // TODO should be conditional
  );
}

// this would be repeated for multiple years
function ammonia_produced(
    nh3_produced_per_year: number, //ammonia produced in year X
    plant_year: number, // year X of operation
    discount_rate: number // discount rate
) {
  return (nh3_produced_per_year * 1000) / (1 + discount_rate) ** plant_year;
}

// this should be repeated for multiple years
function h2_storage_opex(
    h2_storage_opex: number, // undiscounted OPEX for h2 storage
    plant_year: number, // year X of operation
    discount_rate: number // discount rate
) {
  return h2_storage_opex / (1 + discount_rate) ** plant_year;
}

// this should be repeated for multiple years
function ammonia_plant_opex(
    ammonia_plant_opex: number, // undiscounted OPEX for h2 storage
    plant_year: number, // year X of operation
    discount_rate: number // discount rate
) {
  return ammonia_plant_opex / (1 + discount_rate) ** plant_year;
}

// should bre repeated for multiple years
function lcnh3(
    total_discounted_cash_flow_power_plant_capex: number, // discounted cash flow for power plant capex
    total_discounted_ammonia_produced: number // discounted ammonia produced
) {
  return (
      total_discounted_cash_flow_power_plant_capex /
      total_discounted_ammonia_produced
  );
}

function capex_cost(
    electrolyser_capex: number, // electrolyser capex
    h2_storage_capex: number, // h2 storage capex
    ammonia_plant_CAPEX: number, // ammonia plant capex
    power_plant_capex: number, // power plant cappex
    battery_capex: number, // battery capex
    additional_upfront_costs: number, // additional costs
    grid_connection_costs: number
) {
  return (
      electrolyser_capex +
      h2_storage_capex +
      +ammonia_plant_CAPEX +
      power_plant_capex +
      battery_capex +
      additional_upfront_costs +
      grid_connection_costs
  );
}

function epc_cost(
    electrolyser_epc: number,
    ammonia_plant_epc: number,
    power_plant_epc: number,
    battery_epc: number
) {
  return electrolyser_epc + ammonia_plant_epc + power_plant_epc + battery_epc;
}

function land_cost(
    electrolyser_land: number,
    ammonia_plant_land: number,
    power_plant_land: number,
    battery_land: number
) {
  return (
      electrolyser_land + ammonia_plant_land + power_plant_land + battery_land
  );
}

// repeated for multiple cells
function nh3_sales(
    nh3_produced_per_year: number, // ammonia produces in year X
    retail_price_of_ammonia: number, // sale price for ammonia
    plant_year: number, // year X of operation
    discount_rate: number
) {
  return (
      nh3_produced_per_year *
      1000 *
      retail_price_of_ammonia *
      (1 + discount_rate) ** plant_year
  );
}

// should be repeated for multiple cells
// MW
function generator_actual_power(
    total_nominal_power_plant_capacity: number, // total power plant size
    generator_capacity_factor: number[] // generator capacity factor
) {
  return generator_capacity_factor.map(
      (v: number) => total_nominal_power_plant_capacity * v
  );
}

// should be repeated for multiple cells
// MW
function electrolyser_actual_power(
    nominal_electrolyser_capacity: number, // electrolyser capacity
    generator_actual_power: number[], // generator actual power
    asu_nh3_actual_power: number[] // ASU/NH3 actual power
) {
  return generator_actual_power.map((_: number, i: number) =>
      generator_actual_power[i] - asu_nh3_actual_power[i] >
      nominal_electrolyser_capacity
          ? nominal_electrolyser_capacity
          : generator_actual_power[i] - asu_nh3_actual_power[i]
  );
}
// %
// should be repeated for multiple cells
function asu_nh3_capacity_factor(
    ammonia_power_demand: number, // ammonia power demand
    asu_power_demand: number, // asu power demand
    asu_nh3_actual_power: number // asu/nh3 actual power
) {
  return asu_nh3_actual_power / (ammonia_power_demand + asu_power_demand);
}

// should be repeated for multiple cells
function asu_nh3_actual_power(
    ammonia_power_demand: number, // ammonia power demand
    asu_power_demand: number, // asu power demand
    generator_actual_power: number[] // generator actual power
): number[] {
  return generator_actual_power.map((v: number) =>
      v > ammonia_power_demand + asu_power_demand
          ? ammonia_power_demand + asu_power_demand
          : v
  );
}
// MWh
// should be repeated for multiple cells
function excess_generation(
    generator_actual_power: number, // generator actual power MW
    electrolyser_actual_power: number, // electrolyser actual power MW
    asu_nh3_actual_power: number // asu nh3 acutal power
) {
  return (
      asu_nh3_actual_power - electrolyser_actual_power - generator_actual_power
  );
}

// %
// should be repeated for multiple cells
function asu_nh3_with_battery_cf(
    asu_nh3_capacity_factor: number,
    net_battery_flow: number
) {
  return asu_nh3_capacity_factor < 1 && net_battery_flow < 0
      ? asu_nh3_capacity_factor + (1 - asu_nh3_capacity_factor)
      : asu_nh3_capacity_factor;
}

// %
// should be repeated for multiple cells
function electrolyser_with_battery_capacity_factor(
    net_battery_flow: number[],
    electrolyser_actual_power: number[],
    asu_nh3_actual_power: number[],
    electrolyser_capacity_factor: number[],
    ammonia_power_demand: number,
    asu_power_demand: number,
    electrolyser_capacity: number,
    battery_efficiency: number
): number[] {
  return net_battery_flow.map((_: number, i: number) => {
    if (net_battery_flow[i] < 0) {
      return (
          electrolyser_actual_power[i] +
          -1 * net_battery_flow[i] * (1 - (1 - battery_efficiency) / 2) -
          (ammonia_power_demand + asu_power_demand - asu_nh3_actual_power[i]) /
          electrolyser_capacity
      );
    }

    return electrolyser_capacity_factor[i];
  });
}
// should be repeated for multiple cells
function excess_h2(
    mass_of_hydrogen: number[], // asu/nh3 cap factor // TODO type?
    hydrogen_output: number
) {
  return mass_of_hydrogen.map((v: number) =>
      v > (hydrogen_output / 24) * 1000 ? v - (hydrogen_output / 24) * 1000 : 0
  );
}

// should be repeated for multiple cells
function deficit_h2(
    mass_of_hydrogen: number[], // asu/nh3 cap factor // TODO type?
    hydrogen_output: number
) {
  return mass_of_hydrogen.map((v: number) =>
      v < (hydrogen_output / 24) * 1000 ? v - (hydrogen_output / 24) * 1000 : 0
  );
}

// should be repeated for multiple cells
function h2_to_nh3(
    mass_of_hydrogen: number[], // p20
    from_h2_storage: number[], // t20
    h2_store_balance: number[], // u20
    hydrogen_storage_capacity: number, // s1b26
    hydrogen_output: number, // s1b16
    ammonia_plant_minimum_turndown: number // s1b36
): number[] {
  return mass_of_hydrogen.map((_: number, i: number) => {
    if (mass_of_hydrogen[i] >= (hydrogen_output / 24) * 1000) {
      return (hydrogen_output / 24) * 1000;
    } else if (
        mass_of_hydrogen[i] + Math.abs(from_h2_storage[i]) <
        hydrogen_output * 1000 * ammonia_plant_minimum_turndown
    ) {
      return 0;
    } else if (
        mass_of_hydrogen[i] < (hydrogen_output / 24) * 1000 &&
        mass_of_hydrogen[i] > hydrogen_storage_capacity * 0.1
    ) {
      return mass_of_hydrogen[i] + Math.abs(from_h2_storage[i]);
    } else if (
        h2_store_balance[i] < hydrogen_storage_capacity * 0.1 &&
        mass_of_hydrogen[i] >
        hydrogen_output * 1000 * ammonia_plant_minimum_turndown
    ) {
      return mass_of_hydrogen[i];
    } else if (
        h2_store_balance[i] < hydrogen_storage_capacity * 0.1 &&
        mass_of_hydrogen[i] <
        (hydrogen_output / 24) * 1000 * ammonia_plant_minimum_turndown
    ) {
      return 0;
    }
    throw new Error("Unsupported calculation for h2 to nh3");
  });
}

// should be repeated for multiple cells
function asu_out(
    h2_to_nh3: number[], // v20
    hydrogen_output: number, // s1b16
    asu_capacity: number // s1b14
) {
  return h2_to_nh3.map((v: number) => {
    if (v === (hydrogen_output / 24) * 1000) {
      return (hydrogen_output / 24) * 1000;
    } else if (v < (hydrogen_output / 24) * 1000) {
      return (v / ((hydrogen_output / 24) * 1000)) * (asu_capacity / 24) * 1000;
    }
    throw new Error("Unsupported calculation for asu out");
  });
}

// should be repeated for multiple cells
function nh3_unit_out(
    asu_out: number[], // w20
    h2_to_nh3: number[] // v20
) {
  return asu_out.map((_: number, i: number) =>
      asu_out[i] > 0 ? h2_to_nh3[i] + asu_out[i] : 0
  );
}

// should be repeated for multiple cells
function nh3_unit_capacity_factor(
    nh3_unit_out: number[], // x20
    ammonia_plant_capacity: number, // s1b12
    hoursPerYear: number
) {
  return nh3_unit_out.map(
      (v: number) => v / (ammonia_plant_capacity * (1_000_000 / hoursPerYear))
  );
}

// should be repeated for multiple cells
function to_h2_storage(
    excess_h2: number[],
    h2_store_balance: number,
    hydrogen_storage_capacity: number
) {
  return excess_h2.map((_: number, i: number) => {
    if (i === 0) {
      return excess_h2[i] > 0 ? excess_h2[i] : 0;
    } else {
      return h2_store_balance + excess_h2[i] < hydrogen_storage_capacity &&
      excess_h2[i] > 0
          ? excess_h2
          : 0;
    }
  });
}

// should be repeated for multiple cells
function from_h2_storage(
    deficit_h2: number[],
    h2_store_balance: number,
    hydrogen_storage_capacity: number,
    minimum_hydrogen_storage_percentage: number
) {
  return deficit_h2.map((_: number, i: number) => {
    if (i === 0) {
      return deficit_h2[i] < 0 ? deficit_h2[i] : 0;
    } else {
      return h2_store_balance + deficit_h2[i] >
      hydrogen_storage_capacity * minimum_hydrogen_storage_percentage &&
      deficit_h2[i] < 0
          ? deficit_h2
          : 0;
    }
  });
}

function h2_storage_balance(
    deficit_h2: number[],
    excess_h2: number[],
    hydrogen_storage_capacity: number,
    minimum_hydrogen_storage_percentage: number
) {
  const size = deficit_h2.length;
  const h2_storage_balance_result = Array(size).fill(0);
  const from_h2_store = Array(size).fill(0);
  const to_h2_store = Array(size).fill(0);

  for (let i = 0; i < size; i++) {
    if (i === 0) {
      from_h2_store[i] = deficit_h2[i] < 0 ? deficit_h2[i] : 0;
      to_h2_store[i] = excess_h2[i] > 0 ? excess_h2[i] : 0;
      h2_storage_balance_result[i] =
          to_h2_store[i] + from_h2_store[i] + hydrogen_storage_capacity;
    } else {
      from_h2_store[i] =
          h2_storage_balance_result[i - 1] + deficit_h2[i] >
          hydrogen_storage_capacity * minimum_hydrogen_storage_percentage &&
          deficit_h2[i] < 0
              ? deficit_h2[i]
              : 0;
      to_h2_store[i] =
          h2_storage_balance_result[i - 1] + excess_h2[i] <
          hydrogen_storage_capacity && excess_h2[i] > 0
              ? excess_h2[i]
              : 0;
      h2_storage_balance_result[i] =
          to_h2_store[i] + from_h2_store[i] + h2_storage_balance_result[i - 1];
    }
  }
  return { from_h2_store, h2_storage_balance_result };
}
// will be used to calculate mass_of_hydrogen
function calculateGeneratorCapFactors(
    generatorCapFactor: number[], // calculated in hydrogen
    net_battery_flow: number[], // calculated in hydrogen
    electrolyserCapFactor: number[], // calculated in hydrogen
    // round trip efficiency from hydrogen raw input
    batteryEfficiency: number, // %
    total_nominal_power_plant_capacity: number,
    nominal_electrolyser_capacity: number,
    asu_power_demand: number,
    ammonia_plant_power_demand: number
): number[] {
  const generator_actual_power_result: number[] = generator_actual_power(
      total_nominal_power_plant_capacity,
      generatorCapFactor
  );

  const asu_nh3_actual_power_result: number[] = asu_nh3_actual_power(
      ammonia_plant_power_demand,
      asu_power_demand,
      generator_actual_power_result
  );

  const electrolyser_actual_power_result: number[] = electrolyser_actual_power(
      nominal_electrolyser_capacity,
      generator_actual_power_result,
      asu_nh3_actual_power_result
  );

  return electrolyser_with_battery_capacity_factor(
      net_battery_flow,
      electrolyser_actual_power_result,
      asu_nh3_actual_power_result,
      electrolyserCapFactor,
      ammonia_plant_power_demand,
      asu_power_demand,
      nominal_electrolyser_capacity,
      batteryEfficiency
  );
}

function calculateNH3CapFactors(
    mass_of_hydrogen: number[], // calculated in hydrogen
    // system sizing
    ammonia_plant_capacity: number, // raw input
    hydrogen_storage_capacity: number, // raw input
    // ammonia plant load range
    ammonia_plant_minimum_turndown: number, // raw input %
    // electrolyster and hydrogen storage paramteres
    // other operation factors
    minimum_hydrogen_storage: number, // %
    hydrogen_output: number,
    air_separation_unit_capacity: number,
    hoursPerYear: number
): number[] {
  const excess_h2_result = excess_h2(mass_of_hydrogen, hydrogen_output);
  const deficit_h2_result = deficit_h2(mass_of_hydrogen, hydrogen_output);

  const { from_h2_store, h2_storage_balance_result } = h2_storage_balance(
      deficit_h2_result,
      excess_h2_result,
      hydrogen_storage_capacity,
      minimum_hydrogen_storage / 100
  );
  const h2_to_nh3_result = h2_to_nh3(
      mass_of_hydrogen,
      from_h2_store,
      h2_storage_balance_result,
      hydrogen_storage_capacity,
      hydrogen_output,
      ammonia_plant_minimum_turndown
  );

  const asu_out_result = asu_out(
      h2_to_nh3_result,
      hydrogen_output,
      air_separation_unit_capacity
  );

  const nh3_unit_out_result = nh3_unit_out(asu_out_result, h2_to_nh3_result);
  return nh3_unit_capacity_factor(
      nh3_unit_out_result,
      ammonia_plant_capacity,
      hoursPerYear
  );
}
