import Grid from "@mui/material/Grid";

import "../../../input.css";
import { InputScreenProps } from "../../../types";
import { isOffshore } from "../../../utils";
import InputCard from "../blocks/InputCard";
import InputDropdownField from "../blocks/InputDropdownField";
import InputSelect from "../blocks/InputSelect";
import InputSlider from "../blocks/InputSlider";
import { CARBON_CAPTURE_SOURCE_HELPER_TEXT } from "../data";

export default function BasicMethaneInput(props: InputScreenProps) {
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
              <InputSlider
                key="methanePlantCapacity"
                inputKey="methanePlantCapacity"
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
              <InputSlider
                key="electrolyserSystemOversizing"
                inputKey="electrolyserSystemOversizing"
                formState={props.formState}
              />,
              <InputSlider
                key="hydrogenStorageCapacity"
                inputKey="hydrogenStorageCapacity"
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
              <InputSlider
                key="methanePlantUnitCost"
                inputKey="methanePlantUnitCost"
                formState={props.formState}
              />,
              <InputDropdownField
                id="carbonCaptureSource"
                key="carbonCaptureSource"
                label="Carbon Capture Source"
                values={[
                  "Cement Plant",
                  "Fermentation Plant",
                  "Coal Power Plant",
                  "Steel Plant",
                  "Direct Air Capture",
                  "Steam Methane Reforming",
                ]}
                formState={props.formState}
                helperText={CARBON_CAPTURE_SOURCE_HELPER_TEXT}
              />,
              <InputSelect
                key="powerSupplyOptionSelect"
                selectKey="powerSupplyOptionSelect"
                prompt="Power Supply Option"
                selectClass="powerSupplyOption"
                helperText="Select 'Self Build' for a new power plant built in conjunction with electrolyser. Select 'PPA' for electricity purchase from a power supplier."
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
