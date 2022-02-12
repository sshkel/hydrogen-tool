import InputNumberField from "./InputNumberField";
import { Adornment } from "./types";

interface Field {
  id: string;
  label: string;
  defaultValue?: string | number;
  disabled: boolean;
  adornment?: Adornment;
  helperText?: string;
  Field: (p: any) => JSX.Element;
}


const kWheLabel = (<p>kWh<sub>e</sub>/kg<sub>H2</sub></p>);
const kgH2Label = (<p>kg<sub>H2</sub>/kWh<sub>e</sub></p>);


export const data: Field[] = [
  {
    id: "nominalElectrolyserCapacity",
    label: "Nominal Electrolyser Capacity",
    defaultValue: 10,
    disabled: false,
    adornment: { label: "MW", position: "end" },
    Field: InputNumberField,
  },
  {
    id: "nominalSolarCapacity",
    label: "Nominal Solar Capacity",
    defaultValue: 10,
    disabled: false,
    adornment: { label: "MW", position: "end" },
    helperText: "Rated capacity of solar farm",
    Field: InputNumberField,
  },
  {
    id: "nominalWindCapacity",
    label: "Nominal Wind Capacity",
    defaultValue: 10,
    disabled: false,
    adornment: { label: "MW", position: "end" },
    helperText: "Rated capacity of wind farm",
    Field: InputNumberField,
  }

];