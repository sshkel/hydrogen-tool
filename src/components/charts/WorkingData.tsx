import "chart.js/auto";
import { useEffect, useState } from "react";

import {
  DataModel,
  HydrogenModel,
  ProjectModelSummary,
} from "../../model/Model";
import {
  BATTERY_OUTPUT,
  ELECTROLYSER_CF,
  ENERGY_INPUT,
  ENERGY_OUTPUT,
  HYDROGEN_OUTPUT_FIXED,
  HYDROGEN_OUTPUT_VARIABLE,
  POWER_PLANT_CF,
  RATED_CAPACITY_TIME,
  TOTAL_OPERATING_TIME,
} from "../../model/consts";
import { SynthesisedInputs } from "../../types";
import { fillYearsArray, getActiveYearsLabels, mean } from "../../utils";
import BasicTable from "./BasicTable";
import CostBarChart from "./CostBarChart";
import CostBreakdownDoughnutChart from "./CostBreakdownDoughnutChart";
import CostLineChart from "./CostLineChart";
import DurationCurve from "./DurationCurve";
import HourlyCapacityFactors from "./HourlyCapacityFactors";
import { generateCapexValues } from "./capex-calculations";
import { cashFlowAnalysis, sales } from "./cost-functions";
import { generateLCValues } from "./lch2-calculations";
import { generateOpexValues } from "./opex-calculations";

export interface Props {
  location?: string;
  data?: SynthesisedInputs;
  loadSolar: () => Promise<any[]>;
  loadWind: () => Promise<any[]>;
}

interface DownloadedData {
  solarData: any[];
  windData: any[];
}

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
    electrolyserNominalCapacity,
    solarNominalCapacity,
    windNominalCapacity,
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
  } = props.data;
  const location = props.location;
  const dataModel: DataModel = {
    batteryLifetime,
    batteryMinCharge,
    batteryEfficiency,
    batteryStorageDuration,
    batteryRatedPower,
    timeBetweenOverloading,
    maximumLoadWhenOverloading,
    electrolyserNominalCapacity,
    solarNominalCapacity,
    windNominalCapacity,
    solarDegradation,
    windDegradation,
    stackDegradation,
    stackLifetime,
    maximumDegradationBeforeReplacement,
    stackReplacementType,
    location,
    electrolyserMaximumLoad,
    electrolyserMinimumLoad,
    specCons: secAtNominalLoad,
    elecEff: electrolyserEfficiency,
  };

  const model = new HydrogenModel(dataModel, state.solarData, state.windData);

  let summary: ProjectModelSummary =
    model.calculateHydrogenModel(projectTimeline);
  let hourlyOperations = model.getHourlyOperations();
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
  } = generateCapexValues(props.data);

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
    (hours) => hours * 8760
  );

  const h2Produced =
    props.data.profile === "Fixed"
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
    props.data,
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
    props.data,
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

  return (
    <div>
      <BasicTable
        title="Summary of Results"
        data={{
          "Power Plant Capacity Factor": [
            mean(summary[`${POWER_PLANT_CF}`].map((x) => x * 100)),
          ],
          "Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)": [
            mean(summary[`${RATED_CAPACITY_TIME}`].map((x) => x * 100)),
          ],
          "Total Time Electrolyser is Operating (% of 8760 hrs/yr)": [
            mean(summary[`${TOTAL_OPERATING_TIME}`].map((x) => x * 100)),
          ],
          "Electrolyser Capacity Factor": [
            mean(summary[`${ELECTROLYSER_CF}`].map((x) => x * 100)),
          ],
          "Energy Consumed by Electrolyser (MWh/yr)": [
            mean(electricityConsumed),
          ],
          "Excess Energy Not Utilised by Electrolyser (MWh/yr)": [
            mean(electricityProduced),
          ],
          "Hydrogen Output [t/yr]": [mean(h2Produced)],
          LCH2: [lch2],
          "H2 Retail Price": [h2RetailPrice],
        }}
      />
      {/* Comment out for displaying */}
      {/* <BasicTable
        data={{
          paddedH2Produced,
          paddedElectricityProduced,
          h2Sales,
          totalCost,
          totalCostWithDiscount,
          h2ProducedKgLCA,
          electricitySales,
          oxygenSales,
          annualSales,
          waterOpexCost: padArray(waterOpexCost),
          waterCost: padArray(waterCost),
          ...cashFlow,
        }}
      /> */}
      <DurationCurve
        title="Generator Duration Curve"
        data={hourlyOperations.Generator_CF}
      />
      <DurationCurve
        title="Electrolyser Duration Curve"
        data={hourlyOperations.Electrolyser_CF}
      />
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
      <CostLineChart
        title="Operating Costs"
        projectTimeline={projectTimeline}
        datapoints={[
          { label: "Electrolyser OPEX", data: electrolyserOpexPerYear },
          { label: "Power Plant OPEX", data: powerPlantOpexPerYear },
          { label: "Battery OPEX", data: batteryOpexPerYear },
          { label: "Additional Annual Costs", data: additionalOpexPerYear },
          { label: "Water Costs", data: waterOpexPerYear },
          {
            label: "Electricity Purchase",
            data: electricityPurchaseOpexPerYear,
          },
        ]}
      />
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
            label: "Breakdown of Cost Components in Levelised Cost of Hydrogen",
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
      <HourlyCapacityFactors
        datapoints={[
          { label: "Electrolyser", data: hourlyOperations.Electrolyser_CF },
          { label: "Power Plant", data: hourlyOperations.Generator_CF },
        ]}
      />
    </div>
  );
}
