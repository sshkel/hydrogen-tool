import {
  backCalculateElectrolyserCapacity,
  backCalculateInputFields,
  backCalculatePowerPlantCapacity,
} from "../components/charts/basic-calculations";
import {
  calculatePerYearOpex,
  getOpex,
  maxDegradationStackReplacementYears,
} from "../components/charts/opex-calculations";
import {
  InputConfiguration,
  Model,
  PowerCapacityConfiguration,
  PowerPlantConfiguration,
  PowerPlantType,
  PowerSupplyOption,
  StackReplacementType,
} from "../types";
import {mean} from "../utils";
import {CsvRow, ModelHourlyOperation, ModelSummaryPerYear, ProjectModelSummary,} from "./ModelTypes";
import {
  backCalculateSolarAndWindCapacities,
  calculateElectrolyserCapacityFactorsAndBatteryNetFlow,
  calculateHydrogenProduction,
  calculatePowerPlantCapacityFactors,
  calculateSummary, CumulativeDegradation, MaxDegradation,
} from "./ModelUtils";
import {HOURS_PER_YEAR,} from "./consts";

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

export class HydrogenModel implements Model {
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
  private readonly parameters: HydrogenData;
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

  // parameters to expose to working data
  electrolyserNominalCapacity: number;
  powerPlantNominalCapacity: number;


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
      let {calculatedSolarNominalCapacity, calculatedWindNominalCapacity} = backCalculateSolarAndWindCapacities(
          this.powerPlantOversizeRatio,
          this.electrolyserNominalCapacity,
          this.powerPlantType,
          this.parameters.solarToWindPercentage
      );
      this.solarNominalCapacity = calculatedSolarNominalCapacity;
      this.windNominalCapacity = calculatedWindNominalCapacity;
    }

    this.powerPlantNominalCapacity =
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


    let hourlyOperations = this.getHourlyOperations();

    const durationCurves = {
      "Power Plant Duration Curve": hourlyOperations.powerplantCapacityFactors,
      "Electrolyser Duration Curve": hourlyOperations.electrolyserCapacityFactors,
    };
    const hourlyCapFactors = {
      Electrolyser: hourlyOperations.electrolyserCapacityFactors,
      "Power Plant": hourlyOperations.powerplantCapacityFactors,
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
      const hourlyOperations = this.calculatePowerplantAndElectrolyserHourlyOperation(
          this.parameters.solarToWindPercentage / 100,
          1 - this.parameters.solarToWindPercentage / 100,
          this.powerPlantOversizeRatio,
          1
      );

      const hydrogenProduction = calculateHydrogenProduction(
          hourlyOperations.electrolyserCapacityFactors,
          this.hydOutput,
          0,
          this.specCons,
      );

      this.hourlyOperationsInYearOne = {
        powerplantCapacityFactors: hourlyOperations.powerplantCapacityFactors,
        electrolyserCapacityFactors: hourlyOperations.electrolyserCapacityFactors,
        hydrogenProduction,
        netBatteryFLow: hourlyOperations.netBatteryFLow
      };

      this.electrolyserNominalCapacity = backCalculateElectrolyserCapacity(
          this.parameters.projectScale,
          this.elecEff,
          mean(hourlyOperations.electrolyserCapacityFactors),
          this.hoursPerYear
      );
      this.powerPlantNominalCapacity = backCalculatePowerPlantCapacity(
          this.powerPlantOversizeRatio,
          this.electrolyserNominalCapacity
      );

      const operatingOutputs = calculateSummary(
          hourlyOperations.powerplantCapacityFactors,
          hourlyOperations.electrolyserCapacityFactors,
          hydrogenProduction,
          hourlyOperations.netBatteryFLow,
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

    // advanced input calculations
    const noDegradation = stackDegradation + solarDegradation + windDegradation === 0;

    if (noDegradation) {
      const year = 1;
      const hourlyOperation = this.calculatePowerplantAndElectrolyserHourlyOperation(
          this.solarNominalCapacity / this.powerPlantNominalCapacity,
          this.windNominalCapacity / this.powerPlantNominalCapacity,
          this.powerPlantNominalCapacity / this.electrolyserNominalCapacity,
          year
      );

      const hydrogenProduction = calculateHydrogenProduction(
          hourlyOperation.electrolyserCapacityFactors,
          this.hydOutput,
          0,
          this.specCons,
      );

      this.hourlyOperationsInYearOne = {...hourlyOperation, hydrogenProduction};
      const operatingOutputs = calculateSummary(
          hourlyOperation.powerplantCapacityFactors,
          hourlyOperation.electrolyserCapacityFactors,
          hydrogenProduction,
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

    const projectSummary = this.calculateHydrogenModelWithDegradation(projectTimeline);
    return projectSummary

  }

  /**
   * NOTE: This must be called after #calculateHydrogenModel to be properly populated
   * @returns hourly operations for first year of project life
   */
  getHourlyOperations(): ModelHourlyOperation {
    return this.hourlyOperationsInYearOne;
  }

  private calculateHydrogenModelWithDegradation(
      projectTimeline: number
  ): ProjectModelSummary {

    let year = 1;
    // Calculate first year separately
    const hourlyOperation =
        this.calculatePowerplantAndElectrolyserHourlyOperation(
            this.solarNominalCapacity / this.powerPlantNominalCapacity,
            this.windNominalCapacity / this.powerPlantNominalCapacity,
            this.powerPlantNominalCapacity / this.electrolyserNominalCapacity,
            year
        );

    let degradationCalculator;
    if (this.parameters.stackReplacementType === "Maximum Degradation Level") {
      degradationCalculator = new MaxDegradation(this.parameters.stackDegradation, this.parameters.maximumDegradationBeforeReplacement, projectTimeline)
    } else {
      degradationCalculator = new CumulativeDegradation(this.parameters.stackDegradation, this.parameters.stackLifetime)
    }
    const yearlyDegradationRate = degradationCalculator.getStackDegradation(year, hourlyOperation.electrolyserCapacityFactors)

    const hydrogenProduction = calculateHydrogenProduction(
        hourlyOperation.electrolyserCapacityFactors,
        this.hydOutput,
        yearlyDegradationRate,
        this.specCons,
    );
    this.hourlyOperationsInYearOne = {...hourlyOperation, hydrogenProduction};
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
    const operatingOutputs = calculateElectrolyserOutput({...hourlyOperation, hydrogenProduction});

    let modelSummaryPerYear: ModelSummaryPerYear[] = [];
    modelSummaryPerYear.push(operatingOutputs);

    for (year = 2; year <= projectTimeline; year++) {
      const hourlyOperationsByYear =
          this.calculatePowerplantAndElectrolyserHourlyOperation(
              this.solarNominalCapacity / this.powerPlantNominalCapacity,
              this.windNominalCapacity / this.powerPlantNominalCapacity,
              this.powerPlantNominalCapacity / this.electrolyserNominalCapacity,
              year
          );
      const yearlyDegradationRate = degradationCalculator.getStackDegradation(year, hourlyOperationsByYear.electrolyserCapacityFactors)

      const hydrogenProduction = calculateHydrogenProduction(
          hourlyOperationsByYear.electrolyserCapacityFactors,
          this.hydOutput,
          yearlyDegradationRate,
          this.specCons,
      );
      modelSummaryPerYear.push(
          calculateElectrolyserOutput({...hourlyOperationsByYear, hydrogenProduction})
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

  private calculatePowerplantAndElectrolyserHourlyOperation(
      solarRatio: number,
      windRatio: number,
      oversizeRatio: number,
      year: number
  ): ModelHourlyOperation {
    const powerplantCapacityFactors = calculatePowerPlantCapacityFactors(
        this.solarData,
        this.windData,
        solarRatio,
        windRatio,
        this.parameters.location,
        this.parameters.solarDegradation,
        this.parameters.windDegradation,
        year
    );
    const {electrolyserCapacityFactors, netBatteryFLow} = calculateElectrolyserCapacityFactorsAndBatteryNetFlow(
        powerplantCapacityFactors,
        this.hoursPerYear,
        oversizeRatio,
        this.electrolyserNominalCapacity,
        this.elecMaxLoad,
        this.elecMinLoad,
        this.elecOverload,
        this.parameters.timeBetweenOverloading,
        this.batteryEnergy,
        this.batteryStorageDuration,
        this.batteryEfficiency,
        this.batteryRatedPower,
        this.battMin,
    );

    return {
      powerplantCapacityFactors,
      electrolyserCapacityFactors,
      netBatteryFLow
    };
  }
}
