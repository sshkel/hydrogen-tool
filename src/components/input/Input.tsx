import Box from "@mui/material/Box";
import InputNumberField from "./InputNumberField";
import InputExpand from "./InputExpand";
import Button from "@mui/material/Button";
import React from "react";
import {
  data,
  profileData,
  locationData,
  replacementTypeData,
  technologyData,
  capitalDepreciationProfile,
} from "./data";
import InputSelectField from "./InputSelectField";

interface Props {
  setState: (obj: any) => void;
}

export default function Input(props: Props) {
  let pointer: number = 0;

  const onSubmit = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    let form: any = {};

    for (let input of e.target.getElementsByTagName("input")) {
      const { name, value } = input;
      form[name] = isNaN(value) ? value : Number(value);
    }

    localStorage.setItem("savedData", JSON.stringify(form));
    props.setState(form);
  };

  const savedState = localStorage.getItem("savedData") || "{}";
  const parsedState = JSON.parse(savedState);
  const getData = (index: number) => {
    ++pointer;
    const { label, id, defaultValue, adornmentLabel, disabled, helperText } =
      data[index];

    let savedValue;
    if (savedState) {
      const value = parsedState[id];
      savedValue = isNaN(value) ? value : Number(value);
    }
    return (
      <InputNumberField
        key={id}
        label={label}
        name={id}
        defaultValue={savedValue !== undefined ? savedValue : defaultValue}
        adornmentLabel={adornmentLabel}
        disabled={disabled}
        helperText={helperText}
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
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => onSubmit(e)}
    >
      <InputExpand title="Scope of Analysis" id="scope-of-analysis">
        <InputSelectField
          id="location"
          label="Location"
          values={locationData}
          defaultValue={locationData[0]}
        />
      </InputExpand>
      <InputExpand title="System Sizing" id="system-sizing">
        <InputSelectField
          id="technology"
          label="Technology"
          values={technologyData}
          defaultValue={technologyData[0]}
        />
        {[...Array(6)].map((_) => getData(pointer))}
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
          />
          {[...Array(2)].map((_) => getData(pointer))}
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
          />
          {[...Array(4)].map((_) => getData(pointer))}
        </InputExpand>
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
              id="capitalDepreciationProfile"
              label="Depreciation Profile"
              values={capitalDepreciationProfile}
              defaultValue={capitalDepreciationProfile[0]}
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
