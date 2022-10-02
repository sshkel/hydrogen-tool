import "@fontsource/nunito/500.css";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { createTheme } from "@mui/material/styles";
import ThemeProvider from "@mui/system/ThemeProvider";
import React from "react";
import { useNavigate } from "react-router-dom";

import "../../input.css";
import { InputConfiguration } from "../../types";
import AdvancedHydrogenInput from "./AdvancedHydrogenInput";
import BasicHydrogenInput from "./BasicHydrogenInput";
import InputCalculateButton from "./InputCalculateButton";
import InputTab from "./InputTab";
import { BLUE, ORANGE } from "./colors";

const theme = createTheme({
  typography: {
    fontFamily: "Nunito",
  },
  palette: {
    primary: {
      main: BLUE,
      contrastText: "#000",
    },
    secondary: {
      main: "#F2F2F2",
      contrastText: "#000",
    },
    info: {
      main: "rgba(0, 0, 0, 0.54)",
      contrastText: "#000",
    },
    success: {
      main: ORANGE,
      light: "#f5b58a",
      dark: "#d35f12",
      contrastText: "#FFF",
    },
  },
});

interface Props {
  setInputConfiguration: (config: InputConfiguration) => void;
  setState: (obj: any) => void;
}

export default function InputHomePage(props: Props) {
  const navigate = useNavigate();
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

    for (let input of e.target.getElementsByTagName("input")) {
      if (input.type !== "number") {
        continue;
      }
      const { id, value } = input;
      form[id] = isNaN(value) ? value : Number(value);
    }

    localStorage.setItem("savedData", JSON.stringify(form));
    props.setState(form);
    navigate("/result");
  };

  return (
    <Box
      component="form"
      autoComplete="off"
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => onSubmit(e)}
    >
      <ThemeProvider theme={theme}>
        <Grid
          container
          padding={4}
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item>
            <Typography variant="h5" fontWeight="600" gutterBottom>
              Hydrogen
            </Typography>
            <Typography variant="subtitle1">
              General hydrogen production cost for region.​
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
            <AdvancedHydrogenInput />
          </TabPanel>
        </TabContext>
      </ThemeProvider>
    </Box>
  );
}
