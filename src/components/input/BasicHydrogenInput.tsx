import Grid from "@mui/material/Grid";

import "../../input.css";
import InputCard from "./InputCard";
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
        "& .MuiGrid-container": { paddingX: 2, paddingY: 0.5 },
      }}
    >
      <Grid xs={4} container item rowSpacing={1} flexDirection="column">
        <Grid item>
          <InputCard
            title="Project Scale"
            children={[
              <InputSlider key="projectScale" inputKey="projectScale" />,
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
                selectKey="ppaSelect"
                key="ppaSelect"
                titles={["Build Power Plant​", "Purchase Electricity via PPA"]}
                helperTexts={[undefined, undefined]}
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
                    <InputSlider
                      key="waterSupplyCost"
                      inputKey="waterSupplyCost"
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
            title="Cost Analysis"
            children={[
              <InputSelect
                key="costAnalysisSelect"
                selectKey="costAnalysisSelect"
                titles={["LCH2​", "Detailed Project Costing"]}
                helperTexts={[undefined, undefined]}
                buttonChildren={[
                  [
                    <InputSlider
                      key="discountRate-lch2"
                      inputKey="discountRate"
                    />,
                    <InputSlider
                      key="projectTimeline-lch2"
                      inputKey="projectTimeline"
                    />,
                  ],
                  [
                    <InputSlider
                      key="discountRate-detailed"
                      inputKey="discountRate"
                    />,
                    <InputSlider
                      key="projectTimeline-detailed"
                      inputKey="projectTimeline"
                    />,
                    <InputSlider
                      key="shareOfTotalInvestmentFinancedViaEquity"
                      inputKey="shareOfTotalInvestmentFinancedViaEquity"
                    />,
                    <InputSlider
                      key="interestOnLoan"
                      inputKey="interestOnLoan"
                    />,
                    <InputSlider key="loanTerm" inputKey="loanTerm" />,
                    <InputSlider
                      key="inflationRate"
                      inputKey="inflationRate"
                    />,
                    <InputSlider key="taxRate" inputKey="taxRate" />,
                    <InputSlider
                      key="hydrogenSalesMargin"
                      inputKey="hydrogenSalesMargin"
                    />,
                  ],
                ]}
              />,
            ]}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
