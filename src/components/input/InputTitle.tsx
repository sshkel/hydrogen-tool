import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import InputHelpButton from "./InputHelpButton";

interface Props {
  id?: string;
  title: string;
  helperText?: string;
}

export default function InputSlider(props: Props) {
  const { id = "input-title", title, helperText } = props;

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
      }}
    >
      <Typography
        id={id}
        sx={{ lineHeight: "28px", fontWeight: "bold", flexBasis: "99%" }}
      >
        {title}
      </Typography>
      <InputHelpButton helperText={helperText} />
    </Box>
  );
}
