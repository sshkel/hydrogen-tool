import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";

import { getActiveYearsLabels } from "../../utils";
import CostBarChart from "../charts/CostBarChart";

export function CashFlowAnalysisPane(
  projectTimeline: number,
  cumulativeCashFlow: number[]
) {
  return (
    <Card>
      <CardHeader title="Cash Flow Analysis" />
      <CostBarChart
        title="Cash Flow Analysis"
        labels={getActiveYearsLabels(projectTimeline)}
        datapoints={[
          {
            label: "Cash Flow Analysis",
            data: cumulativeCashFlow,
          },
        ]}
      />
    </Card>
  );
}
