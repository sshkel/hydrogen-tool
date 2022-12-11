import {
  backCalculateElectrolyserCapacity,
  backCalculateSolarnAndWindNominalCapacities,
} from "../components/charts/basic-calculations";
import { getCapex, getEpcCosts } from "../components/charts/capex-calculations";
import {
  roundToNearestInteger,
  roundToTwoDP,
  sales,
} from "../components/charts/cost-functions";
import { generateLCBreakdown } from "../components/charts/lch2-calculations";
import {
  calculatePerYearOpex,
  getOpex,
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
import { mean, projectYears } from "../utils";
import {
  CsvRow,
  ModelHourlyOperation,
  ProjectModelSummary,
} from "./ModelTypes";
import {
  CumulativeDegradation,
  MaxDegradation,
  calculateElectrolyserCapacityFactorsAndBatteryNetFlow,
  calculateHydrogenProduction,
  calculatePowerPlantCapacityFactors,
  calculateSummary,
} from "./ModelUtils";
import { HOURS_PER_YEAR } from "./consts";

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
  windOpex: number | undefined;
  windReferenceCapacity: number;
  windReferenceFoldIncrease: number;

  //Ammonia
  ammoniaPlantCapacity: number; // raw input done
  ammoniaStorageCapacity: number;
  electrolyserSystemOversizing: number; // raw input %

  ammoniaPlantSec: number; // raw input
  asuSec: number; // raw input
  hydrogenStorageCapacity: number; // raw input

  ammoniaPlantMinimumTurndown: number; // raw input %
  // electrolyster and hydrogen storage paramteres
  // other operation factors
  minimumHydrogenStorage: number;
  // operating costs
  ammoniaSynthesisUnitCost: number;
  ammoniaStorageCost: number;
  airSeparationUnitCost: number;
  ammoniaEpcCosts: number;
  ammoniaLandProcurementCosts: number;
  ammoniaPlantOMCost: number;
  ammoniaStorageOMCost: number;
  asuPlantOMCost: number;
  hydrogenStoragePurchaseCost: number;
};

export class AmmoniaModel implements Model {
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
  private readonly parameters: AmmoniaData;
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
    parameters: AmmoniaData,
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
    this.hoursPerYear = solarData.length;

    this.elecMaxLoad = parameters.electrolyserMaximumLoad / 100;
    this.elecMinLoad = parameters.electrolyserMinimumLoad / 100;
    this.elecEff = this.electrolyserEfficiency / 100;
    // TODO check if this should be replaced by the other calculation.
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
      airSeparationUnitCapacity,
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
      "Ammonia Duration Curve": hourlyOperations.ammoniaCapacityFactors,
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

    const ammoniaCapex = ammonia_plant_CAPEX(this.parameters.ammoniaPlantCapacity, this.parameters.ammoniaStorageCapacity, airSeparationUnitCapacity, this.parameters.ammoniaSynthesisUnitCost, this.parameters.ammoniaStorageCost,
        this.parameters.airSeparationUnitCost)
    const h2StorageCapex = hydrogen_storage_CAPEX(this.parameters.hydrogenStorageCapacity, this.parameters.hydrogenStoragePurchaseCost);
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

    const ammoniaEpcCost = ammonia_plant_epc(this.parameters.ammoniaEpcCosts, ammoniaCapex)
    const ammoniaLandCost = ammonia_plant_land_procurement_cost(this.parameters.ammoniaLandProcurementCosts, ammoniaCapex)
    const indirectCostBreakdown = {
      "Ammonia EPC": ammoniaEpcCost,
      "Ammonia Land Cost": ammoniaLandCost,
      "Electrolyser EPC": electrolyserEpcCost,
      "Electrolyser Land": electrolyserLandCost,
      "Power Plant EPC": powerPlantEpcCost,
      "Power Plant Land": powerPlantLandCost,
      "Battery EPC": batteryEpcCost,
      "Battery Land": batteryLandCost,
    };

    const totalCapexCost =
        ammoniaCapex +
        h2StorageCapex +
        electrolyserCAPEX +
        powerPlantCAPEX +
        batteryCAPEX +
        this.parameters.additionalUpfrontCosts +
        gridConnectionCAPEX; // Cost values for sales calculation
    const totalEpcCost =
        ammoniaEpcCost + electrolyserEpcCost + powerPlantEpcCost + batteryEpcCost;
    const totalLandCost =
        ammoniaLandCost + electrolyserLandCost + powerPlantLandCost + batteryLandCost;
    const totalIndirectCosts =
        ammoniaLandCost +
        ammoniaEpcCost +
        electrolyserEpcCost +
        electrolyserLandCost +
        powerPlantEpcCost +
        powerPlantLandCost;

    const capitalCostBreakdown = {
      "Ammonia": ammoniaCapex,
      "H2 Storage": h2StorageCapex,
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
      hydrogenProduction,
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

    const { lch2, hydrogenProductionCost } = sales(
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
        mean(powerPlantCapacityFactors.map((x) => x * 100))
      ),

      "Time Electrolyser is at its Maximum Capacity (% of hrs/yr)":
        roundToTwoDP(mean(ratedCapacityTime.map((x) => x * 100))),
      "Total Time Electrolyser is Operating (% of hrs/yr)": roundToTwoDP(
        mean(totalOperatingTime.map((x) => x * 100))
      ),

      "Electrolyser Capacity Factor": roundToTwoDP(
        mean(electrolyserCapacityFactors.map((x) => x * 100))
      ),

      "Energy Consumed by Electrolyser (MWh/yr)": roundToNearestInteger(
        mean(electricityConsumed)
      ),

      "Excess Energy Not Utilised by Electrolyser (MWh/yr)":
        roundToNearestInteger(mean(electricityProduced)),

      "Hydrogen Output (t/yr)": roundToNearestInteger(mean(hydrogenProduction)),
      "LCH2 ($/kg)": roundToTwoDP(lch2),
    };

    return {
      electrolyserNominalCapacity,
      powerPlantNominalCapacity,
      durationCurves,
      hourlyCapFactors,
      indirectCostBreakdown,
      capitalCostBreakdown,
      operatingCosts,
      lch2BreakdownData,
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
    const airSeparationUnitCapacity = air_separation_unit_capacity(
      this.parameters.ammoniaPlantCapacity
    );
    const hydrogenOutput = hydrogen_output(
      this.parameters.ammoniaPlantCapacity
    );

    if (inputConfiguration === "Basic") {
      const hourlyOperations =
        this.calculatePowerplantAndElectrolyserHourlyOperation(
          this.parameters.solarToWindPercentage / 100,
          1 - this.parameters.solarToWindPercentage / 100,
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

      const ammoniaCapacityFactors = calculateNH3CapFactors(
          hydrogenProduction,
          this.parameters.ammoniaPlantCapacity,
          this.parameters.hydrogenStorageCapacity,
          this.parameters.ammoniaPlantMinimumTurndown / 100,
          this.parameters.minimumHydrogenStorage / 100,
          hydrogenOutput,
          airSeparationUnitCapacity,
          this.hoursPerYear
      );

      const hourlyOperationsInYearOne: ModelHourlyOperation = {
        powerplantCapacityFactors: hourlyOperations.powerplantCapacityFactors,
        electrolyserCapacityFactors:
          hourlyOperations.electrolyserCapacityFactors,
        hydrogenProduction,
        netBatteryFlow: hourlyOperations.netBatteryFlow,
        ammoniaCapacityFactors,
      };

      const electrolyserNominalCapacity = backCalculateElectrolyserCapacity(
        this.parameters.projectScale,
        this.elecEff,
        mean(hourlyOperations.electrolyserCapacityFactors),
        this.hoursPerYear
      );

      const { powerPlantOversizeRatio = 1, solarToWindPercentage = 100 } =
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

      const operatingOutputs = calculateSummary(
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
        airSeparationUnitCapacity,
        powerPlantType: powerPlantType,
        solarNominalCapacity: result.solarNominalCapacity,
        windNominalCapacity: result.windNominalCapacity,
        electrolyserNominalCapacity: electrolyserNominalCapacity,
        hourlyOperations: hourlyOperationsInYearOne,
        ...projectSummary,
      };
    } else if (inputConfiguration === "Advanced") {
      // ammonia
      const ammoniaPlantPowerDemand = ammonia_plant_power_demand(
        this.parameters.ammoniaPlantCapacity,
        this.parameters.ammoniaPlantSec,
        this.hoursPerYear
      );

      const airSeparationUnitPowerDemand = air_separation_unit_power_demand(
        airSeparationUnitCapacity,
        this.parameters.asuSec
      );

      const electrolyserNominalCapacity = nominal_electrolyser_capacity(
        hydrogenOutput,
        this.secAtNominalLoad,
        this.parameters.electrolyserSystemOversizing / 100
      );

      const solarNominalCapacity = nominal_solar_capacity(
        ammoniaPlantPowerDemand,
        airSeparationUnitPowerDemand,
        electrolyserNominalCapacity,
        this.parameters.solarToWindPercentage / 100,
        this.parameters.powerPlantOversizeRatio
      );
      const windNominalCapacity = nominal_wind_capacity(
        ammoniaPlantPowerDemand,
        airSeparationUnitPowerDemand,
        electrolyserNominalCapacity,
        1 - this.parameters.solarToWindPercentage / 100,
        this.parameters.powerPlantOversizeRatio
      );

      const powerPlantNominalCapacity =
        solarNominalCapacity + windNominalCapacity;

      const noDegradation =
        stackDegradation + solarDegradation + windDegradation === 0;
      if (noDegradation) {
        const year = 1;
        let {
          powerplantCapacityFactors,
          electrolyserCapacityFactors,
          netBatteryFlow,
        } = this.calculatePowerplantAndElectrolyserHourlyOperation(
          solarNominalCapacity / powerPlantNominalCapacity,
          windNominalCapacity / powerPlantNominalCapacity,
          this.parameters.powerPlantOversizeRatio,
          electrolyserNominalCapacity,
          year
        );
        electrolyserCapacityFactors =
          calculateAmmoniaElectrolyserCapacityFactors(
            powerplantCapacityFactors,
            netBatteryFlow,
            electrolyserCapacityFactors,
            this.batteryEfficiency,
            powerPlantNominalCapacity,
            electrolyserNominalCapacity,
            airSeparationUnitPowerDemand,
            ammoniaPlantPowerDemand
          );

        const hydrogenProduction = calculateHydrogenProduction(
          electrolyserCapacityFactors,
          this.hydOutput,
          0,
          this.specCons
        );

        const ammoniaCapacityFactors = calculateNH3CapFactors(
            hydrogenProduction,
            this.parameters.ammoniaPlantCapacity,
            this.parameters.hydrogenStorageCapacity,
            this.parameters.ammoniaPlantMinimumTurndown / 100,
            this.parameters.minimumHydrogenStorage / 100,
            hydrogenOutput,
            airSeparationUnitCapacity,
            this.hoursPerYear
        );

        const hourlyOperationsInYearOne: ModelHourlyOperation = {
          powerplantCapacityFactors,
          electrolyserCapacityFactors,
          netBatteryFlow,
          hydrogenProduction,
          ammoniaCapacityFactors,
        };
        const operatingOutputs = calculateSummary(
          powerplantCapacityFactors,
          electrolyserCapacityFactors,
          hydrogenProduction,
          netBatteryFlow,
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
        Object.keys(projectSummary).forEach((key) => {
          projectSummary[key as keyof ProjectModelSummary] = Array(
            projectTimeline
          ).fill(operatingOutputs[key]);
        });
        return {
          airSeparationUnitCapacity,
          powerPlantType: this.parameters.powerPlantType,
          solarNominalCapacity: solarNominalCapacity,
          windNominalCapacity: windNominalCapacity,
          electrolyserNominalCapacity: electrolyserNominalCapacity,
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
        return calculateSummary(
          hourlyOperation.powerplantCapacityFactors,
          hourlyOperation.electrolyserCapacityFactors,
          hourlyOperation.hydrogenProduction,
          hourlyOperation.netBatteryFlow,
          electrolyserNominalCapacity,
          powerPlantNominalCapacity,
          this.kgToTonne,
          this.hoursPerYear,
          this.elecMaxLoad,
          this.batteryEfficiency
        );
      };

      const capFactorsByYear = projectYears(projectTimeline).map(
        (year: number) => {
          let {
            powerplantCapacityFactors,
            electrolyserCapacityFactors,
            netBatteryFlow,
          } = this.calculatePowerplantAndElectrolyserHourlyOperation(
            solarNominalCapacity / powerPlantNominalCapacity,
            windNominalCapacity / powerPlantNominalCapacity,
            this.parameters.powerPlantOversizeRatio,
            electrolyserNominalCapacity,
            year
          );

          electrolyserCapacityFactors =
            calculateAmmoniaElectrolyserCapacityFactors(
              powerplantCapacityFactors,
              netBatteryFlow,
              electrolyserCapacityFactors,
              this.batteryEfficiency,
              powerPlantNominalCapacity,
              electrolyserNominalCapacity,
              airSeparationUnitPowerDemand,
              ammoniaPlantPowerDemand
            );

          const yearlyDegradationRate =
            degradationCalculator.getStackDegradation(
              year,
              electrolyserCapacityFactors
            );
          const hydrogenProduction = calculateHydrogenProduction(
            electrolyserCapacityFactors,
            this.hydOutput,
            yearlyDegradationRate,
            this.specCons
          );
          const ammoniaCapacityFactors = calculateNH3CapFactors(
              hydrogenProduction,
              this.parameters.ammoniaPlantCapacity,
              this.parameters.hydrogenStorageCapacity,
              this.parameters.ammoniaPlantMinimumTurndown / 100,
              this.parameters.minimumHydrogenStorage / 100,
              hydrogenOutput,
              airSeparationUnitCapacity,
              this.hoursPerYear
          );
          return {
            powerplantCapacityFactors,
            electrolyserCapacityFactors,
            netBatteryFlow,
            hydrogenProduction,
            ammoniaCapacityFactors,
          };
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
        airSeparationUnitCapacity,
        powerPlantType: this.parameters.powerPlantType,
        solarNominalCapacity: solarNominalCapacity,
        windNominalCapacity: windNominalCapacity,
        electrolyserNominalCapacity: electrolyserNominalCapacity,
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
    const { electrolyserCapacityFactors, netBatteryFlow } =
      calculateElectrolyserCapacityFactorsAndBatteryNetFlow(
        powerplantCapacityFactors,
        this.hoursPerYear,
        oversizeRatio,
        electrolyserNominalCapacity,
        this.elecMaxLoad,
        this.elecMinLoad,
        this.elecOverload,
        this.parameters.timeBetweenOverloading,
        this.batteryEnergy,
        this.batteryStorageDuration,
        this.batteryEfficiency,
        this.batteryRatedPower,
        this.battMin
      );
    return {
      powerplantCapacityFactors,
      electrolyserCapacityFactors,
      netBatteryFlow,
    };
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
function calculateAmmoniaElectrolyserCapacityFactors(
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
  // if no battery is defined return as it is
  if (batteryEfficiency === 0) {
    return electrolyserCapFactor;
  }
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
      minimum_hydrogen_storage
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

function hydrogen_storage_CAPEX(
    hydrogen_storage_capacity: number, // size of hydrogen storage tank
    hydrogen_storage_purchase_cost: number // Cost per kg for Hydrogen Storage
) {
  return hydrogen_storage_capacity * hydrogen_storage_purchase_cost;
}

// // TODO Uncomment when these functions are used

// // kTPA
//  // Not sure what this formula should be used for
// function asu_plant_capacity(
//     air_separation_unit_capacity: number // size of air separation unit
// ) {
//   return air_separation_unit_capacity * (365 / 1000);
// }

// function ammonia_synthesis_unit_OandM(
//     ammonia_plant_capacity: number, // size of ammonia plant
//     asu_synthesis_unit_purchase_cost: number, // cost per T for Ammoni Synthesis Unit
//     ammonia_synthesis_unit_OandM: number // % of CAPEX
// ) {
//   return (
//       ammonia_synthesis_unit_OandM *
//       ammonia_plant_capacity *
//       1000 *
//       asu_synthesis_unit_purchase_cost
//   );
// }
//
// function ammonia_storage_unit_OandM(
//     ammonia_plant_capacity: number, // size of ammonia plant
//     ammonia_storage_capacity: number, // size of ammonia storage tank
//     ammonia_storage_purchase_cost: number, // Cost per T for mmonia Storage unit
//     ammonia_storage_unit_OandM: number // % of CAPEX
// ) {
//   return (
//       ammonia_storage_unit_OandM *
//       ammonia_storage_capacity *
//       ammonia_plant_capacity *
//       (1000 / 365) *
//       ammonia_storage_purchase_cost
//   );
// }
//
// function asu_OandM(
//     asu_plant_capacity: number, // size of ASU
//     asu_purchase_cost: number, // Cost per T for ASU
//     asu_OandM: number // % of CAPEX
// ) {
//   return asu_OandM * asu_plant_capacity * 365 * asu_purchase_cost;
// }
//
// // TODO I think there is a typo in the first param, the cells don't add up
// function ammonia_plant_OandM(
//     asu_plant_capacity: number, // size of ASU
//     asu_purchase_cost: number, // cost per T for ASU
//     asu_OandM: number
// ) {
//   return asu_plant_capacity + asu_purchase_cost + asu_OandM;
// }
//

// // might not need anymore, i just reused previous electrolyser capex calculations
// function electrolyser_hydrogen_storage_system_capex_cost(
//     hydrogen_storage_capacity: number, // size of hydrogen storage tank
//     hydrogen_storage_purchase_cost: number, // cost per kg for hydrogen storage
//     nominal_electrolyser_capacity: number, // size of electrolyser
//     scaled_purchase_cost_of_electrolyser: number // Price per kW for Electrolyser
// ) {
//   return (
//       nominal_electrolyser_capacity *
//       1000 *
//       scaled_purchase_cost_of_electrolyser +
//       hydrogen_storage_purchase_cost * hydrogen_storage_capacity
//   );
// }
//
// function hydrogen_storage_OandM(
//     hydrogen_storage_capacity: number, // size of asu
//     hydrogen_storage_purchase_cost: number, // Cost per T for ASU
//     hydrogen_storage_OandM: number // % of CAPEX
// ) {
//   return (
//       hydrogen_storage_capacity *
//       hydrogen_storage_purchase_cost *
//       hydrogen_storage_OandM
//   );
// }
//
// function indirect_costs(
//     ammonia_plant_indirect_costs: number, // indirect_cost_for ammonia plant
//     electrolyser_and_hydrogen_storage_indirect_costs: number, // indirect costs for electrolyser and h2 storage
//     epc_costs: number, // power plant EPC costs
//     land_procurement_cost: number, // power plant land procurement costs
//     battery_storage_indirect_costs: number // indirect costs for battery if selected
// ) {
//   return (
//       ammonia_plant_indirect_costs +
//       electrolyser_and_hydrogen_storage_indirect_costs +
//       epc_costs +
//       land_procurement_cost +
//       battery_storage_indirect_costs // TODO should be conditional
//   );
// }
//
// // this would be repeated for multiple years
// function ammonia_produced(
//     nh3_produced_per_year: number, //ammonia produced in year X
//     plant_year: number, // year X of operation
//     discount_rate: number // discount rate
// ) {
//   return (nh3_produced_per_year * 1000) / (1 + discount_rate) ** plant_year;
// }
//
// // this should be repeated for multiple years
// function h2_storage_opex(
//     h2_storage_opex: number, // undiscounted OPEX for h2 storage
//     plant_year: number, // year X of operation
//     discount_rate: number // discount rate
// ) {
//   return h2_storage_opex / (1 + discount_rate) ** plant_year;
// }
//
// // this should be repeated for multiple years
// function ammonia_plant_opex(
//     ammonia_plant_opex: number, // undiscounted OPEX for h2 storage
//     plant_year: number, // year X of operation
//     discount_rate: number // discount rate
// ) {
//   return ammonia_plant_opex / (1 + discount_rate) ** plant_year;
// }
//
// // should bre repeated for multiple years
// function lcnh3(
//     total_discounted_cash_flow_power_plant_capex: number, // discounted cash flow for power plant capex
//     total_discounted_ammonia_produced: number // discounted ammonia produced
// ) {
//   return (
//       total_discounted_cash_flow_power_plant_capex /
//       total_discounted_ammonia_produced
//   );
// }
//
// // repeated for multiple cells
// function nh3_sales(
//     nh3_produced_per_year: number, // ammonia produces in year X
//     retail_price_of_ammonia: number, // sale price for ammonia
//     plant_year: number, // year X of operation
//     discount_rate: number
// ) {
//   return (
//       nh3_produced_per_year *
//       1000 *
//       retail_price_of_ammonia *
//       (1 + discount_rate) ** plant_year
//   );
// }
//
// // MWh
// // should be repeated for multiple cells
// function excess_generation(
//     generator_actual_power: number, // generator actual power MW
//     electrolyser_actual_power: number, // electrolyser actual power MW
//     asu_nh3_actual_power: number // asu nh3 acutal power
// ) {
//   return (
//       asu_nh3_actual_power - electrolyser_actual_power - generator_actual_power
//   );
// }
//
// // %
// // should be repeated for multiple cells
// function asu_nh3_with_battery_cf(
//     asu_nh3_capacity_factor: number,
//     net_battery_flow: number
// ) {
//   return asu_nh3_capacity_factor < 1 && net_battery_flow < 0
//       ? asu_nh3_capacity_factor + (1 - asu_nh3_capacity_factor)
//       : asu_nh3_capacity_factor;
// }
//
// // %
// // should be repeated for multiple cells
// function asu_nh3_capacity_factor(
//     ammonia_power_demand: number, // ammonia power demand
//     asu_power_demand: number, // asu power demand
//     asu_nh3_actual_power: number // asu/nh3 actual power
// ) {
//   return asu_nh3_actual_power / (ammonia_power_demand + asu_power_demand);
// }