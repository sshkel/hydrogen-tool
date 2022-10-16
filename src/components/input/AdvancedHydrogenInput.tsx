import Grid from "@mui/material/Grid";

import InputCard from "./InputCard";
import InputDropdownField from "./InputDropdownField";
import InputNumberField from "./InputNumberField";
import InputSelect from "./InputSelect";
import { capitalDepreciationProfile } from "./data";

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
            title="Electrolyser Parameters"
            children={[
              <InputNumberField
                key="electrolyserNominalCapacity"
                inputKey="electrolyserNominalCapacity"
              />,
              <InputCard
                subtitle={true}
                key="electrolyserSystemEfficiency"
                title="Electrolyser System Efficiency"
                children={[
                  <InputNumberField
                    key="secAtNominalLoad"
                    inputKey="secAtNominalLoad"
                  />,
                  <InputNumberField
                    key="electrolyserEfficiency"
                    inputKey="electrolyserEfficiency"
                  />,
                  <InputNumberField
                    key="waterRequirementOfElectrolyser"
                    inputKey="waterRequirementOfElectrolyser"
                  />,
                ]}
              />,
              <InputCard
                subtitle={true}
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
                helperTexts={[
                  undefined,
                  undefined,
                  // "Replace stack lifetime exceeds an hourly threshold",
                  // "Replace stack after it degrades past a given threshold",
                ]}
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
                subtitle={true}
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
              <InputSelect
                key="powerPlantType"
                selectKey="powerPlantType"
                prompt="Power Plant Type"
                titles={["Solar", "Wind", "Hybrid"]}
                selectClass="powerPlantType"
                helperTexts={[undefined, undefined, undefined]}
                buttonChildren={[
                  [
                    <InputSelect
                      key="solarPowerPlantCapacitySelect"
                      selectKey="solarPowerPlantCapacitySelect"
                      prompt="Power Plant Capacity"
                      titles={["Nominal Capacity", "Oversize Ratio"]}
                      helperTexts={[
                        undefined,
                        undefined,
                        // "Solar farm capacity in MW",
                        // "Solar farm capacity as a ratio of electrolyser capacity",
                      ]}
                      buttonChildren={[
                        [
                          <InputNumberField
                            key="solarNominalCapacity"
                            inputKey="solarNominalCapacity"
                          />,
                        ],
                        [
                          <InputNumberField
                            key="powerPlantOversizeRatio"
                            inputKey="powerPlantOversizeRatio"
                          />,
                        ],
                      ]}
                    />,
                  ],
                  [
                    <InputSelect
                      key="windPowerPlantCapacitySelect"
                      selectKey="windPowerPlantCapacitySelect"
                      prompt="Power Plant Capacity"
                      titles={["Nominal Capacity", "Oversize Ratio"]}
                      helperTexts={[
                        undefined,
                        undefined,
                        // "Wind farm capacity in MW",
                        // "Wind farm capacity as a ratio of electrolyser capacity",
                      ]}
                      buttonChildren={[
                        [
                          <InputNumberField
                            key="windNominalCapacity"
                            inputKey="windNominalCapacity"
                          />,
                        ],
                        [
                          <InputNumberField
                            key="powerPlantOversizeRatio"
                            inputKey="powerPlantOversizeRatio"
                          />,
                        ],
                      ]}
                    />,
                  ],
                  [
                    <InputSelect
                      key="hybridPowerPlantCapacitySelect"
                      selectKey="hybridPowerPlantCapacitySelect"
                      prompt="Power Plant Capacity"
                      titles={["Nominal Capacity", "Oversize Ratio"]}
                      helperTexts={[
                        undefined,
                        undefined,
                        // "Solar and Wind farm capacity in MW",
                        // "Solar and Wind fam capacity as a ratio of electrolyser capacity",
                      ]}
                      buttonChildren={[
                        [
                          <InputNumberField
                            key="solarNominalCapacity"
                            inputKey="solarNominalCapacity"
                          />,
                          <InputNumberField
                            key="windNominalCapacity"
                            inputKey="windNominalCapacity"
                          />,
                        ],
                        [
                          <InputNumberField
                            key="powerPlantOversizeRatio"
                            inputKey="powerPlantOversizeRatio"
                          />,
                          <InputNumberField
                            key="solarToWindPercentage"
                            inputKey="solarToWindPercentage"
                          />,
                        ],
                      ]}
                    />,
                  ],
                ]}
              />,
              <InputSelect
                key="powerPlantConfigurationSelect"
                selectKey="powerPlantConfigurationSelect"
                prompt="Power Plant Configuration"
                selectClass="powerPlantConfiguration"
                titles={["Standalone", "Grid Connected"]}
                helperTexts={[undefined, undefined]}
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
                subtitle={true}
                key="powerPlantEfficiency"
                title="Power Plant Efficiency"
                children={[
                  <InputNumberField
                    key="solarDegradation"
                    inputKey="solarDegradation"
                  />,
                  <InputNumberField
                    key="windDegradation"
                    inputKey="windDegradation"
                  />,
                ]}
              />,
              <InputSelect
                key="powerSupplyOptionSelect"
                selectKey="powerSupplyOptionSelect"
                prompt="Power Supply Option"
                selectClass="powerSupplyOption"
                titles={["Self Build", "Power Purchase Agreement (PPA)"]}
                helperTexts={[undefined, undefined]}
                buttonChildren={[
                  [
                    <InputNumberField
                      key="solarFarmBuildCost"
                      inputKey="solarFarmBuildCost"
                    />,
                    <InputNumberField
                      key="solarReferenceCapacity"
                      inputKey="solarReferenceCapacity"
                    />,
                    <InputNumberField
                      key="solarPVCostReductionWithScale"
                      inputKey="solarPVCostReductionWithScale"
                    />,
                    <InputNumberField
                      key="solarReferenceFoldIncrease"
                      inputKey="solarReferenceFoldIncrease"
                    />,
                    <InputNumberField
                      key="windFarmBuildCost"
                      inputKey="windFarmBuildCost"
                    />,
                    <InputNumberField
                      key="windReferenceCapacity"
                      inputKey="windReferenceCapacity"
                    />,
                    <InputNumberField
                      key="windCostReductionWithScale"
                      inputKey="windCostReductionWithScale"
                    />,
                    <InputNumberField
                      key="windReferenceFoldIncrease"
                      inputKey="windReferenceFoldIncrease"
                    />,
                    <InputNumberField
                      key="solarEpcCosts"
                      inputKey="solarEpcCosts"
                    />,
                    <InputNumberField
                      key="solarLandProcurementCosts"
                      inputKey="solarLandProcurementCosts"
                    />,
                    <InputNumberField
                      key="windEpcCosts"
                      inputKey="windEpcCosts"
                    />,
                    <InputNumberField
                      key="windLandProcurementCosts"
                      inputKey="windLandProcurementCosts"
                    />,
                    <InputNumberField key="solarOpex" inputKey="solarOpex" />,
                    <InputNumberField key="windOpex" inputKey="windOpex" />,
                  ],
                  [
                    <InputNumberField
                      key="principalPPACost"
                      inputKey="principalPPACost"
                    />,
                  ],
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
            children={[
              <InputCard
                subtitle={true}
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
                subtitle={true}
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
                subtitle={true}
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
            children={[
              <InputCard
                subtitle={true}
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
                subtitle={true}
                key="additionalRevenueGeneration"
                title="Additional Revenue Generation"
                children={[
                  <InputNumberField
                    key="averageElectricitySpotPrice"
                    inputKey="averageElectricitySpotPrice"
                  />,
                  <InputNumberField
                    key="oxygenRetailPrice"
                    inputKey="oxygenRetailPrice"
                  />,
                ]}
              />,
              <InputCard
                subtitle={true}
                key="financingParameters"
                title="Financing Parameters"
                children={[
                  <InputDropdownField
                    key="capitalDepreciationProfile"
                    id="capitalDepreciationProfile"
                    label="Depreciation Profile"
                    values={capitalDepreciationProfile}
                    defaultValue={capitalDepreciationProfile[0]}
                  />,
                  <InputNumberField
                    key="projectTimeline"
                    inputKey="projectTimeline"
                  />,
                  <InputNumberField
                    key="discountRate"
                    inputKey="discountRate"
                  />,
                  <InputNumberField
                    key="shareOfTotalInvestmentFinancedViaEquity"
                    inputKey="shareOfTotalInvestmentFinancedViaEquity"
                  />,
                  <InputNumberField
                    key="directEquityShare"
                    inputKey="directEquityShare"
                  />,
                  <InputNumberField key="loanTerm" inputKey="loanTerm" />,
                  <InputNumberField
                    key="interestOnLoan"
                    inputKey="interestOnLoan"
                  />,
                  <InputNumberField
                    key="salvageCostShare"
                    inputKey="salvageCostShare"
                  />,
                  <InputNumberField
                    key="decommissioningCostShare"
                    inputKey="decommissioningCostShare"
                  />,
                  <InputNumberField
                    key="inflationRate"
                    inputKey="inflationRate"
                  />,
                  <InputNumberField key="taxRate" inputKey="taxRate" />,
                  <InputNumberField
                    key="hydrogenSalesMargin"
                    inputKey="hydrogenSalesMargin"
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
