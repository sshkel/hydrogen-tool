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
        width: "80%",
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
        <InputExpand title="Electrolyser Capital Costs" id="electrolyser-capital-costs">
          {[...Array(6)].map((_) => getData(pointer))}
        </InputExpand>
        <InputExpand title="Electrolyser Operating Costs" id="electrolyser-operating-costs">
          {[...Array(3)].map((_) => getData(pointer))}
        </InputExpand>
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
      <InputExpand title="Battery" id="Battery">
        <InputExpand title="Battery Parameters" id="battery-parameters">
          {[...Array(2)].map((_) => getData(pointer))}
        </InputExpand>
        <InputExpand title="Battery Costs" id="battery-costs">
          {[...Array(6)].map((_) => getData(pointer))}
        </InputExpand>
      </InputExpand>
      <InputExpand
        title="Electrolyser Specific Consumption - SEC"
        id="electrolyser-specific-consumption"
      >
        {[...Array(4)].map((_) => getData(pointer))}
      </InputExpand>
      <InputExpand title="Electrolyser Load Range" id="electrolyser-load-range">
        {[...Array(4)].map((_) => getData(pointer))}
      </InputExpand>
      <InputExpand title="Additional Costs" id="additional-costs">
        {[...Array(2)].map((_) => getData(pointer))}
      </InputExpand>
      <InputExpand title="Financing Parameters" id="financing-parameters">
        {[...Array(2)].map((_) => getData(pointer))}
      </InputExpand>
      <Button variant="contained" type="submit">
        Calculate
      </Button>
    </Box>
  );
}
