import "chart.js/auto";
import { useEffect, useState } from "react";

import {
  DataModel,
  HydrogenModel,
  ModelSummaryPerYear,
  ProjectModelSummary,
} from "../../model/Model";
import {
  dropPadding,
  fillProjectYearsArray,
  mean,
  padArray,
} from "../../model/Utils";
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
import { InputFields } from "../../types";
import BasicTable from "./BasicTable";
import CostBarChart from "./CostBarChart";
import CostBreakdownDoughnutChart from "./CostBreakdownDoughnutChart";
import CostLineChart from "./CostLineChart";
import DurationCurve from "./DurationCurve";
import HourlyCapacityFactors from "./HourlyCapacityFactors";
import {
  calculateBatteryCapex,
  calculateCapex,
  cashFlowAnalysis,
  cumulativeStackReplacementYears,
  getIndirectCost,
  getOpexPerYearInflation,
  getOpexPerYearInflationConstant,
  getOpexPerYearInflationWithAdditionalCost,
  getReplacementCostOverProjectLife,
  getSummedDiscountForOpexCost,
  getSummedDiscountForOpexValues,
  maxDegradationStackReplacementYears,
  projectYears,
  roundToNearestThousand,
  sales,
} from "./cost-functions";

export interface Props {
  data?: InputFields;
  loadSolar: () => Promise<any[]>;
  loadWind: () => Promise<any[]>;
}

interface DownloadedData {
  solarData: any[];
  windData: any[];
}

const isSolar = (tech: string): boolean => tech !== "Wind";
const isWind = (tech: string): boolean => tech !== "Solar";

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
      if (solar.length !== 8760) {
        console.error("Solar data is not 8760 rows in length");
      }

      if (wind.length !== 8760) {
        console.error("Wind data is not 8760 rows in length");
      }
      setState({ solarData: solar, windData: wind });
    });
  }, [props]);

  if (!props.data) {
    return null;
  }

  const {
    electrolyserNominalCapacity,
    electrolyserReferenceCapacity,
    electrolyserReferencePurchaseCost,
    electrolyserCostReductionWithScale,
    electrolyserReferenceFoldIncrease,
    solarNominalCapacity,
    solarReferenceCapacity,
    solarPVFarmReferenceCost,
    solarPVCostReductionWithScale,
    solarReferenceFoldIncrease,
    windNominalCapacity,
    windReferenceCapacity,
    windFarmReferenceCost,
    windCostReductionWithScale,
    windReferenceFoldIncrease,
    batteryRatedPower = 0,
    batteryNominalCapacity,
    batteryMinCharge = 0,
    batteryCosts,
    batteryEfficiency,
    solarOpex = 0,
    windOpex = 0,
    additionalUpfrontCosts,
    additionalAnnualCosts,
    additionalTransmissionCharges = 0,
    batteryReplacementCost = 0,
    batteryLifetime = 0,
    plantLife,
    durationOfStorage,
    timeBetweenOverloading,
    maximumLoadWhenOverloading,
    electrolyserMinimumLoad,
    electrolyserMaximumLoad,
    location,
    electrolyserWaterCost,
    stackReplacementType,
    stackLifetime,
    stackDegradation,
    maximumDegradationBeforeReplacement,
    waterRequirementOfElectrolyser,
    discountRate,
    salesMargin,
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
    secCorrectionFactor = 0,
    principalPPACost = 0,
  } = props.data;

  const gridConnected: boolean = props.data.gridConnected === "true";
  const ppaAgreement: boolean = props.data.ppaAgreement === "true";

  const dataModel: DataModel = {
    batteryLifetime,
    batteryMinCharge,
    batteryEfficiency,
    durationOfStorage,
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
    elecEff: secCorrectionFactor,
  };

  const model = new HydrogenModel(dataModel, state.solarData, state.windData);

  let summary: ProjectModelSummary = model.calculateHydrogenModel(plantLife);
  let hourlyOperations = model.getHourlyOperations();

  // CAPEX charts
  const electrolyserCAPEX = calculateCapex(
    electrolyserNominalCapacity,
    electrolyserReferenceCapacity,
    electrolyserReferencePurchaseCost,
    electrolyserCostReductionWithScale,
    electrolyserReferenceFoldIncrease
  );

  const { technology } = props.data;

  const solarCAPEX = isSolar(technology)
    ? calculateCapex(
        solarNominalCapacity,
        solarReferenceCapacity,
        solarPVFarmReferenceCost,
        solarPVCostReductionWithScale,
        solarReferenceFoldIncrease
      )
    : 0;
  const windCAPEX = isWind(technology)
    ? calculateCapex(
        windNominalCapacity,
        windReferenceCapacity,
        windFarmReferenceCost,
        windCostReductionWithScale,
        windReferenceFoldIncrease
      )
    : 0;
  const powerPlantCAPEX = solarCAPEX + windCAPEX;

  const batteryCAPEX = calculateBatteryCapex(
    batteryRatedPower,
    batteryNominalCapacity,
    batteryCosts
  );

  const gridConnectionCost = props.data.gridConnectionCost || 0;

  const electrolyserEpcCost = getIndirectCost(
    electrolyserCAPEX,
    props.data.electrolyserEpcCosts
  );
  const electrolyserLandCost = getIndirectCost(
    electrolyserCAPEX,
    props.data.electrolyserLandProcurementCost
  );

  const solarEpcCost = getIndirectCost(solarCAPEX, props.data.solarEpcCosts);
  const solarLandCost = getIndirectCost(
    solarCAPEX,
    props.data.solarLandProcurementCost
  );

  const windEpcCost = getIndirectCost(windCAPEX, props.data.windEpcCosts);
  const windLandCost = getIndirectCost(
    windCAPEX,
    props.data.windLandProcurementCost
  );

  const powerPlantEpcCost = solarEpcCost + windEpcCost;
  const powerPlantLandCost = solarLandCost + windLandCost;

  const batteryEpcCost = getIndirectCost(
    batteryCAPEX,
    props.data.batteryEpcCosts
  );
  const batteryLandCost = getIndirectCost(
    batteryCAPEX,
    props.data.batteryLandProcurementCost
  );

  const totalIndirectCosts =
    electrolyserEpcCost +
    electrolyserLandCost +
    solarEpcCost +
    solarLandCost +
    windEpcCost +
    windLandCost;

  const electrolyserOMCost = roundToNearestThousand(
    (props.data.electrolyserOMCost / 100) * electrolyserCAPEX
  );

  // Stack Lifetime
  const stackReplacementYears: number[] =
    stackReplacementType === "Maximum Degradation Level"
      ? maxDegradationStackReplacementYears(
          stackDegradation,
          maximumDegradationBeforeReplacement,
          plantLife
        )
      : cumulativeStackReplacementYears(
          summary[`${TOTAL_OPERATING_TIME}`],
          stackLifetime,
          plantLife
        );

  const electrolyserStackReplacementCost =
    (props.data.electrolyserStackReplacement / 100) * electrolyserCAPEX;

  const stackReplacementCostsOverProjectLife =
    getReplacementCostOverProjectLife(
      electrolyserStackReplacementCost,
      (year: number) => stackReplacementYears.includes(year),
      plantLife
    );

  const electrolyserOpex = getOpexPerYearInflationWithAdditionalCost(
    electrolyserOMCost,
    inflationRate,
    plantLife,
    stackReplacementCostsOverProjectLife
  );

  const solarOpexCost = isSolar(technology)
    ? roundToNearestThousand(solarOpex * solarNominalCapacity)
    : 0;
  const windOpexCost = isWind(technology)
    ? roundToNearestThousand(windOpex * windNominalCapacity)
    : 0;
  const powerplantOpex = getOpexPerYearInflationConstant(
    solarOpexCost + windOpexCost,
    inflationRate,
    plantLife
  );

  const additionalOpex = getOpexPerYearInflationConstant(
    additionalAnnualCosts,
    inflationRate,
    plantLife
  );

  // Battery costs
  const batteryOMCost: number = roundToNearestThousand(
    (props.data.batteryOMCost || 0) * batteryRatedPower
  );
  const actualBatteryReplacementCost =
    (batteryReplacementCost / 100) * batteryCAPEX;
  const shouldAddBatteryReplacementCost = (year: number): boolean =>
    batteryLifetime > 0 && year % batteryLifetime === 0 && year < plantLife;
  const batteryReplacementCostsOverProjectLife =
    getReplacementCostOverProjectLife(
      actualBatteryReplacementCost,
      shouldAddBatteryReplacementCost,
      plantLife
    );

  const batteryOpex =
    batteryRatedPower > 0
      ? getOpexPerYearInflationWithAdditionalCost(
          batteryOMCost,
          inflationRate,
          plantLife,
          batteryReplacementCostsOverProjectLife
        )
      : Array(plantLife).fill(0);

  const electricityProduced: number[] = summary[`${ENERGY_OUTPUT}`];
  const electricityConsumed: number[] = summary[`${ENERGY_INPUT}`];
  const electricityConsumedByBattery: number[] = summary[`${BATTERY_OUTPUT}`];

  const gridConnectionCapex =
    gridConnected || ppaAgreement ? gridConnectionCost : 0;
  const gridConnectionOpex: number[] = gridConnected
    ? fillProjectYearsArray(
        plantLife,
        (i) =>
          additionalTransmissionCharges *
          (electricityConsumed[i] + electricityConsumedByBattery[i])
      )
    : Array(plantLife).fill(0);

  // Check for PPA Agreement
  const totalPPACost = ppaAgreement
    ? principalPPACost + additionalTransmissionCharges
    : 0;
  const electricityOMCost: number[] = fillProjectYearsArray(
    plantLife,
    (i) =>
      totalPPACost * (electricityConsumed[i] + electricityConsumedByBattery[i])
  );
  const electricityPurchase = getOpexPerYearInflation(
    electricityOMCost,
    inflationRate,
    plantLife
  );

  const h2Produced =
    props.data.profile === "Fixed"
      ? summary[`${HYDROGEN_OUTPUT_FIXED}`]
      : summary[`${HYDROGEN_OUTPUT_VARIABLE}`];
  const waterOMCost: number[] = fillProjectYearsArray(
    plantLife,
    (i) =>
      electrolyserWaterCost * waterRequirementOfElectrolyser * h2Produced[i]
  );
  const waterCost = getOpexPerYearInflation(
    waterOMCost,
    inflationRate,
    plantLife
  );

  const paddedH2Produced: number[] = padArray(h2Produced);
  const paddedElectricityProduced: number[] = padArray(electricityProduced);

  const totalCapexCost =
    electrolyserCAPEX +
    powerPlantCAPEX +
    batteryCAPEX +
    additionalUpfrontCosts +
    gridConnectionCapex;
  const totalEpcCost = electrolyserEpcCost + powerPlantEpcCost + batteryEpcCost;
  const totalLandCost =
    electrolyserLandCost + powerPlantLandCost + batteryLandCost;

  const totalOpex = electrolyserOpex.map(
    (_: number, i: number) =>
      electrolyserOMCost +
      solarOpexCost +
      windOpexCost +
      batteryOMCost +
      electricityOMCost[i] +
      // TODO: Need to figure out a way to include this
      // electricitySales[i] +
      waterOMCost[i] +
      gridConnectionOpex[i] +
      // TODO check if this is correct. Strangely taking not discounted cost here.
      additionalAnnualCosts +
      stackReplacementCostsOverProjectLife[i] +
      batteryReplacementCostsOverProjectLife[i]
  );

  const oxygenSalePrice: number[] = fillProjectYearsArray(
    plantLife,
    (i) => 8 * h2Produced[i] * oxygenRetailPrice
  );

  const {
    lch2,
    h2RetailPrice,
    // totalCost,
    // totalCostWithDiscount,
    // h2ProducedKgLCA,
    h2Sales,
    electricitySales,
    oxygenSales,
    annualSales,
    hydrogenProductionCost,
  } = sales(
    padArray(oxygenSalePrice),
    averageElectricitySpotPrice,
    inflationRate / 100,
    totalCapexCost,
    totalEpcCost,
    totalLandCost,
    plantLife,
    discountRate / 100,
    salesMargin,
    totalOpex,
    paddedH2Produced,
    paddedElectricityProduced
  );

  const cashFlow = cashFlowAnalysis(
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
    plantLife,
    inflationRate / 100
  );

  const lcPowerPlantCAPEX = powerPlantCAPEX / hydrogenProductionCost;
  const lcElectrolyserCAPEX = electrolyserCAPEX / hydrogenProductionCost;
  const lcIndirectCosts = totalIndirectCosts / hydrogenProductionCost;
  const lcPowerPlantOPEX =
    getSummedDiscountForOpexCost(
      solarOpexCost + windOpexCost,
      discountRate,
      plantLife
    ) / hydrogenProductionCost;
  const lcElectrolyserOPEX =
    getSummedDiscountForOpexCost(electrolyserOMCost, discountRate, plantLife) /
    hydrogenProductionCost;

  const batteryCostPerYear: number[] = fillProjectYearsArray(
    plantLife,
    (i) => batteryOMCost + batteryReplacementCostsOverProjectLife[i]
  );

  const lcBattery =
    (batteryCAPEX +
      getSummedDiscountForOpexValues(
        batteryCostPerYear,
        discountRate,
        plantLife
      )) /
    hydrogenProductionCost;
  const lcWater =
    getSummedDiscountForOpexValues(waterOMCost, discountRate, plantLife) /
    hydrogenProductionCost;
  const lcAdditionalCosts =
    (additionalUpfrontCosts +
      getSummedDiscountForOpexCost(
        additionalAnnualCosts,
        discountRate,
        plantLife
      )) /
    hydrogenProductionCost;
  const lcOxygenSale =
    getSummedDiscountForOpexValues(oxygenSalePrice, discountRate, plantLife) /
    hydrogenProductionCost;

  const lcStackReplacement =
    getSummedDiscountForOpexValues(
      stackReplacementCostsOverProjectLife,
      discountRate,
      plantLife
    ) / hydrogenProductionCost;

  const ppaCostOfElectricityConsumed = fillProjectYearsArray(
    plantLife,
    (i) =>
      (electricityConsumed[i] + electricityConsumedByBattery[i]) *
      principalPPACost
  );
  const lcElectricityPurchase = ppaAgreement
    ? getSummedDiscountForOpexValues(
        ppaCostOfElectricityConsumed,
        discountRate,
        plantLife
      ) / hydrogenProductionCost
    : 0;

  // TODO: check in Retail mode
  const retailElectricitySalePrice = fillProjectYearsArray(
    plantLife,
    (i) => electricityProduced[i] * averageElectricitySpotPrice
  );
  const lcElectricitySale =
    getSummedDiscountForOpexValues(
      retailElectricitySalePrice,
      discountRate,
      plantLife
    ) / hydrogenProductionCost;

  const gridOpex = gridConnected
    ? getSummedDiscountForOpexValues(
        gridConnectionOpex,
        discountRate,
        plantLife
      )
    : 0;
  const lcGridConnection =
    (gridConnectionCapex + gridOpex) / hydrogenProductionCost;

  const { cumulativeCashFlow } = cashFlow;

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
          waterOMCost: padArray(waterOMCost),
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
          gridConnectionCost,
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
          solarEpcCost + windEpcCost,
          solarLandCost + windLandCost,
          batteryEpcCost,
          batteryLandCost,
        ]}
      />
      <CostLineChart
        title="Operating Costs"
        plantLife={plantLife}
        datapoints={[
          { label: "Electrolyser OPEX", data: electrolyserOpex },
          { label: "Power Plant OPEX", data: powerplantOpex },
          { label: "Battery OPEX", data: batteryOpex },
          { label: "Additional Annual Costs", data: additionalOpex },
          { label: "Water Costs", data: waterCost },
          { label: "Electricity Purchase", data: electricityPurchase },
        ]}
      />
      <CostLineChart
        title="Sales"
        plantLife={plantLife}
        datapoints={[
          { label: "Hydrogen Sales", data: dropPadding(h2Sales) },
          { label: "Electricity Sales", data: dropPadding(electricitySales) },
          { label: "Oxygen Sales", data: dropPadding(oxygenSales) },
          { label: "Total Sales", data: dropPadding(annualSales) },
        ]}
      />
      <CostBarChart
        title="Cash Flow Analysis"
        labels={["Startup"]
          .concat(projectYears(plantLife).map(String))
          .concat(["Decomissioning"])}
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
