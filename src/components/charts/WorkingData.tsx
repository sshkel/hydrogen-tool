import FactoryRoundedIcon from "@mui/icons-material/FactoryRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import SignalCellularAltRoundedIcon from "@mui/icons-material/SignalCellularAltRounded";
import { CssBaseline, Typography } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";
import { createTheme, styled } from "@mui/material/styles";
import ThemeProvider from "@mui/system/ThemeProvider";
import "chart.js/auto";
import Chart from "chart.js/auto";
import { useEffect, useState } from "react";

import SynthesisedInputs from "../../SynthesisedInput";
import { HydrogenData, HydrogenModel } from "../../model/HydrogenModel";
import {
  ModelHourlyOperation,
  ProjectModelSummary,
} from "../../model/ModelTypes";
import {
  BATTERY_OUTPUT,
  ELECTROLYSER_CF,
  ENERGY_INPUT,
  ENERGY_OUTPUT,
  HOURS_PER_YEAR,
  HYDROGEN_OUTPUT,
  POWER_PLANT_CF,
  RATED_CAPACITY_TIME,
  TOTAL_OPERATING_TIME,
} from "../../model/consts";
import { InputConfiguration, Inputs, UserInputFields } from "../../types";
import { mean } from "../../utils";
import { BLUE, SAPPHIRE } from "../input/colors";
import { zoneInfo } from "../map/ZoneInfo";
import CostBreakdownDoughnutChart from "./CostBreakdownDoughnutChart";
import CostLineChart from "./CostLineChart";
import CostWaterfallBarChart from "./CostWaterfallBarChart";
import DurationCurve from "./DurationCurve";
import HourlyCapacityFactors from "./HourlyCapacityFactors";
import SummaryOfResultsTable from "./SummaryOfResultsTable";
import {
  backCalculateInputFields,
  backCalculateSolarAndWindCapacity,
} from "./basic-calculations";
import { generateCapexValues } from "./capex-calculations";
import { roundToNearestInteger, roundToTwoDP, sales } from "./cost-functions";
import { generateLCValues } from "./lch2-calculations";
import { generateOpexValues } from "./opex-calculations";

export interface Props {
  location?: string;
  data?: UserInputFields;
  inputConfiguration: InputConfiguration;
  loadSolar: () => Promise<any[]>;
  loadWind: () => Promise<any[]>;
}

interface DownloadedData {
  solarData: any[];
  windData: any[];
}

const ItemTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: "darkgrey",
}));
const ItemText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  ...theme.typography.body2,
  margin: "15px",
  borderRadius: "20px",
}));

const theme = createTheme({
  typography: {
    fontFamily: "Nunito",
  },
});
// setup default fonts for the charts
Chart.defaults.font.family = "Nunito";

export default function WorkingData(props: Props) {
  const [state, setState] = useState<DownloadedData>({
    solarData: [],
    windData: [],
  });

  // TODO: Error handling if we can't load solar and wind data
  // TODO: Add some validation for correct number of rows
  useEffect(() => {
    const { loadSolar, loadWind } = props;
    Promise.all([loadSolar(), loadWind()]).then(([solar, wind]) => {
      if (solar.length !== 8784 && solar.length !== 8760) {
        console.error("Solar data is of unexpected length", solar.length);
      }

      if (wind.length !== 8784 && wind.length !== 8760) {
        console.error("Wind data is not 8784 rows in length", wind.length);
      }
      setState({ solarData: solar, windData: wind });
    });
  }, [props]);

  if (!(props.data && props.location)) {
    return null;
  }

  const {
    inputConfiguration,
    data: { projectScale = 0 },
  } = props;

  let inputs: Inputs = new SynthesisedInputs(props.data);

  const {
    batteryRatedPower = 0,
    batteryMinCharge = 0,
    batteryEfficiency,
    additionalUpfrontCosts,
    batteryLifetime = 0,
    projectTimeline,
    batteryStorageDuration = 0,
    timeBetweenOverloading,
    maximumLoadWhenOverloading,
    electrolyserMinimumLoad,
    electrolyserMaximumLoad,
    stackReplacementType,
    stackLifetime,
    stackDegradation,
    maximumDegradationBeforeReplacement,
    discountRate,
    solarDegradation,
    windDegradation,
    secAtNominalLoad = 0,
    electrolyserEfficiency = 0,
    solarToWindPercentage,
    powerCapacityConfiguration,
  } = inputs;

  // These values can change if Oversize Ratio configuration is used
  const powerPlantOversizeRatio =
    powerCapacityConfiguration === "Oversize Ratio"
      ? inputs.powerPlantOversizeRatio
      : (inputs.solarNominalCapacity + inputs.windNominalCapacity) /
        inputs.electrolyserNominalCapacity;

  if (
    props.inputConfiguration === "Advanced" &&
    powerCapacityConfiguration === "Oversize Ratio"
  ) {
    inputs = backCalculateSolarAndWindCapacity(
      inputs,
      powerPlantOversizeRatio,
      inputs.electrolyserNominalCapacity,
      solarToWindPercentage,
      inputs.powerPlantType
    );
  }

  const location = props.location;
  const dataModel: HydrogenData = {
    inputConfiguration,
    batteryLifetime,
    batteryMinCharge,
    batteryEfficiency,
    batteryStorageDuration,
    batteryRatedPower,
    timeBetweenOverloading,
    maximumLoadWhenOverloading,
    projectScale,
    electrolyserNominalCapacity: inputs.electrolyserNominalCapacity,
    solarNominalCapacity: inputs.solarNominalCapacity,
    windNominalCapacity: inputs.windNominalCapacity,
    powerPlantOversizeRatio,
    solarToWindPercentage,
    solarDegradation,
    windDegradation,
    stackDegradation,
    stackLifetime,
    maximumDegradationBeforeReplacement,
    stackReplacementType,
    location,
    electrolyserMaximumLoad,
    electrolyserMinimumLoad,
    secAtNominalLoad,
    electrolyserEfficiency,
  };

  const model = new HydrogenModel(dataModel, state.solarData, state.windData);

  let summary: ProjectModelSummary =
    model.calculateHydrogenModel(projectTimeline);
  let hourlyOperations = model.getHourlyOperations();

  if (props.inputConfiguration === "Basic") {
    inputs = backCalculateInputFields(
      inputs,
      projectScale,
      mean(summary[ELECTROLYSER_CF])
    );
  }

  // CAPEX values
  const {
    electrolyserCAPEX,
    powerPlantCAPEX,
    batteryCAPEX,
    gridConnectionCAPEX,
    electrolyserEpcCost,
    electrolyserLandCost,
    powerPlantEpcCost,
    powerPlantLandCost,
    batteryEpcCost,
    batteryLandCost,
    totalIndirectCosts,
  } = generateCapexValues(inputs);

  const totalCapexCost =
    electrolyserCAPEX +
    powerPlantCAPEX +
    batteryCAPEX +
    additionalUpfrontCosts +
    gridConnectionCAPEX;

  // OPEX values
  const electricityProduced: number[] = summary[`${ENERGY_OUTPUT}`];
  const electricityConsumed: number[] = summary[`${ENERGY_INPUT}`];
  const electricityConsumedByBattery: number[] = summary[`${BATTERY_OUTPUT}`];
  const totalOperatingHours: number[] = summary[`${TOTAL_OPERATING_TIME}`].map(
    (hours) => hours * HOURS_PER_YEAR
  );

  const h2Produced = summary[`${HYDROGEN_OUTPUT}`];

  const {
    electrolyserOpexCost,
    electrolyserOpexPerYear,
    powerPlantOpexCost,
    powerPlantOpexPerYear,
    batteryOpexCost,
    batteryOpexPerYear,
    waterOpexCost,
    waterOpexPerYear,
    electricityPurchaseOpexPerYear,
    stackReplacementCostsOverProjectLife,
    batteryReplacementCostsOverProjectLife,
    additionalOpexPerYear,
    gridConnectionOpexPerYear,
    totalOpex,
  } = generateOpexValues(
    inputs,
    electrolyserCAPEX,
    batteryCAPEX,
    totalOperatingHours,
    electricityConsumed,
    electricityConsumedByBattery,
    h2Produced
  );

  // Cost values for sales calculation
  const totalEpcCost = electrolyserEpcCost + powerPlantEpcCost + batteryEpcCost;
  const totalLandCost =
    electrolyserLandCost + powerPlantLandCost + batteryLandCost;

  const { lch2, hydrogenProductionCost } = sales(
    totalCapexCost,
    totalEpcCost,
    totalLandCost,
    projectTimeline,
    discountRate / 100,
    totalOpex,
    h2Produced
  );

  // LCH2 calculations
  const {
    lcPowerPlantCAPEX,
    lcElectrolyserCAPEX,
    lcIndirectCosts,
    lcPowerPlantOPEX,
    lcElectrolyserOPEX,
    lcElectricityPurchase,
    lcStackReplacement,
    lcWater,
    lcBattery,
    lcGridConnection,
    lcAdditionalCosts,
  } = generateLCValues(
    inputs,
    powerPlantCAPEX,
    electrolyserCAPEX,
    batteryCAPEX,
    gridConnectionCAPEX,
    totalIndirectCosts,
    powerPlantOpexCost,
    electrolyserOpexCost,
    batteryOpexCost,
    waterOpexCost,
    gridConnectionOpexPerYear,
    batteryReplacementCostsOverProjectLife,
    stackReplacementCostsOverProjectLife,
    electricityConsumed,
    electricityConsumedByBattery,
    hydrogenProductionCost
  );

  const summaryTableData: { [key: string]: number } = {
    "Power Plant Capacity Factor": roundToTwoDP(
      mean(summary[`${POWER_PLANT_CF}`].map((x) => x * 100))
    ),

    "Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)":
      roundToTwoDP(mean(summary[`${RATED_CAPACITY_TIME}`].map((x) => x * 100))),
    "Total Time Electrolyser is Operating (% of 8760 hrs/yr)": roundToTwoDP(
      mean(summary[`${TOTAL_OPERATING_TIME}`].map((x) => x * 100))
    ),

    "Electrolyser Capacity Factor": roundToTwoDP(
      mean(summary[`${ELECTROLYSER_CF}`].map((x) => x * 100))
    ),

    "Energy Consumed by Electrolyser (MWh/yr)": roundToNearestInteger(
      mean(electricityConsumed)
    ),

    "Excess Energy Not Utilised by Electrolyser (MWh/yr)":
      roundToNearestInteger(mean(electricityProduced)),

    "Hydrogen Output (t/yr)": roundToNearestInteger(mean(h2Produced)),
    "LCH2 ($/kg)": roundToTwoDP(lch2),
  };

  const lch2BreakdownData: { [key: string]: number } = {
    "Power Plant CAPEX": lcPowerPlantCAPEX,
    "Electrolyser CAPEX": lcElectrolyserCAPEX,
    "Indirect Costs": lcIndirectCosts,
    "Power Plant OPEX": lcPowerPlantOPEX,
    "Electrolyser O&M": lcElectrolyserOPEX,
    "Electricity Purchase": lcElectricityPurchase,
    "Stack Replacement": lcStackReplacement,
    "Water Cost": lcWater,
    "Battery Cost": lcBattery,
    "Grid Connection Cost": lcGridConnection,
    "Additional Costs": lcAdditionalCosts,
  };

  const durationCurves = {
    "Power Plant Duration Curve": hourlyOperations.Generator_CF,
    "Electrolyser Duration Curve": hourlyOperations.Electrolyser_CF,
  };

  const capitalCostBreakdown = {
    "Electrolyser System": electrolyserCAPEX,
    "Power Plant": powerPlantCAPEX,
    Battery: batteryCAPEX,
    "Grid Connection": gridConnectionCAPEX,
    "Additional Upfront Costs": additionalUpfrontCosts,
    "Indirect Costs": totalIndirectCosts,
  };

  const indirectCostBreakdown = {
    "Electrolyser EPC": electrolyserEpcCost,
    "Electrolyser Land": electrolyserLandCost,
    "Power Plant EPC": powerPlantEpcCost,
    "Power Plant Land": powerPlantLandCost,
    "Battery EPC": batteryEpcCost,
    "Battery Land": batteryLandCost,
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container direction="column" sx={{ backgroundColor: SAPPHIRE }}>
        <Grid item>
          {KeyInputsPane(
            location,
            inputs.electrolyserNominalCapacity,
            model.totalNominalPowerPlantCapacity
          )}
        </Grid>
        <Grid item>
          <Grid container className="outside results box" wrap="nowrap">
            <Grid
              container
              item
              direction="column"
              className="summary and cost breakdown"
            >
              <Grid item xs>
                {SummaryOfResultsPane(summaryTableData)}
              </Grid>
              <Grid container item>
                <Grid item xs={6}>
                  <DoughnutPane
                    title="Capital Cost Breakdown"
                    items={capitalCostBreakdown}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DoughnutPane
                    title="Indirect Cost Breakdown"
                    items={indirectCostBreakdown}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid container item>
              <Grid
                container
                item
                direction="column"
                className="curves and lch2"
                justifyContent={"space-between"}
              >
                <Grid container item className="duration curves">
                  {DurationCurves(durationCurves)}
                </Grid>
                <Grid item>{Lch2BreakdownPane(lch2BreakdownData)}</Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          {OperatingCostsPane(
            projectTimeline,
            electrolyserOpexPerYear,
            powerPlantOpexPerYear,
            batteryOpexPerYear,
            additionalOpexPerYear,
            waterOpexPerYear,
            electricityPurchaseOpexPerYear
          )}
        </Grid>
        <Grid item>{HourlyCapacityFactorsPane(hourlyOperations)}</Grid>
      </Grid>
    </ThemeProvider>
  );
}

function DurationCurves(durationCurves: { [key: string]: number[] }) {
  return Object.keys(durationCurves).map((key: string) => {
    return (
      <Grid item xs={6} key={key}>
        <StyledCard>
          <CardHeader
            title={key}
            titleTypographyProps={{
              fontWeight: "bold",
              fontSize: 20,
            }}
          />
          <CardContent
            sx={{
              paddingTop: 0,
            }}
          >
            <DurationCurve title={key} data={durationCurves[key]} />
          </CardContent>
        </StyledCard>
      </Grid>
    );
  });
}
function HourlyCapacityFactorsPane(hourlyOperations: ModelHourlyOperation) {
  return (
    <StyledCard>
      <CardHeader
        title="Hourly Capacity Factors"
        titleTypographyProps={{
          fontWeight: "bold",
          fontSize: 20,
        }}
      />
      <CardContent
        sx={{
          paddingTop: 0,
        }}
      >
        <HourlyCapacityFactors
          datapoints={[
            {
              label: "Electrolyser",
              data: hourlyOperations.Electrolyser_CF,
            },
            {
              label: "Power Plant",
              data: hourlyOperations.Generator_CF,
            },
          ]}
        />
      </CardContent>
    </StyledCard>
  );
}

function KeyInputsPane(
  location: string,
  electrolyserNominalCapacity: number,
  powerplantCapacity: number
) {
  type ObjectKey = keyof typeof zoneInfo;
  const zone = location as ObjectKey;
  return (
    <StyledCard>
      <CardHeader
        id="key-inputs"
        title="Key Inputs"
        titleTypographyProps={{
          fontWeight: "bold",
          fontSize: 20,
        }}
      />
      <CardContent
        sx={{
          paddingTop: 0,
        }}
      >
        <Grid container item>
          <Grid item xs={4}>
            <Grid container item flexWrap={"nowrap"} spacing={2}>
              <Grid item>
                <LocationOnRoundedIcon
                  fontSize="large"
                  style={{ color: BLUE }}
                />
              </Grid>
              <Grid
                id="key-inputs-location"
                container
                item
                direction={"column"}
              >
                <Grid>
                  <ItemTitle>Location</ItemTitle>
                </Grid>
                <Grid>
                  <ItemText>{zoneInfo[zone]?.location}</ItemText>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={4}>
            <Grid container item flexWrap={"nowrap"} spacing={2}>
              <Grid item>
                <SignalCellularAltRoundedIcon
                  fontSize="large"
                  style={{ color: BLUE }}
                />
              </Grid>
              <Grid
                id="key-inputs-electrolyser-capacity"
                container
                item
                direction={"column"}
              >
                <Grid item>
                  <ItemTitle>Electrolyster Capacity</ItemTitle>
                </Grid>
                <Grid item>
                  <ItemText>
                    {roundToNearestInteger(
                      electrolyserNominalCapacity
                    ).toLocaleString("en-US") + " MW"}
                  </ItemText>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <Grid container item flexWrap={"nowrap"} spacing={2}>
              <Grid item>
                <FactoryRoundedIcon fontSize="large" style={{ color: BLUE }} />
              </Grid>
              <Grid
                id="key-inputs-power-plant-capacity"
                container
                item
                direction={"column"}
              >
                <ItemTitle>Power Plant Capacity</ItemTitle>
                <Grid item>
                  <ItemText>
                    {roundToNearestInteger(powerplantCapacity).toLocaleString(
                      "en-US"
                    ) + " MW"}
                  </ItemText>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );
}

function OperatingCostsPane(
  projectTimeline: number,
  electrolyserOpexPerYear: number[],
  powerPlantOpexPerYear: number[],
  batteryOpexPerYear: any[],
  additionalOpexPerYear: number[],
  waterOpexPerYear: number[],
  electricityPurchaseOpexPerYear: number[]
) {
  return (
    <StyledCard>
      <CardHeader
        title="Operating Costs"
        titleTypographyProps={{
          fontWeight: "bold",
          fontSize: 20,
        }}
      />
      <CardContent
        sx={{
          paddingTop: 0,
        }}
      >
        <CostLineChart
          title="Operating Costs"
          projectTimeline={projectTimeline}
          datapoints={[
            { label: "Electrolyser OPEX", data: electrolyserOpexPerYear },
            { label: "Power Plant OPEX", data: powerPlantOpexPerYear },
            { label: "Battery OPEX", data: batteryOpexPerYear },
            {
              label: "Additional Annual Costs",
              data: additionalOpexPerYear,
            },
            { label: "Water Costs", data: waterOpexPerYear },
            {
              label: "Electricity Purchase",
              data: electricityPurchaseOpexPerYear,
            },
          ]}
        />
      </CardContent>
    </StyledCard>
  );
}

type DoughnutPaneData = {
  title: string;
  items: { [key: string]: number };
};

export function DoughnutPane(data: DoughnutPaneData) {
  const labels = [];
  const items = [];
  for (const [key, val] of Object.entries(data.items)) {
    if (val !== 0) {
      labels.push(key);
      items.push(val);
    }
  }
  return (
    <StyledCard>
      <CardHeader
        title={data.title}
        titleTypographyProps={{
          fontWeight: "bold",
          fontSize: 20,
        }}
      />
      <CardContent
        sx={{
          height: "55vh",
          paddingTop: 0,
        }}
      >
        <CostBreakdownDoughnutChart
          title={data.title}
          labels={labels}
          data={items}
        />
      </CardContent>
    </StyledCard>
  );
}

type WaterfallPaneData = {
  title: string;
  label: string;
  items: { [key: string]: number };
};

export function WaterFallPane(data: WaterfallPaneData) {
  const labels = [];
  const items = [];
  for (const [key, val] of Object.entries(data.items)) {
    if (val !== 0) {
      labels.push(key);
      items.push(val);
    }
  }
  const datapoints = [
    {
      label: data.label,
      data: items,
    },
  ];
  return (
    <StyledCard>
      <CardHeader
        title={data.title}
        titleTypographyProps={{
          fontWeight: "bold",
          fontSize: 20,
        }}
      />
      <CardContent
        sx={{
          paddingTop: 0,
        }}
      >
        <CostWaterfallBarChart
          title={data.title}
          labels={labels}
          datapoints={datapoints}
        />
      </CardContent>
    </StyledCard>
  );
}

function Lch2BreakdownPane(lch2BreakdownData: { [key: string]: number }) {
  return (
    <WaterFallPane
      title="Breakdown of Cost Components in LCH2"
      label="Breakdown of Cost Components in Levelised Cost of Hydrogen"
      items={lch2BreakdownData}
    />
  );
}

export function SummaryOfResultsPane(summaryTable: { [key: string]: number }) {
  return (
    <StyledCard>
      <CardHeader
        id="summary-of-results"
        title="Summary of Results"
        titleTypographyProps={{
          fontWeight: "bold",
          fontSize: 20,
        }}
      />
      <CardContent
        sx={{
          paddingTop: 0,
        }}
      >
        <SummaryOfResultsTable title="Summary of Results" data={summaryTable} />
      </CardContent>
    </StyledCard>
  );
}
