import { DefaultInput, PowerPlantConfiguration } from "../../types";

const secAtNominalLoadLabel = (
  <p>
    kWh<sub>e</sub>/kg<sub>H2</sub>
  </p>
);
const ammoniaSECLabel = (
  <p>
    kWh<sub>e</sub>/kg<sub>NH3</sub>
  </p>
);
const asuSECLabel = (
  <p>
    kWh<sub>e</sub>/kg<sub>N2</sub>
  </p>
);
const methanolSECLabel = (
  <p>
    kWh<sub>e</sub>/kg<sub>MeOH</sub>
  </p>
);
const ccSECLabel = (
  <p>
    kWh<sub>e</sub>/kg<sub>CO2</sub>
  </p>
);
const methanolCostLabel = (
  <p>
    A$/T<sub>MeOH</sub>
  </p>
);
const methaneSECLabel = (
  <p>
    kWh<sub>e</sub>/kg<sub>SNG</sub>
  </p>
);

const methaneCostLabel = (
  <p>
    A$/T<sub>SNG</sub>
  </p>
);

export const configurationTypes = [
  "powerPlantType",
  "powerPlantConfiguration",
  "stackReplacementType",
  "powerSupplyOption",
  "powerCapacityConfiguration",
  "ccSourceConfiguration",
];

export const powerPlantTypeData: string[] = ["Solar", "Wind", "Hybrid"];
export const profileData: string[] = ["Fixed", "Variable"];
export const replacementTypeData: string[] = [
  "Cumulative Hours",
  "Maximum Degradation Level",
];

export const powerPlantConfigurationData: string[] = [
  "Standalone",
  "Grid Connected",
  "PPA Agreement",
  "Grid Connected with Surplus Retailed",
];

export const CARBON_CAPTURE_SOURCE_HELPER_TEXT =
  "SEC value for sources - DAC: 1.535, Coal: 0.86, Steel: 0.78, Cement: 0.78, Fermentation Plant: 0, SMR: 0.78";

export function isPowerPlantConfiguration(
  value: string
): value is PowerPlantConfiguration {
  return powerPlantConfigurationData.includes(value);
}

export const sliderFieldDefaultInputs: DefaultInput = {
  projectScale: {
    min: 0.1,
    max: 100_000,
    step: 100,
    title: "Project Scale (kTPA)",
    helperText:
      "Hydrogen production rate. The standard is 175 ton/yr per MW of electrolyser capacity",
  },
  ammoniaPlantCapacity: {
    min: 50,
    max: 1000,
    step: 50,
    title: "Ammonia Plant Capacity (kTPA)",
    helperText:
      "Small Scale Ammonia Plants: <100 ktpa and Large Scale Ammonia Plants: >1,000 ktpa",
  },
  methanolPlantCapacity: {
    min: 50,
    max: 1000,
    step: 50,
    title: "Methanol Plant Capacity (kTPA)",
    helperText:
      "Small Scale Methanol Plants: <100 ktpa and Large Scale Methanol Plants: >1,000 ktpa",
  },
  methanePlantCapacity: {
    min: 50,
    max: 1000,
    step: 50,
    title: "Methane Plant Capacity (kTPA)",
    helperText:
      "Small Scale Methane Plants: <100 ktpa and Large Scale Methane Plants: >1,000 ktpa",
  },
  electrolyserEfficiency: {
    min: 50,
    max: 100,
    step: 2.5,
    title: "Electrolyser Efficiency (%)",
    helperText:
      "Electrolyser Efficiency relative to 39.4 kWh/kg of H2 required (HHV of H2).",
  },
  electrolyserSystemOversizing: {
    min: 0,
    max: 500,
    step: 2.5,
    title: "Electrolyser System Oversizing (%)",
    helperText:
      "Oversize the electrolyser to optimize excess hydrogen production for storage",
  },
  hydrogenStorageCapacity: {
    min: 0,
    max: 1_000_000,
    step: 50_000,
    title: "Hydrogen Storage Capacity (kg)",
    helperText:
      "Add hydrogen storage to improve powerfuel production flexibility",
  },
  powerPlantOversizeRatio: {
    min: 1,
    max: 5,
    step: 0.1,
    title: "Power Plant Oversize Ratio",
    helperText:
      "Capacity of power plant relative to electrolyser, e.g., choosing 3 results in powerplant being 3 times larger than the electrolyser capacity.",
  },
  solarToWindPercentage: {
    min: 0,
    max: 100,
    step: 10,
    title: "Power Plant Capacity Mix – Share of Solar Input",
    helperText:
      "Share of Solar in the power plant output. Provide 100% for solar only and 0% for wind only.",
  },
  electrolyserPurchaseCost: {
    min: 100,
    max: 5000,
    step: 100,
    title: "Electrolyser Capital Cost ($/kW)",
    helperText:
      "Capital cost of electrolyser including the equipment and installation costs.",
  },
  ammoniaPlantCapitalCost: {
    min: 900,
    max: 14000,
    step: 50,
    title: "Ammonia Plant Capital Cost ($/Ton)",
    helperText:
      "Includes Ammonia Synthesis Unit, Air Separation Unit and Ammonia Storage Unit Costs",
  },
  methanolPlantUnitCost: {
    min: 100,
    max: 1000,
    step: 50,
    title: "Methanol Plant Capital Cost ($/Ton)",
    helperText:
      "Includes Methanol and Carbon Capture Unit, and Methanol and Carbon Capture Storage Unit Costs",
  },
  methanePlantUnitCost: {
    min: 100,
    max: 1000,
    step: 50,
    title: "Methane Plant Capital Cost ($/Ton)",
    helperText:
      "Includes Methane and Carbon Capture Unit, and Methane and Carbon Capture Storage Unit Costs",
  },
  solarFarmBuildCost: {
    min: 100,
    max: 5000,
    step: 100,
    title: "Solar Farm Build Cost ($/kW)",
    helperText:
      "Capital cost of solar farm including the equipment and installation costs.",
  },
  windFarmBuildCost: {
    min: 100,
    max: 5000,
    step: 100,
    title: "Wind Farm Build Cost ($/kW)",
    helperText:
      "Capital cost of wind farm including the equipment and installation costs.",
  },
  principalPPACost: {
    min: 0,
    max: 200,
    step: 10,
    title: "PPA Cost ($/MWh)",
    helperText:
      "Cost of PPA including electricity consumed and transmission charges.",
  },
  waterSupplyCost: {
    min: 0,
    max: 10,
    step: 0.5,
    title: "Water Supply Cost ($/kL)",
    helperText: "Wholesale cost of water supply.",
  },
  discountRate: {
    min: 1,
    max: 15,
    step: 1,
    title: "Discount Rate (%)",
    helperText: "Required rate of return based on similar investments.",
  },
  projectTimeline: {
    min: 10,
    max: 50,
    step: 5,
    title: "Project Timeline (years)",
    helperText: "Length of time that project is operational.",
  },
};

export const numberFieldDefaultInputs: DefaultInput = {
  /******* Ammonia Parameters *******/
  ammoniaPlantCapacity: {
    title: "Ammonia Plant Capacity",
    adornmentLabel: "kTPA",
  },
  ammoniaStorageCapacity: {
    title: "Ammonia Storage Capacity",
    adornmentLabel: "days",
  },
  electrolyserSystemOversizing: {
    title: "Electrolyser System Oversizing",
    adornmentLabel: "%",
  },
  ammoniaPlantSec: {
    title: "Ammonia Plant Specific Energy Consumption",
    adornmentLabel: ammoniaSECLabel,
  },
  asuSec: {
    title: "Air Separation Unit Specific Energy Consumption",
    adornmentLabel: asuSECLabel,
  },
  hydrogenStorageCapacity: {
    title: "Hydrogen Storage Capacity",
    adornmentLabel: "kg",
  },
  ammoniaPlantMinimumTurndown: {
    title: "Ammonia Plant Minimum Turndown",
    adornmentLabel: "%",
  },
  minimumHydrogenStorage: {
    title: "Minimum Hydrogen Storage",
    adornmentLabel: "%",
  },
  // ammonia plant operating costs
  ammoniaSynthesisUnitCost: {
    title: "Ammonia Synthesis Unit Cost",
    adornmentLabel: (
      <p>
        A$/T<sub>NH3</sub>
      </p>
    ),
  },
  ammoniaStorageCost: {
    title: "Ammonia Storage Cost",
    adornmentLabel: (
      <p>
        A$/T<sub>NH3</sub>
      </p>
    ),
  },
  airSeparationUnitCost: {
    title: "Air Separation Unit Cost",
    adornmentLabel: (
      <p>
        A$/T<sub>N2</sub>
      </p>
    ),
  },
  ammoniaEpcCosts: {
    title: "EPC Costs",
    adornmentLabel: "% of CAPEX",
  },
  ammoniaLandProcurementCosts: {
    title: "Land Procurement Cost",
    adornmentLabel: "% of CAPEX",
  },
  ammoniaPlantOMCost: {
    title: "Ammonia Plant O&M",
    adornmentLabel: "% of CAPEX",
  },
  ammoniaStorageOMCost: {
    title: "Ammonia Storage O&M",
    adornmentLabel: "% of CAPEX",
  },
  asuPlantOMCost: {
    title: "ASU Plant O&M",
    adornmentLabel: "% of CAPEX",
  },
  hydrogenStorageOMCost: {
    title: "Hydrogen Storage O&M Cost",
    adornmentLabel: "%/yr",
    helperText: "% of CAPEX",
  },
  hydrogenStoragePurchaseCost: {
    title: "Hydrogen Storage Purchase Cost",
    adornmentLabel: "A$/kg",
  },
  powerPlantDegradationRate: {
    //done
    title: "Power Plant Degradation Rate",
    adornmentLabel: "%",
  },
  /******* Methanol Parameters *******/
  methanolPlantCapacity: {
    title: "Methanol Plant Capacity",
    adornmentLabel: "kTPA",
    helperText:
      "Small Scale Methane Plants: <100 ktpa and Large Scale Methane Plants: >1,000 ktpa",
  },
  methanolStorageCapacity: {
    title: "Methanol Storage Capacity",
    adornmentLabel: "days",
  },
  methanolPlantSec: {
    title: "Methanol Plant Specific Energy Consumption",
    adornmentLabel: methanolSECLabel,
  },
  methanolPlantMinimumTurndown: {
    title: "Methanol Plant Minimum Turndown",
    adornmentLabel: "%",
  },
  // methanol plant operating costs
  methanolPlantUnitCost: {
    title: "Methanol Plant Unit Cost",
    adornmentLabel: methanolCostLabel,
  },
  methanolStorageCost: {
    title: "Methanol Storage Cost",
    adornmentLabel: methanolCostLabel,
  },
  methanolEpcCosts: {
    title: "Methanol EPC Costs",
    adornmentLabel: "% of CAPEX",
  },
  methanolLandProcurementCosts: {
    title: "Methanol Land Procurement Cost",
    adornmentLabel: "% of CAPEX",
  },
  methanolPlantOMCost: {
    title: "Methanol Plant O&M",
    adornmentLabel: "% of CAPEX",
  },
  methanolStorageOMCost: {
    title: "Methanol Storage O&M",
    adornmentLabel: "% of CAPEX",
  },
  ccSec: {
    title: "Carbon Capture Unit Specific Energy Consumption",
    adornmentLabel: ccSECLabel,
    helperText: CARBON_CAPTURE_SOURCE_HELPER_TEXT,
  },
  ccPlantCost: {
    title: "Carbon Capture Plant Cost",
    adornmentLabel: (
      <p>
        A$/T<sub>CO2</sub>
      </p>
    ),
    helperText:
      "Pre-set values for carbon capture CAPEX can be found in the supporting guide.",
  },
  ccEpcCosts: {
    title: "Carbon Capture EPC Costs",
    adornmentLabel: "% of CAPEX",
  },
  ccLandProcurementCosts: {
    title: "Carbon Capture Land Procurement Cost",
    adornmentLabel: "% of CAPEX",
  },
  ccPlantOMCost: {
    title: "Carbon Capture Plant O&M",
    adornmentLabel: "% of CAPEX",
  },

  /****** Methane params ******/
  methanePlantCapacity: {
    title: "Methane Plant Capacity",
    adornmentLabel: "kTPA",
  },
  methaneStorageCapacity: {
    title: "Methane Storage Capacity",
    adornmentLabel: "days",
  },
  methanePlantSec: {
    title: "Methane Plant Specific Energy Consumption",
    adornmentLabel: methaneSECLabel,
  },
  methanePlantMinimumTurndown: {
    title: "Methane Plant Minimum Turndown",
    adornmentLabel: "%",
  },
  // methane plant operating costs
  methanePlantUnitCost: {
    title: "Methane Plant Unit Cost",
    adornmentLabel: methaneCostLabel,
  },
  methaneStorageCost: {
    title: "Methane Storage Cost",
    adornmentLabel: methaneCostLabel,
  },
  methaneEpcCosts: {
    title: "Methane EPC Costs",
    adornmentLabel: "% of CAPEX",
  },
  methaneLandProcurementCosts: {
    title: "Methane Land Procurement Cost",
    adornmentLabel: "% of CAPEX",
  },
  methanePlantOMCost: {
    title: "Methane Plant O&M",
    adornmentLabel: "% of CAPEX",
  },
  methaneStorageOMCost: {
    title: "Methane Storage O&M",
    adornmentLabel: "% of CAPEX",
  },
  /******* Project Scale *******/
  projectScale: {
    min: 0.1,
    max: 100_000,
    step: 100,
    helperText:
      "Hydrogen production rate - Standard 175 ton/yr per MW of electrolyser capacity at full load",
    title: "Project Scale (kTPA)",
    adornmentLabel: "kTPA",
  },

  /******* Electrolyser Parameters *******/
  // Electrolyer System Capacity
  electrolyserNominalCapacity: {
    title: "Electrolyser System Capacity",
    adornmentLabel: "MW",
    step: 50,
    min: 0,
  },
  // Electrolyser Efficiency
  secAtNominalLoad: {
    id: "secAtNominalLoad",
    title: "Specific Energy Consumption at Nominal Load",
    adornmentLabel: secAtNominalLoadLabel,
    step: 5,
    min: 39.4,
    max: 100,
  },
  waterRequirementOfElectrolyser: {
    title: "Water Requirement of Electrolyser",
    adornmentLabel: "L/kg",
    helperText:
      "Water consumed per kg of hydrogen produced - independent of load.",
    min: 9,
    max: 50,
    step: 5,
  },
  // Electrolyser Load Range
  electrolyserMaximumLoad: {
    title: "Electrolyser Maximum Load",
    adornmentLabel: "%",
    step: 5,
    min: 90,
    max: 100,
  },
  electrolyserMinimumLoad: {
    title: "Electrolyser Minimum Load",
    adornmentLabel: "%",
    step: 2.5,
    min: 0,
    max: 15,
  },
  maximumLoadWhenOverloading: {
    title: "Maximum Load When Overloading",
    adornmentLabel: "%",
    step: 5,
    min: 100,
    max: 150,
  },
  timeBetweenOverloading: {
    title: "Time Between Overloading",
    adornmentLabel: "hrs",
    min: 0,
    max: 24,
    step: 4,
  },
  // Electrolyser Stack Replacement
  stackDegradation: {
    title: "Stack Degradation",
    adornmentLabel: "%/yr",
    helperText: "Decrease in stack output per year.",
  },
  stackLifetime: {
    title: "Cumulative Operation Hours",
    adornmentLabel: "hrs",
    helperText:
      "Cumulative hours of operation before stack replacement is due.",
    step: 5000,
    min: 60000,
    max: 150000,
  },
  maximumDegradationBeforeReplacement: {
    title: "Maximum Degradation Rate",
    adornmentLabel: "%",
    helperText: "Maximum allowable degradation before stack must be replaced.",
    step: 1,
    min: 1,
    max: 15,
  },
  // Electrolyser Capital and Operating Cost
  // Electrolyser Equipment Costs
  electrolyserReferenceCapacity: {
    title: "Reference Electrolyser Scale",
    adornmentLabel: "kW",
    step: 500,
    min: 1000,
  },
  electrolyserPurchaseCost: {
    title: "Electrolyser System Purchase Cost",
    adornmentLabel: "$/kW",
    step: 250,
    min: 250,
  },
  electrolyserCostReductionWithScale: {
    title: "Electrolyser Cost Reduction with Scale",
    adornmentLabel: "%",
    step: 1,
    min: 0,
    helperText: "Cost reduction due to economies of scale",
  },
  electrolyserReferenceFoldIncrease: {
    title: "Reference Fold Increase",
    step: 5,
    min: 0,
    helperText:
      "Cost reduction occurs for every specified fold increase in capacity vs. reference scale",
  },
  // Electrolyser System Installation Costs
  electrolyserEpcCosts: {
    title: "EPC/Installation Costs of Electrolyser",
    adornmentLabel: "%",
    helperText: "% of CAPEX",
    step: 5,
    min: 0,
    max: 50,
  },
  electrolyserLandProcurementCosts: {
    id: "electrolyserLandProcurementCosts",
    title: "Land Procurement Cost of Electrolyser",
    adornmentLabel: "%",
    helperText: "% of CAPEX",
    step: 5,
    min: 0,
    max: 50,
  },
  // Electrolyser Operating Costs
  electrolyserOMCost: {
    title: "Electrolyser O&M",
    adornmentLabel: "%/yr",
    helperText: "% of CAPEX",
    step: 2.5,
    min: 2.5,
    max: 10,
  },
  electrolyserStackReplacement: {
    title: "Electrolyser Stack Replacement",
    adornmentLabel: "%",
    helperText: "% of CAPEX",
    step: 10,
    min: 10,
    max: 50,
  },
  waterSupplyCost: {
    title: "Water Consumption Cost",
    adornmentLabel: "$/kL",
    step: 1,
    min: 1,
    max: 20,
  },
  /******* Power Plant Parameters *******/
  // Power Plant Capacity
  solarNominalCapacity: {
    title: "Nominal Solar Capacity",
    adornmentLabel: "MW",
    helperText: "Rated capacity of solar farm",
    step: 50,
    min: 0,
  },
  windNominalCapacity: {
    title: "Nominal Wind Capacity",
    adornmentLabel: "MW",
    helperText: "Rated capacity of wind farm",
    step: 50,
    min: 0,
  },
  powerPlantOversizeRatio: {
    title: "Power Plant Oversize Ratio",
    step: 0.1,
    min: 1,
    max: 5,
  },
  solarToWindPercentage: {
    title: "Power Plant Capacity Mix – Share of Solar Input",
    adornmentLabel: "%",
    helperText:
      "Share of Solar in the power plant output. Provide 100% for solar only and 0% for wind only.",
    step: 5,
    min: 0,
    max: 100,
  },
  // Power Plant Efficiency
  solarDegradation: {
    title: "Solar Degradation Rate",
    adornmentLabel: "%",
    helperText: "Decrease in solar farm output per year",
    step: 1,
    min: 0,
    max: 10,
  },
  windDegradation: {
    title: "Wind Degradation Rate",
    adornmentLabel: "%",
    helperText: "Decrease in wind farm output per year",
    step: 1,
    min: 0,
    max: 10,
  },
  // Power Plant Capital and Operating Costs
  // Power Plant Equipment Costs
  solarFarmBuildCost: {
    title: "Solar Farm Build Cost",
    adornmentLabel: "$/kW",
    step: 250,
    min: 250,
  },
  solarReferenceCapacity: {
    title: "Reference Capacity of Solar Farm",
    adornmentLabel: "kW",
    step: 500,
    min: 1000,
  },
  solarPVCostReductionWithScale: {
    title: "Solar Farm Cost Reduction with Scale",
    adornmentLabel: "%",
    step: 1,
    min: 0,
  },
  solarReferenceFoldIncrease: {
    id: "solarReferenceFoldIncrease",
    title: "Solar Farm Reference Fold Increase",
    helperText:
      "Minimum # of fold increase in solar farm capacity for capital cost reduction due to the above economies of scale",
    step: 5,
    min: 0,
  },
  windFarmBuildCost: {
    title: "Wind Farm Build Cost",
    adornmentLabel: "$/kW",
    step: 250,
    min: 250,
  },
  windReferenceCapacity: {
    title: "Reference Capacity of Wind Farm",
    adornmentLabel: "kW",
    step: 500,
    min: 1000,
  },
  windCostReductionWithScale: {
    title: "Wind Farm Cost Reduction with Scale",
    adornmentLabel: "%",
    step: 1,
    min: 0,
  },
  windReferenceFoldIncrease: {
    title: "Wind Farm Reference Fold Increase",
    helperText:
      "Minimum # of fold increase in wind farm capacity for capital cost reduction due to the above economies of scale",
    step: 5,
    min: 0,
  },
  // Power Plant Installation Costs
  solarEpcCosts: {
    title: "EPC/Installation Costs of Solar Farm",
    adornmentLabel: "%",
    helperText: "% of CAPEX",
    step: 5,
    min: 0,
    max: 50,
  },
  solarLandProcurementCosts: {
    title: "Land Procurement Cost of Solar Farm",
    adornmentLabel: "%",
    helperText: "% of CAPEX",
    step: 5,
    min: 0,
    max: 50,
  },
  windEpcCosts: {
    title: "EPC/Installation Costs of Wind Farm",
    adornmentLabel: "%",
    helperText: "% of CAPEX",
    step: 5,
    min: 0,
    max: 50,
  },
  windLandProcurementCosts: {
    title: "Land Procurement Cost of Wind Farm",
    adornmentLabel: "%",
    helperText: "% of CAPEX",
    step: 5,
    min: 0,
    max: 50,
  },
  // Power Plant Operating Costs
  solarOpex: {
    title: "Solar Farm O&M Cost",
    adornmentLabel: "$/MW/yr",
    step: 1000,
    min: 5000,
  },
  windOpex: {
    title: "Wind Farm O&M Cost",
    adornmentLabel: "$/MW/yr",
    step: 1000,
    min: 5000,
  },
  // PPA Costs
  principalPPACost: {
    title: "Principal PPA Cost",
    adornmentLabel: "$/MWh",
    helperText: "Unit price of electricity purchased from power supplier.",
    step: 10,
    min: 0,
    max: 1000,
  },
  // Grid Connection Costs
  gridConnectionCost: {
    title: "Grid Connection Costs",
    adornmentLabel: "$",
    helperText: "Capital cost for transmission connection",
    step: 10000,
    min: 0,
  },
  additionalTransmissionCharges: {
    title: "Grid Usage Charges",
    adornmentLabel: "$/MWh",
    helperText:
      "Any additional charges for using grid services, e.g. Transmission Use of System (TUOS) Charges.",
    step: 5,
    min: 0,
    max: 100,
  },
  /******* BatteryParameters *******/
  // Battery Capacity
  batteryRatedPower: {
    title: "Battery Rated Power",
    adornmentLabel: "MW",
    helperText:
      "Rated power capacity of the battery. Sets a limit on how much the battery can charge/ discharge instantaneously.",
    step: 10,
    min: 0,
  },
  batteryStorageDuration: {
    title: "Battery Storage Duration",
    adornmentLabel: "hr",
    helperText:
      "Number of hours that the battery takes to charge/discharge at its max power level.",
    step: 2,
    min: 0,
    max: 8,
  },
  // Battery Performance
  batteryEfficiency: {
    title: "Round Trip Efficiency",
    adornmentLabel: "%",
    step: 10,
    min: 50,
    max: 100,
  },
  batteryMinCharge: {
    title: "Battery Minimum State of Charge",
    adornmentLabel: "%",
    step: 5,
    min: 0,
    max: 20,
  },
  batteryLifetime: {
    title: "Battery Lifetime",
    adornmentLabel: "years",
    step: 1,
    min: 0,
    max: 20,
  },
  // Battery Capital and Operating Costs
  // Battery System Equipment Costs
  batteryCosts: {
    title: "Cost of Battery",
    adornmentLabel: "$/kWh",
    step: 250,
    min: 250,
  },
  // Battery System Installation Costs
  batteryEpcCosts: {
    title: "EPC/Installation Costs of Battery",
    adornmentLabel: "%",
    helperText: "% of CAPEX",
    step: 5,
    min: 0,
    max: 50,
  },
  batteryLandProcurementCosts: {
    title: "Land Procurement Cost of Battery",
    adornmentLabel: "%",
    helperText: "% of CAPEX",
    step: 5,
    min: 0,
    max: 50,
  },

  // Battery Operating Costs
  batteryOMCost: {
    title: "Battery O&M Costs",
    adornmentLabel: "$/MW/yr",
    helperText: "Fixed & Variable O&M",
    step: 500,
    min: 500,
    max: 15000,
  },
  batteryReplacementCost: {
    title: "Replacement Cost",
    adornmentLabel: "%",
    helperText:
      "Percentage of CAPEX. Cost of battery replacement is incured as additional operating cost in each year the battery lifetime is achieved.",
    step: 10,
    min: 0,
    max: 100,
  },
  // /******* Additional Costs *******/
  // Additional Upfront/Operating Costs
  additionalUpfrontCosts: {
    title: "Additional Upfront Costs",
    adornmentLabel: "$",
    helperText:
      "Any other additional costs to include as a once off in the LCH2 calculation.",
    step: 50000,
    min: 0,
  },
  additionalAnnualCosts: {
    title: "Additional Annual Costs",
    adornmentLabel: "$/yr",
    helperText:
      "Any other additional costs to include as an annual cost in the LCH2 calculation.",
    step: 50000,
    min: 0,
  },
  // Financing Parameters
  projectTimeline: {
    title: "Project Timeline",
    adornmentLabel: "yrs",
    min: 10,
    max: 50,
    step: 5,
    helperText:
      "Length of time that project is operational. Same for both power plant and electrolyser.",
  },
  discountRate: {
    title: "Discount Rate",
    adornmentLabel: "% p.a.",
    min: 5,
    max: 15,
    step: 1,
    helperText:
      "Discount rate for NPV analysis and LCH2. Required rate of return based on similar investments.",
  },
  // Additional liabilities
  inflationRate: {
    title: "Inflation Rate",
    adornmentLabel: "% p.a.",
    step: 0.1,
  },
};
