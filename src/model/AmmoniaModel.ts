import {
  backCalculateElectrolyserCapacity,
  backCalculatePowerPlantCapacity,
} from "../components/charts/basic-calculations";
import { maxDegradationStackReplacementYears } from "../components/charts/opex-calculations";
import { InputConfiguration, SECType, StackReplacementType } from "../types";
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
  calculateVariableHydrogenProduction,
  getTabulatedOutput,
} from "./ModelUtils";
import { HOURS_PER_YEAR, SUMMARY_KEYS } from "./consts";

export type AmmoniaData = {
  // HYDROGEN COPY PASTA
  inputConfiguration: InputConfiguration;
  batteryLifetime: number;
  batteryMinCharge: number;
  batteryEfficiency: number;
  batteryStorageDuration: number;
  batteryRatedPower: number;
  timeBetweenOverloading: number;
  maximumLoadWhenOverloading: number;
  electrolyserNominalCapacity: number;
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
  secType: SECType;

  // NEW AMMONIA STUFF
  // system sizing
  ammonia_plant_capacity: number; // raw input
  electrolyser_system_oversizing: number; // raw input %
  solar_hybrid_generator_split: number; // raw input %
  wind_hybrid_generator_split: number; // raw input %
  renewable_energy_plant_oversizing: number; // raw input

  // specific electricity consumption sec
  ammonia_plant_sec: number; // raw input
  asu_sec: number; // raw input
  hydrogen_storage_capacity: number; // raw input

  // ammonia plant load range
  ammonia_plant_minimum_turndown: number; // raw input %

  // electrolyster and hydrogen storage paramteres
  // other operation factors
  minimum_hydrogen_storage: number;
};

export class AmmoniaModel {
  // consts
  readonly MWtokW = 1000; // kW/MW
  readonly hoursPerYear = HOURS_PER_YEAR;
  readonly kgtoTonne = 1 / 1000;
  readonly H2VoltoMass = 0.089;
  readonly secAtNominalLoad = 33.33; // kWh/kg

  // calculated params

  elecCapacity: number;
  elecMaxLoad: number;
  elecMinLoad: number;
  elecEff: number;
  hydOutput: number;
  parameters: AmmoniaData;
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
  specCons: number;

  // parameters to expose to working data
  hourlyOperationsInYearOne: ModelHourlyOperation;
  ammonia_plant_power_demand: number;
  air_separation_unit_capacity: number;
  air_separation_unit_power_demand: number;
  hydrogenOutput: number;
  nominalElectrolyserCapacity: number;
  nominalSolarCapacity: number;
  nominalWindCapacity: number;
  totalNominalPowerPlantCapacity: number;

  constructor(
    parameters: AmmoniaData,
    solarData: CsvRow[],
    windData: CsvRow[]
  ) {
    this.parameters = parameters;
    // Loaded data
    this.solarData = solarData;
    this.windData = windData;

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

    // TODO implement
    this.ammonia_plant_power_demand = ammonia_plant_power_demand(
      this.parameters.ammonia_plant_capacity,
      this.parameters.ammonia_plant_sec
    );
    this.air_separation_unit_capacity = air_separation_unit_capacity(
      this.parameters.ammonia_plant_capacity
    );
    this.air_separation_unit_power_demand = air_separation_unit_power_demand(
      this.air_separation_unit_capacity,
      this.parameters.asu_sec
    );
    this.hydrogenOutput = hydrogen_output(
      this.parameters.ammonia_plant_capacity
    );
    this.nominalElectrolyserCapacity = nominal_electrolyser_capacity(
      this.hydrogenOutput,
      this.parameters.secAtNominalLoad,
      this.parameters.electrolyser_system_oversizing / 100
    );
    this.nominalSolarCapacity = nominal_solar_capacity(
      this.ammonia_plant_power_demand,
      this.air_separation_unit_power_demand,
      this.nominalElectrolyserCapacity,
      this.parameters.solar_hybrid_generator_split / 100,
      this.parameters.renewable_energy_plant_oversizing / 100
    );
    this.nominalWindCapacity = nominal_wind_capacity(
      this.ammonia_plant_power_demand,
      this.air_separation_unit_power_demand,
      this.nominalElectrolyserCapacity,
      this.parameters.wind_hybrid_generator_split / 100,
      this.parameters.renewable_energy_plant_oversizing / 100
    );
    this.totalNominalPowerPlantCapacity =
      this.nominalSolarCapacity + this.nominalWindCapacity;
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
      hourlyOperation.Hydrogen_prod_variable,
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
      mean(hourlyOperation.Electrolyser_CF)
    );
    this.totalNominalPowerPlantCapacity = backCalculatePowerPlantCapacity(
      this.parameters.powerPlantOversizeRatio,
      this.elecCapacity
    );

    const operatingOutputs = getTabulatedOutput(
      hourlyOperation.Generator_CF,
      hourlyOperation.Electrolyser_CF,
      hourlyOperation.Hydrogen_prod_fixed,
      hourlyOperation.Hydrogen_prod_variable,
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
      this.nominalSolarCapacity / this.totalNominalPowerPlantCapacity,
      this.nominalWindCapacity / this.totalNominalPowerPlantCapacity,
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
      hourlyOperation.Hydrogen_prod_variable,
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
      // additiona calcs for ammonia with battery
      electrolyserCf = calculateGeneratorCapFactors(
        generatorCf,
        batteryNetCharge,
        electrolyserCf,
        batteryEfficiency,
        this.secAtNominalLoad,
        this.parameters.ammonia_plant_capacity,
        this.parameters.electrolyser_system_oversizing,
        this.parameters.ammonia_plant_sec,
        this.parameters.asu_sec,
        this.totalNominalPowerPlantCapacity,
        this.hydrogenOutput
      );
    }

    // Stack degradation calculation
    const yearlyDegradationRate = this.calculateStackDegradation(
      stackDegradation,
      electrolyserCf,
      year,
      this.stackLifetime
    );

    const hydrogen =
      this.parameters.secType == "Fixed"
        ? calculateFixedHydrogenProduction(
            electrolyserCf,
            hydOutput,
            yearlyDegradationRate,
            specCons
          )
        : calculateVariableHydrogenProduction(
            specCons,
            electrolyserCf,
            hydOutput,
            yearlyDegradationRate
          );

    const ammoniaCapFactors = calculateNH3CapFactors(
      hydrogen,
      this.parameters.ammonia_plant_capacity,
      this.parameters.hydrogen_storage_capacity,
      this.parameters.ammonia_plant_minimum_turndown,
      this.parameters.minimum_hydrogen_storage
    );

    const workingDf = {
      Generator_CF: generatorCf,
      Electrolyser_CF: electrolyserCf,
      Hydrogen: hydrogen,
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
    parameters: AmmoniaData,
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

// Functions transcribed from ammonia model

function ammonia_plant_power_demand(
  ammonia_plant_capacity: number, // size of ammonia plant
  ammonia_plant_sec: number // electricity required to produce 1 kg of ammonia
) {
  return (
    (ammonia_plant_capacity / 8760) * 1_000_000 * (ammonia_plant_sec / 1000)
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
  ammonia_plant_capacity: number // s1b12
) {
  return nh3_unit_out.map(
    (v: number) => v / (ammonia_plant_capacity * (1_000_000 / 8760))
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
  sec_at_nominal_load: number, // raw input
  // system sizing
  ammonia_plant_capacity: number, // raw input
  electrolyser_system_oversizing: number, // raw input %
  // specific electricity consumption sec
  ammonia_plant_sec: number, // raw input
  asu_sec: number, // raw input
  total_nominal_power_plant_capacity: number,
  hydrogen_output: number
): number[] {
  const air_separation_unit_capacity_result = air_separation_unit_capacity(
    ammonia_plant_capacity
  );

  const nominal_electrolyser_capacity_result = nominal_electrolyser_capacity(
    hydrogen_output,
    sec_at_nominal_load,
    electrolyser_system_oversizing / 100
  );

  const generator_actual_power_result: number[] = generator_actual_power(
    total_nominal_power_plant_capacity,
    generatorCapFactor
  );
  const ammonia_power_demand_result = ammonia_plant_power_demand(
    ammonia_plant_capacity,
    ammonia_plant_sec
  );

  const asu_power_demand_result = air_separation_unit_power_demand(
    air_separation_unit_capacity_result,
    asu_sec
  );
  const asu_nh3_actual_power_result: number[] = asu_nh3_actual_power(
    ammonia_power_demand_result,
    asu_power_demand_result,
    generator_actual_power_result
  );

  const electrolyser_actual_power_result: number[] = electrolyser_actual_power(
    nominal_electrolyser_capacity_result,
    generator_actual_power_result,
    asu_nh3_actual_power_result
  );

  return electrolyser_with_battery_capacity_factor(
    net_battery_flow,
    electrolyser_actual_power_result,
    asu_nh3_actual_power_result,
    electrolyserCapFactor,
    ammonia_power_demand_result,
    asu_power_demand_result,
    nominal_electrolyser_capacity_result,
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
  minimum_hydrogen_storage: number // %
): number[] {
  // TODO remove duplication of these 2 functions
  const hydrogen_output_result = hydrogen_output(ammonia_plant_capacity);
  const air_separation_unit_capacity_result = air_separation_unit_capacity(
    ammonia_plant_capacity
  );
  const excess_h2_result = excess_h2(mass_of_hydrogen, hydrogen_output_result);
  const deficit_h2_result = deficit_h2(
    mass_of_hydrogen,
    hydrogen_output_result
  );

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
    hydrogen_output_result,
    ammonia_plant_minimum_turndown
  );

  const asu_out_result = asu_out(
    h2_to_nh3_result,
    hydrogen_output_result,
    air_separation_unit_capacity_result
  );

  const nh3_unit_out_result = nh3_unit_out(asu_out_result, h2_to_nh3_result);
  return nh3_unit_capacity_factor(nh3_unit_out_result, ammonia_plant_capacity);
}
