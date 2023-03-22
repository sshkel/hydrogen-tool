import { CarbonCaptureSource, CarbonCaptureSourceConfiguration, InputConfiguration, Model, PowerPlantConfiguration, PowerPlantType, PowerSupplyOption, StackReplacementType } from "../types";
import { isOffshore, mean, projectYears } from "../utils";
import { CsvRow, MethanolProjectModelSummary, ModelHourlyOperation } from "./ModelTypes";
import { CumulativeDegradation, MaxDegradation, basic_nominal_electrolyser_capacity, calculateH2ToPowerfuelUnit, calculateHydrogenProduction, calculateMethanolSnapshotForYear, calculateNetBatteryFlowMeth, calculatePowerPlantCapacityFactors, calculateSolarToWindRatio, capacityFactorsWithBattery, carbonCaptureSourceToPlantCost, carbonCaptureSourceToSec, cc_out, cc_plant_CAPEX, electrolyser_actual_power_meX, excess_generation, generator_actual_power, getBatteryLosses, getEpcIndirectCost, getLandProcurementIndirectCost, hydrogen_storage_CAPEX, me_plant_CAPEX, me_unit_capacity_factor, nominal_electrolyser_capacity, nominal_solar_capacity, nominal_wind_capacity, powerfuel_plant_power_demand } from "./ModelUtils";
import { getCapex, getEpcCosts as getIndirectCosts } from "./capex-calculations";
import { HOURS_PER_YEAR } from "./consts";
import { calculateP2XProductionLC, roundToNearestInteger, roundToTwoDP } from "./cost-functions";
import { generateLCBreakdown, generateMeLCH2Breakdown as generateMeOHLCBreakdown } from "./lch2-calculations";
import { calculateMePerYearOpex, calculatePerYearOpex, getOpex, getP2XOpex, getTotalP2XOpex } from "./opex-calculations";


export type MethanolData = {
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

  //Methanol
  methanolPlantCapacity: number;
  methanolStorageCapacity: number;
  methanolPlantSec: number;
  ccSec: number;
  carbonCaptureSource?: CarbonCaptureSource;
  ccSourceConfiguration?: CarbonCaptureSourceConfiguration;
  methanolPlantMinimumTurndown: number;

  electrolyserSystemOversizing: number;
  hydrogenStorageCapacity: number;
  // electrolyster and hydrogen storage paramteres
  // other operation factors
  minimumHydrogenStorage: number;

  // operating costs
  methanolPlantUnitCost: number;
  methanolStorageCost: number;
  methanolEpcCosts: number;
  methanolLandProcurementCosts: number;
  methanolPlantOMCost: number;
  methanolStorageOMCost: number;

  ccPlantCost: number;
  ccPlantOMCost: number;
  ccEpcCosts: number;
  ccLandProcurementCosts: number;
  hydrogenStoragePurchaseCost: number;
  hydrogenStorageOMCost: number;
};

export class MethanolModel implements Model {
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
  private readonly parameters: MethanolData;
  private readonly batteryEfficiency: number;
  // data from renewables
  private readonly solarData: CsvRow[];
  private readonly windData: CsvRow[];
  // calculated based on number of CSV rows
  private readonly hoursPerYear: number;
  private readonly specCons: number;

  constructor(
    parameters: MethanolData,
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
      methanolCapacityFactors,
      methanolProduction,
      methanolRatedCapacityTime,
      totalMethanolOperatingTime,
    } = this.calculateMethanolModel(this.parameters.projectTimeline);

    const powerPlantNominalCapacity =
      solarNominalCapacity + windNominalCapacity;
    const durationCurves = {
      "Power Plant Duration Curve": hourlyOperations.powerplantCapacityFactors,
      "Electrolyser Duration Curve":
        hourlyOperations.electrolyserCapacityFactors,
      "Methanol Duration Curve": hourlyOperations.methanolCapacityFactors,
    };
    const hourlyCapFactors = {
      Electrolyser: hourlyOperations.electrolyserCapacityFactors,
      "Power Plant": hourlyOperations.powerplantCapacityFactors,
      Methanol: hourlyOperations.methanolCapacityFactors,
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
    const methanolPlantUnitCost =
      this.parameters.inputConfiguration === "Basic"
        ? (561192.63963707 *
            Math.pow(
              (this.parameters.methanolPlantCapacity * 1000) / 365,
              0.745210918855445
            )) /
          (this.parameters.methanolPlantCapacity * 1000)
        : this.parameters.methanolPlantUnitCost;

    const methanolCapex = me_plant_CAPEX(
      this.parameters.methanolPlantCapacity,
      this.parameters.methanolStorageCapacity,
      methanolPlantUnitCost,
      this.parameters.methanolStorageCost
    );

    const h2StorageCapex = hydrogen_storage_CAPEX(
      this.parameters.hydrogenStorageCapacity,
      this.parameters.hydrogenStoragePurchaseCost
    );
    const ccPlantCost =
      this.parameters.ccSourceConfiguration === "Preset Source"
        ? carbonCaptureSourceToPlantCost(this.parameters.carbonCaptureSource!)
        : this.parameters.ccPlantCost;

    const ccCapex = cc_plant_CAPEX(carbonCapturePlantCapacity, ccPlantCost);

    const electrolyserAndH2CAPEX = electrolyserCAPEX + h2StorageCapex;

    const {
      electrolyserEpcCost,
      electrolyserLandCost,
      powerPlantEpcCost,
      powerPlantLandCost,
      batteryEpcCost,
      batteryLandCost,
    } = getIndirectCosts(
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

    const methanolEpcCost = getEpcIndirectCost(
      this.parameters.methanolEpcCosts,
      methanolCapex
    );
    const methanolLandCost = getLandProcurementIndirectCost(
      this.parameters.methanolLandProcurementCosts,
      methanolCapex
    );

    const ccEpcCost = getEpcIndirectCost(
      this.parameters.methanolEpcCosts,
      ccCapex
    );
    const ccLandCost = getLandProcurementIndirectCost(
      this.parameters.methanolLandProcurementCosts,
      ccCapex
    );

    const indirectCostBreakdown = {
      "Methanol EPC": methanolEpcCost,
      "Methanol Land": methanolLandCost,
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
      methanolCapex +
      ccCapex +
      h2StorageCapex +
      electrolyserCAPEX +
      powerPlantCAPEX +
      batteryCAPEX +
      this.parameters.additionalUpfrontCosts +
      gridConnectionCAPEX; // Cost values for sales calculation
    const totalEpcCost =
      methanolEpcCost +
      ccEpcCost +
      electrolyserEpcCost +
      powerPlantEpcCost +
      batteryEpcCost;
    const totalLandCost =
      methanolLandCost +
      ccLandCost +
      electrolyserLandCost +
      powerPlantLandCost +
      batteryLandCost;
    // All existing Excel models do not include battery indirect costs as part of total
    const totalIndirectCosts =
      totalEpcCost + totalLandCost - batteryEpcCost - batteryLandCost;

    const capitalCostBreakdown = {
      Methanol: methanolCapex,
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
      this.parameters.methanolPlantCapacity,
      this.parameters.methanolStorageCapacity,
      carbonCapturePlantCapacity,
      methanolPlantUnitCost,
      this.parameters.methanolStorageCost,
      ccPlantCost,
      this.parameters.methanolPlantOMCost,
      this.parameters.methanolStorageOMCost,
      this.parameters.ccPlantOMCost
    );

    const methanolOpexCost = plantOpexCost + storageUnitOpexCost;

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
      methanolOpexCost + ccOpexCost
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
        methanolOpexCost,
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
        "Methanol OPEX": meOpexPerYear,
        "CC OPEX": ccOpexPerYear,
      },
    };

    const {
      lch2,
      lcP2x: lcmeoh,
      p2xProductionCost: methanolProductionCost,
    } = calculateP2XProductionLC(
      totalCapexCost,
      totalEpcCost,
      totalLandCost,
      this.parameters.projectTimeline,
      this.discountRate,
      totalOpex,
      hydrogenProduction,
      methanolProduction
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
      methanolProductionCost,
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
    } = generateMeOHLCBreakdown(
      h2StorageCapex,
      methanolCapex,
      ccCapex,
      h2StorageOpexCost,
      methanolOpexCost,
      ccOpexCost,
      methanolProductionCost,
      this.parameters.projectTimeline,
      this.discountRate
    );

    const lcBreakdownData: { [key: string]: number } = {
      "Power Plant CAPEX": lcPowerPlantCAPEX,
      "Electrolyser CAPEX": lcElectrolyserCAPEX,
      "H2 Storage CAPEX": lcH2StorageCAPEX,
      "Methanol Plant CAPEX": lcMePlantCAPEX,
      "Carbon Capture CAPEX": lcCarbonCaptureCAPEX,
      "Indirect Costs": lcIndirectCosts,
      "Power Plant OPEX": lcPowerPlantOPEX,
      "Electrolyser OPEX": lcElectrolyserOPEX,
      "H2 Storage OPEX": lcH2StorageOPEX,
      "Methanol Plant OPEX": lcMePlantOPEX,
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

      "Time Electrolyser is at its Maximum Capacity": roundToTwoDP(
        mean(ratedCapacityTime.map((x) => x * 100))
      ),

      "Total Time Electrolyser is Operating": roundToTwoDP(
        mean(totalOperatingTime.map((x) => x * 100))
      ),

      "Time Methanol Plant is at its Maximum Capacity": roundToTwoDP(
        mean(methanolRatedCapacityTime.map((x) => x * 100))
      ),

      "Total Time Methanol Plant is Operating": roundToTwoDP(
        mean(totalMethanolOperatingTime.map((x) => x * 100))
      ),

      "Electrolyser Capacity Factor": roundToTwoDP(
        mean(electrolyserCapacityFactors.map((x) => x * 100))
      ),
      "Methanol Capacity Factor": roundToTwoDP(
        mean(methanolCapacityFactors.map((x) => x * 100))
      ),

      "Energy Consumed by Electrolyser": roundToNearestInteger(
        mean(electricityConsumed)
      ),

      "Excess Energy Not Utilised by Electrolyser": roundToNearestInteger(
        mean(electricityProduced)
      ),

      "Hydrogen Output": roundToNearestInteger(mean(hydrogenProduction)),

      "Methanol Output": roundToNearestInteger(mean(methanolProduction)),

      "Levelised Cost of Hydrogen (LCH2)": roundToTwoDP(lch2),

      "Levelised Cost of Methanol (LCMeOH)": roundToTwoDP(lcmeoh),
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

  calculateMethanolModel(projectTimeline: number) {
    const {
      stackDegradation,
      solarDegradation,
      windDegradation,
      inputConfiguration,
    } = this.parameters;
    const carbonCapturePlantCapacity = carbon_capture_plant_capacity(
      this.parameters.methanolPlantCapacity
    );
    const hydrogenOutput = hydrogen_output(
      this.parameters.methanolPlantCapacity
    );

    const methanolPlantPowerDemand = powerfuel_plant_power_demand(
      this.parameters.methanolPlantCapacity,
      this.parameters.methanolPlantSec,
      this.hoursPerYear
    );
    const ccSec =
      this.parameters.ccSourceConfiguration === "Preset Source"
        ? carbonCaptureSourceToSec(this.parameters.carbonCaptureSource!)
        : this.parameters.ccSec;
    const carbonCapturePlantPowerDemand =
      this.carbon_capture_plant_power_demand(carbonCapturePlantCapacity, ccSec);

    const electrolyserNominalCapacity =
      inputConfiguration === "Basic"
        ? basic_nominal_electrolyser_capacity(
            hydrogenOutput,
            this.secAtNominalLoad,
            this.parameters.electrolyserSystemOversizing / 100,
            this.electrolyserEfficiency / 100
          )
        : nominal_electrolyser_capacity(
            hydrogenOutput,
            this.secAtNominalLoad,
            this.parameters.electrolyserSystemOversizing / 100
          );

    const { solarRatio, windRatio } = calculateSolarToWindRatio(
      this.parameters.powerPlantType,
      this.parameters.solarToWindPercentage
    );
    const solarNominalCapacity = nominal_solar_capacity(
      methanolPlantPowerDemand,
      carbonCapturePlantPowerDemand,
      electrolyserNominalCapacity,
      solarRatio,
      this.parameters.powerPlantOversizeRatio
    );
    const windNominalCapacity = nominal_wind_capacity(
      methanolPlantPowerDemand,
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
        methanolPlantPowerDemand + carbonCapturePlantPowerDemand;
    }

    if (isOffshore(this.parameters.location)) {
      if (solarNominalCapacity !== 0) {
        throw new Error(
          "Solar nominal capacity should be zero for offshore locations. Current value:" +
            solarNominalCapacity
        );
      }
    }

    if (inputConfiguration === "Basic") {
      const solarToWindRatio = isOffshore(this.parameters.location)
        ? 0
        : this.parameters.solarToWindPercentage / 100;
      const hourlyOperations =
        this.calculatePowerplantAndElectrolyserHourlyOperation(
          solarToWindRatio,
          1 - solarToWindRatio,
          // default for the first calculation
          electrolyserNominalCapacity,
          powerPlantNominalCapacity,
          methanolPlantPowerDemand,
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
        this.parameters.methanolPlantMinimumTurndown / 100
      );

      const ccOut = cc_out(
        h2ToMeOhUnit,
        hydrogenOutput,
        carbonCapturePlantCapacity
      );

      const methanolProduction = meOh_unit_out(ccOut);
      const methanolCapacityFactors = me_unit_capacity_factor(
        methanolProduction,
        this.parameters.methanolPlantCapacity,
        this.hoursPerYear
      );

      const hourlyOperationsInYearOne: ModelHourlyOperation = {
        powerplantCapacityFactors: hourlyOperations.powerplantCapacityFactors,
        electrolyserCapacityFactors:
          hourlyOperations.electrolyserCapacityFactors,
        hydrogenProduction,
        netBatteryFlow: hourlyOperations.netBatteryFlow,
        methanolCapacityFactors: methanolCapacityFactors,
      };

      const { solarToWindPercentage = 0 } = this.parameters;
      // back calcualte power plant type from the percentages.
      // Default to hybrid
      let powerPlantType: PowerPlantType = "Hybrid";
      if (solarToWindPercentage === 100) {
        powerPlantType = "Solar";
      }

      if (solarToWindPercentage === 0) {
        powerPlantType = "Wind";
      }

      const operatingOutputs = calculateMethanolSnapshotForYear(
        hourlyOperations.powerplantCapacityFactors,
        hourlyOperations.electrolyserCapacityFactors,
        methanolCapacityFactors,
        hydrogenProduction,
        methanolProduction,
        hourlyOperations.netBatteryFlow,
        electrolyserNominalCapacity,
        powerPlantNominalCapacity,
        this.kgToTonne,
        this.hoursPerYear,
        this.elecMaxLoad,
        this.batteryEfficiency
      );

      let projectSummary: MethanolProjectModelSummary = {
        electricityConsumed: [],
        electricityProduced: [],
        electricityConsumedByBattery: [],
        totalOperatingTime: [],
        hydrogenProduction: [],
        powerPlantCapacityFactors: [],
        ratedCapacityTime: [],
        electrolyserCapacityFactors: [],
        methanolRatedCapacityTime: [],
        totalMethanolOperatingTime: [],
        methanolCapacityFactors: [],
        methanolProduction: [],
      };

      Object.keys(operatingOutputs).forEach((key) => {
        projectSummary[key as keyof MethanolProjectModelSummary] = Array(
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
          electrolyserNominalCapacity,
          powerPlantNominalCapacity,
          methanolPlantPowerDemand,
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
          this.parameters.methanolPlantMinimumTurndown / 100
        );

        const ccOut = cc_out(
          h2ToMeOhUnit,
          hydrogenOutput,
          carbonCapturePlantCapacity
        );

        const methanolProduction = meOh_unit_out(ccOut);
        const methanolCapacityFactors = me_unit_capacity_factor(
          methanolProduction,
          this.parameters.methanolPlantCapacity,
          this.hoursPerYear
        );

        const hourlyOperationsInYearOne: ModelHourlyOperation = {
          powerplantCapacityFactors,
          electrolyserCapacityFactors,
          netBatteryFlow,
          hydrogenProduction,
          methanolCapacityFactors,
        };
        const operatingOutputs = calculateMethanolSnapshotForYear(
          powerplantCapacityFactors,
          electrolyserCapacityFactors,
          methanolCapacityFactors,
          hydrogenProduction,
          methanolProduction,
          netBatteryFlow,
          electrolyserNominalCapacity,
          powerPlantNominalCapacity,
          this.kgToTonne,
          this.hoursPerYear,
          this.elecMaxLoad,
          this.batteryEfficiency
        );

        let projectSummary: MethanolProjectModelSummary = {
          electricityConsumed: [],
          electricityProduced: [],
          electricityConsumedByBattery: [],
          totalOperatingTime: [],
          hydrogenProduction: [],
          powerPlantCapacityFactors: [],
          ratedCapacityTime: [],
          electrolyserCapacityFactors: [],
          methanolRatedCapacityTime: [],
          totalMethanolOperatingTime: [],
          methanolCapacityFactors: [],
          methanolProduction: [],
        };
        Object.keys(projectSummary).forEach((key) => {
          projectSummary[key as keyof MethanolProjectModelSummary] = Array(
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

      const calculateMethanolModelSummary = (
        hourlyOperation: ModelHourlyOperation
      ) => {
        return calculateMethanolSnapshotForYear(
          hourlyOperation.powerplantCapacityFactors,
          hourlyOperation.electrolyserCapacityFactors,
          hourlyOperation.methanolCapacityFactors,
          hourlyOperation.hydrogenProduction,
          hourlyOperation.methanolProduction,
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
            electrolyserNominalCapacity,
            powerPlantNominalCapacity,
            methanolPlantPowerDemand,
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
            this.parameters.methanolPlantMinimumTurndown / 100
          );

          const ccOut = cc_out(
            h2ToMeOhUnit,
            hydrogenOutput,
            carbonCapturePlantCapacity
          );

          const methanolProduction = meOh_unit_out(ccOut);
          const methanolCapacityFactors = me_unit_capacity_factor(
            methanolProduction,
            this.parameters.methanolPlantCapacity,
            this.hoursPerYear
          );

          return {
            powerplantCapacityFactors,
            electrolyserCapacityFactors,
            netBatteryFlow,
            hydrogenProduction,
            methanolCapacityFactors,
            methanolProduction,
          };
        }
      );

      const hourlyOperationsInYearOne: ModelHourlyOperation =
        capFactorsByYear[0];

      const modelSummaryPerYear = capFactorsByYear.map((value) => {
        return calculateMethanolModelSummary(value);
      });

      let projectSummary: MethanolProjectModelSummary = {
        electricityConsumed: [],
        electricityProduced: [],
        electricityConsumedByBattery: [],
        totalOperatingTime: [],
        hydrogenProduction: [],
        powerPlantCapacityFactors: [],
        ratedCapacityTime: [],
        electrolyserCapacityFactors: [],
        methanolRatedCapacityTime: [],
        totalMethanolOperatingTime: [],
        methanolCapacityFactors: [],
        methanolProduction: [],
      };

      modelSummaryPerYear.forEach((yearSummary) => {
        Object.keys(projectSummary).forEach((key) => {
          projectSummary[key as keyof MethanolProjectModelSummary].push(
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
    electrolyserNominalCapacity: number,
    powerPlantNominalCapacity: number,
    methanolPlantPowerDemand: number,
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
      methanolPlantPowerDemand
    );

    // normal electrolyser calculation
    let electrolyserCapacityFactors = electrolyserActualPower.map(
      (v: number) => v / electrolyserNominalCapacity
    );

    const meOH_Cc_actual_power = generatorActualPower.map(
      (generatorActualPower: number) => {
        if (
          generatorActualPower >
          carbonCapturePlantPowerDemand + methanolPlantPowerDemand
        ) {
          return carbonCapturePlantPowerDemand + methanolPlantPowerDemand;
        } else {
          return 0;
        }
      }
    );
    let methanolCapacityFactors = meOH_Cc_actual_power.map(
      (v: number) =>
        v / (carbonCapturePlantPowerDemand + methanolPlantPowerDemand)
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
        methanolPlantPowerDemand,
        generatorActualPower,
        this.parameters.methanolPlantMinimumTurndown / 100
      );
      // with battery
      methanolCapacityFactors = capacityFactorsWithBattery(
        methanolCapacityFactors,
        netBatteryFlow
      );
    }

    return {
      powerplantCapacityFactors,
      electrolyserCapacityFactors,
      netBatteryFlow,
      methanolCapacityFactors,
    };
  }

  private carbon_capture_plant_power_demand(
    carbonCapturePlantCapacity: number,
    carbonCaptureSec: number
  ) {
    return (carbonCapturePlantCapacity / 24) * carbonCaptureSec;
  }
}

function carbon_capture_plant_capacity(methanol_plant_capacity: number) {
  return (((methanol_plant_capacity * 1000) / 365) * (44.01 / 32.04)) / 0.95;
}

function hydrogen_output(methanol_plant_capacity: number) {
  return methanol_plant_capacity * (1000 / 365) * (2.016 / 32.04) * (3 / 0.95);
}

// should be repeated for multiple cells
function meOh_unit_out(
  cc_out: number[] // w20
) {
  return cc_out.map((_: number, i: number) =>
    cc_out[i] > 0 ? (cc_out[i] * 0.95 * 32.04) / 44.01 : 0
  );
}