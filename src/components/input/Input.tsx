import Box from "@mui/material/Box";
import InputNumberField from "./InputNumberField";
import InputExpand from "./InputExpand";
import Button from "@mui/material/Button";
import React, { useState } from "react";
import {
  data,
  profileData,
  regionData,
  replacementTypeData,
  technologyData,
  capitalDepreciaitonProfile,
} from "./data";
import InputSelectField from "./InputSelectField";

interface Props {
  setState: (obj: any) => void;
}

const getDefaultState = () => {
  const defaultState: any = {};
  data.forEach((field) => {
    defaultState[field.id] = field.defaultValue;
  });
  defaultState["profile"] = profileData[0];
  defaultState["replacementType"] = replacementTypeData[0];
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
        key={id}
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
        <InputExpand
          title="Electrolyser Capital Costs"
          id="electrolyser-capital-costs"
        >
          {[...Array(6)].map((_) => getData(pointer))}
        </InputExpand>
        <InputExpand
          title="Electrolyser Operating Costs"
          id="electrolyser-operating-costs"
        >
          {[...Array(3)].map((_) => getData(pointer))}
        </InputExpand>
      </InputExpand>
      <InputExpand title="Power Plant Costs" id="power-plant-costs">
        <InputExpand title="Solar Costs" id="solar-costs">
          {[...Array(7)].map((_) => getData(pointer))}
        </InputExpand>
        <InputExpand title="Wind Costs" id="wind-costs">
          {[...Array(7)].map((_) => getData(pointer))}
        </InputExpand>
        <InputExpand
          title="Costs for Grid Connected Systems"
          id="costs-for-grid-connected-systems"
        >
          {[...Array(3)].map((_) => getData(pointer))}
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
      <InputExpand title="Electrolyser Parameters" id="electrolyser-parameters">
        <InputExpand
          title="Electrolyser Specific Consumption - SEC"
          id="electrolyser-specific-consumption"
        >
          <InputSelectField
            id="profile"
            label="SEC vs Load Profile"
            values={profileData}
            defaultValue={profileData[0]}
            onChange={handleChange}
          />
          {[...Array(4)].map((_) => getData(pointer))}
        </InputExpand>
        <InputExpand
          title="Electrolyser Load Range"
          id="electrolyser-load-range"
        >
          {[...Array(4)].map((_) => getData(pointer))}
        </InputExpand>
        <InputExpand
          title="Other Operational Factors"
          id="other-operational-factors"
        >
          <InputSelectField
            id="replacementType"
            label="Stack Replacement Type"
            values={replacementTypeData}
            defaultValue={replacementTypeData[0]}
            onChange={handleChange}
          />
          {[...Array(4)].map((_) => getData(pointer))}
        </InputExpand>
      </InputExpand>
      <InputExpand title="Additional Costs" id="additional-costs">
        {[...Array(2)].map((_) => getData(pointer))}
      </InputExpand>
      <InputExpand
        title="Additional Revenue streams"
        id="additional-revenue-streams"
      >
        {[...Array(3)].map((_) => getData(pointer))}
      </InputExpand>
      <InputExpand title="Financing Parameters" id="financing-parameters">
        {[...Array(2)].map((_) => getData(pointer))}
        <InputExpand title="Investment Breakdown" id="investment-breakdown">
          <InputExpand title="Equity Share" id="equity-share">
            {[...Array(2)].map((_) => getData(pointer))}
          </InputExpand>
          <InputExpand title="Loan Share" id="loan-share">
            {[...Array(2)].map((_) => getData(pointer))}
          </InputExpand>
          <InputExpand
            title="Post Project Cash Flows"
            id="post-project-cash-flows"
          >
            {[...Array(2)].map((_) => getData(pointer))}
          </InputExpand>
          <InputExpand
            title="Additional Liabilities"
            id="additional-liabilities"
          >
            {[...Array(2)].map((_) => getData(pointer))}
          </InputExpand>
          <InputExpand title="Depreciation" id="depreciation">
            <InputSelectField
              id="capitalDepreciaitonProfile"
              label="DepreciationProfile"
              values={capitalDepreciaitonProfile}
              defaultValue={capitalDepreciaitonProfile[0]}
              onChange={handleChange}
            />
          </InputExpand>
        </InputExpand>
      </InputExpand>
      <Button variant="contained" type="submit">
        Calculate
      </Button>
    </Box>
  );
}
