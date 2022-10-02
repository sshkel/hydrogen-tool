import Grid from "@mui/material/Grid";

import "../../input.css";
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
        "& .MuiGrid-container": { paddingX: 2, paddingY: 0.5 },
      }}
    >
      <Grid xs={4} container item rowSpacing={1} flexDirection="column">
        <Grid item>
          <InputCard
            title="Electrolyser Parameters"
            children={[
              <InputNumberField inputKey="electrolyserNominalCapacity" />,
              <InputCard
                title="Electrolyser System Efficiency"
                children={[
                  <InputNumberField inputKey="secAtNominalLoad" />,
                  <InputNumberField inputKey="electrolyserEfficiency" />,
                  <InputNumberField inputKey="waterRequirementOfElectrolyser" />,
                ]}
              />,
              <InputCard
                title="Electrolyser Load Range"
                children={[
                  <InputNumberField inputKey="electrolyserMaximumLoad" />,
                  <InputNumberField inputKey="electrolyserMinimumLoad" />,
                  <InputNumberField inputKey="maximumLoadWhenOverloading" />,
                  <InputNumberField inputKey="timeBetweenOverloading" />,
                ]}
              />,
              <InputSelect
                prompt="Stack Replacement Type"
                selectClass="stackReplacementType"
                titles={["Cumulative Hours", "Maximum Degradation Level"]}
                helperTexts={[
                  "Replace stack lifetime exceeds an hourly threshold",
                  "Replace stack after it degrades past a given threshold",
                ]}
                buttonChildren={[
                  [
                    <InputNumberField inputKey="stackLifetime" />,
                    <InputNumberField inputKey="stackDegradation" />,
                  ],
                  [
                    <InputNumberField inputKey="maximumDegradationBeforeReplacement" />,
                    <InputNumberField inputKey="stackDegradation" />,
                  ],
                ]}
              />,
              <InputCard
                title="Electrolyser Capital and Operating Costs"
                children={[
                  <InputNumberField inputKey="electrolyserReferenceCapacity" />,
                  <InputNumberField inputKey="electrolyserPurchaseCost" />,
                  <InputNumberField inputKey="electrolyserCostReductionWithScale" />,
                  <InputNumberField inputKey="electrolyserReferenceFoldIncrease" />,
                  <InputNumberField inputKey="electrolyserEpcCosts" />,
                  <InputNumberField inputKey="electrolyserLandProcurementCosts" />,
                  <InputNumberField inputKey="electrolyserOMCost" />,
                  <InputNumberField inputKey="electrolyserStackReplacement" />,
                  <InputNumberField inputKey="waterSupplyCost" />,
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
                prompt="Power Plant Type"
                titles={["Solar", "Wind", "Hybrid"]}
                selectClass="powerPlantType"
                helperTexts={[undefined, undefined, undefined]}
                buttonChildren={[
                  [
                    <InputSelect
                      prompt="Power Plant Capacity"
                      titles={["Nominal Capacity", "Oversize Ratio"]}
                      helperTexts={[
                        "Solar farm capacity in MW",
                        "Solar farm capacity as a ratio of electrolyser capacity",
                      ]}
                      buttonChildren={[
                        [<InputNumberField inputKey="solarNominalCapacity" />],
                        [
                          <InputNumberField inputKey="powerPlantOversizeRatio" />,
                        ],
                      ]}
                    />,
                  ],
                  [
                    <InputSelect
                      prompt="Power Plant Capacity"
                      titles={["Nominal Capacity", "Oversize Ratio"]}
                      helperTexts={[
                        "Wind farm capacity in MW",
                        "Wind farm capacity as a ratio of electrolyser capacity",
                      ]}
                      buttonChildren={[
                        [<InputNumberField inputKey="windNominalCapacity" />],
                        [
                          <InputNumberField inputKey="powerPlantOversizeRatio" />,
                        ],
                      ]}
                    />,
                  ],
                  [
                    <InputSelect
                      prompt="Power Plant Capacity"
                      titles={["Nominal Capacity", "Oversize Ratio"]}
                      helperTexts={[
                        "Solar and Wind farm capacity in MW",
                        "Solar and Wind fam capacity as a ratio of electrolyser capacity",
                      ]}
                      buttonChildren={[
                        [
                          <InputNumberField inputKey="solarNominalCapacity" />,
                          <InputNumberField inputKey="windNominalCapacity" />,
                        ],
                        [
                          <InputNumberField inputKey="powerPlantOversizeRatio" />,
                          <InputNumberField inputKey="solarToWindPercentage" />,
                        ],
                      ]}
                    />,
                  ],
                ]}
              />,
              <InputSelect
                prompt="Power Plant Configuration"
                selectClass="powerPlantConfiguration"
                titles={["Standalone", "Grid Connected"]}
                helperTexts={[undefined, undefined]}
                buttonChildren={[
                  [],
                  [
                    <InputNumberField inputKey="gridConnectionCost" />,
                    <InputNumberField inputKey="additionalTransmissionCharges" />,
                  ],
                ]}
              />,
              <InputCard
                title="Power Plant Efficiency"
                children={[
                  <InputNumberField inputKey="solarDegradation" />,
                  <InputNumberField inputKey="windDegradation" />,
                ]}
              />,
              <InputSelect
                prompt="Power Supply Option"
                selectClass="powerSupplyOption"
                titles={["Self Build", "Power Purchase Agreement (PPA)"]}
                helperTexts={[undefined, undefined]}
                buttonChildren={[
                  [
                    <InputNumberField inputKey="solarFarmBuildCost" />,
                    <InputNumberField inputKey="solarReferenceCapacity" />,
                    <InputNumberField inputKey="solarPVCostReductionWithScale" />,
                    <InputNumberField inputKey="solarReferenceFoldIncrease" />,
                    <InputNumberField inputKey="windFarmBuildCost" />,
                    <InputNumberField inputKey="windReferenceCapacity" />,
                    <InputNumberField inputKey="windCostReductionWithScale" />,
                    <InputNumberField inputKey="windReferenceFoldIncrease" />,
                    <InputNumberField inputKey="solarEpcCosts" />,
                    <InputNumberField inputKey="solarLandProcurementCosts" />,
                    <InputNumberField inputKey="windEpcCosts" />,
                    <InputNumberField inputKey="windLandProcurementCosts" />,
                    <InputNumberField inputKey="solarOpex" />,
                    <InputNumberField inputKey="windOpex" />,
                  ],
                  [<InputNumberField inputKey="principalPPACost" />],
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
                title="Battery Capacity"
                children={[
                  <InputNumberField inputKey="batteryRatedPower" />,
                  <InputNumberField inputKey="batteryStorageDuration" />,
                ]}
              />,
              <InputCard
                title="Battery Performance"
                children={[
                  <InputNumberField inputKey="batteryEfficiency" />,
                  <InputNumberField inputKey="batteryMinCharge" />,
                  <InputNumberField inputKey="batteryLifetime" />,
                ]}
              />,
              <InputCard
                title="Battery Capital and Operating Costs"
                children={[
                  <InputNumberField inputKey="batteryCosts" />,
                  <InputNumberField inputKey="batteryEpcCosts" />,
                  <InputNumberField inputKey="batteryLandProcurementCosts" />,
                  <InputNumberField inputKey="batteryOMCost" />,
                  <InputNumberField inputKey="batteryReplacementCost" />,
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
                title="Additional Upfront/Operating Costs"
                children={[
                  <InputNumberField inputKey="additionalUpfrontCosts" />,
                  <InputNumberField inputKey="additionalAnnualCosts" />,
                ]}
              />,
              <InputCard
                title="Additional Revenue Generation"
                children={[
                  <InputNumberField inputKey="averageElectricitySpotPrice" />,
                  <InputNumberField inputKey="oxygenRetailPrice" />,
                ]}
              />,
              <InputCard
                title="Financing Parameters"
                children={[
                  <InputDropdownField
                    id="capitalDepreciationProfile"
                    label="Depreciation Profile"
                    values={capitalDepreciationProfile}
                    defaultValue={capitalDepreciationProfile[0]}
                  />,
                  <InputNumberField inputKey="projectTimeline" />,
                  <InputNumberField inputKey="discountRate" />,
                  <InputNumberField inputKey="shareOfTotalInvestmentFinancedViaEquity" />,
                  <InputNumberField inputKey="directEquityShare" />,
                  <InputNumberField inputKey="loanTerm" />,
                  <InputNumberField inputKey="interestOnLoan" />,
                  <InputNumberField inputKey="salvageCostShare" />,
                  <InputNumberField inputKey="decommissioningCostShare" />,
                  <InputNumberField inputKey="inflationRate" />,
                  <InputNumberField inputKey="taxRate" />,
                  <InputNumberField inputKey="hydrogenSalesMargin" />,
                ]}
              />,
            ]}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
