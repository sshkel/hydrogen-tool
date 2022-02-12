import Box from '@mui/material/Box';
import InputNumberField from './InputNumberField';
import InputExpand from './InputExpand';
import Button from '@mui/material/Button';
import React, { useState } from 'react';
import { data } from './data';

const onSubmit = (e: React.FormEvent<HTMLFormElement>, form: any) => {
  e.preventDefault();
  console.log(form);
};

export default function Input() {
  const defaultState: any = {}
  data.forEach(field => {
    defaultState[field.id] = field.defaultValue;
  });

  const [ formData, setFormData ] = useState(defaultState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  }

  return (
    <Box
      component="form"
      autoComplete="off"
      sx={{
        width: "50%",
        height: "50%",
        '& .MuiTextField-root': { m: 2, width: "45%" },
        '& .MuiButton-root': { m: 2 },
      }}
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => onSubmit(e, formData)}
    >
      <InputExpand
        title="System Sizing"
        id="system-sizing"
      >
        <InputNumberField label={data[0].label} name={data[0].id} defaultValue={data[0].defaultValue} adornmentLabel={data[0].adornmentLabel} disabled={data[0].disabled} helperText={data[0].helperText} onChange={handleChange} />
        <InputNumberField label={data[1].label} name={data[1].id} defaultValue={data[1].defaultValue} adornmentLabel={data[1].adornmentLabel} disabled={data[1].disabled} helperText={data[1].helperText} onChange={handleChange} />
        <InputNumberField label={data[2].label} name={data[2].id} defaultValue={data[2].defaultValue} adornmentLabel={data[2].adornmentLabel} disabled={data[2].disabled} helperText={data[2].helperText} onChange={handleChange} />
        <InputNumberField label={data[3].label} name={data[3].id} defaultValue={data[3].defaultValue} adornmentLabel={data[3].adornmentLabel} disabled={data[3].disabled} helperText={data[3].helperText} onChange={handleChange} />
        <InputNumberField label={data[4].label} name={data[4].id} defaultValue={data[4].defaultValue} adornmentLabel={data[4].adornmentLabel} disabled={data[4].disabled} helperText={data[4].helperText} onChange={handleChange} />
        <InputNumberField label={data[5].label} name={data[5].id} defaultValue={data[5].defaultValue} adornmentLabel={data[5].adornmentLabel} disabled={data[5].disabled} helperText={data[5].helperText} onChange={handleChange} />
        <InputNumberField label={data[6].label} name={data[6].id} defaultValue={data[6].defaultValue} adornmentLabel={data[6].adornmentLabel} disabled={data[6].disabled} helperText={data[6].helperText} onChange={handleChange} />
      </InputExpand>
      <InputExpand
        title="Electrolyser Parameters"
        id="electrolyser-parameters"
      >
        <InputExpand
          title="Electrolyser Specific Consumption - SEC"
          id="electrolyser-specific-consumption"
        >
          <InputNumberField label={data[7].label} name={data[7].id} defaultValue={data[7].defaultValue} adornmentLabel={data[7].adornmentLabel} disabled={data[7].disabled} helperText={data[7].helperText} onChange={handleChange} />
          <InputNumberField label={data[8].label} name={data[8].id} defaultValue={data[8].defaultValue} adornmentLabel={data[8].adornmentLabel} disabled={data[8].disabled} helperText={data[8].helperText} onChange={handleChange} />
          <InputNumberField label={data[9].label} name={data[9].id} defaultValue={data[9].defaultValue} adornmentLabel={data[9].adornmentLabel} disabled={data[9].disabled} helperText={data[9].helperText} onChange={handleChange} />
          <InputNumberField label={data[10].label} name={data[10].id} defaultValue={data[10].defaultValue} adornmentLabel={data[10].adornmentLabel} disabled={data[10].disabled} helperText={data[10].helperText} onChange={handleChange} />
        </InputExpand>
        <InputExpand
          title="Electrolyser Load Range"
          id="electrolyser-load-range"
        >
          <InputNumberField label={data[11].label} name={data[11].id} defaultValue={data[11].defaultValue} adornmentLabel={data[11].adornmentLabel} disabled={data[11].disabled} helperText={data[11].helperText} onChange={handleChange} />
          <InputNumberField label={data[12].label} name={data[12].id} defaultValue={data[12].defaultValue} adornmentLabel={data[12].adornmentLabel} disabled={data[12].disabled} helperText={data[12].helperText} onChange={handleChange} />
          <InputNumberField label={data[13].label} name={data[13].id} defaultValue={data[13].defaultValue} adornmentLabel={data[13].adornmentLabel} disabled={data[13].disabled} helperText={data[13].helperText} onChange={handleChange} />
          <InputNumberField label={data[14].label} name={data[14].id} defaultValue={data[14].defaultValue} adornmentLabel={data[14].adornmentLabel} disabled={data[14].disabled} helperText={data[14].helperText} onChange={handleChange} />
        </InputExpand>
      </InputExpand>
      <Button variant="contained" type="submit">Calculate</Button>
    </Box>
  );
}