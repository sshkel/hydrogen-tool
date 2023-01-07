import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useState } from "react";

import { GREY, OFF_WHITE, ORANGE } from "../colors";
import InputTitle from "./InputTitle";

interface Props {
  id: string;
  label: string;
  values: string[];
  defaultValue: string;
  onChange?: (val: string) => void;
}

export default function InputDropdownField(props: Props) {
  const { id, label, defaultValue, values, onChange } = props;

  const [value, setValue] = useState(defaultValue);

  const onSelectChange = (event: SelectChangeEvent<string>) => {
    setValue(event.target.value);
    if (onChange) {
      onChange(event.target.value);
    }
  };
  const labelId = id + "-label";

  return (
    <Box
      sx={{
        display: "flex",
        flewidth: "inherit",
        flexDirection: "column",
      }}
    >
      <InputTitle id={labelId} title={label} />
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
              },
            },
          },
          sx: {
            "&& .Mui-selected": {
              backgroundColor: ORANGE,
              color: "white",
              "&.Mui-focusVisible": { background: ORANGE },

              // Override hover colour for selected items
              "&:hover": {
                "&& fieldset": {
                  backgroundColor: ORANGE,
                },
              },
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
    </Box>
  );
}
