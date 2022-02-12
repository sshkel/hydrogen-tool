import TextField from '@mui/material/TextField';

interface Props {
  label: String;
  defaultValue?: number;
  helperText?: String;
  disabled?: boolean;
  required?: boolean;
}

export default function InputNumberField(props: Props) {
  const { label, defaultValue, helperText, disabled, required } = props;
  return <TextField
          id="outlined-number"
          label={label}
          defaultValue={defaultValue}
          helperText={helperText}
          disabled={disabled}
          required={required}
          type="number"
        />;

}
