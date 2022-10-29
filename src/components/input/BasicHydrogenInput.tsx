import Grid from "@mui/material/Grid";

import "../../input.css";
import InputCard from "./InputCard";
import InputNumberField from "./InputNumberField";
import InputSelect from "./InputSelect";
import InputSlider from "./InputSlider";

export default function BasicHydrogenInput() {
  return (
    <Grid
      container
      justifyContent="space-around"
      rowSpacing={1}
      flexWrap="nowrap"
      height="100%"
      sx={{
        "& .MuiButton-root": { marginY: 0.5 },
        "& .MuiGrid-container": {
          paddingX: 0.75,
          paddingTop: 0.25,
          paddingBottom: 2,
        },
      }}
    >
      <Grid xs={4} container item rowSpacing={1} flexDirection="column">
        <Grid item>
          <InputCard
            title="Project Scale"
            children={[
              <InputNumberField key="projectScale" inputKey="projectScale" />,
            ]}
          />
        </Grid>
        <Grid item>
          <InputCard
            title="Electrolyser Parameters"
            children={[
              <InputSlider
                key="electrolyserEfficiency"
                inputKey="electrolyserEfficiency"
              />,
            ]}
          />
        </Grid>
        <Grid item>
          <InputCard
            title="Power Plant Capacity"
            children={[
              <InputSlider
                key="powerPlantOversizeRatio"
                inputKey="powerPlantOversizeRatio"
              />,
              <InputSlider
                key="solarToWindPercentage"
                inputKey="solarToWindPercentage"
              />,
            ]}
          />
        </Grid>
      </Grid>

      <Grid container item flexDirection="column" rowSpacing={1} xs={4}>
        <Grid item>
          <InputCard
            title="Capital & Operating Cost"
            children={[
              <InputSlider
                key="electrolyserPurchaseCost"
                inputKey="electrolyserPurchaseCost"
              />,
              <InputSelect
                key="powerSupplyOptionSelect"
                selectKey="powerSupplyOptionSelect"
                prompt="Power Supply Option"
                selectClass="powerSupplyOption"
                helperText="Add farm build costs or PPA supply costs."
                titles={["Self Build", "Power Purchase Agreement (PPA)"]}
                buttonChildren={[
                  [
                    <InputSlider
                      key="solarFarmBuildCost"
                      inputKey="solarFarmBuildCost"
                    />,
                    <InputSlider
                      key="windFarmBuildCost"
                      inputKey="windFarmBuildCost"
                    />,
                  ],
                  [
                    <InputSlider
                      key="principalPPACost"
                      inputKey="principalPPACost"
                    />,
                  ],
                ]}
              />,
              <InputSlider key="waterSupplyCost" inputKey="waterSupplyCost" />,
            ]}
          />
        </Grid>
      </Grid>

      <Grid container item flexDirection="column" xs={4} rowSpacing={1}>
        <Grid item>
          <InputCard
            title="Cost Analysis"
            children={[
              <InputSlider key="discountRate" inputKey="discountRate" />,
              <InputSlider key="projectTimeline" inputKey="projectTimeline" />,
            ]}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
