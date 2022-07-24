import InputAdornment from "@mui/material/InputAdornment";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import Box from "@mui/system/Box";

import InputHelpButton from "./InputHelpButton";

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
  "& .MuiInputLabel-root": {
    fontWeight: "bold",
    color: "black",
  },
  "& .MuiOutlinedInput-root": {
    flexGrow: "inherit",
    flexShrink: "inherit",
    "& fieldset": {
      borderColor: "blue",
      borderWidth: "2px",
      borderRadius: "20px",
    },
    "&:hover fieldset": {
      borderColor: "blue",
    },
    "&.Mui-focused fieldset": {
      borderColor: "orange",
    },
  },
}));

export default function InputNumberField(props: Props) {
  const {
    label,
    name,
    defaultValue,
    helperText,
    disabled,
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
      <StyledInputNumberField
        id={name}
        key={label}
        label={label}
        name={name}
        defaultValue={defaultValue}
        value={value}
        // helperText={helperText}
        disabled={disabled}
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
          flexFlow: "nowrap",
          alignItems: "stretch",
        }}
      />
      <InputHelpButton helperText={helperText} />
      <div style={{ display: "flex", flexBasis: "100%", height: 0 }} />
      <Typography
        paragraph
        sx={{
          fontStyle: "italic",
          fontSize: "0.75rem",
          margin: "-16px 0px 4px 16px",
        }}
      >
        {helperText}
      </Typography>
    </Box>
  );
}
