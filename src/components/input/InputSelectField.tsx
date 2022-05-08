import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useState } from "react";

interface Props {
  id: string;
  label: string;
  values: string[];
  defaultValue: string;
}

export default function InputTextField(props: Props) {
  const { id, label, defaultValue, values } = props;
  const labelId = `${id}-label`;

  const [value, setValue] = useState(defaultValue);

  const onSelectChange = (event: SelectChangeEvent<string>) => {
    setValue(event.target.value);
  };

  return (
    <FormControl className="selectWrapper">
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        name={id}
        key={id}
        labelId={labelId}
        id={id}
        value={value}
        label={label}
        onChange={onSelectChange}
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
