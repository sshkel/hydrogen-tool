import InputAdornment from "@mui/material/InputAdornment";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Box from "@mui/system/Box";

import InputTitle from "./InputTitle";

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
    flexGrow: "inherit",
    flexShrink: "inherit",
    "& fieldset": {
      borderColor: "#396AFF",
      borderWidth: "2px",
      borderRadius: "20px",
    },
    "&:hover fieldset": {
      borderColor: "#396AFF",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#ed7d31",
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
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        flexFlow: "wrap",
        alignItems: "stretch",
      }}
    >
      <InputTitle title={label} helperText={helperText} />
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
    </Box>
  );
}
