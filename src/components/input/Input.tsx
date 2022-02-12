import Box from '@mui/material/Box';
import InputNumberField from './InputNumberField';
import InputExpand from './InputExpand';
import Button from '@mui/material/Button';
import React from 'react';
import { FormEventHandler } from 'react';


const kWheLabel = (<p>kWh<sub>e</sub>/kg<sub>H2</sub></p>);
const kgH2Label = (<p>kg<sub>H2</sub>/kWh<sub>e</sub></p>);


const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  console.log(e);
};



export default function Input() {
  return (
    <Box
      component="form"
      autoComplete="off"
      sx={{
        width: "50%",
        height: "50%",
        '& .MuiTextField-root': { m: 2, width: "45%" },
        '& .MuiButton-root': { m: 2 },
      }}
      onSubmit={onSubmit}
    >
      <InputExpand
        title="System Sizing"
        id="system-sizing"
      >
        <InputNumberField label="Nominal Electrolyser Capacity" defaultValue={10} adornment={{ label: "MW", position: "end" }}/>
        <InputNumberField label="Nominal Solar Capacity" defaultValue={10} adornment={{ label: "MW", position: "end" }}
                          helperText="Rated capacity of solar farm"/>
        <InputNumberField label="Nominal Wind Capacity" defaultValue={10} adornment={{ label: "MW", position: "end" }}
                          helperText="Rated capacity of wind farm"/>
        <InputNumberField label="Total Nominal Power Plant Capacity" defaultValue={10} disabled adornment={{ label: "MW", position: "end" }}
                          helperText="Total rated capacity for selected generation type" />
        <InputNumberField label="Battery Rated Power" defaultValue={0} adornment={{ label: "MW", position: "end" }}
                          helperText="Rated power capacity of the battery. Sets a limit on how much the battery can charge/ discharge instantaneously." />
        <InputNumberField label="Duration of Storage" defaultValue={0} adornment={{ label: "hr", position: "end" }}
                          helperText="Number of hours that the battery takes to charge/ discharge at its max power level" />
        <InputNumberField label="Nominal Battery Capacity" defaultValue={0} disabled adornment={{ label: "MWh", position: "end" }}
                          helperText="Rated energy capacity of battery (multiple of storage duration and battery power capacity). Equals 0 if battery is not in configuration." />
      </InputExpand>
      <InputExpand
        title="Electrolyser Parameters"
        id="electrolyser-parameters"
      >
        <InputExpand
          title="Electrolyser Specific Consumption - SEC"
          id="electrolyser-specific-consumption"
        >
          <InputNumberField label="SEC At Nominal Load (AE)" defaultValue={50} adornment={{ label: kWheLabel , position: "end" }} />
          <InputNumberField label="SEC At Nominal Load (PEM)" defaultValue={0.02} disabled adornment={{ label: kgH2Label , position: "end" }} />
          <InputNumberField label="SEC Correction Factor" defaultValue={100} adornment={{ label: "%" , position: "end" }} />
          <InputNumberField label="Total System SEC at Nominal Load" defaultValue={50.00} disabled adornment={{ label: kWheLabel , position: "end" }} />
        </InputExpand>
        <InputExpand
          title="Electrolyser Load Range"
          id="electrolyser-load-range"
        >
          <InputNumberField label="Electrolyser Maximum Load" defaultValue={100} adornment={{ label: "%" , position: "end" }} />
          <InputNumberField label="Electrolyser Minimum Load" defaultValue={10} adornment={{ label: "%" , position: "end" }} />
          <InputNumberField label="Maximum Load When Overloading" defaultValue={0} adornment={{ label: "%" , position: "end" }} />
          <InputNumberField label="Time Between Overloading" defaultValue={0} adornment={{ label: "hr" , position: "end" }} />
        </InputExpand>
      </InputExpand>
      <Button variant="contained" type="submit">Calculate</Button>
    </Box>
  );
}