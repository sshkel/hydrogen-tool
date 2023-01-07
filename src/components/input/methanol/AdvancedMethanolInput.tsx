import Grid from "@mui/material/Grid";

import ControlledPowerPlantCard from "../ControlledPowerPlantCard";
import InputCard from "../InputCard";
import InputDropdownField from "../InputDropdownField";
import InputNumberField from "../InputNumberField";
import InputSelect from "../InputSelect";

export default function AdvancedMethanolInput() {
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
            title="Methanol Parameters"
            children={[
              <InputCard
                subtitle
                mountOnEnter
                key="methanolPlantCapacity"
                title="Methanol Plant Capacity"
                children={[
                  <InputNumberField
                    key="methanolPlantCapacity"
                    inputKey="methanolPlantCapacity"
                  />,
                  <InputNumberField
                    key="methanolStorageCapacity"
                    inputKey="methanolStorageCapacity"
                  />,
                  <InputNumberField
                    key="methanolPlantMinimumTurndown"
                    inputKey="methanolPlantMinimumTurndown"
                  />,
                  <InputDropdownField
                    id="carbonCaptureSource"
                    defaultValue="Coal Power Plant"
                    label="Carbon Capture Source"
                    values={[
                      "Coal Power Plant",
                      "Steel Plant",
                      "Cement Plant",
                      "Fermentation Plant",
                      "Direct Air Capture",
                      "Steam Methane Reforming",
                    ]}
                  />,
                ]}
              />,
              <InputCard
                subtitle
                mountOnEnter
                key="methanolPlantSec"
                title="Methanol Plant SEC"
                children={[
                  <InputNumberField
                    key="methanolPlantSec"
                    inputKey="methanolPlantSec"
                  />,
                  <InputNumberField key="ccSec" inputKey="ccSec" />,
                ]}
              />,
              <InputCard
                subtitle
                mountOnEnter
                key="methanolCapitalAndOperatingCosts"
                title="Methanol Capital and Operating Costs"
                children={[
                  <InputNumberField
                    key="methanolPlantUnitCost"
                    inputKey="methanolPlantUnitCost"
                  />,
                  <InputNumberField
                    key="methanolStorageCost"
                    inputKey="methanolStorageCost"
                  />,
                  <InputNumberField key="ccPlantCost" inputKey="ccPlantCost" />,
                  <InputNumberField
                    key="methanolEpcCosts"
                    inputKey="methanolEpcCosts"
                  />,
                  <InputNumberField
                    key="methanolLandProcurementCosts"
                    inputKey="methanolLandProcurementCosts"
                  />,
                  <InputNumberField key="ccEpcCosts" inputKey="ccEpcCosts" />,
                  <InputNumberField
                    key="ccLandProcurementCosts"
                    inputKey="ccLandProcurementCosts"
                  />,
                  <InputNumberField
                    key="methanolPlantOMCost"
                    inputKey="methanolPlantOMCost"
                  />,
                  <InputNumberField
                    key="methanolStorageOMCost"
                    inputKey="methanolStorageOMCost"
                  />,
                  <InputNumberField
                    key="ccPlantOMCost"
                    inputKey="ccPlantOMCost"
                  />,
                ]}
              />,
            ]}
          />
        </Grid>
        <Grid item>
          <InputCard
            title="Electrolyser & Hydrogen Parameters"
            children={[
              <InputNumberField
                key="electrolyserSystemOversizing"
                inputKey="electrolyserSystemOversizing"
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
                  />,
                  <InputNumberField
                    key="waterRequirementOfElectrolyser"
                    inputKey="waterRequirementOfElectrolyser"
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
                  />,
                  <InputNumberField
                    key="electrolyserMinimumLoad"
                    inputKey="electrolyserMinimumLoad"
                  />,
                  <InputNumberField
                    key="maximumLoadWhenOverloading"
                    inputKey="maximumLoadWhenOverloading"
                  />,
                  <InputNumberField
                    key="timeBetweenOverloading"
                    inputKey="timeBetweenOverloading"
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
                buttonChildren={[
                  [
                    <InputNumberField
                      key="stackLifetime"
                      inputKey="stackLifetime"
                    />,
                    <InputNumberField
                      key="stackDegradation"
                      inputKey="stackDegradation"
                    />,
                  ],
                  [
                    <InputNumberField
                      key="maximumDegradationBeforeReplacement"
                      inputKey="maximumDegradationBeforeReplacement"
                    />,
                    <InputNumberField
                      key="stackDegradation"
                      inputKey="stackDegradation"
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
                  />,
                  <InputNumberField
                    key="minimumHydrogenStorage"
                    inputKey="minimumHydrogenStorage"
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
                  />,
                  <InputNumberField
                    key="electrolyserPurchaseCost"
                    inputKey="electrolyserPurchaseCost"
                  />,
                  <InputNumberField
                    key="electrolyserCostReductionWithScale"
                    inputKey="electrolyserCostReductionWithScale"
                  />,
                  <InputNumberField
                    key="electrolyserReferenceFoldIncrease"
                    inputKey="electrolyserReferenceFoldIncrease"
                  />,
                  <InputNumberField
                    key="hydrogenStoragePurchaseCost"
                    inputKey="hydrogenStoragePurchaseCost"
                  />,
                  <InputNumberField
                    key="electrolyserEpcCosts"
                    inputKey="electrolyserEpcCosts"
                  />,
                  <InputNumberField
                    key="electrolyserLandProcurementCosts"
                    inputKey="electrolyserLandProcurementCosts"
                  />,
                  <InputNumberField
                    key="electrolyserOMCost"
                    inputKey="electrolyserOMCost"
                  />,
                  <InputNumberField
                    key="hydrogenStorageOMCost"
                    inputKey="hydrogenStorageOMCost"
                  />,
                  <InputNumberField
                    key="electrolyserStackReplacement"
                    inputKey="electrolyserStackReplacement"
                  />,
                  <InputNumberField
                    key="waterSupplyCost"
                    inputKey="waterSupplyCost"
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
          <ControlledPowerPlantCard />
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
                  <InputNumberField
                    key="batteryRatedPower"
                    inputKey="batteryRatedPower"
                  />,
                  <InputNumberField
                    key="batteryStorageDuration"
                    inputKey="batteryStorageDuration"
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
                  />,
                  <InputNumberField
                    key="batteryMinCharge"
                    inputKey="batteryMinCharge"
                  />,
                  <InputNumberField
                    key="batteryLifetime"
                    inputKey="batteryLifetime"
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
                  />,
                  <InputNumberField
                    key="batteryEpcCosts"
                    inputKey="batteryEpcCosts"
                  />,
                  <InputNumberField
                    key="batteryLandProcurementCosts"
                    inputKey="batteryLandProcurementCosts"
                  />,
                  <InputNumberField
                    key="batteryOMCost"
                    inputKey="batteryOMCost"
                  />,
                  <InputNumberField
                    key="batteryReplacementCost"
                    inputKey="batteryReplacementCost"
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
                  />,
                  <InputNumberField
                    key="additionalAnnualCosts"
                    inputKey="additionalAnnualCosts"
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
                  />,
                  <InputNumberField
                    key="discountRate"
                    inputKey="discountRate"
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
