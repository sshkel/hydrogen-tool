import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import ThemeProvider from "@mui/system/ThemeProvider";
import "chart.js/auto";
import Chart from "chart.js/auto";

import { WHITE } from "../colors";

// setup default fonts for the charts
Chart.defaults.font.family = "Nunito";

export default function LoadingResultsPage() {
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <Backdrop
        sx={{ color: WHITE, zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={true}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </ThemeProvider>
  );
}
