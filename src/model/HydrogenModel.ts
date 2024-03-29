import {
  InputConfiguration,
  Model,
  PowerCapacityConfiguration,
  PowerPlantConfiguration,
  PowerPlantType,
  PowerSupplyOption,
  StackReplacementType,
} from "../types";
import { isOffshore, isSolar, isWind, mean, projectYears } from "../utils";
import {
  CsvRow,
  ModelHourlyOperation,
  ProjectModelSummary,
} from "./ModelTypes";
import {
  CumulativeDegradation,
  MaxDegradation,
  backCalculateSolarAndWindCapacities,
  calculateElectrolyserCapacityFactors,
  calculateHydrogenProduction,
  calculateNetBatteryFlow,
  calculateOverloadingModel,
  calculatePowerPlantCapacityFactors,
  calculateSnapshotForYear,
  getBatteryLosses,
  getElectrolyserCapacityFactorsWithBattery,
  getExcessGeneration,
} from "./ModelUtils";
import {
  backCalculateElectrolyserCapacity,
  backCalculateSolarnAndWindNominalCapacities,
} from "./basic-calculations";
import { getCapex, getEpcCosts } from "./capex-calculations";
import { HOURS_PER_YEAR } from "./consts";
import {
  calculateH2ProductionLC,
  roundToNearestInteger,
  roundToTwoDP,
} from "./cost-functions";
import { generateLCBreakdown } from "./lch2-calculations";
import {
  calculatePerYearOpex,
  getOpex,
  getTotalHydrogenOpex,
} from "./opex-calculations";

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
  private readonly mwToKw = 1000; // kW/MW
  private readonly kgToTonne = 1 / 1000;
  private readonly h2VolToMass = 0.089; // kg/m3

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
  // data from renewables
  private readonly solarData: CsvRow[];
  private readonly windData: CsvRow[];
  // calculated based on number of CSV rows
  private readonly hoursPerYear: number;
  private readonly specCons: number;

  constructor(
    parameters: HydrogenData,
    solarData: CsvRow[],
    windData: CsvRow[]
  ) {
    this.parameters = parameters;

    this.additionalTransmissionCharges =
      parameters.additionalTransmissionCharges ?? 0;
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

    // Loaded data
    this.solarData = solarData;
    this.windData = windData;
    this.hoursPerYear = solarData.length || HOURS_PER_YEAR;

    this.elecMaxLoad = parameters.electrolyserMaximumLoad / 100;
    this.elecMinLoad = parameters.electrolyserMinimumLoad / 100;
    this.elecEff = this.electrolyserEfficiency / 100;
    this.hydOutput = this.h2VolToMass * this.mwToKw * this.elecEff; // kg.kWh/m3.MWh
    this.elecOverload = parameters.maximumLoadWhenOverloading / 100;
    this.batteryEnergy = this.batteryRatedPower * this.batteryStorageDuration;
    this.batteryEfficiency = parameters.batteryEfficiency / 100;
    this.battMin = this.batteryMinCharge / 100;
    this.specCons = this.secAtNominalLoad * this.h2VolToMass;
    this.discountRate = this.parameters.discountRate / 100;
  }

  produceResults() {
    const {
      powerPlantType,
      solarNominalCapacity,
      windNominalCapacity,
      electrolyserNominalCapacity,
      powerPlantCapacityFactors,
      electrolyserCapacityFactors,
      electricityConsumed,
      electricityProduced,
      electricityConsumedByBattery,
      hydrogenProduction,
      ratedCapacityTime,
      totalOperatingTime,
      hourlyOperations,
    } = this.calculateHydrogenModel(this.parameters.projectTimeline);

    const powerPlantNominalCapacity =
      solarNominalCapacity + windNominalCapacity;
    const durationCurves = {
      "Power Plant Duration Curve": hourlyOperations.powerplantCapacityFactors,
      "Electrolyser Duration Curve":
        hourlyOperations.electrolyserCapacityFactors,
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
      electrolyserNominalCapacity,
      this.parameters.electrolyserReferenceCapacity,
      this.parameters.electrolyserPurchaseCost,
      this.parameters.electrolyserCostReductionWithScale,
      this.parameters.electrolyserReferenceFoldIncrease,
      powerPlantType,
      solarNominalCapacity,
      this.parameters.solarReferenceCapacity,
      this.parameters.solarFarmBuildCost,
      this.parameters.solarPVCostReductionWithScale,
      this.parameters.solarReferenceFoldIncrease,
      windNominalCapacity,
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
    const totalEpcCost =
      electrolyserEpcCost + powerPlantEpcCost + batteryEpcCost;
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

    const totalOperatingHours: number[] = totalOperatingTime.map(
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
      powerPlantType,
      this.solarOpex,
      solarNominalCapacity,
      this.windOpex,
      windNominalCapacity,
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
      hydrogenProduction
    );

    const totalOpex = getTotalHydrogenOpex(
      this.parameters.projectTimeline,
      electrolyserOpexCost,
      powerPlantOpexCost,
      batteryOpexCost,
      electricityOpexCost,
      waterOpexCost,
      gridConnectionOpexPerYear,
      this.parameters.additionalAnnualCosts,
      stackReplacementCostsOverProjectLife,
      batteryReplacementCostsOverProjectLife
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

    const { lch2, hydrogenProductionCost } = calculateH2ProductionLC(
      totalCapexCost,
      totalEpcCost,
      totalLandCost,
      this.parameters.projectTimeline,
      this.discountRate,
      totalOpex,
      hydrogenProduction
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

    const lcBreakdownData: { [key: string]: number } = {
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
        mean(powerPlantCapacityFactors.map((x) => x * 100))
      ),

      "Time Electrolyser is at its Maximum Capacity": roundToTwoDP(
        mean(ratedCapacityTime.map((x) => x * 100))
      ),
      "Total Time Electrolyser is Operating": roundToTwoDP(
        mean(totalOperatingTime.map((x) => x * 100))
      ),

      "Electrolyser Capacity Factor": roundToTwoDP(
        mean(electrolyserCapacityFactors.map((x) => x * 100))
      ),

      "Energy Consumed by Electrolyser": roundToNearestInteger(
        mean(electricityConsumed)
      ),

      "Excess Energy Not Utilised by Electrolyser": roundToNearestInteger(
        mean(electricityProduced)
      ),

      "Hydrogen Output": roundToNearestInteger(mean(hydrogenProduction)),
      "Levelised Cost of Hydrogen (LCH2)": roundToTwoDP(lch2),
    };

    return {
      electrolyserNominalCapacity,
      powerPlantNominalCapacity,
      durationCurves,
      hourlyCapFactors,
      indirectCostBreakdown,
      capitalCostBreakdown,
      operatingCosts,
      lcBreakdownData,
      summaryTableData,
    };
  }

  calculateHydrogenModel(projectTimeline: number) {
    const {
      stackDegradation,
      solarDegradation,
      windDegradation,
      inputConfiguration,
    } = this.parameters;

    if (inputConfiguration === "Basic") {
      const solarToWindRatio = isOffshore(this.parameters.location)
        ? 0
        : this.parameters.solarToWindPercentage / 100;
      const hourlyOperations =
        this.calculatePowerplantAndElectrolyserHourlyOperation(
          solarToWindRatio,
          1 - solarToWindRatio,
          this.parameters.powerPlantOversizeRatio,
          // default for the first calculation
          1,
          1
        );

      const hydrogenProduction = calculateHydrogenProduction(
        hourlyOperations.electrolyserCapacityFactors,
        this.hydOutput,
        0,
        this.specCons
      );

      const hourlyOperationsInYearOne: ModelHourlyOperation = {
        powerplantCapacityFactors: hourlyOperations.powerplantCapacityFactors,
        electrolyserCapacityFactors:
          hourlyOperations.electrolyserCapacityFactors,
        hydrogenProduction,
        netBatteryFlow: hourlyOperations.netBatteryFlow,
      };

      const electrolyserNominalCapacity = backCalculateElectrolyserCapacity(
        this.parameters.projectScale,
        this.elecEff,
        mean(hourlyOperations.electrolyserCapacityFactors),
        this.hoursPerYear,
        this.secAtNominalLoad
      );

      const { powerPlantOversizeRatio = 1, solarToWindPercentage = 0 } =
        this.parameters;
      // back calcualte power plant type from the percentages.
      // Default to hybrid
      let powerPlantType: PowerPlantType = "Hybrid";
      if (solarToWindPercentage === 100) {
        powerPlantType = "Solar";
      }

      if (solarToWindPercentage === 0) {
        powerPlantType = "Wind";
      }
      const result = backCalculateSolarnAndWindNominalCapacities(
        powerPlantOversizeRatio,
        solarToWindPercentage,
        electrolyserNominalCapacity
      );

      const powerPlantNominalCapacity =
        result.solarNominalCapacity + result.windNominalCapacity;

      const operatingOutputs = calculateSnapshotForYear(
        hourlyOperations.powerplantCapacityFactors,
        hourlyOperations.electrolyserCapacityFactors,
        hydrogenProduction,
        hourlyOperations.netBatteryFlow,
        electrolyserNominalCapacity,
        powerPlantNominalCapacity,
        this.kgToTonne,
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
        projectSummary[key as keyof ProjectModelSummary] = Array(
          projectTimeline
        ).fill(operatingOutputs[key]);
      });

      return {
        powerPlantType: powerPlantType,
        solarNominalCapacity: result.solarNominalCapacity,
        windNominalCapacity: result.windNominalCapacity,
        electrolyserNominalCapacity: electrolyserNominalCapacity,
        hourlyOperations: hourlyOperationsInYearOne,
        ...projectSummary,
      };
    } else if (inputConfiguration === "Advanced") {
      let windNominalCapacity: number;
      let solarNominalCapacity: number;

      if (this.parameters.powerCapacityConfiguration === "Oversize Ratio") {
        // Generate solar and wind nominal capacitues from oversize ratios
        let { calculatedSolarNominalCapacity, calculatedWindNominalCapacity } =
          backCalculateSolarAndWindCapacities(
            this.parameters.powerPlantOversizeRatio,
            this.parameters.electrolyserNominalCapacity,
            this.parameters.powerPlantType,
            this.parameters.solarToWindPercentage
          );
        solarNominalCapacity = calculatedSolarNominalCapacity;
        windNominalCapacity = calculatedWindNominalCapacity;
      } else if (
        this.parameters.powerCapacityConfiguration === "Nominal Capacity"
      ) {
        solarNominalCapacity = !isSolar(this.parameters.powerPlantType)
          ? 0
          : this.parameters.solarNominalCapacity;
        windNominalCapacity = !isWind(this.parameters.powerPlantType)
          ? 0
          : this.parameters.windNominalCapacity;
      } else {
        throw new Error(
          "Unknown powerCapacityConfiguration: " +
            this.parameters.powerCapacityConfiguration
        );
      }

      if (isOffshore(this.parameters.location)) {
        if (solarNominalCapacity !== 0) {
          throw new Error(
            "Solar nominal capacity should be zero for offshore locations. Current value:" +
              solarNominalCapacity
          );
        }
      }

      const powerPlantNominalCapacity =
        solarNominalCapacity + windNominalCapacity;
      const powerPlantOversizeRatio =
        (solarNominalCapacity + windNominalCapacity) /
        this.parameters.electrolyserNominalCapacity;

      const noDegradation =
        stackDegradation + solarDegradation + windDegradation === 0;
      if (noDegradation) {
        const year = 1;
        const hourlyOperation =
          this.calculatePowerplantAndElectrolyserHourlyOperation(
            solarNominalCapacity / powerPlantNominalCapacity,
            windNominalCapacity / powerPlantNominalCapacity,
            powerPlantOversizeRatio,
            this.parameters.electrolyserNominalCapacity,
            year
          );

        const hydrogenProduction = calculateHydrogenProduction(
          hourlyOperation.electrolyserCapacityFactors,
          this.hydOutput,
          0,
          this.specCons
        );

        const hourlyOperationsInYearOne: ModelHourlyOperation = {
          ...hourlyOperation,
          hydrogenProduction,
        };
        const operatingOutputs = calculateSnapshotForYear(
          hourlyOperation.powerplantCapacityFactors,
          hourlyOperation.electrolyserCapacityFactors,
          hydrogenProduction,
          hourlyOperation.netBatteryFlow,
          this.parameters.electrolyserNominalCapacity,
          powerPlantNominalCapacity,
          this.kgToTonne,
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
          projectSummary[key as keyof ProjectModelSummary] = Array(
            projectTimeline
          ).fill(operatingOutputs[key]);
        });
        return {
          powerPlantType: this.parameters.powerPlantType,
          solarNominalCapacity: solarNominalCapacity,
          windNominalCapacity: windNominalCapacity,
          electrolyserNominalCapacity:
            this.parameters.electrolyserNominalCapacity,
          hourlyOperations: hourlyOperationsInYearOne,
          ...projectSummary,
        };
      }

      // Advanced model with degradation
      let degradationCalculator: MaxDegradation | CumulativeDegradation;
      if (
        this.parameters.stackReplacementType === "Maximum Degradation Level"
      ) {
        degradationCalculator = new MaxDegradation(
          this.parameters.stackDegradation,
          this.parameters.maximumDegradationBeforeReplacement,
          projectTimeline
        );
      } else {
        degradationCalculator = new CumulativeDegradation(
          this.parameters.stackDegradation,
          this.parameters.stackLifetime
        );
      }

      const calculateElectrolyserOutput = (
        hourlyOperation: ModelHourlyOperation
      ) => {
        return calculateSnapshotForYear(
          hourlyOperation.powerplantCapacityFactors,
          hourlyOperation.electrolyserCapacityFactors,
          hourlyOperation.hydrogenProduction,
          hourlyOperation.netBatteryFlow,
          this.parameters.electrolyserNominalCapacity,
          powerPlantNominalCapacity,
          this.kgToTonne,
          this.hoursPerYear,
          this.elecMaxLoad,
          this.batteryEfficiency
        );
      };

      const capFactorsByYear = projectYears(projectTimeline).map(
        (year: number) => {
          const hourlyOperation =
            this.calculatePowerplantAndElectrolyserHourlyOperation(
              solarNominalCapacity / powerPlantNominalCapacity,
              windNominalCapacity / powerPlantNominalCapacity,
              powerPlantOversizeRatio,
              this.parameters.electrolyserNominalCapacity,
              year
            );
          const yearlyDegradationRate =
            degradationCalculator.getStackDegradation(
              year,
              hourlyOperation.electrolyserCapacityFactors
            );
          const hydrogenProduction = calculateHydrogenProduction(
            hourlyOperation.electrolyserCapacityFactors,
            this.hydOutput,
            yearlyDegradationRate,
            this.specCons
          );
          return { ...hourlyOperation, hydrogenProduction };
        }
      );

      const hourlyOperationsInYearOne: ModelHourlyOperation =
        capFactorsByYear[0];

      const modelSummaryPerYear = capFactorsByYear.map((value) => {
        return calculateElectrolyserOutput(value);
      });

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
          projectSummary[key as keyof ProjectModelSummary].push(
            yearSummary[key]
          );
        });
      });

      return {
        powerPlantType: this.parameters.powerPlantType,
        solarNominalCapacity: solarNominalCapacity,
        windNominalCapacity: windNominalCapacity,
        electrolyserNominalCapacity:
          this.parameters.electrolyserNominalCapacity,
        hourlyOperations: hourlyOperationsInYearOne,
        ...projectSummary,
      };
    } else {
      throw new Error("Unknown inputConfiguration: " + inputConfiguration);
    }
  }

  private calculatePowerplantAndElectrolyserHourlyOperation(
    solarRatio: number,
    windRatio: number,
    oversizeRatio: number,
    electrolyserNominalCapacity: number,
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

    // normal electrolyser calculation
    let electrolyserCapacityFactors = calculateElectrolyserCapacityFactors(
      oversizeRatio,
      this.elecMaxLoad,
      this.elecMinLoad,
      powerplantCapacityFactors
    );

    // overload calculation
    if (
      this.elecOverload > this.elecMaxLoad &&
      this.parameters.timeBetweenOverloading > 0
    ) {
      electrolyserCapacityFactors = calculateOverloadingModel(
        oversizeRatio,
        this.elecMaxLoad,
        this.parameters.timeBetweenOverloading,
        this.elecOverload,
        powerplantCapacityFactors,
        electrolyserCapacityFactors
      );
    }

    let netBatteryFlow: number[] = new Array(this.hoursPerYear).fill(0);
    // // battery model calc
    if (this.batteryEnergy > 0) {
      const hours = [1, 2, 4, 8];
      if (!hours.includes(this.batteryStorageDuration)) {
        throw new Error(
          `Battery storage length not valid. Please enter one of 1, 2, 4 or 8. Current value is ${this.batteryStorageDuration}`
        );
      }
      const excessGeneration = getExcessGeneration(
        powerplantCapacityFactors,
        oversizeRatio,
        electrolyserCapacityFactors,
        electrolyserNominalCapacity
      );
      const batteryLosses = getBatteryLosses(this.batteryEfficiency);
      netBatteryFlow = calculateNetBatteryFlow(
        oversizeRatio,
        electrolyserNominalCapacity,
        excessGeneration,
        electrolyserCapacityFactors,
        this.elecMinLoad,
        this.elecMaxLoad,
        this.batteryRatedPower,
        this.batteryEnergy,
        this.battMin,
        batteryLosses
      );
      // recalculate electrolyser capacity factors using battery model
      electrolyserCapacityFactors = getElectrolyserCapacityFactorsWithBattery(
        netBatteryFlow,
        electrolyserCapacityFactors,
        batteryLosses,
        excessGeneration,
        electrolyserNominalCapacity
      );
    }

    return {
      powerplantCapacityFactors,
      electrolyserCapacityFactors,
      netBatteryFlow,
    };
  }
}
