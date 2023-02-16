import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "../../../input.css";
import { InputConfiguration } from "../../../types";
import { isOffshore } from "../../../utils";
import DesignStepper from "../../DesignStepper";
import AdvancedAmmoniaInput from "../ammonia/AdvancedAmmoniaInput";
import BasicAmmoniaInput from "../ammonia/BasicAmmoniaInput";
import { configurationTypes, getInputKeysForConfiguration } from "../data";
import { getDefaultInputs } from "../defaults";
import AdvancedHydrogenInput from "../hydrogen/AdvancedHydrogenInput";
import BasicHydrogenInput from "../hydrogen/BasicHydrogenInput";
import AdvancedMethaneInput from "../methane/AdvancedMethaneInput";
import BasicMethaneInput from "../methane/BasicMethaneInput";
import AdvancedMethanolInput from "../methanol/AdvancedMethanolInput";
import BasicMethanolInput from "../methanol/BasicMethanolInput";
import InputCalculateButton from "./InputCalculateButton";
import InputTab from "./InputTab";

interface Props {
  setInputConfiguration: (config: InputConfiguration) => void;
  setState: (obj: any) => void;
  location: string;
}

export default function InputHomePage(props: Props) {
  const navigate = useNavigate();
  const { powerfuel = "hydrogen" } = useParams();
  const [tab, setTab] = React.useState<InputConfiguration>("Basic");
  const offshore = isOffshore(props.location);

  const { setInputConfiguration } = props;

  useEffect(() => {
    setInputConfiguration("Basic");
  }, [setInputConfiguration]);

  let formState: { [key: string]: number | string } = getDefaultInputs(
    powerfuel,
    tab,
    getInputKeysForConfiguration(powerfuel, tab, offshore)
  );

  const setInputConfigurationAndDefaultValues = (tab: InputConfiguration) => {
    props.setInputConfiguration(tab);
    formState = getDefaultInputs(
      powerfuel,
      tab,
      getInputKeysForConfiguration(powerfuel, tab, offshore)
    );
  };

  const handleChange = (_: React.SyntheticEvent, newTab: string) => {
    if (newTab === "Basic" || newTab === "Advanced") {
      setInputConfigurationAndDefaultValues(newTab);
      setTab(newTab);
    }
  };

  function getBasicInputs(powerfuel: string): JSX.Element {
    if (powerfuel === "ammonia") {
      return (
        <BasicAmmoniaInput location={props.location} formState={formState} />
      );
    }
    if (powerfuel === "methanol") {
      return (
        <BasicMethanolInput location={props.location} formState={formState} />
      );
    }
    if (powerfuel === "methane") {
      return (
        <BasicMethaneInput location={props.location} formState={formState} />
      );
    }
    return (
      <BasicHydrogenInput location={props.location} formState={formState} />
    );
  }

  function getAdvancedInputs(powerfuel: string): JSX.Element {
    if (powerfuel === "ammonia") {
      return (
        <AdvancedAmmoniaInput location={props.location} formState={formState} />
      );
    }
    if (powerfuel === "methanol") {
      return (
        <AdvancedMethanolInput
          location={props.location}
          formState={formState}
        />
      );
    }
    if (powerfuel === "methane") {
      return (
        <AdvancedMethaneInput location={props.location} formState={formState} />
      );
    }
    return (
      <AdvancedHydrogenInput location={props.location} formState={formState} />
    );
  }

  const onSubmit = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    let form: any = { ...formState };

    form["powerfuel"] = powerfuel;
    form["inputConfiguration"] = tab;
    for (let input of e.target.getElementsByTagName("input")) {
      const { id, name, value } = input;
      const key = id || name;
      if (key) {
        form[key] = isNaN(value) ? value : Number(value);
      }
    }

    for (let config of e.target.getElementsByClassName(
      "selectedConfiguration"
    )) {
      const value = config.textContent;
      const classList = config.classList;

      configurationTypes.forEach((config) => {
        if (classList.contains(config)) {
          form[config] = value;
        }
      });
    }

    props.setState(form);

    sessionStorage.setItem("savedData", JSON.stringify(form));
    navigate("/result");
  };

  const powerfuelTitle =
    powerfuel.charAt(0).toLocaleUpperCase() + powerfuel.slice(1);

  return (
    <Box
      component="form"
      autoComplete="off"
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => onSubmit(e)}
    >
      <DesignStepper activeStep={2} />
      <Grid
        container
        padding={4}
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item>
          <Typography
            variant="h5"
            fontWeight="600"
            gutterBottom
            marginBottom={0}
          >
            {powerfuelTitle}
          </Typography>
          <Typography variant="subtitle1">
            General {powerfuel} production cost for region.​
          </Typography>
        </Grid>
        <InputCalculateButton />
      </Grid>
      <TabContext value={tab}>
        <TabList
          indicatorColor="secondary"
          textColor="inherit"
          onChange={handleChange}
          aria-label="input-workflow-tab"
          sx={{
            boxShadow: "0px -6px 6px 0px rgb(180 180 180 / 75%) inset",
          }}
        >
          <InputTab
            label="Basic Input"
            value="Basic"
            active={tab === "Basic"}
          />
          <InputTab
            label="Advanced Input"
            value="Advanced"
            active={tab === "Advanced"}
          />
        </TabList>
        <TabPanel value="Basic" sx={{ background: "#F2F2F2" }}>
          {getBasicInputs(powerfuel)}
        </TabPanel>
        <TabPanel value="Advanced" sx={{ background: "#F2F2F2" }}>
          {getAdvancedInputs(powerfuel)}
        </TabPanel>
      </TabContext>
    </Box>
  );
}
