import FactoryRoundedIcon from "@mui/icons-material/FactoryRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import SignalCellularAltRoundedIcon from "@mui/icons-material/SignalCellularAltRounded";
import { Typography } from "@mui/material";
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
import {
  DataModel,
  HydrogenModel,
  ModelHourlyOperation,
  ProjectModelSummary,
} from "../../model/Model";
import {
  BATTERY_OUTPUT,
  ELECTROLYSER_CF,
  ENERGY_INPUT,
  ENERGY_OUTPUT,
  HOURS_PER_YEAR,
  HYDROGEN_OUTPUT_FIXED,
  HYDROGEN_OUTPUT_VARIABLE,
  POWER_PLANT_CF,
  RATED_CAPACITY_TIME,
  TOTAL_OPERATING_TIME,
} from "../../model/consts";
import { InputConfiguration, Inputs, UserInputFields } from "../../types";
import { fillYearsArray, getActiveYearsLabels, mean } from "../../utils";
import { zoneInfo } from "../map/ZoneInfo";
import BasicTable from "./BasicTable";
import CostBarChart from "./CostBarChart";
import CostBreakdownDoughnutChart from "./CostBreakdownDoughnutChart";
import CostLineChart from "./CostLineChart";
import DurationCurve from "./DurationCurve";
import HourlyCapacityFactors from "./HourlyCapacityFactors";
import { backCalculateInputFields } from "./basic-calculations";
import { generateCapexValues } from "./capex-calculations";
import { cashFlowAnalysis, sales } from "./cost-functions";
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
  fontWeight: "bold",
}));
const ItemText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
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
      if (solar.length !== 8784) {
        console.error("Solar data is not 8784 rows in length");
      }

      if (wind.length !== 8784) {
        console.error("Wind data is not 8784 rows in length");
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
    hydrogenSalesMargin,
    oxygenRetailPrice,
    averageElectricitySpotPrice,
    shareOfTotalInvestmentFinancedViaEquity,
    directEquityShare,
    salvageCostShare,
    decommissioningCostShare,
    loanTerm,
    interestOnLoan,
    capitalDepreciationProfile,
    taxRate,
    inflationRate,
    solarDegradation,
    windDegradation,
    secAtNominalLoad = 0,
    electrolyserEfficiency = 0,
    powerPlantOversizeRatio,
    solarToWindPercentage,
  } = inputs;
  const location = props.location;
  const dataModel: DataModel = {
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

  const h2Produced =
    inputs.profile === "Fixed"
      ? summary[`${HYDROGEN_OUTPUT_FIXED}`]
      : summary[`${HYDROGEN_OUTPUT_VARIABLE}`];

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

  const oxygenSalePrice: number[] = fillYearsArray(
    projectTimeline,
    (i) => 8 * h2Produced[i] * oxygenRetailPrice
  );

  const {
    lch2,
    h2RetailPrice,
    h2Sales,
    electricitySales,
    oxygenSales,
    annualSales,
    hydrogenProductionCost,
  } = sales(
    totalCapexCost,
    totalEpcCost,
    totalLandCost,
    projectTimeline,
    discountRate / 100,
    hydrogenSalesMargin,
    averageElectricitySpotPrice,
    inflationRate / 100,
    oxygenSalePrice,
    totalOpex,
    h2Produced,
    electricityProduced
  );

  // Cash flow analysis calculations
  const { cumulativeCashFlow } = cashFlowAnalysis(
    annualSales,
    totalOpex,
    totalCapexCost,
    totalEpcCost,
    totalLandCost,
    shareOfTotalInvestmentFinancedViaEquity / 100,
    directEquityShare / 100,
    salvageCostShare / 100,
    decommissioningCostShare / 100,
    loanTerm,
    interestOnLoan / 100,
    capitalDepreciationProfile,
    taxRate / 100,
    projectTimeline,
    inflationRate / 100
  );

  // LCH2 calculations
  const {
    lcPowerPlantCAPEX,
    lcElectrolyserCAPEX,
    lcIndirectCosts,
    lcPowerPlantOPEX,
    lcElectrolyserOPEX,
    lcElectricityPurchase,
    lcElectricitySale,
    lcStackReplacement,
    lcWater,
    lcBattery,
    lcGridConnection,
    lcAdditionalCosts,
    lcOxygenSale,
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
    oxygenSalePrice,
    electricityProduced,
    electricityConsumed,
    electricityConsumedByBattery,
    hydrogenProductionCost
  );

  const netProfit = cumulativeCashFlow[cumulativeCashFlow.length - 1];
  const totalInvestmentRequired = totalCapexCost + totalIndirectCosts;
  const returnOnInvestment = netProfit / totalInvestmentRequired;
  const powerplantCapacity =
    inputs.solarNominalCapacity + inputs.windNominalCapacity;
  type ObjectKey = keyof typeof zoneInfo;
  const zone = location as ObjectKey;
  return (
    <ThemeProvider theme={theme}>
      <Grid container direction="column">
        <Card>
          <CardHeader title="Key inputs" />
          <CardContent>
            <Grid container item>
              <Grid item xs={4}>
                <Grid container item flexWrap={"nowrap"}>
                  <Grid item>
                    <LocationOnRoundedIcon fontSize="large" />
                  </Grid>
                  <Grid container item direction={"column"}>
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
                <Grid container item flexWrap={"nowrap"}>
                  <Grid item>
                    <SignalCellularAltRoundedIcon fontSize="large" />
                  </Grid>
                  <Grid container item direction={"column"}>
                    <Grid item>
                      <ItemTitle>Electrolyster Capacity</ItemTitle>
                    </Grid>
                    <Grid item>
                      <ItemText>
                        {inputs.electrolyserNominalCapacity.toLocaleString(
                          "en-US"
                        )}
                      </ItemText>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={4}>
                <Grid container item flexWrap={"nowrap"}>
                  <Grid item>
                    <FactoryRoundedIcon fontSize="large" />
                  </Grid>
                  <Grid container item direction={"column"}>
                    <ItemTitle>Powerplant Capacity</ItemTitle>
                    <Grid item>
                      <ItemText>
                        {powerplantCapacity.toLocaleString("en-US")}
                      </ItemText>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid item>
          {FirstGraph(
            summary,
            electricityConsumed,
            electricityProduced,
            h2Produced,
            lch2,
            netProfit,
            returnOnInvestment,
            h2RetailPrice,
            electrolyserCAPEX,
            powerPlantCAPEX,
            batteryCAPEX,
            gridConnectionCAPEX,
            additionalUpfrontCosts,
            totalIndirectCosts,
            electrolyserEpcCost,
            electrolyserLandCost,
            powerPlantEpcCost,
            powerPlantLandCost,
            batteryEpcCost,
            batteryLandCost,
            hourlyOperations,
            lcPowerPlantCAPEX,
            lcElectrolyserCAPEX,
            lcIndirectCosts,
            lcPowerPlantOPEX,
            lcElectrolyserOPEX,
            lcElectricityPurchase,
            lcElectricitySale,
            lcStackReplacement,
            lcWater,
            lcBattery,
            lcGridConnection,
            lcAdditionalCosts,
            lcOxygenSale,
            projectTimeline,
            cumulativeCashFlow
          )}
        </Grid>
        <Grid item>
          {OperatingCosts(
            projectTimeline,
            electrolyserOpexPerYear,
            powerPlantOpexPerYear,
            batteryOpexPerYear,
            additionalOpexPerYear,
            waterOpexPerYear,
            electricityPurchaseOpexPerYear,
            h2Sales,
            electricitySales,
            oxygenSales,
            annualSales
          )}
        </Grid>
        <Grid item>
          <Card>
            <CardHeader title="Hourly capacity factors" />

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
          </Card>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
function OperatingCosts(
  projectTimeline: number,
  electrolyserOpexPerYear: number[],
  powerPlantOpexPerYear: number[],
  batteryOpexPerYear: any[],
  additionalOpexPerYear: number[],
  waterOpexPerYear: number[],
  electricityPurchaseOpexPerYear: number[],
  h2Sales: number[],
  electricitySales: number[],
  oxygenSales: number[],
  annualSales: number[]
) {
  return (
    <Card>
      <CardHeader title="Operating Costs" />
      <CardContent>
        <Grid container item>
          <Grid item xs={6}>
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
          </Grid>
          <Grid item xs={6}>
            <CostLineChart
              title="Sales"
              projectTimeline={projectTimeline}
              datapoints={[
                { label: "Hydrogen Sales", data: h2Sales },
                { label: "Electricity Sales", data: electricitySales },
                { label: "Oxygen Sales", data: oxygenSales },
                { label: "Total Sales", data: annualSales },
              ]}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function FirstGraph(
  summary: ProjectModelSummary,
  electricityConsumed: number[],
  electricityProduced: number[],
  h2Produced: number[],
  lch2: number,
  netProfit: number,
  returnOnInvestment: number,
  h2RetailPrice: number,
  electrolyserCAPEX: number,
  powerPlantCAPEX: number,
  batteryCAPEX: number,
  gridConnectionCAPEX: number,
  additionalUpfrontCosts: number,
  totalIndirectCosts: number,
  electrolyserEpcCost: number,
  electrolyserLandCost: number,
  powerPlantEpcCost: number,
  powerPlantLandCost: number,
  batteryEpcCost: number,
  batteryLandCost: number,
  hourlyOperations: ModelHourlyOperation,
  lcPowerPlantCAPEX: number,
  lcElectrolyserCAPEX: number,
  lcIndirectCosts: number,
  lcPowerPlantOPEX: number,
  lcElectrolyserOPEX: number,
  lcElectricityPurchase: number,
  lcElectricitySale: number,
  lcStackReplacement: number,
  lcWater: number,
  lcBattery: number,
  lcGridConnection: number,
  lcAdditionalCosts: number,
  lcOxygenSale: number,
  projectTimeline: number,
  cumulativeCashFlow: number[]
) {
  const summaryDict: { [key: string]: number } = {
    "Power Plant Capacity Factor": mean(
      summary[`${POWER_PLANT_CF}`].map((x) => x * 100)
    ),

    "Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)": mean(
      summary[`${RATED_CAPACITY_TIME}`].map((x) => x * 100)
    ),
    "Total Time Electrolyser is Operating (% of 8760 hrs/yr)": mean(
      summary[`${TOTAL_OPERATING_TIME}`].map((x) => x * 100)
    ),

    "Electrolyser Capacity Factor": mean(
      summary[`${ELECTROLYSER_CF}`].map((x) => x * 100)
    ),

    "Energy Consumed by Electrolyser (MWh/yr)": mean(electricityConsumed),

    "Excess Energy Not Utilised by Electrolyser (MWh/yr)":
      mean(electricityProduced),

    "Hydrogen Output [t/yr]": mean(h2Produced),
    LCH2: lch2,
    "H2 Retail Price": h2RetailPrice,
    "Net Profit (A$)": netProfit,
    "Return on Investment (%)": returnOnInvestment,
  };
  return (
    <Grid container className="outside results box" wrap="nowrap">
      <Grid
        container
        item
        direction="column"
        className="summary and cost breakdown"
      >
        <Grid item>
          <Card>
            <CardHeader title="Summary of results" />
            <BasicTable title="Summary of Results" data={summaryDict} />
          </Card>
        </Grid>
        <Grid container item>
          <Grid item xs={6}>
            <Card>
              <CostBreakdownDoughnutChart
                title="Capital Cost Breakdown"
                labels={[
                  "Electrolyser System",
                  "Power Plant",
                  "Battery",
                  "Grid Connection",
                  "Additional Upfront Costs",
                  "Indirect Costs",
                ]}
                data={[
                  electrolyserCAPEX,
                  powerPlantCAPEX,
                  batteryCAPEX,
                  gridConnectionCAPEX,
                  additionalUpfrontCosts,
                  totalIndirectCosts,
                ]}
              />
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CostBreakdownDoughnutChart
                title="Indirect Cost Breakdown"
                labels={[
                  "Electrolyser EPC",
                  "Electrolyser Land",
                  "Power Plant EPC",
                  "Power Plant Land",
                  "Battery EPC",
                  "Battery Land",
                ]}
                data={[
                  electrolyserEpcCost,
                  electrolyserLandCost,
                  powerPlantEpcCost,
                  powerPlantLandCost,
                  batteryEpcCost,
                  batteryLandCost,
                ]}
              />
            </Card>
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
            <Grid item xs={6}>
              <Card>
                <CardHeader title="Powerplant duration curve" />

                <DurationCurve
                  title="Generator Duration Curve"
                  data={hourlyOperations.Generator_CF}
                />
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardHeader title="Electrolyser duration curve" />

                <DurationCurve
                  title="Electrolyser Duration Curve"
                  data={hourlyOperations.Electrolyser_CF}
                />
              </Card>
            </Grid>
          </Grid>
          <Grid item>
            <Card>
              <CardHeader title="Cash Flow Analysis" />
              <CostBarChart
                title="Cash Flow Analysis"
                labels={getActiveYearsLabels(projectTimeline)}
                datapoints={[
                  {
                    label: "Cash Flow Analysis",
                    data: cumulativeCashFlow,
                  },
                ]}
              />
            </Card>
          </Grid>
          <Grid item>
            <Card>
              <CardHeader title="Breakdown of cost components in LCH2" />

              <CostBarChart
                title="Breakdown of Cost Components in LCH2"
                labels={[
                  "Power Plant CAPEX",
                  "Electrolyser CAPEX",
                  "Indirect Costs",
                  "Power Plant OPEX",
                  "Electrolyser O&M",
                  "Electricity Purchase",
                  "Electricity Sale",
                  "Stack Replacement",
                  "Water Cost",
                  "Battery Cost",
                  "Grid Connection Cost",
                  "Additional Costs",
                  "Oxygen Sale",
                ]}
                datapoints={[
                  {
                    label:
                      "Breakdown of Cost Components in Levelised Cost of Hydrogen",
                    data: [
                      lcPowerPlantCAPEX,
                      lcElectrolyserCAPEX,
                      lcIndirectCosts,
                      lcPowerPlantOPEX,
                      lcElectrolyserOPEX,
                      lcElectricityPurchase,
                      lcElectricitySale,
                      lcStackReplacement,
                      lcWater,
                      lcBattery,
                      lcGridConnection,
                      lcAdditionalCosts,
                      lcOxygenSale,
                    ],
                  },
                ]}
              />
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
