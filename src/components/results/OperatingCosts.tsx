import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";

import { StyledCard } from "./Styles";
import CostLineChart from "./charts/CostLineChart";

export function OperatingCostsPane(operatingCosts: {
  projectTimeline: number;
  costs: { [key: string]: number[] };
}) {
  return (
    <StyledCard>
      <CardHeader
        title="Operating Costs"
        titleTypographyProps={{
          fontWeight: "bold",
          fontSize: 20,
        }}
      />
      <CardContent
        sx={{
          paddingTop: 0,
        }}
      >
        <CostLineChart
          title="Operating Costs"
          subtitle="Spike in values of battery and electrolyser OPEX due to replacement of battery and stack at the end of their lifetime."
          projectTimeline={operatingCosts.projectTimeline}
          datapoints={Object.keys(operatingCosts.costs).map((key: string) => {
            return { label: key, data: operatingCosts.costs[key] };
          })}
        />
      </CardContent>
    </StyledCard>
  );
}
