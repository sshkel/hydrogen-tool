import { CssBaseline } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";
import ThemeProvider from "@mui/system/ThemeProvider";
import "chart.js/auto";
import Chart from "chart.js/auto";
import { useEffect, useState } from "react";

import SynthesisedInputs from "../../SynthesisedInput";
import { AmmoniaData, AmmoniaModel } from "../../model/AmmoniaModel";
import { HydrogenData, HydrogenModel } from "../../model/HydrogenModel";
import { MethaneData, MethaneModel } from "../../model/MethaneModel";
import { MethanolData, MethanolModel } from "../../model/MethanolModel";
import { HOURS_PER_LEAP_YEAR, HOURS_PER_YEAR } from "../../model/consts";
import {
  InputConfiguration,
  Inputs,
  Model,
  UserInputFields,
} from "../../types";
import DesignStepper from "../DesignStepper";
import { SAPPHIRE } from "../colors";
import ErrorAlert from "../misc/ErrorAlert";
import { CapitalCostCharts } from "./CapitalCostCharts";
import { DurationCurves } from "./DurationCurves";
import { HourlyCapacityFactorsPane } from "./HourlyCapacityFactors";
import HoverChip from "./HoverChip";
import { KeyInputsPane } from "./KeyInputs";
import { LcBreakdownPane } from "./LevelisedCost";
import LoadingResultsPage from "./LoadingResultsPage";
import { OperatingCostsPane } from "./OperatingCosts";
import { SummaryOfResultsPane } from "./SummaryOfResults";

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
  hoursPerYear: number;
}

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
        solar.length !== HOURS_PER_LEAP_YEAR &&
        solar.length !== HOURS_PER_YEAR
      ) {
        console.error("Solar data is of unexpected length", solar.length);
      }

      if (
        wind.length !== HOURS_PER_LEAP_YEAR &&
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

  if (state.solarData.length === 0 || state.windData.length === 0) {
    return <LoadingResultsPage />;
  }

  const {
    inputConfiguration,
    data: { projectScale = 0, powerfuel = "hydrogen" },
  } = props;

  let inputs = new SynthesisedInputs(props.data) as Inputs;

  const location = props.location;

  let model: Model;
  if (powerfuel === "ammonia") {
    const dataModel: AmmoniaData = {
      inputConfiguration: inputConfiguration,
      location: location,
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
      electrolyserCostReductionWithScale:
        inputs.electrolyserCostReductionWithScale,
      electrolyserEfficiency: inputs.electrolyserEfficiency,
      electrolyserEpcCosts: inputs.electrolyserEpcCosts,
      electrolyserLandProcurementCosts: inputs.electrolyserLandProcurementCosts,
      electrolyserMaximumLoad: inputs.electrolyserMaximumLoad,
      electrolyserMinimumLoad: inputs.electrolyserMinimumLoad,
      electrolyserOMCost: inputs.electrolyserOMCost,
      electrolyserPurchaseCost: inputs.electrolyserPurchaseCost,
      electrolyserReferenceCapacity: inputs.electrolyserReferenceCapacity,
      electrolyserReferenceFoldIncrease:
        inputs.electrolyserReferenceFoldIncrease,
      electrolyserStackReplacement: inputs.electrolyserStackReplacement,
      gridConnectionCost: inputs.gridConnectionCost,
      inflationRate: inputs.inflationRate,
      maximumDegradationBeforeReplacement:
        inputs.maximumDegradationBeforeReplacement,
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
      asuPlantOMCost: inputs.asuPlantOMCost!,
      hydrogenStoragePurchaseCost: inputs.hydrogenStoragePurchaseCost!,
      hydrogenStorageOMCost: inputs.hydrogenStorageOMCost!,
      ammoniaPlantCapitalCost: inputs.ammoniaPlantCapitalCost!,
    };

    model = new AmmoniaModel(dataModel, state.solarData, state.windData);
  } else if (powerfuel === "methanol") {
    const dataModel: MethanolData = {
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
      batteryReplacementCost: inputs.batteryReplacementCost,
      batteryStorageDuration: inputs.batteryStorageDuration,
      discountRate: inputs.discountRate,
      electrolyserCostReductionWithScale:
        inputs.electrolyserCostReductionWithScale,
      electrolyserEfficiency: inputs.electrolyserEfficiency,
      electrolyserEpcCosts: inputs.electrolyserEpcCosts,
      electrolyserLandProcurementCosts: inputs.electrolyserLandProcurementCosts,
      electrolyserMaximumLoad: inputs.electrolyserMaximumLoad,
      electrolyserMinimumLoad: inputs.electrolyserMinimumLoad,
      electrolyserOMCost: inputs.electrolyserOMCost,
      electrolyserPurchaseCost: inputs.electrolyserPurchaseCost,
      electrolyserReferenceCapacity: inputs.electrolyserReferenceCapacity,
      electrolyserReferenceFoldIncrease:
        inputs.electrolyserReferenceFoldIncrease,
      electrolyserStackReplacement: inputs.electrolyserStackReplacement,
      gridConnectionCost: inputs.gridConnectionCost,
      inflationRate: inputs.inflationRate,
      maximumDegradationBeforeReplacement:
        inputs.maximumDegradationBeforeReplacement,
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
      electrolyserSystemOversizing: inputs.electrolyserSystemOversizing!,
      methanolPlantCapacity: inputs.methanolPlantCapacity!,
      methanolStorageCapacity: inputs.methanolStorageCapacity!,
      methanolPlantSec: inputs.methanolPlantSec!,
      methanolPlantMinimumTurndown: inputs.methanolPlantMinimumTurndown!,
      methanolPlantUnitCost: inputs.methanolPlantUnitCost!,
      methanolStorageCost: inputs.methanolStorageCost!,
      methanolEpcCosts: inputs.methanolEpcCosts!,
      methanolLandProcurementCosts: inputs.methanolLandProcurementCosts!,
      methanolPlantOMCost: inputs.methanolPlantOMCost!,
      methanolStorageOMCost: inputs.methanolStorageOMCost!,
      ccSec: inputs.ccSec!,
      ccPlantCost: inputs.ccPlantCost!,
      ccEpcCosts: inputs.ccEpcCosts!,
      ccLandProcurementCosts: inputs.ccLandProcurementCosts!,
      ccPlantOMCost: inputs.ccPlantOMCost!,
      minimumHydrogenStorage: inputs.minimumHydrogenStorage!,
      hydrogenStorageCapacity: inputs.hydrogenStorageCapacity!,
      hydrogenStoragePurchaseCost: inputs.hydrogenStoragePurchaseCost!,
      hydrogenStorageOMCost: inputs.hydrogenStorageOMCost!,
      carbonCaptureSource: inputs.carbonCaptureSource,
      ccSourceConfiguration: inputs.ccSourceConfiguration,
    };

    model = new MethanolModel(dataModel, state.solarData, state.windData);
  } else if (powerfuel === "methane") {
    const dataModel: MethaneData = {
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
      batteryReplacementCost: inputs.batteryReplacementCost,
      batteryStorageDuration: inputs.batteryStorageDuration,
      discountRate: inputs.discountRate,
      electrolyserCostReductionWithScale:
        inputs.electrolyserCostReductionWithScale,
      electrolyserEfficiency: inputs.electrolyserEfficiency,
      electrolyserEpcCosts: inputs.electrolyserEpcCosts,
      electrolyserLandProcurementCosts: inputs.electrolyserLandProcurementCosts,
      electrolyserMaximumLoad: inputs.electrolyserMaximumLoad,
      electrolyserMinimumLoad: inputs.electrolyserMinimumLoad,
      electrolyserOMCost: inputs.electrolyserOMCost,
      electrolyserPurchaseCost: inputs.electrolyserPurchaseCost,
      electrolyserReferenceCapacity: inputs.electrolyserReferenceCapacity,
      electrolyserReferenceFoldIncrease:
        inputs.electrolyserReferenceFoldIncrease,
      electrolyserStackReplacement: inputs.electrolyserStackReplacement,
      gridConnectionCost: inputs.gridConnectionCost,
      inflationRate: inputs.inflationRate,
      maximumDegradationBeforeReplacement:
        inputs.maximumDegradationBeforeReplacement,
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
      electrolyserSystemOversizing: inputs.electrolyserSystemOversizing!,
      methanePlantCapacity: inputs.methanePlantCapacity!,
      methaneStorageCapacity: inputs.methaneStorageCapacity!,
      methanePlantSec: inputs.methanePlantSec!,
      methanePlantMinimumTurndown: inputs.methanePlantMinimumTurndown!,
      methanePlantUnitCost: inputs.methanePlantUnitCost!,
      methaneStorageCost: inputs.methaneStorageCost!,
      methaneEpcCosts: inputs.methaneEpcCosts!,
      methaneLandProcurementCosts: inputs.methaneLandProcurementCosts!,
      methanePlantOMCost: inputs.methanePlantOMCost!,
      methaneStorageOMCost: inputs.methaneStorageOMCost!,
      ccSec: inputs.ccSec!,
      ccPlantCost: inputs.ccPlantCost!,
      ccEpcCosts: inputs.ccEpcCosts!,
      ccLandProcurementCosts: inputs.ccLandProcurementCosts!,
      ccPlantOMCost: inputs.ccPlantOMCost!,
      minimumHydrogenStorage: inputs.minimumHydrogenStorage!,
      hydrogenStorageCapacity: inputs.hydrogenStorageCapacity!,
      hydrogenStoragePurchaseCost: inputs.hydrogenStoragePurchaseCost!,
      hydrogenStorageOMCost: inputs.hydrogenStorageOMCost!,
      carbonCaptureSource: inputs.carbonCaptureSource,
      ccSourceConfiguration: inputs.ccSourceConfiguration,
    };

    model = new MethaneModel(dataModel, state.solarData, state.windData);
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
      electrolyserCostReductionWithScale:
        inputs.electrolyserCostReductionWithScale,
      electrolyserEfficiency: inputs.electrolyserEfficiency,
      electrolyserEpcCosts: inputs.electrolyserEpcCosts,
      electrolyserLandProcurementCosts: inputs.electrolyserLandProcurementCosts,
      electrolyserMaximumLoad: inputs.electrolyserMaximumLoad,
      electrolyserMinimumLoad: inputs.electrolyserMinimumLoad,
      electrolyserNominalCapacity: inputs.electrolyserNominalCapacity,
      electrolyserOMCost: inputs.electrolyserOMCost,
      electrolyserPurchaseCost: inputs.electrolyserPurchaseCost,
      electrolyserReferenceCapacity: inputs.electrolyserReferenceCapacity,
      electrolyserReferenceFoldIncrease:
        inputs.electrolyserReferenceFoldIncrease,
      electrolyserStackReplacement: inputs.electrolyserStackReplacement,
      gridConnectionCost: inputs.gridConnectionCost,
      inflationRate: inputs.inflationRate,
      maximumDegradationBeforeReplacement:
        inputs.maximumDegradationBeforeReplacement,
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
  try {
    const results = model.produceResults();
    return (
      <ThemeProvider theme={theme}>
        <DesignStepper activeStep={3} />
        <CssBaseline />
        {results.summaryTableData["Electrolyser Capacity Factor"] === 0 &&
        // TODO dirtiest of hacks to not render this on first paint, we should clean this up
        state.solarData.length > 0 ? (
          <ErrorAlert
            message={
              "Invalid inputs. Electrolyser capacity was 0. Please check the inputs."
            }
            state={{
              validatedInputs: inputs,
              rawInputs: {
                location: props.location,
                inputConfiguration: props.inputConfiguration,
                data: props.data,
              },
            }}
          />
        ) : null}
        <Grid
          container
          direction="column"
          sx={{ backgroundColor: SAPPHIRE, paddingTop: 4, paddingX: 8 }}
        >
          <Grid item>
            {KeyInputsPane(
              location,
              results.electrolyserNominalCapacity,
              results.powerPlantNominalCapacity
            )}
          </Grid>
          <Grid item>
            <Grid
              container
              item
              direction="column"
              className="summary and cost breakdown"
            >
              <Grid item xs>
                {SummaryOfResultsPane(results.summaryTableData)}
              </Grid>
            </Grid>
          </Grid>
          <HoverChip />
          <Grid container item xs={6}>
            <Grid item xs={6}>
              {OperatingCostsPane(results.operatingCosts)}
            </Grid>
            <Grid item xs={6}>
              {LcBreakdownPane(results.lcBreakdownData, powerfuel)}
            </Grid>
          </Grid>

          <Grid container className="duration curves" wrap="nowrap">
            {DurationCurves(results.durationCurves)}
          </Grid>

          <Grid container className="cost breakdown" item wrap="nowrap">
            {CapitalCostCharts([
              {
                title: "Capital Cost Breakdown",
                items: results.capitalCostBreakdown,
              },
              {
                title: "Indirect Cost Breakdown",
                items: results.indirectCostBreakdown,
              },
            ])}
          </Grid>
          <Grid item>
            {HourlyCapacityFactorsPane(results.hourlyCapFactors)}
          </Grid>
        </Grid>
      </ThemeProvider>
    );
  } catch (e: any) {
    return (
      <ErrorAlert
        message={e.message}
        state={{
          validatedInputs: inputs,
          rawInputs: {
            location: props.location,
            inputConfiguration: props.inputConfiguration,
            data: props.data,
          },
        }}
      />
    );
  }
}
