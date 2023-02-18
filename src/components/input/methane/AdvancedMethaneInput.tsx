import Grid from "@mui/material/Grid";

import ControlledPowerPlantCard from "../blocks/ControlledPowerPlantCard";
import InputCard from "../blocks/InputCard";
import InputDropdownField from "../blocks/InputDropdownField";
import InputNumberField from "../blocks/InputNumberField";
import InputSelect from "../blocks/InputSelect";
import { InputScreenProps } from "../types";

export default function AdvancedMethaneInput(props: InputScreenProps) {
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
        flexWrap="nowrap"
      >
        <Grid item>
          <InputCard
            title="Methane Parameters"
            children={[
              <InputCard
                subtitle
                mountOnEnter
                key="methanePlantCapacity"
                title="Methane Plant Capacity"
                children={[
                  <InputNumberField
                    key="methanePlantCapacity"
                    inputKey="methanePlantCapacity"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="methaneStorageCapacity"
                    inputKey="methaneStorageCapacity"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="methanePlantMinimumTurndown"
                    inputKey="methanePlantMinimumTurndown"
                    formState={props.formState}
                  />,
                ]}
              />,
              <InputCard
                subtitle
                mountOnEnter
                key="methanePlantSec"
                title="Methane Plant SEC"
                children={[
                  <InputNumberField
                    key="methanePlantSec"
                    inputKey="methanePlantSec"
                    formState={props.formState}
                  />,
                ]}
              />,
              <InputCard
                subtitle
                mountOnEnter
                key="methaneCapitalAndOperatingCosts"
                title="Methane Capital and Operating Costs"
                children={[
                  <InputNumberField
                    key="methanePlantUnitCost"
                    inputKey="methanePlantUnitCost"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="methaneStorageCost"
                    inputKey="methaneStorageCost"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="methaneEpcCosts"
                    inputKey="methaneEpcCosts"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="methaneLandProcurementCosts"
                    inputKey="methaneLandProcurementCosts"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="methanePlantOMCost"
                    inputKey="methanePlantOMCost"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="methaneStorageOMCost"
                    inputKey="methaneStorageOMCost"
                    formState={props.formState}
                  />,
                ]}
              />,
            ]}
          />
        </Grid>
        <Grid item>
          <InputCard
            title="Carbon Capture Parameters"
            children={[
              <InputCard
                subtitle
                mountOnEnter
                key="ccPlantSec"
                title="Carbon Capture SEC"
                children={[
                  <InputNumberField
                    key="ccSec"
                    inputKey="ccSec"
                    formState={props.formState}
                  />,
                ]}
              />,
              <InputCard
                subtitle
                mountOnEnter
                key="ccCapitalAndOperatingCosts"
                title="Carbon Capture Capital and Operating Costs"
                children={[
                  <InputNumberField
                    key="ccPlantCost"
                    inputKey="ccPlantCost"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="ccEpcCosts"
                    inputKey="ccEpcCosts"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="ccLandProcurementCosts"
                    inputKey="ccLandProcurementCosts"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="ccPlantOMCost"
                    inputKey="ccPlantOMCost"
                    formState={props.formState}
                  />,
                ]}
              />,
            ]}
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
            title="Electrolyser & Hydrogen Parameters"
            children={[
              <InputNumberField
                key="electrolyserSystemOversizing"
                inputKey="electrolyserSystemOversizing"
                formState={props.formState}
              />,
              <InputCard
                subtitle
                mountOnEnter
                key="electrolyserSystemEfficiency"
                title="Electrolyser System Efficiency"
                children={[
                  <InputNumberField
                    key="secAtNominalLoad"
                    inputKey="secAtNominalLoad"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="waterRequirementOfElectrolyser"
                    inputKey="waterRequirementOfElectrolyser"
                    formState={props.formState}
                  />,
                ]}
              />,
              <InputCard
                subtitle
                mountOnEnter
                key="electrolyserLoadRange"
                title="Electrolyser Load Range"
                children={[
                  <InputNumberField
                    key="electrolyserMaximumLoad"
                    inputKey="electrolyserMaximumLoad"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="electrolyserMinimumLoad"
                    inputKey="electrolyserMinimumLoad"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="maximumLoadWhenOverloading"
                    inputKey="maximumLoadWhenOverloading"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="timeBetweenOverloading"
                    inputKey="timeBetweenOverloading"
                    formState={props.formState}
                  />,
                ]}
              />,
              <InputSelect
                key="stackReplacementTypeSelect"
                selectKey="stackReplacementTypeSelect"
                prompt="Stack Replacement Type"
                selectClass="stackReplacementType"
                titles={["Cumulative Hours", "Maximum Degradation Level"]}
                helperText="Replace stack lifetime exceeds an hourly threshold or degrades past a given rate"
                formState={props.formState}
                buttonChildren={[
                  [
                    <InputNumberField
                      key="stackLifetime"
                      inputKey="stackLifetime"
                      formState={props.formState}
                    />,
                    <InputNumberField
                      key="stackDegradation"
                      inputKey="stackDegradation"
                      formState={props.formState}
                    />,
                  ],
                  [
                    <InputNumberField
                      key="maximumDegradationBeforeReplacement"
                      inputKey="maximumDegradationBeforeReplacement"
                      formState={props.formState}
                    />,
                    <InputNumberField
                      key="stackDegradation"
                      inputKey="stackDegradation"
                      formState={props.formState}
                    />,
                  ],
                ]}
              />,
              <InputCard
                subtitle
                mountOnEnter
                key="hydrogenStorage"
                title="Hydrogen Storage"
                children={[
                  <InputNumberField
                    key="hydrogenStorageCapacity"
                    inputKey="hydrogenStorageCapacity"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="minimumHydrogenStorage"
                    inputKey="minimumHydrogenStorage"
                    formState={props.formState}
                  />,
                ]}
              />,
              <InputCard
                subtitle
                mountOnEnter
                key="electrolyserCapitialAndOperatingCosts"
                title="Electrolyser Capital and Operating Costs"
                children={[
                  <InputNumberField
                    key="electrolyserReferenceCapacity"
                    inputKey="electrolyserReferenceCapacity"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="electrolyserPurchaseCost"
                    inputKey="electrolyserPurchaseCost"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="electrolyserCostReductionWithScale"
                    inputKey="electrolyserCostReductionWithScale"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="electrolyserReferenceFoldIncrease"
                    inputKey="electrolyserReferenceFoldIncrease"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="hydrogenStoragePurchaseCost"
                    inputKey="hydrogenStoragePurchaseCost"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="electrolyserEpcCosts"
                    inputKey="electrolyserEpcCosts"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="electrolyserLandProcurementCosts"
                    inputKey="electrolyserLandProcurementCosts"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="electrolyserOMCost"
                    inputKey="electrolyserOMCost"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="hydrogenStorageOMCost"
                    inputKey="hydrogenStorageOMCost"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="electrolyserStackReplacement"
                    inputKey="electrolyserStackReplacement"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="waterSupplyCost"
                    inputKey="waterSupplyCost"
                    formState={props.formState}
                  />,
                ]}
              />,
            ]}
          />
        </Grid>
        <Grid item>
          <ControlledPowerPlantCard
            location={props.location}
            formState={props.formState}
            withNominalCapacity={false}
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
            title="Battery Parameters"
            mountOnEnter
            children={[
              <InputCard
                subtitle
                key="batteryCapacity"
                title="Battery Capacity"
                children={[
                  <InputDropdownField
                    id="batteryStorageDuration"
                    key="batteryStorageDuration"
                    label="Battery Storage Duration"
                    values={["0", "1", "2", "4", "8"]}
                    formState={props.formState}
                  />,
                ]}
              />,
              <InputCard
                subtitle
                key="batteryPerformance"
                title="Battery Performance"
                children={[
                  <InputNumberField
                    key="batteryEfficiency"
                    inputKey="batteryEfficiency"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="batteryMinCharge"
                    inputKey="batteryMinCharge"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="batteryLifetime"
                    inputKey="batteryLifetime"
                    formState={props.formState}
                  />,
                ]}
              />,
              <InputCard
                subtitle
                key="batteryCapitalAndOperatingCosts"
                title="Battery Capital and Operating Costs"
                children={[
                  <InputNumberField
                    key="batteryCosts"
                    inputKey="batteryCosts"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="batteryEpcCosts"
                    inputKey="batteryEpcCosts"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="batteryLandProcurementCosts"
                    inputKey="batteryLandProcurementCosts"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="batteryOMCost"
                    inputKey="batteryOMCost"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="batteryReplacementCost"
                    inputKey="batteryReplacementCost"
                    formState={props.formState}
                  />,
                ]}
              />,
            ]}
          />
        </Grid>

        <Grid item>
          <InputCard
            title="Additional Costs"
            mountOnEnter
            children={[
              <InputCard
                subtitle
                key="additionalCosts"
                title="Additional Upfront/Operating Costs"
                children={[
                  <InputNumberField
                    key="additionalUpfrontCosts"
                    inputKey="additionalUpfrontCosts"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="additionalAnnualCosts"
                    inputKey="additionalAnnualCosts"
                    formState={props.formState}
                  />,
                ]}
              />,
              <InputCard
                subtitle
                key="financingParameters"
                title="Financing Parameters"
                children={[
                  <InputNumberField
                    key="projectTimeline"
                    inputKey="projectTimeline"
                    formState={props.formState}
                  />,
                  <InputNumberField
                    key="discountRate"
                    inputKey="discountRate"
                    formState={props.formState}
                  />,
                ]}
              />,
            ]}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
