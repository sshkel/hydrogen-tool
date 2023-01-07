import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import React, { useEffect } from "react";

import { BLUE, GREY } from "../colors";
import InputTitle from "./InputTitle";
import { numberFieldDefaultInputs } from "./data";
import { DefaultInputs } from "./defaults";

const StyledInputNumberField = styled(TextField)<TextFieldProps>(() => ({
  "& .MuiOutlinedInput-root": {
    height: "2.5rem",
    "& fieldset": {
      borderColor: GREY,
      borderWidth: "2px",
      borderRadius: "8px",
    },
    "&:hover fieldset": {
      borderColor: GREY,
    },
    "&.Mui-focused fieldset": {
      borderColor: BLUE,
      boxShadow:
        "0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)",
    },
  },
  "& .MuiFormHelperText-root": {
    fontStyle: "italic",
    lineHeight: "1.2",
    marginLeft: 0,
  },
}));

const sx = {
  display: "flex",
  flexGrow: "1",
  flexShrink: "1",
  flexBasis: "100%",
  width: "100%",
  paddingX: 2.5,
};

interface Props {
  inputKey: string;
}

function InputNumberField({ inputKey }: Props) {
  if (!numberFieldDefaultInputs[inputKey]) {
    throw new Error(`${inputKey} is not a valid key for defaults`);
  }
  const {
    title,
    id = inputKey,
    helperText,
    adornmentLabel,
    step = 0.01,
    min,
    max,
  } = numberFieldDefaultInputs[inputKey];

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

  const valueText: string | undefined =
    min && max ? "Value: " + min + " - " + max : undefined;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(
      event.target.value === "" ? defaultValue : Number(event.target.value)
    );
  };

  const handleBlur = () => {
    if (min && value < min) {
      setValue(min);
    } else if (max && value > max) {
      setValue(max);
    }
  };

  return (
    <Grid container alignItems="center" columnSpacing={3.5}>
      <Grid item xs={12}>
        <InputTitle title={title} helperText={helperText} />
      </Grid>
      <Grid item xs={12}>
        <StyledInputNumberField
          id={id}
          key={title}
          // defaultValue={defaultValue}
          value={value}
          helperText={valueText}
          required
          type="number"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">{adornmentLabel}</InputAdornment>
            ),
          }}
          inputProps={{
            step: step,
            min: min,
            max: max,
            pattern: "/^d*.?d*$/",
          }}
          sx={sx}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
      </Grid>
    </Grid>
  );
}

export default React.memo(InputNumberField);
