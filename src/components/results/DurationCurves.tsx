import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";

import { StyledCard } from "./Styles";
import DurationCurve from "./charts/DurationCurve";

export function DurationCurves(durationCurves: { [key: string]: number[] }) {
  return Object.keys(durationCurves).map((key: string) => {
    return (
      <Grid item xs={6} key={key}>
        <StyledCard>
          <CardHeader
            title={key}
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
            <DurationCurve title={key} data={durationCurves[key]} />
          </CardContent>
        </StyledCard>
      </Grid>
    );
  });
}
