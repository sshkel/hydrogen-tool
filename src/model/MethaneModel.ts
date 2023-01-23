import { getCapex, getEpcCosts } from "../components/charts/capex-calculations";
import {
  calculateP2XProductionLC,
  roundToNearestInteger,
  roundToTwoDP,
} from "../components/charts/cost-functions";
import {
  generateLCBreakdown,
  generateMeLCH2Breakdown as generateSNGLCBreakdown,
} from "../components/charts/lch2-calculations";
import {
  calculateMePerYearOpex,
  calculatePerYearOpex,
  getOpex,
  getP2XOpex,
  getTotalP2XOpex,
} from "../components/charts/opex-calculations";
import {
  InputConfiguration,
  Model,
  PowerPlantConfiguration,
  PowerPlantType,
  PowerSupplyOption,
  StackReplacementType,
} from "../types";
import { isOffshore, mean, projectYears } from "../utils";
import {
  CsvRow,
  MethaneProjectModelSummary,
  ModelHourlyOperation,
} from "./ModelTypes";
import {
  CumulativeDegradation,
  MaxDegradation,
  calculateH2ToPowerfuelUnit,
  calculateHydrogenProduction,
  calculateMethaneSnapshotForYear,
  calculateNetBatteryFlowMeth,
  calculatePowerPlantCapacityFactors,
  calculateSolarToWindRatio,
  capacityFactorsWithBattery,
  cc_out,
  cc_plant_CAPEX,
  electrolyser_actual_power_meX,
  excess_generation,
  generator_actual_power,
  getBatteryLosses,
  getEpcIndirectCost,
  getLandProcurementIndirectCost,
  hydrogen_storage_CAPEX,
  me_plant_CAPEX,
  me_unit_capacity_factor,
  nominal_electrolyser_capacity,
  nominal_solar_capacity,
  nominal_wind_capacity,
  powerfuel_plant_power_demand,
} from "./ModelUtils";
import { HOURS_PER_YEAR } from "./consts";

export type MethaneData = {
  additionalAnnualCosts: number;
  additionalTransmissionCharges?: number;
  additionalUpfrontCosts: number;
  batteryCosts?: number;
  batteryEfficiency: number;
  batteryEpcCosts?: number;
  batteryLandProcurementCosts?: number;
  batteryLifetime?: number;
  batteryMinCharge?: number;
  batteryOMCost?: number;
  batteryReplacementCost?: number;
  batteryStorageDuration?: number;
  discountRate: number;
  electrolyserCostReductionWithScale: number;
  electrolyserEfficiency?: number;
  electrolyserEpcCosts: number;
  electrolyserLandProcurementCosts: number;
  electrolyserMaximumLoad: number;
  electrolyserMinimumLoad: number;
  electrolyserOMCost: number;
  electrolyserPurchaseCost: number;
  electrolyserReferenceCapacity: number;
  electrolyserReferenceFoldIncrease: number;
  electrolyserStackReplacement: number;
  gridConnectionCost?: number;
  inflationRate: number;
  inputConfiguration: InputConfiguration;
  location: string;
  maximumDegradationBeforeReplacement: number;
  maximumLoadWhenOverloading: number;
  powerPlantConfiguration: PowerPlantConfiguration;
  powerPlantOversizeRatio: number;
  powerPlantType: PowerPlantType;
  powerSupplyOption: PowerSupplyOption;
  principalPPACost?: number;
  projectScale: number;
  projectTimeline: number;
  secAtNominalLoad?: number;
  solarDegradation: number;
  solarEpcCosts: number;
  solarFarmBuildCost: number;
  solarLandProcurementCosts: number;
  solarOpex?: number;
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
  windOpex?: number;
  windReferenceCapacity: number;
  windReferenceFoldIncrease: number;

  //Methane
  methanePlantCapacity: number;
  methaneStorageCapacity: number;
  methanePlantSec: number;
  ccSec: number;
  methanePlantMinimumTurndown: number;

  electrolyserSystemOversizing: number;
  hydrogenStorageCapacity: number;
  // electrolyster and hydrogen storage paramteres
  // other operation factors
  minimumHydrogenStorage: number;

  // operating costs
  methanePlantUnitCost: number;
  methaneStorageCost: number;
  methaneEpcCosts: number;
  methaneLandProcurementCosts: number;
  methanePlantOMCost: number;
  methaneStorageOMCost: number;

  ccPlantCost: number;
  ccPlantOMCost: number;
  ccEpcCosts: number;
  ccLandProcurementCosts: number;
  hydrogenStoragePurchaseCost: number;
  hydrogenStorageOMCost: number;
};

export class MethaneModel implements Model {
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
  private readonly batteryStorageDuration: number;
  private readonly electrolyserEfficiency: number;
  private readonly secAtNominalLoad: number;

  // calculated params
  private readonly elecMaxLoad: number;
  private readonly elecMinLoad: number;
  private readonly elecEff: number;
  private readonly hydOutput: number;
  private readonly parameters: MethaneData;
  private readonly elecOverload: number;
  private readonly batteryEfficiency: number;
  // data from renewables
  private readonly solarData: CsvRow[];
  private readonly windData: CsvRow[];
  // calculated based on number of CSV rows
  private readonly hoursPerYear: number;
  private readonly specCons: number;

  constructor(
    parameters: MethaneData,
    solarData: CsvRow[],
    windData: CsvRow[]
  ) {
    this.parameters = parameters;

    this.additionalTransmissionCharges =
      parameters.additionalTransmissionCharges ?? 0;
    this.batteryCosts = parameters.batteryCosts ?? 0;
    this.batteryLifetime = parameters.batteryLifetime ?? 0;
    this.batteryOMCost = parameters.batteryOMCost ?? 0;
    this.batteryReplacementCost = parameters.batteryReplacementCost ?? 0;
    // this.batteryRatedPower = parameters.batteryRatedPower ?? 0;
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
    // TODO check if this should be replaced by the other calculation.
    this.hydOutput = this.h2VolToMass * this.mwToKw * this.elecEff; // kg.kWh/m3.MWh
    this.elecOverload = parameters.maximumLoadWhenOverloading / 100;
    this.batteryEfficiency = parameters.batteryEfficiency / 100;
    this.batteryMinCharge = (parameters.batteryMinCharge ?? 0) / 100;
    this.specCons = this.secAtNominalLoad * this.h2VolToMass;
    this.discountRate = this.parameters.discountRate / 100;
  }

  produceResults() {
    const {
      batteryRatedPower,
      carbonCapturePlantCapacity,
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
      methaneCapacityFactors,
      methaneProduction,
      methaneRatedCapacityTime,
      totalMethaneOperatingTime,
    } = this.calculateMethaneModel(this.parameters.projectTimeline);

    const powerPlantNominalCapacity =
      solarNominalCapacity + windNominalCapacity;
    const durationCurves = {
      "Power Plant Duration Curve": hourlyOperations.powerplantCapacityFactors,
      "Electrolyser Duration Curve":
        hourlyOperations.electrolyserCapacityFactors,
      "Methane Duration Curve": hourlyOperations.methaneCapacityFactors,
    };
    const hourlyCapFactors = {
      Electrolyser: hourlyOperations.electrolyserCapacityFactors,
      "Power Plant": hourlyOperations.powerplantCapacityFactors,
      Methane: hourlyOperations.methaneCapacityFactors,
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
      batteryRatedPower,
      this.batteryStorageDuration,
      this.batteryCosts,
      this.gridConnectionCost
    );

    let methaneCapex = 0;
    if (this.parameters.inputConfiguration === "Basic") {
      methaneCapex =
        this.parameters.methanePlantUnitCost! * this.parameters.projectScale;
    } else {
      methaneCapex = me_plant_CAPEX(
        this.parameters.methanePlantCapacity,
        this.parameters.methaneStorageCapacity,
        this.parameters.methanePlantUnitCost,
        this.parameters.methaneStorageCost
      );
    }

    const h2StorageCapex = hydrogen_storage_CAPEX(
      this.parameters.hydrogenStorageCapacity,
      this.parameters.hydrogenStoragePurchaseCost
    );

    const ccCapex = cc_plant_CAPEX(
      carbonCapturePlantCapacity,
      this.parameters.ccPlantCost
    );

    const electrolyserAndH2CAPEX = electrolyserCAPEX + h2StorageCapex;

    const {
      electrolyserEpcCost,
      electrolyserLandCost,
      powerPlantEpcCost,
      powerPlantLandCost,
      batteryEpcCost,
      batteryLandCost,
    } = getEpcCosts(
      electrolyserAndH2CAPEX,
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

    const methaneEpcCost = getEpcIndirectCost(
      this.parameters.methaneEpcCosts,
      methaneCapex
    );
    const methaneLandCost = getLandProcurementIndirectCost(
      this.parameters.methaneLandProcurementCosts,
      methaneCapex
    );

    const ccEpcCost = getEpcIndirectCost(
      this.parameters.methaneEpcCosts,
      ccCapex
    );
    const ccLandCost = getLandProcurementIndirectCost(
      this.parameters.methaneLandProcurementCosts,
      ccCapex
    );

    const indirectCostBreakdown = {
      "Methane EPC": methaneEpcCost,
      "Methane Land": methaneLandCost,
      "CC EPC": ccEpcCost,
      "CC Land": ccLandCost,
      "Electrolyser EPC": electrolyserEpcCost,
      "Electrolyser Land": electrolyserLandCost,
      "Power Plant EPC": powerPlantEpcCost,
      "Power Plant Land": powerPlantLandCost,
      "Battery EPC": batteryEpcCost,
      "Battery Land": batteryLandCost,
    };

    const totalCapexCost =
      methaneCapex +
      ccCapex +
      h2StorageCapex +
      electrolyserCAPEX +
      powerPlantCAPEX +
      batteryCAPEX +
      this.parameters.additionalUpfrontCosts +
      gridConnectionCAPEX; // Cost values for sales calculation
    const totalEpcCost =
      methaneEpcCost +
      ccEpcCost +
      electrolyserEpcCost +
      powerPlantEpcCost +
      batteryEpcCost;
    const totalLandCost =
      methaneLandCost +
      ccLandCost +
      electrolyserLandCost +
      powerPlantLandCost +
      batteryLandCost;
    // All existing Excel models do not include battery indirect costs as part of total
    const totalIndirectCosts =
      totalEpcCost + totalLandCost - batteryEpcCost - batteryLandCost;

    const capitalCostBreakdown = {
      Methane: methaneCapex,
      "Carbon Capture": ccCapex,
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
      batteryRatedPower,
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

    const {
      h2StorageOpexCost,
      plantOpexCost,
      storageUnitOpexCost,
      secondaryUnitOpexCost: ccOpexCost,
    } = getP2XOpex(
      this.parameters.hydrogenStorageCapacity,
      this.parameters.hydrogenStoragePurchaseCost,
      this.parameters.hydrogenStorageOMCost,
      this.parameters.methanePlantCapacity,
      this.parameters.methaneStorageCapacity,
      carbonCapturePlantCapacity,
      this.parameters.methanePlantUnitCost,
      this.parameters.methaneStorageCost,
      this.parameters.ccPlantCost,
      this.parameters.methanePlantOMCost,
      this.parameters.methaneStorageOMCost,
      this.parameters.ccPlantOMCost
    );

    const methaneOpexCost = plantOpexCost + storageUnitOpexCost;

    const totalOpex = getTotalP2XOpex(
      this.parameters.projectTimeline,
      electrolyserOpexCost,
      powerPlantOpexCost,
      batteryOpexCost,
      electricityOpexCost,
      waterOpexCost,
      gridConnectionOpexPerYear,
      this.parameters.additionalAnnualCosts,
      stackReplacementCostsOverProjectLife,
      batteryReplacementCostsOverProjectLife,
      h2StorageOpexCost,
      methaneOpexCost + ccOpexCost
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
      batteryRatedPower,
      batteryOpexCost,
      batteryReplacementCostsOverProjectLife,
      waterOpexCost
    );

    const { h2StorageOpexPerYear, meOpexPerYear, ccOpexPerYear } =
      calculateMePerYearOpex(
        h2StorageOpexCost,
        methaneOpexCost,
        ccOpexCost,
        this.parameters.inflationRate,
        this.parameters.projectTimeline
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
        "H2 Storage OPEX": h2StorageOpexPerYear,
        "Methane OPEX": meOpexPerYear,
        "CC OPEX": ccOpexPerYear,
      },
    };

    const {
      lch2,
      lcP2x: lcsng,
      p2xProductionCost: methaneProductionCost,
    } = calculateP2XProductionLC(
      totalCapexCost,
      totalEpcCost,
      totalLandCost,
      this.parameters.projectTimeline,
      this.discountRate,
      totalOpex,
      hydrogenProduction,
      methaneProduction
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
      methaneProductionCost,
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

    const {
      lcH2StorageCAPEX,
      lcMePlantCAPEX,
      lcCarbonCaptureCAPEX,
      lcH2StorageOPEX,
      lcMePlantOPEX,
      lcCarbonCaptureOPEX,
    } = generateSNGLCBreakdown(
      h2StorageCapex,
      methaneCapex,
      ccCapex,
      h2StorageOpexCost,
      methaneOpexCost,
      ccOpexCost,
      methaneProductionCost,
      this.parameters.projectTimeline,
      this.discountRate
    );

    const lcBreakdownData: { [key: string]: number } = {
      "Power Plant CAPEX": lcPowerPlantCAPEX,
      "Electrolyser CAPEX": lcElectrolyserCAPEX,
      "H2 Storage CAPEX": lcH2StorageCAPEX,
      "Methane Plant CAPEX": lcMePlantCAPEX,
      "Carbon Capture CAPEX": lcCarbonCaptureCAPEX,
      "Indirect Costs": lcIndirectCosts,
      "Power Plant OPEX": lcPowerPlantOPEX,
      "Electrolyser OPEX": lcElectrolyserOPEX,
      "H2 Storage OPEX": lcH2StorageOPEX,
      "Methane Plant OPEX": lcMePlantOPEX,
      "Carbon Capture OPEX": lcCarbonCaptureOPEX,
      "Electricity Purchase": lcElectricityPurchase,
      "Stack Replacement": lcStackReplacement,
      "Water Cost": lcWater,
      "Battery Cost": lcBattery,
      "Grid Connection Cost": lcGridConnection,
      "Additional Costs": lcAdditionalCosts,
    };
    // TODO why are we doing a map and then mean, we can just multiply by a hundie after mean
    const summaryTableData: { [key: string]: number } = {
      "Power Plant Capacity Factor": roundToTwoDP(
        mean(powerPlantCapacityFactors.map((x) => x * 100))
      ),

      "Time Electrolyser is at its Maximum Capacity (% of hrs/yr)":
        roundToTwoDP(mean(ratedCapacityTime.map((x) => x * 100))),

      "Total Time Electrolyser is Operating (% of hrs/yr)": roundToTwoDP(
        mean(totalOperatingTime.map((x) => x * 100))
      ),

      "Time Methane Plant is at its Maximum Capacity (% of hrs/yr)":
        roundToTwoDP(mean(methaneRatedCapacityTime.map((x) => x * 100))),

      "Total Time Methane Plant is Operating (% of hrs/yr)": roundToTwoDP(
        mean(totalMethaneOperatingTime.map((x) => x * 100))
      ),

      "Electrolyser Capacity Factor": roundToTwoDP(
        mean(electrolyserCapacityFactors.map((x) => x * 100))
      ),
      "Methane Capacity Factor": roundToTwoDP(
        mean(methaneCapacityFactors.map((x) => x * 100))
      ),

      "Energy Consumed by Electrolyser (MWh/yr)": roundToNearestInteger(
        mean(electricityConsumed)
      ),

      "Excess Energy Not Utilised by Electrolyser (MWh/yr)":
        roundToNearestInteger(mean(electricityProduced)),

      "Hydrogen Output (t/yr)": roundToNearestInteger(mean(hydrogenProduction)),

      "Methane Output (TPA)": roundToNearestInteger(mean(methaneProduction)),

      "LCH2 ($/kg)": roundToTwoDP(lch2),

      "LCSNG ($/kg)": roundToTwoDP(lcsng),
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

  calculateMethaneModel(projectTimeline: number) {
    const {
      stackDegradation,
      solarDegradation,
      windDegradation,
      inputConfiguration,
    } = this.parameters;
    const carbonCapturePlantCapacity = carbon_capture_plant_capacity(
      this.parameters.methanePlantCapacity
    );
    const hydrogenOutput = hydrogen_output(
      this.parameters.methanePlantCapacity
    );

    const methanePlantPowerDemand = powerfuel_plant_power_demand(
      this.parameters.methanePlantCapacity,
      this.parameters.methanePlantSec,
      this.hoursPerYear
    );

    const carbonCapturePlantPowerDemand =
      this.carbon_capture_plant_power_demand(
        carbonCapturePlantCapacity,
        this.parameters.ccSec
      );

    const electrolyserNominalCapacity = nominal_electrolyser_capacity(
      hydrogenOutput,
      this.secAtNominalLoad,
      this.parameters.electrolyserSystemOversizing / 100
    );
    const { solarRatio, windRatio } = calculateSolarToWindRatio(
      this.parameters.powerPlantType,
      this.parameters.solarToWindPercentage
    );
    const solarNominalCapacity = nominal_solar_capacity(
      methanePlantPowerDemand,
      carbonCapturePlantPowerDemand,
      electrolyserNominalCapacity,
      solarRatio,
      this.parameters.powerPlantOversizeRatio
    );
    const windNominalCapacity = nominal_wind_capacity(
      methanePlantPowerDemand,
      carbonCapturePlantPowerDemand,
      electrolyserNominalCapacity,
      windRatio,
      this.parameters.powerPlantOversizeRatio
    );

    const powerPlantNominalCapacity =
      solarNominalCapacity + windNominalCapacity;
    let batteryRatedPower = 0;
    if (this.batteryStorageDuration > 0) {
      batteryRatedPower =
        methanePlantPowerDemand + carbonCapturePlantPowerDemand;
    }

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
          electrolyserNominalCapacity,
          powerPlantNominalCapacity,
          methanePlantPowerDemand,
          carbonCapturePlantPowerDemand,
          batteryRatedPower,
          1
        );

      const hydrogenProduction = calculateHydrogenProduction(
        hourlyOperations.electrolyserCapacityFactors,
        this.hydOutput,
        0,
        this.specCons
      );

      const h2ToMeOhUnit = calculateH2ToPowerfuelUnit(
        hydrogenProduction,
        electrolyserNominalCapacity,
        hydrogenOutput,
        this.parameters.hydrogenStorageCapacity,
        this.parameters.minimumHydrogenStorage / 100,
        this.parameters.methanePlantMinimumTurndown / 100
      );

      const ccOut = cc_out(
        h2ToMeOhUnit,
        hydrogenOutput,
        carbonCapturePlantCapacity
      );

      const methaneProduction = sng_unit_out(ccOut);
      const methaneCapacityFactors = me_unit_capacity_factor(
        methaneProduction,
        this.parameters.methanePlantCapacity,
        this.hoursPerYear
      );

      const hourlyOperationsInYearOne: ModelHourlyOperation = {
        powerplantCapacityFactors: hourlyOperations.powerplantCapacityFactors,
        electrolyserCapacityFactors:
          hourlyOperations.electrolyserCapacityFactors,
        hydrogenProduction,
        netBatteryFlow: hourlyOperations.netBatteryFlow,
        methaneCapacityFactors: methaneCapacityFactors,
      };

      const { solarToWindPercentage = 100 } = this.parameters;
      // back calcualte power plant type from the percentages.
      // Default to hybrid
      let powerPlantType: PowerPlantType = "Hybrid";
      if (solarToWindPercentage === 100) {
        powerPlantType = "Solar";
      }

      if (solarToWindPercentage === 0) {
        powerPlantType = "Wind";
      }

      const operatingOutputs = calculateMethaneSnapshotForYear(
        hourlyOperations.powerplantCapacityFactors,
        hourlyOperations.electrolyserCapacityFactors,
        methaneCapacityFactors,
        hydrogenProduction,
        methaneProduction,
        hourlyOperations.netBatteryFlow,
        electrolyserNominalCapacity,
        powerPlantNominalCapacity,
        this.kgToTonne,
        this.hoursPerYear,
        this.elecMaxLoad,
        this.batteryEfficiency
      );

      let projectSummary: MethaneProjectModelSummary = {
        electricityConsumed: [],
        electricityProduced: [],
        electricityConsumedByBattery: [],
        totalOperatingTime: [],
        hydrogenProduction: [],
        powerPlantCapacityFactors: [],
        ratedCapacityTime: [],
        electrolyserCapacityFactors: [],
        methaneRatedCapacityTime: [],
        totalMethaneOperatingTime: [],
        methaneCapacityFactors: [],
        methaneProduction: [],
      };

      Object.keys(operatingOutputs).forEach((key) => {
        projectSummary[key as keyof MethaneProjectModelSummary] = Array(
          projectTimeline
        ).fill(operatingOutputs[key]);
      });

      return {
        batteryRatedPower,
        carbonCapturePlantCapacity,
        powerPlantType: powerPlantType,
        solarNominalCapacity: solarNominalCapacity,
        windNominalCapacity: windNominalCapacity,
        electrolyserNominalCapacity: electrolyserNominalCapacity,
        hourlyOperations: hourlyOperationsInYearOne,
        ...projectSummary,
      };
    } else if (inputConfiguration === "Advanced") {
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
          powerPlantNominalCapacity,
          methanePlantPowerDemand,
          carbonCapturePlantPowerDemand,
          batteryRatedPower,
          year
        );

        const hydrogenProduction = calculateHydrogenProduction(
          electrolyserCapacityFactors,
          this.hydOutput,
          0,
          this.specCons
        );

        const h2ToMeOhUnit = calculateH2ToPowerfuelUnit(
          hydrogenProduction,
          electrolyserNominalCapacity,
          hydrogenOutput,
          this.parameters.hydrogenStorageCapacity,
          this.parameters.minimumHydrogenStorage / 100,
          this.parameters.methanePlantMinimumTurndown / 100
        );

        const ccOut = cc_out(
          h2ToMeOhUnit,
          hydrogenOutput,
          carbonCapturePlantCapacity
        );

        const methaneProduction = sng_unit_out(ccOut);
        const methaneCapacityFactors = me_unit_capacity_factor(
          methaneProduction,
          this.parameters.methanePlantCapacity,
          this.hoursPerYear
        );

        const hourlyOperationsInYearOne: ModelHourlyOperation = {
          powerplantCapacityFactors,
          electrolyserCapacityFactors,
          netBatteryFlow,
          hydrogenProduction,
          methaneCapacityFactors,
        };
        const operatingOutputs = calculateMethaneSnapshotForYear(
          powerplantCapacityFactors,
          electrolyserCapacityFactors,
          methaneCapacityFactors,
          hydrogenProduction,
          methaneProduction,
          netBatteryFlow,
          electrolyserNominalCapacity,
          powerPlantNominalCapacity,
          this.kgToTonne,
          this.hoursPerYear,
          this.elecMaxLoad,
          this.batteryEfficiency
        );

        let projectSummary: MethaneProjectModelSummary = {
          electricityConsumed: [],
          electricityProduced: [],
          electricityConsumedByBattery: [],
          totalOperatingTime: [],
          hydrogenProduction: [],
          powerPlantCapacityFactors: [],
          ratedCapacityTime: [],
          electrolyserCapacityFactors: [],
          methaneRatedCapacityTime: [],
          totalMethaneOperatingTime: [],
          methaneCapacityFactors: [],
          methaneProduction: [],
        };
        Object.keys(projectSummary).forEach((key) => {
          projectSummary[key as keyof MethaneProjectModelSummary] = Array(
            projectTimeline
          ).fill(operatingOutputs[key]);
        });
        return {
          batteryRatedPower,
          carbonCapturePlantCapacity,
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

      const calculateMethaneModelSummary = (
        hourlyOperation: ModelHourlyOperation
      ) => {
        return calculateMethaneSnapshotForYear(
          hourlyOperation.powerplantCapacityFactors,
          hourlyOperation.electrolyserCapacityFactors,
          hourlyOperation.methaneCapacityFactors,
          hourlyOperation.hydrogenProduction,
          hourlyOperation.methaneProduction,
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
            powerPlantNominalCapacity,
            methanePlantPowerDemand,
            carbonCapturePlantPowerDemand,
            batteryRatedPower,
            year
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
          const h2ToMeOhUnit = calculateH2ToPowerfuelUnit(
            hydrogenProduction,
            electrolyserNominalCapacity,
            hydrogenOutput,
            this.parameters.hydrogenStorageCapacity,
            this.parameters.minimumHydrogenStorage / 100,
            this.parameters.methanePlantMinimumTurndown / 100
          );

          const ccOut = cc_out(
            h2ToMeOhUnit,
            hydrogenOutput,
            carbonCapturePlantCapacity
          );

          const methaneProduction = sng_unit_out(ccOut);
          const methaneCapacityFactors = me_unit_capacity_factor(
            methaneProduction,
            this.parameters.methanePlantCapacity,
            this.hoursPerYear
          );

          return {
            powerplantCapacityFactors,
            electrolyserCapacityFactors,
            netBatteryFlow,
            hydrogenProduction,
            methaneCapacityFactors,
            methaneProduction,
          };
        }
      );

      const hourlyOperationsInYearOne: ModelHourlyOperation =
        capFactorsByYear[0];

      const modelSummaryPerYear = capFactorsByYear.map((value) => {
        return calculateMethaneModelSummary(value);
      });

      let projectSummary: MethaneProjectModelSummary = {
        electricityConsumed: [],
        electricityProduced: [],
        electricityConsumedByBattery: [],
        totalOperatingTime: [],
        hydrogenProduction: [],
        powerPlantCapacityFactors: [],
        ratedCapacityTime: [],
        electrolyserCapacityFactors: [],
        methaneRatedCapacityTime: [],
        totalMethaneOperatingTime: [],
        methaneCapacityFactors: [],
        methaneProduction: [],
      };

      modelSummaryPerYear.forEach((yearSummary) => {
        Object.keys(projectSummary).forEach((key) => {
          projectSummary[key as keyof MethaneProjectModelSummary].push(
            yearSummary[key]
          );
        });
      });

      return {
        batteryRatedPower,
        carbonCapturePlantCapacity,
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
    powerPlantOversizeRatio: number,
    electrolyserNominalCapacity: number,
    powerPlantNominalCapacity: number,
    methanePlantPowerDemand: number,
    carbonCapturePlantPowerDemand: number,
    batteryRatedPower: number,
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

    const generatorActualPower = generator_actual_power(
      powerPlantNominalCapacity,
      powerplantCapacityFactors
    );

    const electrolyserActualPower = electrolyser_actual_power_meX(
      electrolyserNominalCapacity,
      generatorActualPower,
      carbonCapturePlantPowerDemand,
      methanePlantPowerDemand
    );

    // normal electrolyser calculation
    let electrolyserCapacityFactors = electrolyserActualPower.map(
      (v: number) => v / electrolyserNominalCapacity
    );

    const meOH_Cc_actual_power = generatorActualPower.map(
      (generatorActualPower: number) => {
        if (
          generatorActualPower >
          carbonCapturePlantPowerDemand + methanePlantPowerDemand
        ) {
          return carbonCapturePlantPowerDemand + methanePlantPowerDemand;
        } else {
          return 0;
        }
      }
    );
    let methaneCapacityFactors = meOH_Cc_actual_power.map(
      (v: number) =>
        v / (carbonCapturePlantPowerDemand + methanePlantPowerDemand)
    );

    let netBatteryFlow: number[] = new Array(this.hoursPerYear).fill(0);
    // battery model calc
    if (this.batteryStorageDuration > 0) {
      const hours = [1, 2, 4, 8];
      if (!hours.includes(this.batteryStorageDuration)) {
        throw new Error(
          `Battery storage length not valid. Please enter one of 1, 2, 4 or 8. Current value is ${this.batteryStorageDuration}`
        );
      }
      const batteryEnergy = batteryRatedPower * this.batteryStorageDuration;
      const excessGeneration = excess_generation(
        generatorActualPower,
        electrolyserActualPower,
        meOH_Cc_actual_power
      );
      const batteryLosses = getBatteryLosses(this.batteryEfficiency);
      netBatteryFlow = calculateNetBatteryFlowMeth(
        excessGeneration,
        batteryRatedPower,
        batteryEnergy,
        this.batteryMinCharge,
        batteryLosses,
        carbonCapturePlantPowerDemand,
        methanePlantPowerDemand,
        generatorActualPower,
        this.parameters.methanePlantMinimumTurndown / 100
      );
      // with battery
      methaneCapacityFactors = capacityFactorsWithBattery(
        methaneCapacityFactors,
        netBatteryFlow
      );
    }

    return {
      powerplantCapacityFactors,
      electrolyserCapacityFactors,
      netBatteryFlow,
      methaneCapacityFactors,
    };
  }

  private carbon_capture_plant_power_demand(
    carbonCapturePlantCapacity: number,
    carbonCaptureSec: number
  ) {
    return (carbonCapturePlantCapacity / 24) * carbonCaptureSec;
  }
}

function carbon_capture_plant_capacity(methane_plant_capacity: number) {
  return (((methane_plant_capacity * 1000) / 365) * (44.01 / 16.04)) / 0.95;
}

function hydrogen_output(methane_plant_capacity: number) {
  return methane_plant_capacity * (1000 / 365) * (2.016 / 16.04) * (4 / 0.95);
}

function sng_unit_out(
  cc_out: number[] // w20
) {
  return cc_out.map((_: number, i: number) =>
    cc_out[i] > 0 ? (cc_out[i] * 0.95 * 16.04) / 44.01 : 0
  );
}
