import Box from "@mui/material/Box";
import InputNumberField from "./InputNumberField";
import InputExpand from "./InputExpand";
import Button from "@mui/material/Button";
import React, { useState } from "react";
import { data, regionData, technologyData } from "./data";
import InputSelectField from "./InputSelectField";

interface Props {
  setState: (obj: any) => void;
}

const getDefaultState = () => {
  const defaultState: any = {};
  data.forEach((field) => {
    defaultState[field.id] = field.defaultValue;
  });
  defaultState["technology"] = technologyData[0];
  defaultState["region"] = regionData[0];
  return defaultState;
};

export default function Input(props: Props) {
  const [formData, setFormData] = useState(getDefaultState());
  let pointer: number = 0;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>, form: any) => {
    e.preventDefault();
    console.log(form);
    props.setState(form);
  };

  const handleChange = (e: { target: { value: any; name: string } }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getData = (index: number) => {
    ++pointer;
    const { label, id, defaultValue, adornmentLabel, disabled, helperText } =
      data[index];
    return (
      <InputNumberField
        label={label}
        name={id}
        defaultValue={defaultValue}
        adornmentLabel={adornmentLabel}
        disabled={disabled}
        helperText={helperText}
        onChange={handleChange}
      />
    );
  };

  return (
    <Box
      component="form"
      autoComplete="off"
      sx={{
        width: "66%",
        height: "50%",
        "& .MuiTextField-root": { m: 2, width: "40%" },
        "& .selectWrapper": { m: 2, width: "40%" },
        "& .MuiButton-root": { m: 2 },
      }}
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => onSubmit(e, formData)}
    >
      <InputExpand title="Scope of Analysis" id="scope-of-analysis">
        <InputSelectField
          id="location"
          label="Location"
          values={regionData}
          defaultValue={regionData[0]}
          onChange={handleChange}
        />
      </InputExpand>
      <InputExpand title="System Sizing" id="system-sizing">
        <InputSelectField
          id="technology"
          label="Technology"
          values={technologyData}
          defaultValue={technologyData[0]}
          onChange={handleChange}
        />
        {[...Array(7)].map((_) => getData(pointer))}
      </InputExpand>
      <InputExpand title="Electrolyser Costs" id="electrolyser-costs">
        {[...Array(6)].map((_) => getData(pointer))}
      </InputExpand>
      <InputExpand title="Power Plant Costs" id="power-plant-costs">
        <InputExpand title="Solar Costs" id="solar-costs">
          {[...Array(6)].map((_) => getData(pointer))}
        </InputExpand>
        <InputExpand title="Wind Costs" id="wind-costs">
          {[...Array(6)].map((_) => getData(pointer))}
        </InputExpand>
        <InputExpand
          title="Costs for Grid Connected Systems"
          id="costs-for-grid-connected-systems"
        >
          {getData(pointer)}
        </InputExpand>
      </InputExpand>
      <InputExpand title="Battery Costs" id="battery-costs">
        {[...Array(3)].map((_) => getData(pointer))}
      </InputExpand>
      <InputExpand title="Additional Costs" id="additional-costs">
        {[...Array(2)].map((_) => getData(pointer))}
      </InputExpand>

      {/* <InputExpand
        title="Electrolyser Parameters"
        id="electrolyser-parameters"
      >
        <InputExpand
          title="Electrolyser Specific Consumption - SEC"
          id="electrolyser-specific-consumption"
        >
          <InputNumberField label={data[7].label} name={data[7].id} defaultValue={data[7].defaultValue} adornmentLabel={data[7].adornmentLabel} disabled={data[7].disabled} helperText={data[7].helperText} onChange={handleChange} />
          <InputNumberField label={data[8].label} name={data[8].id} defaultValue={data[8].defaultValue} adornmentLabel={data[8].adornmentLabel} disabled={data[8].disabled} helperText={data[8].helperText} onChange={handleChange} />
          <InputNumberField label={data[9].label} name={data[9].id} defaultValue={data[9].defaultValue} adornmentLabel={data[9].adornmentLabel} disabled={data[9].disabled} helperText={data[9].helperText} onChange={handleChange} />
          <InputNumberField label={data[10].label} name={data[10].id} defaultValue={data[10].defaultValue} adornmentLabel={data[10].adornmentLabel} disabled={data[10].disabled} helperText={data[10].helperText} onChange={handleChange} />
        </InputExpand>
        <InputExpand
          title="Electrolyser Load Range"
          id="electrolyser-load-range"
        >
          <InputNumberField label={data[11].label} name={data[11].id} defaultValue={data[11].defaultValue} adornmentLabel={data[11].adornmentLabel} disabled={data[11].disabled} helperText={data[11].helperText} onChange={handleChange} />
          <InputNumberField label={data[12].label} name={data[12].id} defaultValue={data[12].defaultValue} adornmentLabel={data[12].adornmentLabel} disabled={data[12].disabled} helperText={data[12].helperText} onChange={handleChange} />
          <InputNumberField label={data[13].label} name={data[13].id} defaultValue={data[13].defaultValue} adornmentLabel={data[13].adornmentLabel} disabled={data[13].disabled} helperText={data[13].helperText} onChange={handleChange} />
          <InputNumberField label={data[14].label} name={data[14].id} defaultValue={data[14].defaultValue} adornmentLabel={data[14].adornmentLabel} disabled={data[14].disabled} helperText={data[14].helperText} onChange={handleChange} />
        </InputExpand>
      </InputExpand> */}
      <Button variant="contained" type="submit">
        Calculate
      </Button>
    </Box>
  );
}
