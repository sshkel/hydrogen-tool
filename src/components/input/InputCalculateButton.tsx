import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

const StyledButton = styled(Button)({
  textTransform: "none",
  height: "fit-content",
  fontWeight: "bold",
  fontSize: "16px",
  backgroundColor: "#203864",
  color: "white",
  borderRadius: 20,
  width: 180,
});

export default function InputCalculateButton() {
  return (
    <StyledButton variant="contained" type="submit">
      Calculate
    </StyledButton>
  );
}
