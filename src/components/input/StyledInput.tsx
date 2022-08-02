import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import React from "react";
import { useNavigate } from "react-router-dom";

import InputCard from "./InputCard";
import InputNumberField from "./InputNumberField";
import InputSelect from "./InputSelect";
import InputSlider from "./InputSlider";
import { data } from "./data";

interface Props {
  setState: (obj: any) => void;
}

export default function StyledInput(props: Props) {
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

  return (
    <Box
      component="form"
      autoComplete="off"
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => onSubmit(e)}
      sx={
        {
          // "> *": {
          //   padding: 2,
          // },
          // margin: 2,
        }
      }
    >
      <Button variant="contained" type="submit">
        Calculate
      </Button>

      <Grid
        container
        justifyContent="space-around"
        rowSpacing={1}
        flexWrap="nowrap"
        sx={{
          "& .MuiButton-root": { marginY: 0.5 },
          "& .MuiGrid-container": { paddingX: 2, paddingY: 0.5 },
        }}
      >
        <Grid
          xs={4}
          container
          item
          rowSpacing={1}
          flexDirection="column"
          // justifyContent="flex-start"
        >
          <Grid item>
            <InputCard
              title="Project Scale"
              children={[...Array(3)].map((_, i) => {
                if (i % 3 === 0) {
                  let data = getData(pointer);
                  return data;
                }
                if (i % 3 === 1) {
                  return (
                    <InputSlider
                      title="Efficiency (%)"
                      helperText="Value: 50 - 100%"
                    />
                  );
                }
                return (
                  <InputSelect
                    titles={[
                      "Build powerplant option​",
                      "Purchase electricity via PPA",
                    ]}
                    helperTexts={["No PPA Agreement", undefined]}
                    buttonChildren={[
                      [
                        <InputSlider
                          title="Solar farm build cost​"
                          helperText="Value: A$50 – 5,000 per kW​"
                        />,
                        <InputSlider
                          title="Wind farm build cost​"
                          helperText="Value: A$50 – 5,000 per kW​"
                        />,
                      ],
                      [
                        <InputSlider
                          title="Override the powerplant cost with electricity price​"
                          helperText="Value: A$0 – 100 per MWh​​"
                        />,
                      ],
                    ]}
                  />
                );
              })}
            />
          </Grid>
          <Grid item>
            <InputCard
              title="Electrolyser Parameters"
              children={[...Array(3)].map((_, i) => {
                if (i % 3 === 0) {
                  let data = getData(pointer);
                  return data;
                }
                if (i % 3 === 1) {
                  return (
                    <InputSlider
                      title="Efficiency (%)"
                      helperText="Value: 50 - 100%"
                    />
                  );
                }
                return (
                  <InputSelect
                    titles={[
                      "Build powerplant option​",
                      "Purchase electricity via PPA",
                    ]}
                    helperTexts={["No PPA Agreement", undefined]}
                    buttonChildren={[
                      [
                        <InputSlider
                          title="Solar farm build cost​"
                          helperText="Value: A$50 – 5,000 per kW​"
                        />,
                        <InputSlider
                          title="Wind farm build cost​"
                          helperText="Value: A$50 – 5,000 per kW​"
                        />,
                      ],
                      [
                        <InputSlider
                          title="Override the powerplant cost with electricity price​"
                          helperText="Value: A$0 – 100 per MWh​​"
                        />,
                      ],
                    ]}
                  />
                );
              })}
            />
          </Grid>
          <Grid item>
            <InputCard
              title="Power Plant Capacity"
              children={[...Array(3)].map((_, i) => {
                if (i % 3 === 0) {
                  let data = getData(pointer);
                  return data;
                }
                if (i % 3 === 1) {
                  return (
                    <InputSlider
                      title="Efficiency (%)"
                      helperText="Value: 50 - 100%"
                    />
                  );
                }
                return (
                  <InputSelect
                    titles={[
                      "Build powerplant option​",
                      "Purchase electricity via PPA",
                    ]}
                    helperTexts={["No PPA Agreement", undefined]}
                    buttonChildren={[
                      [
                        <InputSlider
                          title="Solar farm build cost​"
                          helperText="Value: A$50 – 5,000 per kW​"
                        />,
                        <InputSlider
                          title="Wind farm build cost​"
                          helperText="Value: A$50 – 5,000 per kW​"
                        />,
                      ],
                      [
                        <InputSlider
                          title="Override the powerplant cost with electricity price​"
                          helperText="Value: A$0 – 100 per MWh​​"
                        />,
                      ],
                    ]}
                  />
                );
              })}
            />
          </Grid>
        </Grid>

        <Grid container item flexDirection="column" rowSpacing={1} xs={4}>
          <Grid item>
            <InputCard
              title="Capital & Operating Cost"
              children={[...Array(3)].map((_, i) => {
                if (i % 3 === 0) {
                  let data = getData(0);
                  return data;
                }
                if (i % 3 === 1) {
                  return (
                    <InputSlider
                      title="Efficiency (%)"
                      helperText="Value: 50 - 100%"
                    />
                  );
                }
                return (
                  <InputSelect
                    titles={[
                      "Build powerplant option​",
                      "Purchase electricity via PPA",
                    ]}
                    helperTexts={["No PPA Agreement", undefined]}
                    buttonChildren={[
                      [
                        <InputSlider
                          title="Solar farm build cost​"
                          helperText="Value: A$50 – 5,000 per kW​"
                        />,
                        <InputSlider
                          title="Wind farm build cost​"
                          helperText="Value: A$50 – 5,000 per kW​"
                        />,
                      ],
                      [
                        <InputSlider
                          title="Override the powerplant cost with electricity price​"
                          helperText="Value: A$0 – 100 per MWh​​"
                        />,
                      ],
                    ]}
                  />
                );
              })}
            />
          </Grid>
        </Grid>

        <Grid container item flexDirection="column" xs={4} rowSpacing={1}>
          <Grid item>
            <InputCard
              title="Cost Analysis"
              children={[...Array(3)].map((_, i) => {
                if (i % 3 === 0) {
                  let data = getData(pointer);
                  return data;
                }
                if (i % 3 === 1) {
                  return (
                    <InputSlider
                      title="Efficiency (%)"
                      helperText="Value: 50 - 100%"
                    />
                  );
                }
                return (
                  <InputSelect
                    titles={[
                      "Build powerplant option​",
                      "Purchase electricity via PPA",
                    ]}
                    helperTexts={["No PPA Agreement", undefined]}
                    buttonChildren={[
                      [
                        <InputSlider
                          title="Solar farm build cost​"
                          helperText="Value: A$50 – 5,000 per kW​"
                        />,
                        <InputSlider
                          title="Wind farm build cost​"
                          helperText="Value: A$50 – 5,000 per kW​"
                        />,
                      ],
                      [
                        <InputSlider
                          title="Override the powerplant cost with electricity price​"
                          helperText="Value: A$0 – 100 per MWh​​"
                        />,
                      ],
                    ]}
                  />
                );
              })}
            />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
