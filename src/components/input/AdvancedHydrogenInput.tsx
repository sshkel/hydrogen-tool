import Grid from "@mui/material/Grid";

import "../../input.css";
import InputCard from "./InputCard";
import InputDropdownField from "./InputDropdownField";
import InputSelect from "./InputSelect";
import InputSlider from "./InputSlider";
import { technologyData } from "./data";

export default function BasicHydrogenInput() {
  // let pointer: number = 0;

  // const savedState = localStorage.getItem("savedData") || "{}";
  // const parsedState = JSON.parse(savedState);
  // const getData = (index: number) => {
  //   ++pointer;
  //   const { label, id, defaultValue, adornmentLabel, disabled, helperText } =
  //     data[index];

  //   let savedValue;
  //   if (savedState) {
  //     const value = parsedState[id];
  //     savedValue = isNaN(value) ? value : Number(value);
  //   }
  //   return (
  //     <InputNumberField
  //       key={id}
  //       label={label}
  //       name={id}
  //       defaultValue={savedValue !== undefined ? savedValue : defaultValue}
  //       adornmentLabel={adornmentLabel}
  //       disabled={disabled}
  //       helperText={helperText}
  //     />
  //   );
  // };

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
              <InputDropdownField
                id="technology"
                label="Technology"
                values={technologyData}
                defaultValue={technologyData[0]}
              />,
            ]}
          />
        </Grid>
        <Grid item>
          <InputCard
            title="Electrolyser Parameters"
            children={[<InputSlider inputKey="electrolyserEfficiency" />]}
          />
        </Grid>
        <Grid item>
          <InputCard
            title="Power Plant Capacity"
            children={[
              <InputSlider inputKey="powerPlantOversizeRatio" />,
              <InputSlider inputKey="solarToWindPercentage" />,
            ]}
          />
        </Grid>
      </Grid>

      <Grid container item flexDirection="column" rowSpacing={1} xs={4}>
        <Grid item>
          <InputCard
            title="Capital & Operating Cost"
            children={[
              <InputSlider inputKey="electrolyserPurchaseCost" />,
              <InputSelect
                titles={["Build Power Plant​", "Purchase Electricity via PPA"]}
                helperTexts={["No PPA Agreement", undefined]}
                buttonChildren={[
                  [
                    <InputSlider inputKey="solarFarmBuildCost" />,
                    <InputSlider inputKey="windFarmBuildCost" />,
                  ],
                  [
                    <InputSlider inputKey="principalPPACost" />,
                    <InputSlider inputKey="waterSupplyCost" />,
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
                titles={["LCH2​", "Detailed Project Costing"]}
                helperTexts={[undefined, undefined]}
                buttonChildren={[
                  [
                    <InputSlider inputKey="discountRate" />,
                    <InputSlider inputKey="projectTimeline" />,
                  ],
                  [
                    <InputSlider inputKey="discountRate" />,
                    <InputSlider inputKey="projectTimeline" />,
                    <InputSlider inputKey="shareOfTotalInvestmentFinancedViaEquity" />,
                    <InputSlider inputKey="interestOnLoan" />,
                    <InputSlider inputKey="loanTerm" />,
                    <InputSlider inputKey="inflationRate" />,
                    <InputSlider inputKey="taxRate" />,
                    <InputSlider inputKey="hydrogenSalesMargin" />,
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
