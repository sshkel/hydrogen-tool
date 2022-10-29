import Grid from "@mui/material/Grid";

import InputCard from "../InputCard";
import InputNumberField from "../InputNumberField";
import InputSelect from "../InputSelect";

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
            title="Ammonia Parameters"
            children={[
              <InputCard
                subtitle
                mountOnEnter
                key="ammoniaPlantCapacity"
                title="Ammonia Plant Capacity"
                children={[
                  <InputNumberField
                    key="ammoniaPlantCapacity"
                    inputKey="ammoniaPlantCapacity"
                  />,
                  <InputNumberField
                    key="ammoniaPlantMinTurndown"
                    inputKey="ammoniaPlantMinTurndown"
                  />,
                ]}
              />,
              <InputCard
                subtitle
                mountOnEnter
                key="ammoniaPlantSec"
                title="Ammonia Plant SEC"
                children={[
                  <InputNumberField
                    key="ammoniaPlantSec"
                    inputKey="ammoniaPlantSec"
                  />,
                  <InputNumberField key="asuSec" inputKey="asuSec" />,
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

      <Grid container item flexDirection="column" rowSpacing={1} xs={4}>
        <Grid item>
          <InputCard
            title="Power Plant Parameters"
            children={[
              <InputCard
                subtitle
                mountOnEnter
                key="powerCapacityConfiguration"
                title="Power Plant Capacity"
                children={[
                  <InputNumberField
                    key="renewableEnergyPlantOversizing"
                    inputKey="renewableEnergyPlantOversizing"
                  />,
                  <InputNumberField
                    key="solarToWindPercentage"
                    inputKey="solarToWindPercentage"
                  />,
                ]}
              />,
              <InputSelect
                key="powerPlantConfigurationSelect"
                selectKey="powerPlantConfigurationSelect"
                prompt="Power Plant Configuration"
                selectClass="powerPlantConfiguration"
                titles={["Standalone", "Grid Connected"]}
                buttonChildren={[
                  [],
                  [
                    <InputNumberField
                      key="gridConnectionCost"
                      inputKey="gridConnectionCost"
                    />,
                    <InputNumberField
                      key="additionalTransmissionCharges"
                      inputKey="additionalTransmissionCharges"
                    />,
                  ],
                ]}
              />,
              <InputCard
                subtitle
                mountOnEnter
                key="powerPlantEfficiency"
                title="Power Plant Efficiency"
                children={[
                  <InputNumberField
                    key="powerPlantDegradationRate"
                    inputKey="powerPlantDegradationRate"
                  />,
                ]}
              />,
            ]}
          />
        </Grid>
      </Grid>

      <Grid container item flexDirection="column" xs={4} rowSpacing={1}>
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
