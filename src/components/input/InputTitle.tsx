import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
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
      <Typography
        sx={{ lineHeight: "28px", fontWeight: "bold", flexBasis: "99%" }}
      >
        {title}
      </Typography>
      <InputHelpButton helperText={helperText} />
    </Box>
  );
}

export default React.memo(InputTitle);
