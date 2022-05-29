import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";

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
    <TextField
      id={name}
      key={label}
      name={name}
      label={label}
      defaultValue={defaultValue}
      value={value}
      helperText={helperText}
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
    />
  );
}
