import { TextField } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import * as React from "react";

import InputTitle from "./InputTitle";

interface Props {
  title: string;
  helperText?: string;
}

const StyledSlider = styled(Slider)({
  height: 8,
  color: "#396AFF",

  "& .MuiSlider-rail": {
    background: "linear-gradient(90deg ,#5A6FFA, #BDD7EF)",
  },
  "& .MuiSlider-track": {
    border: "none",
  },
  "& .MuiSlider-thumb": {
    height: 24,
    width: 24,
    backgroundColor: "#5A93FC",
    border: "9px solid #FFFF",
    boxShadow:
      "0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)",

    "&:before": {
      display: "none",
    },
  },
});

export default function InputSlider(props: Props) {
  const [value, setValue] = React.useState<
    number | string | Array<number | string>
  >(30);

  const { title, helperText } = props;

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value === "" ? "" : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < 0) {
      setValue(0);
    } else if (value > 100) {
      setValue(100);
    }
  };

  return (
    <Box>
      <InputTitle title={title} helperText={helperText} />
      <Grid container padding="0 18px" alignItems="center">
        <Grid item xs>
          <StyledSlider
            value={typeof value === "number" ? value : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
          />
        </Grid>
        <Grid item>
          <TextField
            id={title}
            key={title}
            value={value}
            variant="outlined"
            size="small"
            type="number"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: 10,
              min: 0,
              max: 100,
              "aria-labelledby": "input-slider",
              style: {
                textAlign: "center",
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
