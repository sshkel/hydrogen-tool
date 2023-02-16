import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/material/styles";

import { WHITE } from "../colors";

const StyledChip = styled(Chip)({
  height: "fit-content",
  padding: "6px 24px",
  fontWeight: "bold",
  fontSize: "16px",
  backgroundColor: "white",
  color: "black",
  borderRadius: 20,
});

export default function HoverChip() {
  return (
    <Divider
      sx={{
        "&.MuiDivider-root": {
          "&::before": {
            borderColor: WHITE,
          },
          "&::after": {
            borderColor: WHITE,
          },
        },
        paddingY: 2,
      }}
    >
      <StyledChip label="Hover over the graphs to view the numbers" />
    </Divider>
  );
}
