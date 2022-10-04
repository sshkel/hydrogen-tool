import Grid from "@mui/material/Grid";

import InputCard from "./InputCard";

export default function AdvancedHydrogenInput() {
  return (
    <Grid
      container
      justifyContent="space-around"
      rowSpacing={1}
      flexWrap="nowrap"
      height="100%"
      sx={{
        "& .MuiButton-root": { marginY: 0.5 },
        "& .MuiGrid-container": { paddingX: 2, paddingY: 0.5 },
      }}
    >
      <Grid xs={4} container item rowSpacing={1} flexDirection="column">
        <Grid item>
          <InputCard title="Electrolyser Parameters" children={null} />
        </Grid>
      </Grid>

      <Grid container item flexDirection="column" rowSpacing={1} xs={4}>
        <Grid item>
          <InputCard title="Power Plant Parameters" children={null} />
        </Grid>
      </Grid>

      <Grid container item flexDirection="column" xs={4} rowSpacing={1}>
        <Grid item>
          <InputCard title="Battery Parameters" children={null} />
        </Grid>

        <Grid item>
          <InputCard title="Additional Costs" children={null} />
        </Grid>
      </Grid>
    </Grid>
  );
}
