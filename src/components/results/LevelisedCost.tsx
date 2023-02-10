import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";

import { StyledCard } from "./Styles";
import CostWaterfallBarChart from "./charts/CostWaterfallBarChart";

type WaterfallPaneData = {
  title: string;
  label: string;
  items: { [key: string]: number };
  formula: string;
};

export function WaterFallPane(data: WaterfallPaneData) {
  const labels = [];
  const items = [];
  for (const [key, val] of Object.entries(data.items)) {
    if (val !== 0) {
      labels.push(key);
      items.push(val);
    }
  }
  const datapoints = [
    {
      label: data.label,
      data: items,
    },
  ];
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
          paddingTop: 0,
        }}
      >
        <CostWaterfallBarChart
          title={data.title}
          labels={labels}
          datapoints={datapoints}
          formula={data.formula}
        />
      </CardContent>
    </StyledCard>
  );
}
export function LcBreakdownPane(
  lcBreakdownData: { [key: string]: number },
  powerfuel: string
) {
  return (
    <WaterFallPane
      title={`Breakdown of Cost Components in LC${powerfuelToFormula(
        powerfuel
      )}`}
      label={`Breakdown of Cost Components in Levelised Cost of ${
        powerfuel.charAt(0).toLocaleUpperCase() + powerfuel.slice(1)
      }`}
      formula={powerfuelToFormula(powerfuel)}
      items={lcBreakdownData}
    />
  );
}

function powerfuelToFormula(powerfuel: string): string {
  if (powerfuel === "hydrogen") {
    return "H2";
  }
  if (powerfuel === "ammonia") {
    return "NH3";
  }
  if (powerfuel === "methanol") {
    return "MeOH";
  }
  if (powerfuel === "methane") {
    return "SNG";
  }

  return "";
}
