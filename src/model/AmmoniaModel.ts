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
  AmmoniaProjectModelSummary,
  CsvRow,
  ModelHourlyOperation,
} from "./ModelTypes";
import {
  CumulativeDegradation,
  MaxDegradation,
  calculateAmmoniaSnapshotForYear,
  calculateH2ToPowerfuelUnit,
  calculateHydrogenProduction,
  calculateNetBatteryFlow,
  calculatePowerPlantCapacityFactors,
  calculateSolarToWindRatio,
  capacityFactorsWithBattery,
  excess_generation,
  generator_actual_power,
  getBatteryLosses,
  hydrogen_storage_CAPEX,
  nominal_electrolyser_capacity,
  powerfuel_plant_power_demand,
} from "./ModelUtils";
import { getCapex, getEpcCosts } from "./capex-calculations";
import { HOURS_PER_YEAR } from "./consts";
import {
  calculateP2XProductionLC,
  roundToNearestInteger,
  roundToNearestThousand,
  roundToTwoDP,
} from "./cost-functions";
import {
  generateAmmoniaLCH2Breakdown,
  generateLCBreakdown,
} from "./lch2-calculations";
import {
  calculateAmmoniaPerYearOpex,
  calculatePerYearOpex,
  getOpex,
  getP2XOpex,
  getTotalP2XOpex,
} from "./opex-calculations";

export type AmmoniaData = {
  ammoniaPlantCapitalCost?: number;
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
  batteryRatedPower?: number;
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
  hydrogenStorageOMCost: number;
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
  private readonly batteryEnergy: number;
  private readonly batteryEfficiency: number;
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
    this.batteryEnergy = this.batteryRatedPower * this.batteryStorageDuration;
    this.batteryEfficiency = parameters.batteryEfficiency / 100;
    this.batteryMinCharge = (parameters.batteryMinCharge ?? 0) / 100;
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
      ammoniaCapacityFactors,
      ammoniaProduction,
      ammoniaRatedCapacityTime,
      totalAmmoniaOperatingTime,
    } = this.calculateAmmoniaModel(this.parameters.projectTimeline);

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

    let ammoniaCapex = 0;
    if (this.parameters.inputConfiguration === "Basic") {
      ammoniaCapex =
        this.parameters.ammoniaPlantCapitalCost! *
        this.parameters.ammoniaPlantCapacity;
    } else {
      ammoniaCapex = ammonia_plant_CAPEX(
        this.parameters.ammoniaPlantCapacity,
        this.parameters.ammoniaStorageCapacity,
        airSeparationUnitCapacity,
        this.parameters.ammoniaSynthesisUnitCost,
        this.parameters.ammoniaStorageCost,
        this.parameters.airSeparationUnitCost
      );
    }

    const h2StorageCapex = hydrogen_storage_CAPEX(
      this.parameters.hydrogenStorageCapacity,
      this.parameters.hydrogenStoragePurchaseCost
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

    const ammoniaEpcCost = ammonia_plant_epc(
      this.parameters.ammoniaEpcCosts,
      ammoniaCapex
    );
    const ammoniaLandCost = ammonia_plant_land_procurement_cost(
      this.parameters.ammoniaLandProcurementCosts,
      ammoniaCapex
    );
    const indirectCostBreakdown = {
      "Ammonia EPC": ammoniaEpcCost,
      "Ammonia Land": ammoniaLandCost,
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
      ammoniaLandCost +
      electrolyserLandCost +
      powerPlantLandCost +
      batteryLandCost;
    const totalIndirectCosts =
      ammoniaLandCost +
      ammoniaEpcCost +
      electrolyserEpcCost +
      electrolyserLandCost +
      powerPlantEpcCost +
      powerPlantLandCost;

    const capitalCostBreakdown = {
      Ammonia: ammoniaCapex,
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

    const {
      h2StorageOpexCost,
      plantOpexCost,
      storageUnitOpexCost,
      secondaryUnitOpexCost,
    } = getP2XOpex(
      this.parameters.hydrogenStorageCapacity,
      this.parameters.hydrogenStoragePurchaseCost,
      this.parameters.hydrogenStorageOMCost,
      this.parameters.ammoniaPlantCapacity,
      this.parameters.ammoniaStorageCapacity,
      airSeparationUnitCapacity,
      this.parameters.ammoniaSynthesisUnitCost,
      this.parameters.ammoniaStorageCost,
      this.parameters.airSeparationUnitCost,
      this.parameters.ammoniaPlantOMCost,
      this.parameters.ammoniaStorageOMCost,
      this.parameters.asuPlantOMCost
    );

    const ammoniaOpexCost =
      plantOpexCost + storageUnitOpexCost + secondaryUnitOpexCost;

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
      ammoniaOpexCost
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

    const { h2StorageOpexPerYear, ammoniaOpexPerYear } =
      calculateAmmoniaPerYearOpex(
        h2StorageOpexCost,
        ammoniaOpexCost,
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
        "Ammonia OPEX": ammoniaOpexPerYear,
      },
    };

    const {
      lch2,
      lcP2x: lcnh3,
      p2xProductionCost: ammoniaProductionCost,
    } = calculateP2XProductionLC(
      totalCapexCost,
      totalEpcCost,
      totalLandCost,
      this.parameters.projectTimeline,
      this.discountRate,
      totalOpex,
      hydrogenProduction,
      ammoniaProduction
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
      ammoniaProductionCost,
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
      lcAmmoniaPlantCAPEX,
      lcH2StorageOPEX,
      lcAmmoniaPlantOPEX,
    } = generateAmmoniaLCH2Breakdown(
      h2StorageCapex,
      ammoniaCapex,
      h2StorageOpexCost,
      ammoniaOpexCost,
      ammoniaProductionCost,
      this.parameters.projectTimeline,
      this.discountRate
    );

    const lcBreakdownData: { [key: string]: number } = {
      "Power Plant CAPEX": lcPowerPlantCAPEX,
      "Electrolyser CAPEX": lcElectrolyserCAPEX,
      "H2 Storage CAPEX": lcH2StorageCAPEX,
      "Ammonia Plant CAPEX": lcAmmoniaPlantCAPEX,
      "Indirect Costs": lcIndirectCosts,
      "Power Plant OPEX": lcPowerPlantOPEX,
      "Electrolyser OPEX": lcElectrolyserOPEX,
      "H2 Storage OPEX": lcH2StorageOPEX,
      "Ammonia Plant OPEX": lcAmmoniaPlantOPEX,
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

      "Time Ammonia Plant is at its Maximum Capacity": roundToTwoDP(
        mean(ammoniaRatedCapacityTime.map((x) => x * 100))
      ),

      "Total Time Ammonia Plant is Operating": roundToTwoDP(
        mean(totalAmmoniaOperatingTime.map((x) => x * 100))
      ),

      "Electrolyser Capacity Factor": roundToTwoDP(
        mean(electrolyserCapacityFactors.map((x) => x * 100))
      ),
      "Ammonia Capacity Factor": roundToTwoDP(
        mean(ammoniaCapacityFactors.map((x) => x * 100))
      ),

      "Energy Consumed by Electrolyser": roundToNearestInteger(
        mean(electricityConsumed)
      ),

      "Excess Energy Not Utilised by Electrolyser": roundToNearestInteger(
        mean(electricityProduced)
      ),

      "Hydrogen Output": roundToNearestInteger(mean(hydrogenProduction)),

      "Ammonia Output": roundToNearestInteger(mean(ammoniaProduction)),

      "Levelised Cost of Hydrogen (LCH2)": roundToTwoDP(lch2),

      "Levelised Cost of Ammonia (LCNH3)": roundToTwoDP(lcnh3),
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

  calculateAmmoniaModel(projectTimeline: number) {
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

    const ammoniaPlantPowerDemand = powerfuel_plant_power_demand(
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

    const { solarRatio, windRatio } = calculateSolarToWindRatio(
      this.parameters.powerPlantType,
      this.parameters.solarToWindPercentage
    );

    const solarNominalCapacity = nominal_solar_capacity(
      ammoniaPlantPowerDemand,
      airSeparationUnitPowerDemand,
      electrolyserNominalCapacity,
      solarRatio,
      this.parameters.powerPlantOversizeRatio
    );
    const windNominalCapacity = nominal_wind_capacity(
      ammoniaPlantPowerDemand,
      airSeparationUnitPowerDemand,
      electrolyserNominalCapacity,
      windRatio,
      this.parameters.powerPlantOversizeRatio
    );
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
          airSeparationUnitCapacity,
          1
        );

      // if (
      //   notEnoughHydrogenProduced(
      //     // TODO reuse already calculated value
      //     generator_actual_power(
      //       powerPlantNominalCapacity,
      //       hourlyOperations.powerplantCapacityFactors
      //     ),
      //     ammoniaPlantPowerDemand + airSeparationUnitPowerDemand,
      //     electrolyserNominalCapacity,
      //     this.elecMinLoad,
      //     this.secAtNominalLoad,
      //     hydrogenOutput
      //   )
      // ) {
      //   throw new Error(
      //     "Electrolyser oversizing is to small for the current configuration. Please increase and try again."
      //   );
      // }

      const hydrogenProduction = calculateHydrogenProduction(
        hourlyOperations.electrolyserCapacityFactors,
        this.hydOutput,
        0,
        this.specCons
      );

      const h2ToNH3Unit = calculateH2ToPowerfuelUnit(
        hydrogenProduction,
        electrolyserNominalCapacity,
        hydrogenOutput,
        this.parameters.hydrogenStorageCapacity,
        this.parameters.minimumHydrogenStorage / 100,
        this.parameters.ammoniaPlantMinimumTurndown / 100
      );

      const asuOut = asu_out(
        h2ToNH3Unit,
        hydrogenOutput,
        airSeparationUnitCapacity
      );

      const ammoniaProduction = nh3_unit_out(asuOut, h2ToNH3Unit);
      const ammoniaCapacityFactors = nh3_unit_capacity_factor(
        ammoniaProduction,
        this.parameters.ammoniaPlantCapacity,
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

      const operatingOutputs = calculateAmmoniaSnapshotForYear(
        hourlyOperations.powerplantCapacityFactors,
        hourlyOperations.electrolyserCapacityFactors,
        ammoniaCapacityFactors,
        hydrogenProduction,
        ammoniaProduction,
        hourlyOperations.netBatteryFlow,
        electrolyserNominalCapacity,
        powerPlantNominalCapacity,
        this.kgToTonne,
        this.hoursPerYear,
        this.elecMaxLoad,
        this.batteryEfficiency
      );

      let projectSummary: AmmoniaProjectModelSummary = {
        electricityConsumed: [],
        electricityProduced: [],
        electricityConsumedByBattery: [],
        totalOperatingTime: [],
        hydrogenProduction: [],
        powerPlantCapacityFactors: [],
        ratedCapacityTime: [],
        electrolyserCapacityFactors: [],
        ammoniaRatedCapacityTime: [],
        totalAmmoniaOperatingTime: [],
        ammoniaCapacityFactors: [],
        ammoniaProduction: [],
      };

      Object.keys(operatingOutputs).forEach((key) => {
        projectSummary[key as keyof AmmoniaProjectModelSummary] = Array(
          projectTimeline
        ).fill(operatingOutputs[key]);
      });

      return {
        airSeparationUnitCapacity,
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
          airSeparationUnitCapacity,
          year
        );

        // if (
        //   notEnoughHydrogenProduced(
        //     // TODO reuse already calculated value
        //     generator_actual_power(
        //       powerPlantNominalCapacity,
        //       powerplantCapacityFactors
        //     ),
        //     ammoniaPlantPowerDemand + airSeparationUnitPowerDemand,
        //     electrolyserNominalCapacity,
        //     this.elecMinLoad,
        //     this.secAtNominalLoad,
        //     hydrogenOutput
        //   )
        // ) {
        //   throw new Error(
        //     "Electrolyser oversizing is to small for the current configuration. Please increase and try again."
        //   );
        // }

        const hydrogenProduction = calculateHydrogenProduction(
          electrolyserCapacityFactors,
          this.hydOutput,
          0,
          this.specCons
        );

        const h2ToNH3Unit = calculateH2ToPowerfuelUnit(
          hydrogenProduction,
          electrolyserNominalCapacity,
          hydrogenOutput,
          this.parameters.hydrogenStorageCapacity,
          this.parameters.minimumHydrogenStorage / 100,
          this.parameters.ammoniaPlantMinimumTurndown / 100
        );

        const asuOut = asu_out(
          h2ToNH3Unit,
          hydrogenOutput,
          airSeparationUnitCapacity
        );

        const ammoniaProduction = nh3_unit_out(asuOut, h2ToNH3Unit);
        const ammoniaCapacityFactors = nh3_unit_capacity_factor(
          ammoniaProduction,
          this.parameters.ammoniaPlantCapacity,
          this.hoursPerYear
        );

        const hourlyOperationsInYearOne: ModelHourlyOperation = {
          powerplantCapacityFactors,
          electrolyserCapacityFactors,
          netBatteryFlow,
          hydrogenProduction,
          ammoniaCapacityFactors,
        };
        const operatingOutputs = calculateAmmoniaSnapshotForYear(
          powerplantCapacityFactors,
          electrolyserCapacityFactors,
          ammoniaCapacityFactors,
          hydrogenProduction,
          ammoniaProduction,
          netBatteryFlow,
          electrolyserNominalCapacity,
          powerPlantNominalCapacity,
          this.kgToTonne,
          this.hoursPerYear,
          this.elecMaxLoad,
          this.batteryEfficiency
        );

        let projectSummary: AmmoniaProjectModelSummary = {
          electricityConsumed: [],
          electricityProduced: [],
          electricityConsumedByBattery: [],
          totalOperatingTime: [],
          hydrogenProduction: [],
          powerPlantCapacityFactors: [],
          ratedCapacityTime: [],
          electrolyserCapacityFactors: [],
          ammoniaRatedCapacityTime: [],
          totalAmmoniaOperatingTime: [],
          ammoniaCapacityFactors: [],
          ammoniaProduction: [],
        };
        Object.keys(projectSummary).forEach((key) => {
          projectSummary[key as keyof AmmoniaProjectModelSummary] = Array(
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

      const calculateAmmoniaModelSummary = (
        hourlyOperation: ModelHourlyOperation
      ) => {
        return calculateAmmoniaSnapshotForYear(
          hourlyOperation.powerplantCapacityFactors,
          hourlyOperation.electrolyserCapacityFactors,
          hourlyOperation.ammoniaCapacityFactors,
          hourlyOperation.hydrogenProduction,
          hourlyOperation.ammoniaProduction,
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
            airSeparationUnitCapacity,
            year
          );

          // if (
          //   notEnoughHydrogenProduced(
          //     // TODO reuse already calculated value
          //     generator_actual_power(
          //       powerPlantNominalCapacity,
          //       powerplantCapacityFactors
          //     ),
          //     ammoniaPlantPowerDemand + airSeparationUnitPowerDemand,
          //     electrolyserNominalCapacity,
          //     this.elecMinLoad,
          //     this.secAtNominalLoad,
          //     hydrogenOutput
          //   )
          // ) {
          //   throw new Error(
          //     "Electrolyser oversizing is to small for the current configuration. Please increase and try again."
          //   );
          // }

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
          const h2ToNH3Unit = calculateH2ToPowerfuelUnit(
            hydrogenProduction,
            electrolyserNominalCapacity,
            hydrogenOutput,
            this.parameters.hydrogenStorageCapacity,
            this.parameters.minimumHydrogenStorage / 100,
            this.parameters.ammoniaPlantMinimumTurndown / 100
          );

          const asuOut = asu_out(
            h2ToNH3Unit,
            hydrogenOutput,
            airSeparationUnitCapacity
          );

          const ammoniaProduction = nh3_unit_out(asuOut, h2ToNH3Unit);
          const ammoniaCapacityFactors = nh3_unit_capacity_factor(
            ammoniaProduction,
            this.parameters.ammoniaPlantCapacity,
            this.hoursPerYear
          );

          return {
            powerplantCapacityFactors,
            electrolyserCapacityFactors,
            netBatteryFlow,
            hydrogenProduction,
            ammoniaCapacityFactors,
            ammoniaProduction,
          };
        }
      );

      const hourlyOperationsInYearOne: ModelHourlyOperation =
        capFactorsByYear[0];

      const modelSummaryPerYear = capFactorsByYear.map((value) => {
        return calculateAmmoniaModelSummary(value);
      });

      let projectSummary: AmmoniaProjectModelSummary = {
        electricityConsumed: [],
        electricityProduced: [],
        electricityConsumedByBattery: [],
        totalOperatingTime: [],
        hydrogenProduction: [],
        powerPlantCapacityFactors: [],
        ratedCapacityTime: [],
        electrolyserCapacityFactors: [],
        ammoniaRatedCapacityTime: [],
        totalAmmoniaOperatingTime: [],
        ammoniaCapacityFactors: [],
        ammoniaProduction: [],
      };

      modelSummaryPerYear.forEach((yearSummary) => {
        Object.keys(projectSummary).forEach((key) => {
          projectSummary[key as keyof AmmoniaProjectModelSummary].push(
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
    powerPlantOversizeRatio: number,
    electrolyserNominalCapacity: number,
    powerPlantNominalCapacity: number,
    airSeparationUnitCapacity: number,
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
    const ammoniaPowerDemand = powerfuel_plant_power_demand(
      this.parameters.ammoniaPlantCapacity,
      this.parameters.ammoniaPlantSec,
      this.hoursPerYear
    );
    const asuPowerDemand = air_separation_unit_power_demand(
      airSeparationUnitCapacity,
      this.parameters.asuSec
    );
    const asuNh3ActualPower = asu_nh3_actual_power(
      ammoniaPowerDemand,
      asuPowerDemand,
      generatorActualPower
    );
    const electrolyserActualPower = electrolyser_actual_power(
      electrolyserNominalCapacity,
      generatorActualPower,
      asuNh3ActualPower
    );

    // normal electrolyser calculation
    let electrolyserCapacityFactors = electrolyserActualPower.map(
      (v: number) => v / electrolyserNominalCapacity
    );
    let asuNh3CapacityFactors = asu_nh3_capacity_factor(
      ammoniaPowerDemand,
      asuPowerDemand,
      asuNh3ActualPower
    );

    let netBatteryFlow: number[] = new Array(this.hoursPerYear).fill(0);
    // // battery model calc
    if (this.batteryEnergy > 0) {
      const hours = [1, 2, 4, 8];
      if (!hours.includes(this.batteryStorageDuration)) {
        throw new Error(
          `Battery storage length not valid. Please enter one of 1, 2, 4 or 8. Current value is ${this.batteryStorageDuration}`
        );
      }
      const excessGeneration = excess_generation(
        generatorActualPower,
        electrolyserActualPower,
        asuNh3ActualPower
      );
      const batteryLosses = getBatteryLosses(this.batteryEfficiency);
      netBatteryFlow = calculateNetBatteryFlow(
        powerPlantOversizeRatio,
        electrolyserNominalCapacity,
        excessGeneration,
        electrolyserCapacityFactors,
        this.elecMinLoad,
        this.elecMaxLoad,
        this.batteryRatedPower,
        this.batteryEnergy,
        this.batteryMinCharge,
        batteryLosses
      );

      asuNh3CapacityFactors = capacityFactorsWithBattery(
        asuNh3CapacityFactors,
        netBatteryFlow
      );

      electrolyserCapacityFactors = electrolyser_with_battery_capacity_factor(
        netBatteryFlow,
        electrolyserActualPower,
        asuNh3ActualPower,
        electrolyserCapacityFactors,
        ammoniaPowerDemand,
        asuPowerDemand,
        electrolyserNominalCapacity,
        this.batteryEfficiency
      );
    }

    return {
      powerplantCapacityFactors,
      electrolyserCapacityFactors,
      netBatteryFlow,
      asuNh3CapacityFactors,
    };
  }
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

// TODO lots of these functions can be simplified like methanol and methane
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
    renewable_energy_plant_oversizing *
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
    renewable_energy_plant_oversizing *
    hybrid_generator_split
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
        (electrolyser_actual_power[i] +
          -1 * net_battery_flow[i] * (1 - (1 - battery_efficiency) / 2) -
          (ammonia_power_demand + asu_power_demand - asu_nh3_actual_power[i])) /
        electrolyser_capacity
      );
    }

    return electrolyser_capacity_factor[i];
  });
}

// should be repeated for multiple cells
function asu_out(
  h2_to_nh3: number[], // v20
  hydrogen_output: number, // s1b16
  asu_capacity: number // s1b14
) {
  return h2_to_nh3.map((v: number) => {
    if (Math.abs(v - (hydrogen_output / 24) * 1000) < 0.001) {
      return (asu_capacity / 24) * 1000;
    } else if (v < (hydrogen_output / 24) * 1000) {
      return (v / ((hydrogen_output / 24) * 1000)) * (asu_capacity / 24) * 1000;
    }
    // TODO check if this is okay
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
  return nh3_unit_out.map((v: number) =>
    Math.min(v / (ammonia_plant_capacity * (1_000_000 / hoursPerYear)), 1)
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
  return roundToNearestThousand(
    ammonia_plant_capacity * 1000 * ammonia_synthesis_unit_purchase_cost +
      ((ammonia_storage_capacity * (ammonia_plant_capacity * 1000)) / 365) *
        ammonia_storage_purchase_cost +
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

function asu_nh3_capacity_factor(
  ammonia_power_demand: number, // ammonia power demand
  asu_power_demand: number, // asu power demand
  asu_nh3_actual_power: number[] // asu/nh3 actual power
) {
  return asu_nh3_actual_power.map(
    (v: number) => v / (ammonia_power_demand + asu_power_demand)
  );
}
