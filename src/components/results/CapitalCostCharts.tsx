import { Grid } from "@mui/material";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";

import { StyledCard } from "./Styles";
import CostBreakdownDoughnutChart from "./charts/CostBreakdownDoughnutChart";

type DoughnutPaneData = {
  title: string;
  items: { [key: string]: number };
};

export function DoughnutPane(data: DoughnutPaneData) {
  return (
    <StyledCard>
      <CardHeader
        title={data.title}
        titleTypographyProps={{
          fontWeight: "bold",
          fontSize: 20,
        }}
      />
      <CardContent
        sx={{
          height: "50vh",
          paddingTop: 0,
        }}
      >
        <CostBreakdownDoughnutChart title={data.title} items={data.items} />
      </CardContent>
    </StyledCard>
  );
}

export function CapitalCostCharts(charts: DoughnutPaneData[]) {
  return charts.map((data: DoughnutPaneData) => {
    return (
      <Grid item xs={6} key={data.title}>
        <DoughnutPane title={data.title} items={data.items} />
      </Grid>
    );
  });
}
