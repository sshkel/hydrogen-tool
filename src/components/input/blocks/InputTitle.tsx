import { InputLabel } from "@mui/material";
import Box from "@mui/material/Box";
import * as React from "react";

import InputHelpButton from "./InputHelpButton";

interface Props {
  id?: string;
  title: string;
  helperText?: string;
}

function InputTitle(props: Props) {
  const { id, title, helperText } = props;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-around",
        width: "100%",
      }}
    >
      <InputLabel
        id={id}
        sx={{
          paddingLeft: "1.5rem",
          fontSize: "0.85rem",
          fontWeight: "bold",
          color: "black",
          flexBasis: "99%",
        }}
      >
        {title}
      </InputLabel>
      <InputHelpButton helperText={helperText} />
    </Box>
  );
}

export default React.memo(InputTitle);
