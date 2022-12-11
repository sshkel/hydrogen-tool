import { DefaultInput, PowerPlantConfiguration } from "../../types";

export const configurationTypes = [
  "powerPlantType",
  "powerPlantConfiguration",
  "stackReplacementType",
  "powerSupplyOption",
  "powerCapacityConfiguration",
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

export function isPowerPlantConfiguration(
  value: string
): value is PowerPlantConfiguration {
  return powerPlantConfigurationData.includes(value);
}

export const sliderFieldDefaultInputs: DefaultInput = {
  projectScale: {
    min: 100,
    max: 1_000_000,
    step: 50_000,
    title: "Project Scale (tonnes/yr)",
    helperText:
      "Hydrogen production rate. The standard is 175 ton/yr per MW of electrolyser capacity",
  },
  electrolyserEfficiency: {
    min: 50,
    max: 100,
    step: 2.5,
    title: "Electrolyser Efficiency (%)",
    helperText:
      "Electrolyser efficiency relative to 33.33 kWh/kg of H2 required.",
  },
  powerPlantOversizeRatio: {
    min: 1,
    max: 3,
    step: 0.1,
    title: "Power Plant Oversize Ratio",
    helperText:
      "Capacity of power plant relative to electrolyser, e.g., choosing 3 results in powe rplant being 3 times larger than the electrolyser capacity.",
  },
  solarToWindPercentage: {
    min: 0,
    max: 100,
    step: 10,
    title: "Solar to Wind Capacity Ratio (%)",
    helperText: "Split of solar and wind farm share in the power plant output.",
  },
  electrolyserPurchaseCost: {
    min: 100,
    max: 5000,
    step: 100,
    title: "Electrolyser Capital Cost ($/kW)",
    helperText:
      "Capital cost of electrolyser including the equipment and installation costs.",
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
      "Cost of PPA - Electricity consumption and transmission/grid usage charges.",
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
    // done
    title: "Ammonia Plant Capacity",
    adornmentLabel: "kTPA",
  },
  ammoniaStorageCapacity: {
    title: "Ammonia Storage Capacity",
    adornmentLabel: "days",
  },
  electrolyserSystemOversizing: {
    // done
    title: "Electrolyser System Oversizing",
    adornmentLabel: "%",
  },
  renewableEnergyPlantOversizing: {
    //done
    title: "Renewable Energy Plant Oversizing",
    adornmentLabel: "%",
  },
  ammoniaPlantSec: {
    // done
    title: "Ammonia Plant SEC",
    adornmentLabel: "kWhe/kgNH3",
  },
  asuSec: {
    // done
    title: "ASU SEC",
    adornmentLabel: "kWhe/kgN2",
  },
  hydrogenStorageCapacity: {
    //done
    title: "Hydrogen Storage Capacity",
    adornmentLabel: "kg",
  },
  ammoniaPlantMinimumTurndown: {
    title: "Ammonia Plant Minimum Turndown",
    adornmentLabel: "%",
  },
  minimumHydrogenStorage: {
    //done
    title: "Minimum Hydrogen Storage",
    adornmentLabel: "%",
  },
  // ammonia plant operating costs
  ammoniaSynthesisUnitCost: {
    title: "Ammonia Synthesis Unit Cost",
    adornmentLabel: "A$/TNH3",
  },
  ammoniaStorageCost: {
    title: "Ammonia Storage Cost",
    adornmentLabel: "A$/TNH3",
  },
  airSeparationUnitCost: {
    title: "Air Separation Unit Cost",
    adornmentLabel: "A$/TN2",
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
    title: "ASU plant O&M",
    adornmentLabel: "% of CAPEX",
  },
  hydrogenStoragePurchaseCost: {
    title: "Hydrogen Storage Purchase Cost",
    adornmentLabel: "A$/kg"
  },
  powerPlantDegradationRate: {
    //done
    title: "Power Plant Degradation Rate",
    adornmentLabel: "%",
  },
  /******* Project Scale *******/
  projectScale: {
    min: 100,
    max: 1_000_000,
    step: 100,
    title: "Project Scale",
    adornmentLabel: "tonnes/yr",
  },

  /******* Electrolyser Parameters *******/
  // Electrolyer System Capacity
  electrolyserNominalCapacity: {
    title: "Electrolyser System Capacity",
    adornmentLabel: "MW",
  },
  // Electrolyser Efficiency
  secAtNominalLoad: {
    id: "secAtNominalLoad",
    title: "Specific Energy Consumption at Nominal Load",
    adornmentLabel: "kWh/kg",
  },
  waterRequirementOfElectrolyser: {
    title: "Water Requirement of Electrolyser",
    adornmentLabel: "L/kg",
    helperText:
      "Water consumed per kg of hydrogen produced - independent of load.",
  },
  // Electrolyser Load Range
  electrolyserMaximumLoad: {
    title: "Electrolyser Maximum Load",
    adornmentLabel: "%",
  },
  electrolyserMinimumLoad: {
    title: "Electrolyser Minimum Load",
    adornmentLabel: "%",
  },
  maximumLoadWhenOverloading: {
    title: "Maximum Load When Overloading",
    adornmentLabel: "%",
  },
  timeBetweenOverloading: {
    title: "Time Between Overloading",
    adornmentLabel: "hrs",
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
  },
  maximumDegradationBeforeReplacement: {
    title: "Maximum Degradation Rate",
    adornmentLabel: "%",
    helperText: "Maximum allowable degradation before stack must be replaced.",
  },
  // Electrolyser Capital and Operating Cost
  // Electrolyser Equipment Costs
  electrolyserReferenceCapacity: {
    title: "Reference Electrolyser Scale",
    adornmentLabel: "kW",
  },
  electrolyserPurchaseCost: {
    title: "Electrolyser System Purchase Cost",
    adornmentLabel: "$/kW",
  },
  electrolyserCostReductionWithScale: {
    title: "Electrolyser Cost Reduction with Scale",
    adornmentLabel: "%",
  },
  electrolyserReferenceFoldIncrease: {
    title: "Reference Fold Increase",
  },
  // Electrolyser System Installation Costs
  electrolyserEpcCosts: {
    title: "EPC/Installation Costs of Electrolyser",
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX",
  },
  electrolyserLandProcurementCosts: {
    id: "electrolyserLandProcurementCosts",
    title: "Land Procurement Cost of Electrolyser",
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX",
  },
  // Electrolyser Operating Costs
  electrolyserOMCost: {
    title: "Electrolyser O&M",
    adornmentLabel: "%/yr",
    helperText: "Percentage of Electrolyser Purchase Cost",
  },
  electrolyserStackReplacement: {
    title: "Electrolyser Stack Replacement",
    adornmentLabel: "%",
    helperText: "Percentage of Electrolyser Purchase Cost",
  },
  waterSupplyCost: {
    title: "Water Consumption Cost",
    adornmentLabel: "$/kL",
  },
  /******* Power Plant Parameters *******/
  // Power Plant Capacity
  solarNominalCapacity: {
    title: "Nominal Solar Capacity",
    adornmentLabel: "MW",
    helperText: "Rated capacity of solar farm",
  },
  windNominalCapacity: {
    title: "Nominal Wind Capacity",
    adornmentLabel: "MW",
    helperText: "Rated capacity of wind farm",
  },
  powerPlantOversizeRatio: {
    title: "Power Plant Oversize Ratio",
  },
  solarToWindPercentage: {
    title: "Solar to Wind Capacity Ratio",
    adornmentLabel: "%",
  },
  // Power Plant Efficiency
  solarDegradation: {
    title: "Solar Degradation Rate",
    adornmentLabel: "%",
    helperText: "Decrease in solar farm output per year",
  },
  windDegradation: {
    title: "Wind Degradation Rate",
    adornmentLabel: "%",
    helperText: "Decrease in wind farm output per year",
  },
  // Power Plant Capital and Operating Costs
  // Power Plant Equipment Costs
  solarFarmBuildCost: {
    title: "Solar Farm Build Cost",
    adornmentLabel: "$/kW",
  },
  solarReferenceCapacity: {
    title: "Reference Capacity of Solar Farm",
    adornmentLabel: "kW",
  },
  solarPVCostReductionWithScale: {
    title: "Solar Farm Cost Reduction with Scale",
    adornmentLabel: "%",
  },
  solarReferenceFoldIncrease: {
    id: "solarReferenceFoldIncrease",
    title: "Solar Farm Reference Fold Increase",
    helperText:
      "Minimum # of fold increase in solar farm capacity for capital cost reduction due to the above economies of scale",
  },
  windFarmBuildCost: {
    title: "Wind Farm Build Cost",
    adornmentLabel: "$/kW",
  },
  windReferenceCapacity: {
    title: "Reference Capacity of Wind Farm",
    adornmentLabel: "kW",
  },
  windCostReductionWithScale: {
    title: "Wind Farm Cost Reduction with Scale",
    adornmentLabel: "%",
  },
  windReferenceFoldIncrease: {
    title: "Wind Farm Reference Fold Increase",
    helperText:
      "Minimum # of fold increase in wind farm capacity for capital cost reduction due to the above economies of scale",
  },
  // Power Plant Installation Costs
  solarEpcCosts: {
    title: "EPC/Installation Costs of Solar Farm",
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX",
  },
  solarLandProcurementCosts: {
    title: "Land Procurement Cost of Solar Farm",
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX",
  },
  windEpcCosts: {
    title: "EPC/Installation Costs of Wind Farm",
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX",
  },
  windLandProcurementCosts: {
    title: "Land Procurement Cost of Wind Farm",
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX",
  },
  // Power Plant Operating Costs
  solarOpex: {
    title: "Solar Farm O&M Cost",
    adornmentLabel: "$/MW/yr",
  },
  windOpex: {
    title: "Wind Farm O&M Cost",
    adornmentLabel: "$/MW/yr",
  },
  // PPA Costs
  principalPPACost: {
    title: "Principal PPA Cost",
    adornmentLabel: "$/MWh",
    helperText: "Fixed price for electricity bought from the grid.",
  },
  // Grid Connection Costs
  gridConnectionCost: {
    title: "Grid Connection Costs",
    adornmentLabel: "$",
    helperText: "Capital cost for transmission connection",
  },
  additionalTransmissionCharges: {
    title: "Grid Usage Charges",
    adornmentLabel: "$/MWh",
    helperText:
      "Any additional charges for using grid services, e.g. Transmission Use of System (TUOS) Charges.",
  },
  /******* BatteryParameters *******/
  // Battery Capacity
  batteryRatedPower: {
    title: "Battery Rated Power",
    adornmentLabel: "MW",
    helperText:
      "Rated power capacity of the battery. Sets a limit on how much the battery can charge/ discharge instantaneously.",
  },
  batteryStorageDuration: {
    title: "Battery Storage Duration",
    adornmentLabel: "hr",
    helperText:
      "Number of hours that the battery takes to charge/discharge at its max power level.",
  },
  // Battery Performance
  batteryEfficiency: {
    title: "Round Trip Efficiency",
    adornmentLabel: "%",
  },
  batteryMinCharge: {
    title: "Battery Minimum State of Charge",
    adornmentLabel: "%",
  },
  batteryLifetime: {
    title: "Battery Lifetime",
    adornmentLabel: "years",
  },
  // Battery Capital and Operating Costs
  // Battery System Equipment Costs
  batteryCosts: {
    title: "Cost of Battery",
    adornmentLabel: "$/kWh",
  },
  // Battery System Installation Costs
  batteryEpcCosts: {
    title: "EPC/Installation Costs of Battery",
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX",
  },
  batteryLandProcurementCosts: {
    title: "Land Procurement Cost of Battery",
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX",
  },

  // Battery Operating Costs
  batteryOMCost: {
    title: "Battery O&M Costs",
    adornmentLabel: "$/MW/yr",
    helperText: "Fixed & Variable O&M",
  },
  batteryReplacementCost: {
    title: "Replacement Cost",
    adornmentLabel: "%",
    helperText:
      "Percentage of CAPEX. Cost of battery replacement is incured as additional operating cost in each year the battery lifetime is achieved.",
  },
  // /******* Additional Costs *******/
  // Additional Upfront/Operating Costs
  additionalUpfrontCosts: {
    title: "Additional Upfront Costs",
    adornmentLabel: "$",
    helperText:
      "Any other additional costs to include as a once off in the LCH2 calculation.",
  },
  additionalAnnualCosts: {
    title: "Additional Annual Costs",
    adornmentLabel: "$/yr",
    helperText:
      "Any other additional costs to include as an annual cost in the LCH2 calculation.",
  },
  // Financing Parameters
  projectTimeline: {
    title: "Project Timeline",
    adornmentLabel: "yrs",
    min: 1,
    max: 50,
    helperText:
      "Length of time that project is operational. Same for both power plant and electrolyser.",
  },
  discountRate: {
    title: "Discount Rate",
    adornmentLabel: "% p.a.",
    helperText:
      "Discount rate for NPV analysis and LCH2. Required rate of return based on similar investments.",
  },
  // Additional liabilities
  inflationRate: {
    title: "Inflation Rate",
    adornmentLabel: "% p.a.",
  },
};
