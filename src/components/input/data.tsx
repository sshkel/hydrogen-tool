import { DepreciationProfile } from "../../types";

interface Field {
  id: string;
  label: string;
  defaultValue?: string | number;
  disabled?: boolean;
  adornmentLabel?: string | JSX.Element;
  helperText?: string;
}

const kWheLabel = (
  <p>
    kWh<sub>e</sub>/kg<sub>H2</sub>
  </p>
);
const kgH2Label = (
  <p>
    kg<sub>H2</sub>/kWh<sub>e</sub>
  </p>
);

export const data: Field[] = [
  // System Sizing
  {
    id: "electrolyserNominalCapacity",
    label: "Nominal Electrolyser Capacity",
    defaultValue: 10,
    adornmentLabel: "MW",
  },
  {
    id: "solarNominalCapacity",
    label: "Nominal Solar Capacity",
    defaultValue: 10,
    adornmentLabel: "MW",
    helperText: "Rated capacity of solar farm",
  },
  {
    id: "windNominalCapacity",
    label: "Nominal Wind Capacity",
    defaultValue: 10,
    adornmentLabel: "MW",
    helperText: "Rated capacity of wind farm",
  },
  {
    id: "totalNominalPowerPlantCapacity",
    label: "Total Nominal Power Plant Capacity",
    defaultValue: 10,
    disabled: true,
    adornmentLabel: "MW",
    helperText: "Total rated capacity for selected generation type",
  },
  {
    id: "batteryRatedPower",
    label: "Battery Rated Power",
    defaultValue: 0,
    adornmentLabel: "MW",
    helperText:
      "Rated power capacity of the battery. Sets a limit on how much the battery can charge/ discharge instantaneously.",
  },
  {
    id: "durationOfStorage",
    label: "Duration of Storage",
    defaultValue: 0,
    adornmentLabel: "hr",
    helperText:
      "Number of hours that the battery takes to charge/discharge at its max power level.",
  },
  {
    id: "batteryNominalCapacity",
    label: "Nominal Battery Capacity",
    defaultValue: 0,
    adornmentLabel: "MWh",
    helperText:
      "Rated energy capacity of battery (multiple of storage duration and battery power capacity). Equals 0 if battery is not in configuration.",
  },
  /******* Electrolyser Parameters *******/
  // Electrolyser Specific Consumption
  {
    id: "secAtNominalLoadAE",
    label: "SEC At Nominal Load (AE)",
    defaultValue: 50,
    adornmentLabel: kWheLabel,
  },
  {
    id: "secAtNominalLoadPEM",
    label: "SEC At Nominal Load (PEM)",
    defaultValue: 0.02,
    adornmentLabel: kgH2Label,
    disabled: true,
  },
  {
    id: "secCorrectionFactor",
    label: "SEC Correction Factor",
    defaultValue: 100,
    adornmentLabel: "%",
  },
  {
    id: "totalSystemSecAtNominalLoad",
    label: "Total System SEC at Nominal Load",
    defaultValue: 50.0,
    adornmentLabel: kWheLabel,
    disabled: true,
  },
  // Electrolyser Load Range
  {
    id: "electrolyserMaximumLoad",
    label: "Electrolyser Maximum Load",
    defaultValue: 100,
    adornmentLabel: "%",
  },
  {
    id: "electrolyserMinimumLoad",
    label: "Electrolyser Minimum Load",
    defaultValue: 10,
    adornmentLabel: "%",
  },
  {
    id: "maximumLoadWhenOverloading",
    label: "Maximum Load When Overloading",
    defaultValue: 10,
    adornmentLabel: "%",
  },
  {
    id: "timeBetweenOverloading",
    label: "Time Between Overloading",
    defaultValue: 0,
    adornmentLabel: "hr",
  },
  // Other Operational Factors
  {
    id: "stackLifetime",
    label: "Stack Lifetime",
    defaultValue: 60000,
    adornmentLabel: "hrs",
    helperText:
      "Cumulative hours of operation before stack replacement is due.",
  },
  {
    id: "stackDegradation",
    label: "Stack Degradation",
    defaultValue: 0.0,
    adornmentLabel: "%/yr",
    helperText: "Decrease in stack output per year.",
  },
  {
    id: "maximumDegradationBeforeReplacement",
    label: "Maximum Degradation Before Replacement",
    defaultValue: 0,
    adornmentLabel: "%",
    helperText: "Maximum allowable degradation before stack must be replaced.",
  },
  {
    id: "waterRequirementOfElectrolyser",
    label: "Water Requirement of Electrolyser",
    defaultValue: 10,
    adornmentLabel: "L/kg",
    helperText:
      "Water consumed per kg of hydrogen produced - independent of load.",
  },
  /******* Electrolyser Costs *******/
  // Electrolyser Capital Costs
  {
    id: "electrolyserReferenceCapacity",
    label: "Reference Electrolyser Capacity",
    defaultValue: 10,
    adornmentLabel: "kW",
  },
  {
    id: "electrolyserReferencePurchaseCost",
    label: "Reference Electrolyser Purchase Cost",
    defaultValue: 1000,
    adornmentLabel: "A$/kW",
  },
  {
    id: "electrolyserCostReductionWithScale",
    label: "Electrolyser Cost Reduction with Scale",
    defaultValue: 10,
    adornmentLabel: "%",
  },
  {
    id: "electrolyserReferenceFoldIncrease",
    label: "Reference Fold Increase",
    defaultValue: 10,
  },
  {
    id: "electrolyserEpcCosts",
    label: "EPC Costs",
    defaultValue: 0,
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX",
  },
  {
    id: "electrolyserLandProcurementCost",
    label: "Land Procurement Cost",
    defaultValue: 0,
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX",
  },
  // Electrolyser Operating Costs
  {
    id: "electrolyserOMCost",
    label: "Electrolyser O&M",
    defaultValue: 2.5,
    adornmentLabel: "%/yr",
    helperText: "Percentage of Electrolyser Purchase Cost",
  },
  {
    id: "electrolyserStackReplacement",
    label: "Electrolyser Stack Replacement",
    defaultValue: 40,
    adornmentLabel: "%",
    helperText: "Percentage of Electrolyser Purchase Cost",
  },
  {
    id: "electrolyserWaterCost",
    label: "Water Cost",
    defaultValue: 5,
    adornmentLabel: "A$/kL",
  },
  /******* Power Plant Costs *******/
  // Solar Costs
  {
    id: "solarReferenceCapacity",
    label: "Reference Capacity of Solar Farm",
    defaultValue: 1000,
    adornmentLabel: "kW",
  },
  {
    id: "solarPVFarmReferenceCost",
    label: "Reference Solar PV Farm Cost",
    defaultValue: 1200,
    adornmentLabel: "A$/kW",
  },
  {
    id: "solarPVCostReductionWithScale",
    label: "Solar PV Cost Reduction with Scale",
    defaultValue: 10,
    adornmentLabel: "%",
  },
  {
    id: "solarReferenceFoldIncrease",
    label: "Reference Fold Increase",
    defaultValue: 10,
    helperText:
      "Minimum # of fold increase in solar farm capacity for capital cost reduction due to the above economies of scale",
  },
  {
    id: "solarEpcCosts",
    label: "EPC Costs",
    defaultValue: 0,
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX",
  },
  {
    id: "solarLandProcurementCost",
    label: "Land Procurement Cost",
    defaultValue: 0,
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX",
  },
  {
    id: "solarOpex",
    label: "OPEX (Fixed & Variable O&M)",
    defaultValue: 17000,
    adornmentLabel: "A$/MW/yr",
  },
  // Wind Costs
  {
    id: "windReferenceCapacity",
    label: "Reference Capacity of Wind Farm",
    defaultValue: 1000,
    adornmentLabel: "kW",
  },
  {
    id: "windFarmReferenceCost",
    label: "Reference Wind Farm Cost",
    defaultValue: 1950,
    adornmentLabel: "A$/kW",
  },
  {
    id: "windCostReductionWithScale",
    label: "Wind Cost Reduction with Scale",
    defaultValue: 10,
    adornmentLabel: "%",
  },
  {
    id: "windReferenceFoldIncrease",
    label: "Reference Fold Increase",
    defaultValue: 10,
    helperText:
      "Minimum # of fold increase in wind farm capacity for capital cost reduction due to the above economies of scale",
  },
  {
    id: "windEpcCosts",
    label: "EPC Costs",
    defaultValue: 0,
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX",
  },
  {
    id: "windLandProcurementCost",
    label: "Land Procurement Cost",
    defaultValue: 0,
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX",
  },
  {
    id: "windOpex",
    label: "OPEX (Fixed & Variable O&M)",
    defaultValue: 25000,
    adornmentLabel: "A$/MW/yr",
  },
  // Costs for Grid Connected Systems
  {
    id: "gridConnectionCost",
    label: "Grid Connection Cost",
    adornmentLabel: "A$",
    helperText: "Capital cost for transmission connection",
  },
  {
    id: "additionalTransmissionCharges",
    label: "Additional Transmission Charges",
    adornmentLabel: "A$/MWh",
    helperText:
      "Any additional charges for using grid services, e.g. Transmission Use of System (TUOS) Charges.",
  },
  {
    id: "principalPPACost",
    label: "Principal PPA Cost",
    adornmentLabel: "A$/MWh",
    helperText: "Fixed price for electricity bought from the grid.",
  },
  /******* Battery *******/
  // Battery Parameters
  {
    id: "batteryEfficiency",
    label: "Round Trip Efficiency",
    defaultValue: 85,
    adornmentLabel: "%",
  },
  {
    id: "batteryMinCharge",
    label: "Minimum State of Charge",
    defaultValue: 0,
    adornmentLabel: "%",
  },
  // Battery Costs
  {
    id: "batteryLifetime",
    label: "Battery Lifetime",
    defaultValue: "10",
    adornmentLabel: "years",
  },
  {
    id: "batteryCosts",
    label: "Cost of Battery",
    adornmentLabel: "A$/kWh",
  },
  {
    id: "batteryEpcCosts",
    label: "EPC Costs",
    defaultValue: 0,
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX",
  },
  {
    id: "batteryLandProcurementCost",
    label: "Land Procurement Cost",
    defaultValue: 0,
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX",
  },
  {
    id: "batteryOMCost",
    label: "Battery O&M",
    adornmentLabel: "A$/MW/yr",
    helperText: "Fixed & Variable O&M",
  },
  {
    id: "batteryReplacementCost",
    label: "Replacement Cost",
    defaultValue: 100,
    adornmentLabel: "%",
    helperText:
      "Percentage of CAPEX. Cost of battery replacement is incured as additional operating cost in each year the battery lifetime is achieved.",
  },

  /******* Additional Costs *******/
  {
    id: "additionalUpfrontCosts",
    label: "Additional Upfront Costs",
    defaultValue: 0,
    adornmentLabel: "A$",
    helperText:
      "Any other additional costs to include as a once off in the LCH2 calculation",
  },
  {
    id: "additionalAnnualCosts",
    label: "Additional Annual Costs",
    defaultValue: 0,
    adornmentLabel: "A$/yr",
    helperText:
      "Any other additional costs to include as an annual cost in the LCH2 calculation",
  },
  // Additional Revenue streams
  {
    id: "h2RetailPrice",
    label: "Hydrogen Retail Price",
    defaultValue: 1,
    adornmentLabel: "A$/kgH2",
    helperText: "Price that hydrogen can be sold for",
  },
  {
    id: "averageElectricitySpotPrice",
    label: "Average Electricity Spot Price",
    defaultValue: 0,
    adornmentLabel: "A$/MWh",
    helperText: "Fixed price for excess electricity sold to the grid",
  },
  {
    id: "oxygenRetailPrice",
    label: "Oxygen Retail Price",
    defaultValue: 50,
    adornmentLabel: "A$/tonne",
    helperText:
      "Price that oxygen can be sold for, assuming 8 kg oxygen produced per kg of hydrogen.",
  },
  /******* Financing Parameters *******/
  {
    id: "plantLife",
    label: "Plant Life",
    defaultValue: 20,
    adornmentLabel: "yrs",
    helperText:
      "Same for both Powerplant and Electrolyser (Fixed Value). Must be less than or equal to 50.",
  },
  {
    id: "discountRate",
    label: "Discount Rate",
    defaultValue: 7,
    adornmentLabel: "% p.a.",
    helperText: "Discount rate for NPV analysis and LCH2.",
  },
  // Investment Breakdown
  // Equity Share
  {
    id: "shareOfTotalInvestmentFinancedViaEquity",
    label: "Share of Total Investment Financed via Equity.",
    defaultValue: 70,
    adornmentLabel: "% of Total Investment",
  },
  {
    id: "directEquityShare",
    label: "Direct Equity",
    defaultValue: 100,
    adornmentLabel: "% of Equity",
    helperText: "Share of equity directly supported by project proponent.",
  },
  //Loan Share
  {
    id: "loanTerm",
    label: "Loan Term",
    defaultValue: 10,
    adornmentLabel: "yrs",
    helperText: "Loan repayment duration.",
  },
  {
    id: "interestOnLoan",
    label: "Interest on Loan",
    defaultValue: 2.5,
    adornmentLabel: "% p.a.",
  },
  // Post Project Cash Flows
  {
    id: "salvageCostShare",
    label: "Salvage Cost",
    defaultValue: 10,
    adornmentLabel: "% of Total Investment",
  },
  {
    id: "decommissioningCostShare",
    label: "Decommissioning Costs",
    defaultValue: 10,
    adornmentLabel: "% of Total Investment",
  },

  //Additional liabilities
  {
    id: "inflationRate",
    label: "Inflation Rate",
    defaultValue: 2.5,
    adornmentLabel: "% p.a.",
    helperText: "water, O&M, PPA",
  },
  {
    id: "taxRate",
    label: "Tax Rate",
    defaultValue: 30,
    adornmentLabel: "% p.a.",
    helperText: "Cash flow",
  },
];

export const regionData: string[] = [
  "Port Hedland, WA",
  "Geraldton, WA",
  "Ashburton, WA",
  "Tennant Creek, NT",
  "Baines, NT",
  "McArthur, NT",
  "North West NSW",
  "New England",
  "Central West NSW",
  "Southern NSW Tablelands",
  "Broken Hill, NSW",
  "South West NSW",
  "Wagga Wagga, NSW",
  "Tumut, NSW",
  "Cooma Monaro, NSW",
  "Far North QLD",
  "Clean Energy Hub North QLD",
  "Northern QLD",
  "Isaac, QLD",
  "Barcaldine, QLD",
  "Fitzroy, QLD",
  "Wide Bay, QLD",
  "Darling Downs, QLD",
  "South East, SA",
  "Riverland, SA",
  "Mid North SA",
  "Yorke Peninsula SA",
  "Northern SA",
  "Leigh Creek, SA",
  "Roxby Downs SA",
  "Eastern Eyre Peninsula, SA",
  "Western Eyre Peninsula, SA",
  "North East Tasmania",
  "North West Tasmania",
  "Tasmania Midlands",
  "Ovens Murray, VIC",
  "Murray River, VIC",
  "Western VIC",
  "South West VIC",
  "Gippsland, VIC",
  "Central North VIC",
  "Custom",
];

export const technologyData: string[] = ["Solar", "Wind", "Hybrid"];
export const profileData: string[] = ["Fixed", "Variable"];
export const replacementTypeData: string[] = [
  "Cumulative Hours",
  "Maximum Degradation Level",
];

export const capitalDepreciationProfile: DepreciationProfile[] = [
  "Straight Line",
  "MACRs - 3 year Schedule",
  "MACRs - 5 year Schedule",
  "MACRs - 7 year Schedule",
  "MACRs - 10 year Schedule",
  "MACRs - 15 year Schedule",
  "MACRs - 20 year Schedule",
];
