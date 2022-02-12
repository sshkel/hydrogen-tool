import Box from '@mui/material/Box';
import InputNumberField from './InputNumberField';
import InputExpand from './InputExpand';

export default function Input() {
  return (
    <Box
      component="form"
      autoComplete="off"
      sx={{
        width: "50%",
        height: "50%",
        '& .MuiTextField-root': { m: 2, width: "45%" },
      }}
    >
      <InputExpand
        title="System Sizing"
        id="system-sizing"
      >
          <InputNumberField label="Nominal Electrolyser Capacity" defaultValue={10} />
          <InputNumberField label="Nominal Solar Capacity" defaultValue={10} />
          <InputNumberField label="Nominal Wind Capacity" defaultValue={10} />
          <InputNumberField label="Total Nominal Power Plant Capacity" defaultValue={10} disabled />
          <InputNumberField label="Battery Rated Power" defaultValue={0} />
          <InputNumberField label="Duration of Storage" defaultValue={0} />
          <InputNumberField label="Nominal Battery Capacity" defaultValue={0} disabled />
        </InputExpand>
    </Box>
  );
}