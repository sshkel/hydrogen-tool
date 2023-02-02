import Grid from "@mui/material/Grid";

import "../../../input.css";
import { isOffshore } from "../../../utils";
import InputCard from "../InputCard";
import InputNumberField from "../InputNumberField";
import InputSelect from "../InputSelect";
import InputSlider from "../InputSlider";
import { InputScreenProps } from "../types";

export default function BasicHydrogenInput(props: InputScreenProps) {
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
      <Grid
        xs={4}
        container
        item
        rowSpacing={1}
        flexDirection="column"
        columnSpacing={2}
        flexWrap="nowrap"
      >
        <Grid item>
          <InputCard
            title="Project Scale"
            children={[
              <InputNumberField
                key="projectScale"
                inputKey="projectScale"
                formState={props.formState}
              />,
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
                formState={props.formState}
              />,
            ]}
          />
        </Grid>
        <Grid item>
          <InputCard
            title="Power Plant Capacity"
            children={
              isOffshore(props.location)
                ? [
                    <InputSlider
                      key="powerPlantOversizeRatio"
                      inputKey="powerPlantOversizeRatio"
                      formState={props.formState}
                    />,
                  ]
                : [
                    <InputSlider
                      key="powerPlantOversizeRatio"
                      inputKey="powerPlantOversizeRatio"
                      formState={props.formState}
                    />,
                    <InputSlider
                      key="solarToWindPercentage"
                      inputKey="solarToWindPercentage"
                      formState={props.formState}
                    />,
                  ]
            }
          />
        </Grid>
      </Grid>

      <Grid
        container
        item
        flexDirection="column"
        rowSpacing={1}
        xs={4}
        flexWrap="nowrap"
      >
        <Grid item>
          <InputCard
            title="Capital & Operating Cost"
            children={[
              <InputSlider
                key="electrolyserPurchaseCost"
                inputKey="electrolyserPurchaseCost"
                formState={props.formState}
              />,
              <InputSelect
                key="powerSupplyOptionSelect"
                selectKey="powerSupplyOptionSelect"
                prompt="Power Supply Option"
                selectClass="powerSupplyOption"
                helperText="Select Self Build for cases in which a new power plant is built in conjunction with electrolyser. Select PPA if there is a grid connection to a power supplier."
                titles={["Self Build", "Power Purchase Agreement (PPA)"]}
                buttonChildren={[
                  isOffshore(props.location)
                    ? [
                        <InputSlider
                          key="windFarmBuildCost"
                          inputKey="windFarmBuildCost"
                          formState={props.formState}
                        />,
                      ]
                    : [
                        <InputSlider
                          key="solarFarmBuildCost"
                          inputKey="solarFarmBuildCost"
                          formState={props.formState}
                        />,
                        <InputSlider
                          key="windFarmBuildCost"
                          inputKey="windFarmBuildCost"
                          formState={props.formState}
                        />,
                      ],
                  [
                    <InputSlider
                      key="principalPPACost"
                      inputKey="principalPPACost"
                      formState={props.formState}
                    />,
                  ],
                ]}
              />,
              <InputSlider
                key="waterSupplyCost"
                inputKey="waterSupplyCost"
                formState={props.formState}
              />,
            ]}
          />
        </Grid>
      </Grid>

      <Grid
        container
        item
        flexDirection="column"
        xs={4}
        rowSpacing={1}
        flexWrap="nowrap"
      >
        <Grid item>
          <InputCard
            title="Cost Analysis"
            children={[
              <InputSlider
                key="discountRate"
                inputKey="discountRate"
                formState={props.formState}
              />,
              <InputSlider
                key="projectTimeline"
                inputKey="projectTimeline"
                formState={props.formState}
              />,
            ]}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
