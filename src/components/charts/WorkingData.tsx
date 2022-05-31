import "chart.js/auto";
import { useEffect, useState } from "react";
import { DataModel, HydrogenModel } from "../../model/Model";
import { activeYears, dropPadding } from "../../model/Utils";
import { InputFields } from "../../types";
import {
  cumulativeStackReplacementYears,
  calculateBatteryCapex,
  calculateCapex,
  getIndirectCost,
  getOpexPerYearInflation,
  getOpexPerYearInflationWithAdditionalCost,
  maxDegradationStackReplacementYears,
  roundToNearestThousand,
  cashFlowAnalysis,
  sales,
  projectYears,
  getSummedDiscountForOpexCost,
  getReplacementCostOverProjectLife,
  getSummedDiscountForOpexValues,
} from "./cost-functions";
import CostBarChart from "./CostBarChart";
import CostBreakdownDoughnutChart from "./CostBreakdownDoughnutChart";
import CostLineChart from "./CostLineChart";
import BasicTable from "./BasicTable";
import DurationCurve from "./DurationCurve";
import HourlyCapacityFactors from "./HourlyCapacityFactors";

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
    secAtNominalLoad = 0,
    secCorrectionFactor = 0,
    principalPPACost = 0,
  } = props.data;

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
    location,
    electrolyserMaximumLoad,
    electrolyserMinimumLoad,
    specCons: secAtNominalLoad,
    elecEff: secCorrectionFactor,
  };

  const model = new HydrogenModel(dataModel, state.solarData, state.windData);

  const hourlyOperations = model.calculateElectrolyserHourlyOperation();

  const summary = model.calculateElectrolyserOutput(hourlyOperations);
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
          summary["Total Time Electrolyser is Operating"] * 8760,
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
  const powerplantOpex = getOpexPerYearInflation(
    solarOpexCost + windOpexCost,
    inflationRate,
    plantLife
  );

  const additionalOpex = getOpexPerYearInflation(
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

  // Check for PPA Agreement
  const totalPPACost =
    (props.data.principalPPACost || 0) +
    (props.data.additionalTransmissionCharges || 0);
  const electricityOMCost =
    summary["Energy in to Electrolyser [MWh/yr]"] * totalPPACost;
  const electricityPurchase = getOpexPerYearInflation(
    electricityOMCost,
    inflationRate,
    plantLife
  );

  const h2Produced =
    props.data.profile === "Fixed"
      ? summary["Hydrogen Output for Fixed Operation [t/yr]"]
      : summary["Hydrogen Output for Variable Operation [t/yr"];
  const waterOMCost =
    h2Produced * electrolyserWaterCost * waterRequirementOfElectrolyser;
  const waterCost = getOpexPerYearInflation(
    waterOMCost,
    inflationRate,
    plantLife
  );

  const electricityProduced = summary["Surplus Energy [MWh/yr]"];
  const electricityConsumed = summary["Energy in to Electrolyser [MWh/yr]"];
  const h2Prod = activeYears(h2Produced, plantLife);
  const elecProduced = activeYears(electricityProduced, plantLife);
  const elecConsumed = activeYears(electricityConsumed, plantLife);

  const totalCapexCost =
    electrolyserCAPEX +
    powerPlantCAPEX +
    batteryCAPEX +
    additionalUpfrontCosts +
    gridConnectionCost;
  const totalEpcCost = electrolyserEpcCost + powerPlantEpcCost + batteryEpcCost;
  const totalLandCost =
    electrolyserLandCost + powerPlantLandCost + batteryLandCost;
  const totalOpex = electrolyserOpex.map(
    (_: number, i: number) =>
      electrolyserOMCost +
      solarOpexCost +
      windOpexCost +
      batteryOMCost +
      waterOMCost +
      electricityOMCost +
      // TODO check if this is correct. Strangely taking not discounted cost here.
      additionalAnnualCosts +
      stackReplacementCostsOverProjectLife[i] +
      batteryReplacementCostsOverProjectLife[i]
  );

  const oxygenSalePrice = 8 * h2Produced * oxygenRetailPrice;

  const {
    lch2,
    h2RetailPrice,
    totalCost,
    totalCostWithDiscount,
    h2Moneys,
    h2Sales,
    electricitySales,
    oxygenSales,
    annualSales,
    hydrogenProductionCost,
  } = sales(
    oxygenSalePrice,
    averageElectricitySpotPrice,
    inflationRate / 100,
    totalCapexCost,
    totalEpcCost,
    totalLandCost,
    plantLife,
    discountRate / 100,
    salesMargin,
    totalOpex,
    h2Prod,
    elecProduced,
    elecConsumed
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

  const batteryCostPerYear: number[] = new Array(plantLife)
    .fill(batteryOMCost)
    .map((cost, i) => cost + batteryReplacementCostsOverProjectLife[i]);

  const lcBattery =
    (batteryCAPEX +
      getSummedDiscountForOpexValues(
        batteryCostPerYear,
        discountRate,
        plantLife
      )) /
    hydrogenProductionCost;
  const lcWater =
    getSummedDiscountForOpexCost(waterOMCost, discountRate, plantLife) /
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
    getSummedDiscountForOpexCost(oxygenSalePrice, discountRate, plantLife) /
    hydrogenProductionCost;

  const lcStackReplacement =
    getSummedDiscountForOpexValues(
      stackReplacementCostsOverProjectLife,
      discountRate,
      plantLife
    ) / hydrogenProductionCost;

  // NOTE: This will change once electricity consumed becomes a list
  // TODO: Need to check we are in PPA mode
  const lcElectricityPurchase =
    getSummedDiscountForOpexCost(
      electricityConsumed * principalPPACost,
      discountRate,
      plantLife
    ) / hydrogenProductionCost;
  // TODO: check in Retail mode
  const lcElectricitySale =
    getSummedDiscountForOpexCost(
      (electricityConsumed - electricityProduced) * averageElectricitySpotPrice,
      discountRate,
      plantLife
    ) / hydrogenProductionCost;

  // Add CAPEX if PPA or Grid, and transmission charge if Grid
  const lcGridConnection =
    (gridConnectionCost +
      getSummedDiscountForOpexCost(
        additionalTransmissionCharges * electricityConsumed,
        discountRate,
        plantLife
      )) /
    hydrogenProductionCost;

  const { cumulativeCashFlow } = cashFlow;

  return (
    <div>
      <BasicTable
        data={{
          "Power Plant Capacity Factor": [
            summary["Generator Capacity Factor"] * 100,
          ],
          "Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)": [
            summary["Time Electrolyser is at its Rated Capacity"] * 100,
          ],
          "Total Time Electrolyser is Operating (% of 8760 hrs/yr)": [
            summary["Total Time Electrolyser is Operating"] * 100,
          ],
          "Electrolyser Capacity Factor": [
            summary["Achieved Electrolyser Capacity Factor"] * 100,
          ],
          "Energy Consumed by Electrolyser (MWh/yr)": [electricityConsumed],
          "Excess Energy Not Utilised by Electrolyser (MWh/yr)": [
            electricityProduced,
          ],
          "Hydrogen Output [t/yr]": [h2Produced],
          LCH2: [lch2],
          "H2 Retail Price": [h2RetailPrice],
        }}
      />
      <BasicTable
        data={{
          h2Prod,
          elecProduced,
          elecConsumed,
          h2Sales,
          electricitySales,
          oxygenSales,
          annualSales,
          totalCost,
          totalCostWithDiscount,
          h2Moneys,
          ...cashFlow,
        }}
      />
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
        plantLife={plantLife}
        datapoints={[
          { label: "Electrolyser OPEX", data: electrolyserOpex },
          { label: "Powerplant OPEX", data: powerplantOpex },
          { label: "Battery OPEX", data: batteryOpex },
          { label: "Additional Annual Costs", data: additionalOpex },
          { label: "Electricity Purchase", data: electricityPurchase },
          { label: "Water Cost", data: waterCost },
        ]}
      />
      <CostLineChart
        plantLife={plantLife}
        datapoints={[
          { label: "Hydrogen Sales", data: dropPadding(h2Sales) },
          { label: "Electricity Sales", data: dropPadding(electricitySales) },
          { label: "Oxygen Sales", data: dropPadding(oxygenSales) },
          { label: "Total Sales", data: dropPadding(annualSales) },
        ]}
      />
      <CostBarChart
        labels={["startup"]
          .concat(projectYears(plantLife).map(String))
          .concat(["decomissioning"])}
        datapoints={[
          {
            label: "Cash Flow Analysis",
            data: cumulativeCashFlow,
          },
        ]}
      />
      <CostBarChart
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
