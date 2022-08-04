import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { styled } from "@mui/material/styles";

import InputTitle from "./InputTitle";
import { BLUE, ORANGE } from "./colors";

interface Props {
  label: string;
  name: string;
  defaultValue?: string | number;
  value?: number;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  adornmentLabel?: string | JSX.Element;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const StyledInputNumberField = styled(TextField)<TextFieldProps>(() => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: BLUE,
      borderWidth: "2px",
      borderRadius: "20px",
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
  },
}));

export default function InputNumberField(props: Props) {
  const {
    label,
    name,
    defaultValue,
    helperText,
    required,
    onChange,
    adornmentLabel,
    value,
  } = props;

  return (
    <Grid container alignItems="center" columnSpacing={4}>
      <Grid item xs={12}>
        <InputTitle title={label} helperText={helperText} />
      </Grid>
      <Grid item xs={12}>
        <StyledInputNumberField
          id={name}
          key={label}
          // label={label}
          name={name}
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
          inputProps={{
            step: "0.01",
          }}
          sx={{
            display: "flex",
            flexGrow: "1",
            flexShrink: "1",
            flexBasis: "100%",
            width: "100%",
          }}
        />
      </Grid>
    </Grid>
  );
}
