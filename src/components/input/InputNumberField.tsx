import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import React from "react";

import InputTitle from "./InputTitle";
import { BLUE, ORANGE } from "./colors";
import { advancedDefaultInputs } from "./data";
import { defaultInputs } from "./defaults";

const StyledInputNumberField = styled(TextField)<TextFieldProps>(() => ({
  "& .MuiOutlinedInput-root": {
    height: "40px",
    "& fieldset": {
      borderColor: BLUE,
      borderWidth: "2px",
      borderRadius: "8px",
    },
    "&:hover fieldset": {
      borderColor: BLUE,
    },
    "&.Mui-focused fieldset": {
      borderColor: ORANGE,
      boxShadow:
        "0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)",
    },
  },
  "& .MuiFormHelperText-root": {
    fontStyle: "italic",
    lineHeight: "1.2",
    paddingLeft: "10px",
  },
}));

const inputProps = {
  step: "0.01",
};

const sx = {
  display: "flex",
  flexGrow: "1",
  flexShrink: "1",
  flexBasis: "100%",
  width: "100%",
  paddingX: 1,
};

interface Props {
  inputKey: string;
}

function InputNumberField({ inputKey }: Props) {
  const {
    title,
    id = inputKey,
    helperText,
    required,
    onChange,
    adornmentLabel,
    value,
  } = advancedDefaultInputs[inputKey];
  const defaultValue = defaultInputs[inputKey];

  return (
    <Grid container alignItems="center" columnSpacing={4}>
      <Grid item xs={12}>
        <InputTitle title={title} helperText={helperText} />
      </Grid>
      <Grid item xs={12}>
        <StyledInputNumberField
          id={id}
          key={title}
          defaultValue={defaultValue}
          value={value}
          helperText={helperText}
          required={required}
          type="number"
          onChange={onChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">{adornmentLabel}</InputAdornment>
            ),
          }}
          inputProps={inputProps}
          sx={sx}
        />
      </Grid>
    </Grid>
  );
}

export default React.memo(InputNumberField);
