import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useState } from "react";

import InputTitle from "./InputTitle";
import { ORANGE } from "./colors";

interface Props {
  id: string;
  label: string;
  values: string[];
  defaultValue: string;
  onChange?: (val: string) => void;
}

export default function InputDropdownField(props: Props) {
  const { id, label, defaultValue, values, onChange } = props;
  const labelId = `${id}-label`;

  const [value, setValue] = useState(defaultValue);

  const onSelectChange = (event: SelectChangeEvent<string>) => {
    setValue(event.target.value);
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <FormControl sx={{ display: "flex", width: "inherit", p: 2 }}>
      <InputTitle title={label} id={labelId} />
      <Select
        color="success"
        displayEmpty
        name={id}
        key={id}
        labelId={labelId}
        id={id}
        value={value}
        onChange={onSelectChange}
        sx={{
          borderRadius: 2,
          boxShadow: "0px 0px 2px 2px rgb(180 180 180 / 75%)",
        }}
        MenuProps={{
          MenuListProps: {
            sx: {
              backgroundColor: "#F4F9FA",
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
    </FormControl>
  );
}
