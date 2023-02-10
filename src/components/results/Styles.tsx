import { Typography } from "@mui/material";
import Card from "@mui/material/Card";
import { styled } from "@mui/material/styles";

export const ItemTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: "darkgrey",
}));
export const ItemText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
}));

export const StyledCard = styled(Card)(({ theme }) => ({
  ...theme.typography.body2,
  margin: "15px",
  padding: "4px",
  borderRadius: "20px",
}));
