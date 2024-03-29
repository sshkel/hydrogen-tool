import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";

import { StyledCard } from "./Styles";
import HourlyCapacityFactors from "./charts/HourlyCapacityFactors";

export function HourlyCapacityFactorsPane(hourlyCapFactors: {
  [key: string]: number[];
}) {
  return (
    <StyledCard>
      <CardHeader
        title="Hourly Capacity Factors"
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
        <HourlyCapacityFactors
          datapoints={Object.keys(hourlyCapFactors).map((key: string) => {
            return {
              label: key,
              data: hourlyCapFactors[key],
            };
          })}
        />
      </CardContent>
    </StyledCard>
  );
}