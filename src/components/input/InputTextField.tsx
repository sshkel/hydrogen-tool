import TextField from '@mui/material/TextField';

interface Props {
  label: String;
  defaultValue?: String;
  helperText?: String;
  disabled?: boolean;
  required?: boolean;
}

export default function InputTextField(props: Props) {
  const { label, defaultValue, helperText, disabled, required } = props;
  return <TextField
          id="outlined"
          label={label}
          defaultValue={defaultValue}
          helperText={helperText}
          disabled={disabled}
          required={required}
        />
}