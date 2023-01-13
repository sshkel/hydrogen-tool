import { getCapex, getEpcCosts } from "../components/charts/capex-calculations";
import {
  calculateP2XProductionLC,
  roundToNearestInteger,
  roundToNearestThousand,
  roundToTwoDP,
} from "../components/charts/cost-functions";
import {
  generateLCBreakdown,
  generateMethaneLCH2Breakdown,
} from "../components/charts/lch2-calculations";
import {
  calculateMethanePerYearOpex,
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
import { mean, projectYears } from "../utils";
import {
  CsvRow,
  MethaneProjectModelSummary,
  ModelHourlyOperation,
} from "./ModelTypes";
import {
  CumulativeDegradation,
  MaxDegradation,
  calculateHydrogenProduction,
  calculateMethaneSnapshotForYear,
  calculateNetBatteryFlowMeth,
  calculatePowerPlantCapacityFactors,
  getBatteryLosses,
  nominal_electrolyser_capacity,
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
      methaneCapex = methane_plant_CAPEX(
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

    const { h2StorageOpexPerYear, methaneOpexPerYear, ccOpexPerYear } =
      calculateMethanePerYearOpex(
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
        "Methane OPEX": methaneOpexPerYear,
        "CC OPEX": ccOpexPerYear,
      },
    };

    const {
      lch2,
      hydrogenProductionCost,
      lcP2x: lcmeoh,
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

    const {
      lcH2StorageCAPEX,
      lcMethanePlantCAPEX,
      lcCarbonCaptureCAPEX,
      lcH2StorageOPEX,
      lcMethanePlantOPEX,
      lcCarbonCaptureOPEX,
    } = generateMethaneLCH2Breakdown(
      h2StorageCapex,
      methaneCapex,
      ccCapex,
      h2StorageOpexCost,
      methaneOpexCost,
      ccOpexCost,
      hydrogenProductionCost,
      this.parameters.projectTimeline,
      this.discountRate
    );

    const lch2BreakdownData: { [key: string]: number } = {
      "Power Plant CAPEX": lcPowerPlantCAPEX,
      "Electrolyser CAPEX": lcElectrolyserCAPEX,
      "H2 Storage CAPEX": lcH2StorageCAPEX,
      "Methane Plant CAPEX": lcMethanePlantCAPEX,
      "Carbon Capture CAPEX": lcCarbonCaptureCAPEX,
      "Indirect Costs": lcIndirectCosts,
      "Power Plant OPEX": lcPowerPlantOPEX,
      "Electrolyser OPEX": lcElectrolyserOPEX,
      "H2 Storage OPEX": lcH2StorageOPEX,
      "Methane Plant OPEX": lcMethanePlantOPEX,
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

      "LCMeOH ($/kg)": roundToTwoDP(lcmeoh),
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

    const methanePlantPowerDemand = methane_plant_power_demand(
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

    const solarNominalCapacity = nominal_solar_capacity(
      methanePlantPowerDemand,
      carbonCapturePlantPowerDemand,
      electrolyserNominalCapacity,
      this.parameters.solarToWindPercentage / 100,
      this.parameters.powerPlantOversizeRatio
    );
    const windNominalCapacity = nominal_wind_capacity(
      methanePlantPowerDemand,
      carbonCapturePlantPowerDemand,
      electrolyserNominalCapacity,
      1 - this.parameters.solarToWindPercentage / 100,
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
      const hourlyOperations =
        this.calculatePowerplantAndElectrolyserHourlyOperation(
          this.parameters.solarToWindPercentage / 100,
          1 - this.parameters.solarToWindPercentage / 100,
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

      const h2ToMeOhUnit = calculateH2ToMeOhUnit(
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
      const methaneCapacityFactors = meOh_unit_capacity_factor(
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

        const h2ToMeOhUnit = calculateH2ToMeOhUnit(
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
        const methaneCapacityFactors = meOh_unit_capacity_factor(
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
          const h2ToMeOhUnit = calculateH2ToMeOhUnit(
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
          const methaneCapacityFactors = meOh_unit_capacity_factor(
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

    const electrolyserActualPower = electrolyser_actual_power(
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
      methaneCapacityFactors = meOh_cc_with_battery_cf(
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

// Should be the same in methanol
// should be repeated for multiple cells
// MW
function electrolyser_actual_power(
  nominal_electrolyser_capacity: number, // electrolyser capacity
  generator_actual_power: number[], // generator actual power
  carbonCapturePowerDemand: number,
  mePowerDemand: number
) {
  return generator_actual_power.map((_: number, i: number) =>
    generator_actual_power[i] - (carbonCapturePowerDemand + mePowerDemand) >
    nominal_electrolyser_capacity
      ? nominal_electrolyser_capacity
      : Math.max(
          generator_actual_power[i] -
            (carbonCapturePowerDemand + mePowerDemand),
          0
        )
  );
}

function methane_plant_power_demand(
  me_plant_capacity: number, // size of methane plant
  methane_plant_sec: number, // electricity required to produce 1 kg of methane
  hoursPerYear: number
) {
  return (
    (me_plant_capacity / hoursPerYear) * 1_000_000 * (methane_plant_sec / 1000)
  );
}

// if hybrid we multiply by the split otherwise we leave it out or we can make it 1
function nominal_solar_capacity(
  meOH_PowDem: number,
  co2_PowDem: number,
  nominal_electrolyser_capacity: number, // Power required for Electrolyser
  hybrid_generator_split: number, // % of hybrid plant made up of solar
  renewable_energy_plant_oversizing: number // % oversizing of renewable energy plant
) {
  return (
    (meOH_PowDem + co2_PowDem + nominal_electrolyser_capacity) *
    (1 + renewable_energy_plant_oversizing) *
    hybrid_generator_split
  );
}

// if hybrid we multiply by the split otherwise we leave it out or we can make it 1
function nominal_wind_capacity(
  meOH_PowDem: number,
  co2_PowDem: number,
  nominal_electrolyser_capacity: number, // Power required for Electrolyser
  hybrid_generator_split: number, // % of hybrid plant made up of solar
  renewable_energy_plant_oversizing: number // % oversizing of renewable energy plant
) {
  return (
    (meOH_PowDem + co2_PowDem + nominal_electrolyser_capacity) *
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

function h2_to_meOh(
  mass_of_hydrogen: number[], // p20
  from_h2_storage: number[], // t20
  h2_store_balance: number[], // u20
  hydrogen_storage_capacity: number, // s1b26
  hydrogen_output: number, // s1b16
  methane_plant_minimum_turndown: number // s1b36
): number[] {
  return mass_of_hydrogen.map((_: number, i: number) => {
    if (mass_of_hydrogen[i] >= (hydrogen_output / 24) * 1000) {
      return (hydrogen_output / 24) * 1000;
    } else if (
      mass_of_hydrogen[i] + Math.abs(from_h2_storage[i]) <
      (hydrogen_output / 24) * 1000 * methane_plant_minimum_turndown
    ) {
      return 0;
    } else if (
      mass_of_hydrogen[i] < (hydrogen_output / 24) * 1000 &&
      h2_store_balance[i] > hydrogen_storage_capacity * 0.1
    ) {
      return mass_of_hydrogen[i] + Math.abs(from_h2_storage[i]);
    } else if (
      h2_store_balance[i] < hydrogen_storage_capacity * 0.1 &&
      mass_of_hydrogen[i] >
        (hydrogen_output / 24) * 1000 * methane_plant_minimum_turndown
    ) {
      return mass_of_hydrogen[i];
    } else if (
      h2_store_balance[i] < hydrogen_storage_capacity * 0.1 &&
      mass_of_hydrogen[i] <
        (hydrogen_output / 24) * 1000 * methane_plant_minimum_turndown
    ) {
      return 0;
    }
    return 0;
  });
}

// should be repeated for multiple cells
function cc_out(
  h2_to_meoh: number[], // v20
  hydrogen_output: number, // s1b16
  cc_capacity: number // s1b14
) {
  return h2_to_meoh.map((v: number) => {
    if (v === (hydrogen_output / 24) * 1000) {
      return (cc_capacity / 24) * 1000;
    } else if (v < (hydrogen_output / 24) * 1000) {
      return (v / ((hydrogen_output / 24) * 1000)) * (cc_capacity / 24) * 1000;
    }
    // TODO check if this is okay
    throw new Error("Unsupported calculation for cc out");
  });
}

// should be repeated for multiple cells
function meOh_unit_capacity_factor(
  meOh_unit_out: number[], // x20
  methane_plant_capacity: number, // s1b12
  hoursPerYear: number
) {
  return meOh_unit_out.map((v: number) =>
    Math.min(v / (methane_plant_capacity * (1_000_000 / hoursPerYear)), 1)
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

function calculateH2ToMeOhUnit(
  hydrogenProduction: number[],
  electrolyserNominalCapacity: number,
  hydrogen_output: number,
  hydrogen_storage_capacity: number,
  minimum_hydrogen_storage: number,
  methane_plant_minimum_turndown: number
) {
  // adjust hydrogen to work for methane
  const mass_of_hydrogen = hydrogenProduction.map(
    (v) => v * electrolyserNominalCapacity
  );
  const excess_h2_result = excess_h2(mass_of_hydrogen, hydrogen_output);
  const deficit_h2_result = deficit_h2(mass_of_hydrogen, hydrogen_output);

  const { from_h2_store, h2_storage_balance_result } = h2_storage_balance(
    deficit_h2_result,
    excess_h2_result,
    hydrogen_storage_capacity,
    minimum_hydrogen_storage
  );

  const h2_to_meoh_result = h2_to_meOh(
    mass_of_hydrogen,
    from_h2_store,
    h2_storage_balance_result,
    hydrogen_storage_capacity,
    hydrogen_output,
    methane_plant_minimum_turndown
  );
  return h2_to_meoh_result;
}

function methane_plant_CAPEX(
  methane_plant_capacity: number, // size of methane plant
  methane_storage_capacity: number, // size of methane storage
  methane_synthesis_unit_purchase_cost: number, // cost per T for methane plant
  methane_storage_purchase_cost: number // cost per T for methane storage
) {
  return roundToNearestThousand(
    methane_plant_capacity * 1000 * methane_synthesis_unit_purchase_cost +
      ((methane_storage_capacity * (methane_plant_capacity * 1000)) / 365) *
        methane_storage_purchase_cost
  );
}

function cc_plant_CAPEX(
  cc_plant_capacity: number, // size of cc plant
  cc_synthesis_unit_purchase_cost: number // cost per T for carbon capture plant
) {
  return roundToNearestThousand(
    cc_plant_capacity * 365 * cc_synthesis_unit_purchase_cost
  );
}

function getEpcIndirectCost(
  epc: number, // % of capex
  CAPEX: number // total capex of Methane plant
) {
  return epc * CAPEX;
}

function getLandProcurementIndirectCost(
  landProcurementCost: number, // % of capex
  CAPEX: number // total capex of Methane plant
) {
  return landProcurementCost * CAPEX;
}

function hydrogen_storage_CAPEX(
  hydrogen_storage_capacity: number, // size of hydrogen storage tank
  hydrogen_storage_purchase_cost: number // Cost per kg for Hydrogen Storage
) {
  return hydrogen_storage_capacity * hydrogen_storage_purchase_cost;
}

// // MWh
// // should be repeated for multiple cells
function excess_generation(
  generator_actual_power: number[], // generator actual power MW
  electrolyser_actual_power: number[], // electrolyser actual power MW
  meOh_cc_actual_power: number[] // asu nh3 acutal power
) {
  return meOh_cc_actual_power.map((_: number, i: number) => {
    const excess =
      generator_actual_power[i] -
      electrolyser_actual_power[i] -
      meOh_cc_actual_power[i];
    // TODO check if this okay, otherwise battery model throws exceptions
    // it might've been just old battery model and the new one is fine
    return excess > 0 ? excess : 0;
  });
}

//
// // %
// // should be repeated for multiple cells
function meOh_cc_with_battery_cf(
  meOh_cc_capacity_factor: number[],
  net_battery_flow: number[]
) {
  return meOh_cc_capacity_factor.map((_: number, i: number) =>
    meOh_cc_capacity_factor[i] < 1 && net_battery_flow[i] < 0
      ? meOh_cc_capacity_factor[i] + (1 - meOh_cc_capacity_factor[i])
      : meOh_cc_capacity_factor[i]
  );
}
