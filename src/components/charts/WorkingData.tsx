import FactoryRoundedIcon from "@mui/icons-material/FactoryRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import SignalCellularAltRoundedIcon from "@mui/icons-material/SignalCellularAltRounded";
import { CssBaseline, Typography } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";
import { styled, useTheme } from "@mui/material/styles";
import ThemeProvider from "@mui/system/ThemeProvider";
import "chart.js/auto";
import Chart from "chart.js/auto";
import { useEffect, useState } from "react";

import SynthesisedInputs from "../../SynthesisedInput";
import { HydrogenData, HydrogenModel } from "../../model/HydrogenModel";
import { HOURS_PER_LEAR_YEAR, HOURS_PER_YEAR } from "../../model/consts";
import {
  InputConfiguration,
  Inputs,
  Model,
  UserInputFields,
} from "../../types";
import DesignStepper from "../DesignStepper";
import { BLUE, SAPPHIRE } from "../colors";
import { zoneInfo } from "../map/ZoneInfo";
import CostBreakdownDoughnutChart from "./CostBreakdownDoughnutChart";
import CostLineChart from "./CostLineChart";
import CostWaterfallBarChart from "./CostWaterfallBarChart";
import DurationCurve from "./DurationCurve";
import HourlyCapacityFactors from "./HourlyCapacityFactors";
import SummaryOfResultsTable from "./SummaryOfResultsTable";
import {roundToNearestInteger} from "./cost-functions";
import {AmmoniaData, AmmoniaModel} from "../../model/Ammonia2Model";

export interface Props {
  powerfuel?: string;
  location?: string;
  data?: UserInputFields;
  inputConfiguration: InputConfiguration;
  loadSolar: () => Promise<any[]>;
  loadWind: () => Promise<any[]>;
}

interface DownloadedData {
  solarData: any[];
  windData: any[];
  hoursPerYear: number;
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

// setup default fonts for the charts
Chart.defaults.font.family = "Nunito";

export default function WorkingData(props: Props) {
  const [state, setState] = useState<DownloadedData>({
    solarData: [],
    windData: [],
    hoursPerYear: HOURS_PER_YEAR,
  });

  const theme = useTheme();

  // TODO: Error handling if we can't load solar and wind data
  // TODO: Add some validation for correct number of rows
  useEffect(() => {
    const { loadSolar, loadWind } = props;
    Promise.all([loadSolar(), loadWind()]).then(([solar, wind]) => {
      if (
        solar.length !== HOURS_PER_LEAR_YEAR &&
        solar.length !== HOURS_PER_YEAR
      ) {
        console.error("Solar data is of unexpected length", solar.length);
      }

      if (
        wind.length !== HOURS_PER_LEAR_YEAR &&
        wind.length !== HOURS_PER_YEAR
      ) {
        console.error("Wind data is of unexpected length", wind.length);
      }
      setState({
        solarData: solar,
        windData: wind,
        hoursPerYear: solar.length,
      });
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

  const location = props.location;

  let model: Model;
  if (props.data.powerfuel === "ammonia") {
    const dataModel: AmmoniaData = {
      inputConfiguration: inputConfiguration,
      location: location,
      projectScale: projectScale,
      additionalAnnualCosts: inputs.additionalAnnualCosts,
      additionalTransmissionCharges: inputs.additionalTransmissionCharges,
      additionalUpfrontCosts: inputs.additionalUpfrontCosts,
      batteryCosts: inputs.batteryCosts,
      batteryEfficiency: inputs.batteryEfficiency,
      batteryEpcCosts: inputs.batteryEpcCosts,
      batteryLandProcurementCosts: inputs.batteryLandProcurementCosts,
      batteryLifetime: inputs.batteryLifetime,
      batteryMinCharge: inputs.batteryMinCharge,
      batteryOMCost: inputs.batteryOMCost,
      batteryRatedPower: inputs.batteryRatedPower,
      batteryReplacementCost: inputs.batteryReplacementCost,
      batteryStorageDuration: inputs.batteryStorageDuration,
      discountRate: inputs.discountRate,
      electrolyserCostReductionWithScale: inputs.electrolyserCostReductionWithScale,
      electrolyserEfficiency: inputs.electrolyserEfficiency,
      electrolyserEpcCosts: inputs.electrolyserEpcCosts,
      electrolyserLandProcurementCosts: inputs.electrolyserLandProcurementCosts,
      electrolyserMaximumLoad: inputs.electrolyserMaximumLoad,
      electrolyserMinimumLoad: inputs.electrolyserMinimumLoad,
      electrolyserOMCost: inputs.electrolyserOMCost,
      electrolyserPurchaseCost: inputs.electrolyserPurchaseCost,
      electrolyserReferenceCapacity: inputs.electrolyserReferenceCapacity,
      electrolyserReferenceFoldIncrease: inputs.electrolyserReferenceFoldIncrease,
      electrolyserStackReplacement: inputs.electrolyserStackReplacement,
      gridConnectionCost: inputs.gridConnectionCost,
      inflationRate: inputs.inflationRate,
      maximumDegradationBeforeReplacement: inputs.maximumDegradationBeforeReplacement,
      maximumLoadWhenOverloading: inputs.maximumLoadWhenOverloading,
      powerCapacityConfiguration: inputs.powerCapacityConfiguration,
      powerPlantConfiguration: inputs.powerPlantConfiguration,
      powerPlantOversizeRatio: inputs.powerPlantOversizeRatio,
      powerPlantType: inputs.powerPlantType,
      powerSupplyOption: inputs.powerSupplyOption,
      principalPPACost: inputs.principalPPACost,
      projectTimeline: inputs.projectTimeline,
      secAtNominalLoad: inputs.secAtNominalLoad,
      solarDegradation: inputs.solarDegradation,
      solarEpcCosts: inputs.solarEpcCosts,
      solarFarmBuildCost: inputs.solarFarmBuildCost,
      solarLandProcurementCosts: inputs.solarLandProcurementCosts,
      solarOpex: inputs.solarOpex,
      solarPVCostReductionWithScale: inputs.solarPVCostReductionWithScale,
      solarReferenceCapacity: inputs.solarReferenceCapacity,
      solarReferenceFoldIncrease: inputs.solarReferenceFoldIncrease,
      solarToWindPercentage: inputs.solarToWindPercentage,
      stackDegradation: inputs.stackDegradation,
      stackLifetime: inputs.stackLifetime,
      stackReplacementType: inputs.stackReplacementType,
      timeBetweenOverloading: inputs.timeBetweenOverloading,
      waterRequirementOfElectrolyser: inputs.waterRequirementOfElectrolyser,
      waterSupplyCost: inputs.waterSupplyCost,
      windDegradation: inputs.windDegradation,
      windEpcCosts: inputs.windEpcCosts,
      windFarmBuildCost: inputs.windFarmBuildCost,
      windLandProcurementCosts: inputs.windLandProcurementCosts,
      windOpex: inputs.windOpex,
      windReferenceCapacity: inputs.windReferenceCapacity,
      windReferenceFoldIncrease: inputs.windReferenceFoldIncrease,
      windCostReductionWithScale: inputs.windCostReductionWithScale,
      ammoniaPlantCapacity: inputs.ammoniaPlantCapacity!,
      ammoniaStorageCapacity: inputs.ammoniaStorageCapacity!,
      electrolyserSystemOversizing: inputs.electrolyserSystemOversizing!,
      ammoniaPlantSec: inputs.ammoniaPlantSec!,
      asuSec: inputs.asuSec!,
      hydrogenStorageCapacity: inputs.hydrogenStorageCapacity!,
      ammoniaPlantMinimumTurndown: inputs.ammoniaPlantMinimumTurndown!,
      minimumHydrogenStorage: inputs.minimumHydrogenStorage!,
      // operating costs
      ammoniaSynthesisUnitCost: inputs.ammoniaSynthesisUnitCost!,
      ammoniaStorageCost: inputs.ammoniaStorageCost!,
      airSeparationUnitCost: inputs.airSeparationUnitCost!,
      ammoniaEpcCosts: inputs.ammoniaEpcCosts!,
      ammoniaLandProcurementCosts: inputs.ammoniaLandProcurementCosts!,
      ammoniaPlantOMCost: inputs.ammoniaPlantOMCost!,
      ammoniaStorageOMCost: inputs.ammoniaStorageOMCost!,
      asuPlantOMCost: inputs.asuPlantOMCost!
    };

    model = new AmmoniaModel(dataModel, state.solarData, state.windData);

  } else {
    const dataModel: HydrogenData = {
      inputConfiguration: inputConfiguration,
      location: location,
      projectScale: projectScale,
      additionalAnnualCosts: inputs.additionalAnnualCosts,
      additionalTransmissionCharges: inputs.additionalTransmissionCharges,
      additionalUpfrontCosts: inputs.additionalUpfrontCosts,
      batteryCosts: inputs.batteryCosts,
      batteryEfficiency: inputs.batteryEfficiency,
      batteryEpcCosts: inputs.batteryEpcCosts,
      batteryLandProcurementCosts: inputs.batteryLandProcurementCosts,
      batteryLifetime: inputs.batteryLifetime,
      batteryMinCharge: inputs.batteryMinCharge,
      batteryOMCost: inputs.batteryOMCost,
      batteryRatedPower: inputs.batteryRatedPower,
      batteryReplacementCost: inputs.batteryReplacementCost,
      batteryStorageDuration: inputs.batteryStorageDuration,
      discountRate: inputs.discountRate,
      electrolyserCostReductionWithScale: inputs.electrolyserCostReductionWithScale,
      electrolyserEfficiency: inputs.electrolyserEfficiency,
      electrolyserEpcCosts: inputs.electrolyserEpcCosts,
      electrolyserLandProcurementCosts: inputs.electrolyserLandProcurementCosts,
      electrolyserMaximumLoad: inputs.electrolyserMaximumLoad,
      electrolyserMinimumLoad: inputs.electrolyserMinimumLoad,
      electrolyserNominalCapacity: inputs.electrolyserNominalCapacity,
      electrolyserOMCost: inputs.electrolyserOMCost,
      electrolyserPurchaseCost: inputs.electrolyserPurchaseCost,
      electrolyserReferenceCapacity: inputs.electrolyserReferenceCapacity,
      electrolyserReferenceFoldIncrease: inputs.electrolyserReferenceFoldIncrease,
      electrolyserStackReplacement: inputs.electrolyserStackReplacement,
      gridConnectionCost: inputs.gridConnectionCost,
      inflationRate: inputs.inflationRate,
      maximumDegradationBeforeReplacement: inputs.maximumDegradationBeforeReplacement,
      maximumLoadWhenOverloading: inputs.maximumLoadWhenOverloading,
      powerCapacityConfiguration: inputs.powerCapacityConfiguration,
      powerPlantConfiguration: inputs.powerPlantConfiguration,
      powerPlantOversizeRatio: inputs.powerPlantOversizeRatio,
      powerPlantType: inputs.powerPlantType,
      powerSupplyOption: inputs.powerSupplyOption,
      principalPPACost: inputs.principalPPACost,
      projectTimeline: inputs.projectTimeline,
      secAtNominalLoad: inputs.secAtNominalLoad,
      solarDegradation: inputs.solarDegradation,
      solarEpcCosts: inputs.solarEpcCosts,
      solarFarmBuildCost: inputs.solarFarmBuildCost,
      solarLandProcurementCosts: inputs.solarLandProcurementCosts,
      solarNominalCapacity: inputs.solarNominalCapacity,
      solarOpex: inputs.solarOpex,
      solarPVCostReductionWithScale: inputs.solarPVCostReductionWithScale,
      solarReferenceCapacity: inputs.solarReferenceCapacity,
      solarReferenceFoldIncrease: inputs.solarReferenceFoldIncrease,
      solarToWindPercentage: inputs.solarToWindPercentage,
      stackDegradation: inputs.stackDegradation,
      stackLifetime: inputs.stackLifetime,
      stackReplacementType: inputs.stackReplacementType,
      timeBetweenOverloading: inputs.timeBetweenOverloading,
      waterRequirementOfElectrolyser: inputs.waterRequirementOfElectrolyser,
      waterSupplyCost: inputs.waterSupplyCost,
      windDegradation: inputs.windDegradation,
      windEpcCosts: inputs.windEpcCosts,
      windFarmBuildCost: inputs.windFarmBuildCost,
      windLandProcurementCosts: inputs.windLandProcurementCosts,
      windNominalCapacity: inputs.windNominalCapacity,
      windOpex: inputs.windOpex,
      windReferenceCapacity: inputs.windReferenceCapacity,
      windReferenceFoldIncrease: inputs.windReferenceFoldIncrease,
      windCostReductionWithScale: inputs.windCostReductionWithScale,
    };

    model = new HydrogenModel(dataModel, state.solarData, state.windData);
  }

  const results = model.produceResults()

  return (
    <ThemeProvider theme={theme}>
      <DesignStepper activeStep={3} />
      <CssBaseline />
      <Grid container direction="column" sx={{ backgroundColor: SAPPHIRE }}>
        <Grid item>
          {KeyInputsPane(
            location,
            results.electrolyserNominalCapacity,
            results.powerPlantNominalCapacity
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
                {SummaryOfResultsPane(results.summaryTableData)}
              </Grid>
              <Grid container item>
                <Grid item xs={6}>
                  <DoughnutPane
                    title="Capital Cost Breakdown"
                    items={results.capitalCostBreakdown}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DoughnutPane
                    title="Indirect Cost Breakdown"
                    items={results.indirectCostBreakdown}
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
                  {DurationCurves(results.durationCurves)}
                </Grid>
                <Grid item>{Lch2BreakdownPane(results.lch2BreakdownData)}</Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>{OperatingCostsPane(results.operatingCosts)}</Grid>
        <Grid item>{HourlyCapacityFactorsPane(results.hourlyCapFactors)}</Grid>
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
function HourlyCapacityFactorsPane(hourlyCapFactors: {
  [key: string]: number[];
}) {
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
          datapoints={Object.keys(hourlyCapFactors).map((key: string) => {
            return {
              label: key,
              data: hourlyCapFactors[key],
            };
          })}
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

function OperatingCostsPane(operatingCosts: {
  projectTimeline: number;
  costs: { [key: string]: number[] };
}) {
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
          projectTimeline={operatingCosts.projectTimeline}
          datapoints={Object.keys(operatingCosts.costs).map((key: string) => {
            return { label: key, data: operatingCosts.costs[key] };
          })}
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
