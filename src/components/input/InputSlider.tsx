import { TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import * as React from "react";
import { useEffect } from "react";

import { BLUE, WHITE } from "../colors";
import InputTitle from "./InputTitle";
import { sliderFieldDefaultInputs } from "./data";
import { DefaultInputs } from "./defaults";

interface Props {
  inputKey: string;
}

const StyledSlider = styled(Slider)({
  height: 8,
  color: BLUE,

  "& .MuiSlider-rail": {
    background: "linear-gradient(90deg ,#5A6FFA, #BDD7EF)",
  },
  "& .MuiSlider-track": {
    border: "none",
  },
  "& .MuiSlider-thumb": {
    height: 20,
    width: 20,
    backgroundColor: "#5A93FC",
    border: `6px solid ${WHITE}`,
    boxShadow:
      "0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)",

    "&:before": {
      display: "none",
    },
  },
});

export default function InputSlider({ inputKey }: Props) {
  const data = sliderFieldDefaultInputs[inputKey];

  if (!data) {
    throw new Error(`Could not locate data for key ${inputKey}`);
  }

  const { title, helperText, min = 0, max = 100, step = 10 } = data;
  const defaultValue = DefaultInputs.get(inputKey);

  const [value, setValue] = React.useState<string | number | number[]>(
    defaultValue
  );

  useEffect(() => {
    // Capture current state on unmount and in between state change of app
    return () => {
      DefaultInputs.set(
        inputKey,
        typeof value === "number" ? value : defaultValue
      );
    };
  });

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    setValue(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(
      event.target.value === "" ? defaultValue : Number(event.target.value)
    );
  };

  const handleBlur = () => {
    if (value < min) {
      setValue(min);
    } else if (value > max) {
      setValue(max);
    }
  };
  const valueText: string =
    "Value: " +
    min.toLocaleString("en-US") +
    " - " +
    max.toLocaleString("en-US");

  return (
    <Grid container columnSpacing={3.5}>
      <Grid item xs={12}>
        <InputTitle title={title} helperText={helperText} />
      </Grid>
      <Grid item flexGrow={1} flexShrink={1} marginLeft={3.25}>
        <StyledSlider
          value={typeof value === "number" ? value : 0}
          onChange={handleSliderChange}
          aria-labelledby="input-slider"
          min={min}
          max={max}
          step={step}
          defaultValue={defaultValue}
        />
      </Grid>
      <Grid item marginRight={1.5}>
        <TextField
          id={inputKey}
          value={value}
          variant="outlined"
          size="small"
          type="number"
          onChange={handleInputChange}
          onBlur={handleBlur}
          required
          sx={{ width: "6rem" }}
          inputProps={{
            inputMode: "numeric",
            pattern: "/^d*.?d*$/",
            step: step,
            min: min,
            max: max,
            "aria-labelledby": "input-slider",
            style: {
              textAlign: "center",
              fontSize: "0.85rem",
            },
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography
          sx={{
            marginLeft: "24px",
            fontSize: "0.75rem",
            fontStyle: "italic",
            color: "rgba(0, 0, 0, 0.6)",
            lineHeight: "1.2",
            marginTop: "-8px",
          }}
        >
          {valueText}
        </Typography>
      </Grid>
    </Grid>
  );
}
