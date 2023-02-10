import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";

import CostLineChart from "../charts/CostLineChart";
import { StyledCard } from "./Styles";

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
          projectTimeline={operatingCosts.projectTimeline}
          datapoints={Object.keys(operatingCosts.costs).map((key: string) => {
            return { label: key, data: operatingCosts.costs[key] };
          })}
        />
      </CardContent>
    </StyledCard>
  );
}
