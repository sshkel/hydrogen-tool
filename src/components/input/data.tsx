
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
    id: "nominalElectrolyserCapacity",
    label: "Nominal Electrolyser Capacity",
    defaultValue: 10,
    adornmentLabel: "MW"
  },
  {
    id: "nominalSolarCapacity",
    label: "Nominal Solar Capacity",
    defaultValue: 10,
    adornmentLabel: "MW",
    helperText: "Rated capacity of solar farm"
  },
  {
    id: "nominalWindCapacity",
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
    label: "durationOfStorage",
    defaultValue: 0,
    adornmentLabel: "hr",
    helperText: "Number of hours that the battery takes to charge/discharge at its max power level."
  },
  {
    id: "nominalBatteryCapacity",
    label: "Nominal Battery Capacity",
    defaultValue: 0,
    disabled: true,
    adornmentLabel: "MWh",
    helperText: "Rated energy capacity of battery (multiple of storage duration and battery power capacity). Equals 0 if battery is not in configuration."
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
  }

];