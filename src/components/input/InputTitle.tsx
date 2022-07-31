import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import InputHelpButton from "./InputHelpButton";

interface Props {
  title: string;
  helperText?: string;
}

export default function InputSlider(props: Props) {
  const { title, helperText } = props;

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        padding: "0 18px",
      }}
    >
      <Typography
        id="input-title"
        sx={{ lineHeight: "28px", flexBasis: "99%" }}
      >
        {title}
      </Typography>
      <InputHelpButton helperText={helperText} />
    </Box>
  );
}
