import { InputLabel } from "@mui/material";
import Box from "@mui/material/Box";
import * as React from "react";

import InputHelpButton from "./InputHelpButton";

interface Props {
  title: string;
  helperText?: string;
}

function InputTitle(props: Props) {
  const { title, helperText } = props;

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
      }}
    >
      <InputLabel
        sx={{
          paddingLeft: "24px",
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
