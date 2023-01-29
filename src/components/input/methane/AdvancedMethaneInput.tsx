import Grid from "@mui/material/Grid";

import ControlledPowerPlantCard from "../ControlledPowerPlantCard";
import InputCard from "../InputCard";
import InputDropdownField from "../InputDropdownField";
import InputNumberField from "../InputNumberField";
import InputSelect from "../InputSelect";

interface Props {
  location: string;
}
export default function AdvancedMethaneInput(props: Props) {
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
                  />,
                  <InputNumberField
                    key="methaneStorageCapacity"
                    inputKey="methaneStorageCapacity"
                  />,
                  <InputNumberField
                    key="methanePlantMinimumTurndown"
                    inputKey="methanePlantMinimumTurndown"
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
                  />,
                  <InputNumberField key="ccSec" inputKey="ccSec" />,
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
                  />,
                  <InputNumberField
                    key="methaneStorageCost"
                    inputKey="methaneStorageCost"
                  />,
                  <InputNumberField key="ccPlantCost" inputKey="ccPlantCost" />,
                  <InputNumberField
                    key="methaneEpcCosts"
                    inputKey="methaneEpcCosts"
                  />,
                  <InputNumberField
                    key="methaneLandProcurementCosts"
                    inputKey="methaneLandProcurementCosts"
                  />,
                  <InputNumberField key="ccEpcCosts" inputKey="ccEpcCosts" />,
                  <InputNumberField
                    key="ccLandProcurementCosts"
                    inputKey="ccLandProcurementCosts"
                  />,
                  <InputNumberField
                    key="methanePlantOMCost"
                    inputKey="methanePlantOMCost"
                  />,
                  <InputNumberField
                    key="methaneStorageOMCost"
                    inputKey="methaneStorageOMCost"
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
          <ControlledPowerPlantCard location={props.location} />
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
                  <InputDropdownField
                    id="batteryStorageDuration"
                    key="batteryStorageDuration"
                    defaultValue="0"
                    label="Battery Storage Duration"
                    values={["0", "1", "2", "4", "8"]}
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
