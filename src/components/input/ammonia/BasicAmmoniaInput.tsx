import Grid from "@mui/material/Grid";

import "../../../input.css";
import { isOffshore } from "../../../utils";
import InputCard from "../InputCard";
import InputSelect from "../InputSelect";
import InputSlider from "../InputSlider";
import { InputProps } from "../types";

export default function BasicAmmoniaInput(props: InputProps) {
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
                key="ammoniaPlantCapacity"
                inputKey="ammoniaPlantCapacity"
                addValueToForm={props.formState}
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
                addValueToForm={props.formState}
              />,
              <InputSlider
                key="electrolyserSystemOversizing"
                inputKey="electrolyserSystemOversizing"
                addValueToForm={props.formState}
              />,
              // TODO work out why this freaks out as a slider
              <InputSlider
                key="hydrogenStorageCapacity"
                inputKey="hydrogenStorageCapacity"
                addValueToForm={props.formState}
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
                      addValueToForm={props.formState}
                    />,
                  ]
                : [
                    <InputSlider
                      key="powerPlantOversizeRatio"
                      inputKey="powerPlantOversizeRatio"
                      addValueToForm={props.formState}
                    />,
                    <InputSlider
                      key="solarToWindPercentage"
                      inputKey="solarToWindPercentage"
                      addValueToForm={props.formState}
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
                addValueToForm={props.formState}
              />,
              <InputSlider
                key="ammoniaPlantCapitalCost"
                inputKey="ammoniaPlantCapitalCost"
                addValueToForm={props.formState}
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
                          addValueToForm={props.formState}
                        />,
                      ]
                    : [
                        <InputSlider
                          key="solarFarmBuildCost"
                          inputKey="solarFarmBuildCost"
                          addValueToForm={props.formState}
                        />,
                        <InputSlider
                          key="windFarmBuildCost"
                          inputKey="windFarmBuildCost"
                          addValueToForm={props.formState}
                        />,
                      ],
                  [
                    <InputSlider
                      key="principalPPACost"
                      inputKey="principalPPACost"
                      addValueToForm={props.formState}
                    />,
                  ],
                ]}
              />,
              <InputSlider
                key="waterSupplyCost"
                inputKey="waterSupplyCost"
                addValueToForm={props.formState}
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
                addValueToForm={props.formState}
              />,
              <InputSlider
                key="projectTimeline"
                inputKey="projectTimeline"
                addValueToForm={props.formState}
              />,
            ]}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
