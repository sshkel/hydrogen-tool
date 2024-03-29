import { Grid } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useState } from "react";

import { GREY, OFF_WHITE, ORANGE } from "../../colors";
import InputTitle from "./InputTitle";

interface Props {
  id: string;
  label: string;
  values: string[];
  onChange?: (val: string) => void;
  formState?: { [key: string]: number | string };
  helperText?: string;
}

export default function InputDropdownField(props: Props) {
  const { id, label, values, formState, helperText, onChange } = props;

  const defaultValue =
    formState && formState[id] ? String(formState[id]) : values[0];

  const [value, setValue] = useState(defaultValue);

  const onSelectChange = (event: SelectChangeEvent<string>) => {
    setValue(event.target.value);
    if (onChange) {
      onChange(event.target.value);
    }
    if (formState) {
      formState[id] = value;
    }
  };
  const labelId = id + "-label";

  return (
    <Grid
      container
      sx={{
        display: "flex",
        flexWidth: "inherit",
        flexDirection: "column",
      }}
    >
      <InputTitle id={labelId} title={label} helperText={helperText} />
      <Select
        id={id}
        labelId={labelId}
        color="primary"
        displayEmpty
        name={id}
        key={id}
        value={value}
        onChange={onSelectChange}
        sx={{
          height: "2.5rem",
          borderRadius: 2,
          borderColor: GREY,
          boxShadow:
            "0px 0px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%))",
          marginX: 3.5,
          marginY: 1,

          "&:hover": {
            "&& fieldset": {
              borderColor: GREY,
            },
          },
        }}
        MenuProps={{
          MenuListProps: {
            sx: {
              backgroundColor: OFF_WHITE,
              "&& .Mui-selected": {
                backgroundColor: ORANGE,

                "&:hover": {
                  backgroundColor: ORANGE,
                },
              },
            },
          },
          sx: {
            "&& .Mui-selected": {
              backgroundColor: ORANGE,
              color: "white",
              "&.Mui-focusVisible": { background: ORANGE },
            },
          },
        }}
      >
        {values.map((item) => (
          <MenuItem key={item} value={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
    </Grid>
  );
}
