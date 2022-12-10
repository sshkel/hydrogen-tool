import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import "../../input.css";
import { InputConfiguration } from "../../types";
import DesignStepper from "../DesignStepper";
import AdvancedHydrogenInput from "./AdvancedHydrogenInput";
import BasicHydrogenInput from "./BasicHydrogenInput";
import InputCalculateButton from "./InputCalculateButton";
import InputTab from "./InputTab";
import AdvancedAmmoniaInput from "./ammonia/AdvancedAmmoniaInput";
import { configurationTypes } from "./data";

interface Props {
  setInputConfiguration: (config: InputConfiguration) => void;
  setState: (obj: any) => void;
}

export default function InputHomePage(props: Props) {
  const navigate = useNavigate();
  const { powerfuel = "hydrogen" } = useParams();
  const [tab, setTab] = React.useState("Basic");

  const handleChange = (_: React.SyntheticEvent, newTab: string) => {
    if (newTab === "Basic" || newTab === "Advanced") {
      props.setInputConfiguration(newTab);
    }
    setTab(newTab);
  };

  const onSubmit = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    let form: any = {};

    form["powerfuel"] = powerfuel;
    for (let input of e.target.getElementsByTagName("input")) {
      const { id, name, value } = input;
      const key = id || name;
      if (key) {
        form[key] = isNaN(value) ? value : Number(value);
      }
    }

    for (let button of e.target.getElementsByTagName("button")) {
      const classList = button.classList;
      if (classList.contains("MuiButton-containedSuccess")) {
        const value = button.textContent;

        configurationTypes.forEach((config) => {
          if (classList.contains(config)) {
            form[config] = value;
          }
        });
      }
    }

    localStorage.setItem("savedData", JSON.stringify(form));
    props.setState(form);
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
          <BasicHydrogenInput />
        </TabPanel>
        <TabPanel value="Advanced" sx={{ background: "#F2F2F2" }}>
          {powerfuel === "hydrogen" ? (
            <AdvancedHydrogenInput />
          ) : (
            <AdvancedAmmoniaInput />
          )}
        </TabPanel>
      </TabContext>
    </Box>
  );
}
