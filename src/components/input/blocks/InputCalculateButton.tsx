import LoadingButton from "@mui/lab/LoadingButton";
import { styled } from "@mui/material/styles";

const StyledButton = styled(LoadingButton)({
  textTransform: "none",
  height: "fit-content",
  fontWeight: "bold",
  fontSize: "16px",
  backgroundColor: "#203864",
  color: "white",
  borderRadius: 20,
  width: 180,
});

interface Props {
  loading?: boolean;
}

export default function InputCalculateButton({ loading }: Props) {
  return (
    <StyledButton loading={loading} variant="contained" type="submit">
      Calculate
    </StyledButton>
  );
}
