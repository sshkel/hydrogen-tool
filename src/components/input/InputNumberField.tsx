import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { Adornment } from './types';

interface Props {
  label: String;
  defaultValue?: number;
  helperText?: String;
  disabled?: boolean;
  required?: boolean;
  adornment?: Adornment;
}

export default function InputNumberField(props: Props) {
  const { label, defaultValue, helperText, disabled, required, adornment } = props;
  let startAdornment, endAdornment;

  if (adornment) {
    if (adornment.position === 'start') {
      startAdornment = <InputAdornment position="start">{adornment.label}</InputAdornment>
    }

    if (adornment.position === 'end') {
      endAdornment = <InputAdornment position="end">{adornment.label}</InputAdornment>;
    }
  }


  return <TextField
          id="outlined-number"
          label={label}
          defaultValue={defaultValue}
          helperText={helperText}
          disabled={disabled}
          required={required}
          type="number"
          InputProps={{
            startAdornment: startAdornment,
            endAdornment: endAdornment
          }}
        />;

}
