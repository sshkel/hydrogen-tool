import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { PowerPlantConfiguration } from "../../types";
import InputExpand from "./InputExpand";
import InputNumberField from "./InputNumberField";
import InputSelectField from "./InputSelectField";
import {
  capitalDepreciationProfile,
  data,
  isPowerPlantConfiguration,
  powerPlantConfigurationData,
  profileData,
  replacementTypeData,
  technologyData,
} from "./data";

interface Props {
  setState: (obj: any) => void;
}

export default function Input(props: Props) {
  const [powerPlantConfiguration, setPowerPlantConfiguration] =
    useState<PowerPlantConfiguration>("Standalone");

  const navigate = useNavigate();

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
    navigate("/result");
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

  const getDataWithDisabledCheck = (index: number, disabled: boolean) => {
    ++pointer;
    const { label, id, defaultValue, adornmentLabel, helperText } = data[index];

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
        defaultValue={
          disabled
            ? undefined
            : savedValue !== undefined
            ? savedValue
            : defaultValue
        }
        value={disabled ? 0 : undefined}
        adornmentLabel={adornmentLabel}
        disabled={disabled}
        helperText={helperText}
      />
    );
  };

  const setStateChange = (setState: (s: PowerPlantConfiguration) => void) => {
    return (val: string) => {
      if (isPowerPlantConfiguration(val)) {
        setState(val);
      }
    };
  };

  return (
    <Box
      component="form"
      autoComplete="off"
      sx={{
        height: "50%",
        "& .selectWrapper": { m: 2, width: "40%" },
        "& .MuiButton-root": { marginY: 0.5 },
        "& .MuiGrid-container": { paddingX: 2, paddingY: 0.5 },
        "& .MuiCard-root": { marginY: 1 },
      }}
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => onSubmit(e)}
    >
      <InputExpand title="Scope of Analysis" id="scope-of-analysis">
        <InputSelectField
          id="powerPlantConfiguration"
          label="Power Plant Configuration"
          values={powerPlantConfigurationData}
          defaultValue={
            parsedState["powerPlantConfiguration"] !== undefined
              ? parsedState["powerPlantConfiguration"]
              : powerPlantConfigurationData[0]
          }
          onChange={setStateChange(setPowerPlantConfiguration)}
        />
      </InputExpand>
      <InputExpand title="System Sizing" id="system-sizing">
        <InputSelectField
          id="technology"
          label="Technology"
          values={technologyData}
          defaultValue={
            parsedState["technology"] !== undefined
              ? parsedState["technology"]
              : technologyData[0]
          }
        />
        {[...Array(5)].map((_) => getData(pointer))}
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
            defaultValue={
              parsedState["profile"] !== undefined
                ? parsedState["profile"]
                : profileData[0]
            }
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
            id="stackReplacementType"
            label="Stack Replacement Type"
            values={replacementTypeData}
            defaultValue={
              parsedState["stackReplacementType"] !== undefined
                ? parsedState["stackReplacementType"]
                : replacementTypeData[0]
            }
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
      <InputExpand title="Power Plant Parameters" id="power-plant-parameters">
        {[...Array(2)].map((_) => getData(pointer))}
      </InputExpand>
      <InputExpand title="Power Plant Costs" id="power-plant-costs">
        <InputExpand title="Solar Costs" id="solar-costs">
          {[...Array(7)].map((_) =>
            getDataWithDisabledCheck(
              pointer,
              powerPlantConfiguration === "PPA Agreement"
            )
          )}
        </InputExpand>

        <InputExpand title="Wind Costs" id="wind-costs">
          {[...Array(7)].map((_) =>
            getDataWithDisabledCheck(
              pointer,
              powerPlantConfiguration === "PPA Agreement"
            )
          )}
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
              defaultValue={
                parsedState["capitalDepreciationProfile"] !== undefined
                  ? parsedState["capitalDepreciationProfile"]
                  : capitalDepreciationProfile[0]
              }
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
