
interface Field {
  id: string;
  label: string;
  defaultValue?: string | number;
  disabled?: boolean;
  adornmentLabel?: string | JSX.Element;
  helperText?: string;
}

const kWheLabel = (<p>kWh<sub>e</sub>/kg<sub>H2</sub></p>);
const kgH2Label = (<p>kg<sub>H2</sub>/kWh<sub>e</sub></p>);


export const data: Field[] = [
  {
    id: "electrolyserNominalCapacity",
    label: "Nominal Electrolyser Capacity",
    defaultValue: 10,
    adornmentLabel: "MW"
  },
  {
    id: "solarNominalCapacity",
    label: "Nominal Solar Capacity",
    defaultValue: 10,
    adornmentLabel: "MW",
    helperText: "Rated capacity of solar farm"
  },
  {
    id: "windNominalCapacity",
    label: "Nominal Wind Capacity",
    defaultValue: 10,
    adornmentLabel: "MW",
    helperText: "Rated capacity of wind farm"
  },
  {
    id: "totalNominalPowerPlantCapacity",
    label: "Total Nominal Power Plant Capacity",
    defaultValue: 10,
    disabled: true,
    adornmentLabel: "MW",
    helperText: "Total rated capacity for selected generation type"
  },
  {
    id: "batteryRatedPower",
    label: "Battery Rated Power",
    defaultValue: 0,
    adornmentLabel: "MW",
    helperText: "Rated power capacity of the battery. Sets a limit on how much the battery can charge/ discharge instantaneously."
  },
  {
    id: "durationOfStorage",
    label: "Duration of Storage",
    defaultValue: 0,
    adornmentLabel: "hr",
    helperText: "Number of hours that the battery takes to charge/discharge at its max power level."
  },
  {
    id: "batteryNominalCapacity",
    label: "Nominal Battery Capacity",
    defaultValue: 0,
    disabled: true,
    adornmentLabel: "MWh",
    helperText: "Rated energy capacity of battery (multiple of storage duration and battery power capacity). Equals 0 if battery is not in configuration."
  },
  {
    id: "electrolyserReferenceCapacity",
    label: "Reference Electrolyser Capacity",
    defaultValue: 10,
    adornmentLabel: "kW"
  },
  {
    id: "electrolyserReferencePurchaseCost",
    label: "Reference Electrolyser Purchase Cost",
    defaultValue: 1000,
    adornmentLabel: "A$/kW"
  },
  {
    id: "electrolyserCostReductionWithScale",
    label: "Electrolyser Cost Reduction with Scale",
    defaultValue: 10,
    adornmentLabel: "%"
  },
  {
    id: "electrolyserReferenceFoldIncrease",
    label: "Reference Fold Increase",
    defaultValue: 10
  },
  {
    id: "electrolyserEpcCosts",
    label: "EPC Costs",
    defaultValue: 0,
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX"
  },
  {
    id: "electrolyserLandProcurementCost",
    label: "Land Procurement Cost",
    defaultValue: 0,
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX"
  },
  {
    id: "solarReferenceCapacity",
    label: "Reference Capacity of Solar Farm",
    defaultValue: 1000,
    adornmentLabel: "kW"
  },
  {
    id: "solarPVFarmReferenceCost",
    label: "Reference Solar PV Farm Cost",
    defaultValue: 1200,
    adornmentLabel: "A$/kW"
  },
  {
    id: "solarPVCostReductionWithScale",
    label: "Solar PV Cost Reduction with Scale",
    defaultValue: 10,
    adornmentLabel: "%"
  },
  {
    id: "solarReferenceFoldIncrease",
    label: "Reference Fold Increase",
    defaultValue: 10,
    helperText: "Minimum # of fold increase in solar farm capacity for capital cost reduction due to the above economies of scale"
  },
  {
    id: "solarEpcCosts",
    label: "EPC Costs",
    defaultValue: 0,
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX"
  },
  {
    id: "solarLandProcurementCost",
    label: "Land Procurement Cost",
    defaultValue: 0,
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX"
  },
  {
    id: "windReferenceCapacity",
    label: "Reference Capacity of Wind Farm",
    defaultValue: 1000,
    adornmentLabel: "kW"
  },
  {
    id: "windFarmReferenceCost",
    label: "Reference Wind Farm Cost",
    defaultValue: 1950,
    adornmentLabel: "A$/kW"
  },
  {
    id: "windCostReductionWithScale",
    label: "Wind Cost Reduction with Scale",
    defaultValue: 10,
    adornmentLabel: "%"
  },
  {
    id: "windReferenceFoldIncrease",
    label: "Reference Fold Increase",
    defaultValue: 10,
    helperText: "Minimum # of fold increase in wind farm capacity for capital cost reduction due to the above economies of scale"
  },
  {
    id: "windEpcCosts",
    label: "EPC Costs",
    defaultValue: 0,
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX"
  },
  {
    id: "windLandProcurementCost",
    label: "Land Procurement Cost",
    defaultValue: 0,
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX"
  },
  {
    id: "gridConnectionCost",
    label: "Grid Connection Cost",
    adornmentLabel: "A$",
    helperText: "Capital cost for transmission connection"
  },
  {
    id: "batteryCosts",
    label: "Cost of Battery",
    adornmentLabel: "A$/kWh"
  },
  {
    id: "batteryEpcCosts",
    label: "EPC Costs",
    defaultValue: 0,
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX"
  },
  {
    id: "batteryLandProcurementCost",
    label: "Land Procurement Cost",
    defaultValue: 0,
    adornmentLabel: "%",
    helperText: "Percentage of CAPEX"
  },
  {
    id: "additionalUpfrontCosts",
    label: "Additional Upfront Costs",
    defaultValue: 0,
    adornmentLabel: "A$",
    helperText: "Any other additional costs to include as a once off in the LCH2 calculation"
  },
  {
    id: "additionalAnnualCosts",
    label: "Additional Annual Costs",
    defaultValue: 0,
    adornmentLabel: "A$/yr",
    helperText: "Any other additional costs to include as an annual cost in the LCH2 calculation"
  },
  {
    id: "secAtNominalLoadAE",
    label: "SEC At Nominal Load (AE)",
    defaultValue: 50,
    adornmentLabel: kWheLabel
  },
  {
    id: "secAtNominalLoadPEM",
    label: "SEC At Nominal Load (PEM)",
    defaultValue: 0.02,
    adornmentLabel: kgH2Label,
    disabled: true
  },
  {
    id: "secCorrectionFactor",
    label: "SEC Correction Factor",
    defaultValue: 100,
    adornmentLabel: "%"
  },
  {
    id: "totalSystemSecAtNominalLoad",
    label: "Total System SEC at Nominal Load",
    defaultValue: 50.00,
    adornmentLabel: kWheLabel,
    disabled: true
  },
  {
    id: "electrolyserMaximumLoad",
    label: "Electrolyser Maximum Load",
    defaultValue: 100,
    adornmentLabel: "%"
  },
  {
    id: "electrolyserMinimumLoad",
    label: "Electrolyser Minimum Load",
    defaultValue: 10,
    adornmentLabel: "%"
  },
  {
    id: "maximumLoadWhenOverloading",
    label: "Maximum Load When Overloading",
    defaultValue: 10,
    adornmentLabel: "%"
  },
  {
    id: "timeBetweenOverloading",
    label: "Time Between Overloading",
    defaultValue: 0,
    adornmentLabel: "hr"
  },
];

export const regionData : string[] = [
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
  "Custom"
]

export const technologyData : string[] = [
  "Solar", "Wind", "Hybrid"
];