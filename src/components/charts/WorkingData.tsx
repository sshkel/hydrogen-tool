import "chart.js/auto";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { loadSolar, loadWind } from "../../model/DataLoader";
import {
  cumulativeStackReplacementYears,
  DataModel,
  HydrogenModel,
  maxDegradationStackReplacementYears,
  first,
  decomissioning,
  projectYears,
  buttFirst,
} from "../../model/Model";
import { SECType, StackReplacementType, Technology } from "../../types";
import {
  calculateBatteryCapex,
  calculateCapex,
  getIndirectCost,
  getOpexPerYear,
  getOpexPerYearWithAdditionalCostPredicate,
  roundToNearestThousand,
} from "./cost-functions";
import CostBreakdownDoughnutChart from "./CostBreakdownDoughnutChart";
import CostLineChart from "./CostLineChart";

interface Props {
  data?: {
    additionalUpfrontCosts;
    additionalAnnualCosts;
    batteryEpcCosts?;
    batteryEfficiency;
    batteryMinCharge?;
    batteryLandProcurementCost?;
    batteryRatedPower?;
    batteryCosts?;
    batteryOMCost?;
    batteryReplacementCost?;
    batteryLifetime?;
    discountRate;
    durationOfStorage;
    electrolyserCostReductionWithScale;
    electrolyserEpcCosts;
    electrolyserLandProcurementCost;
    electrolyserReferenceFoldIncrease;
    electrolyserOMCost;
    electrolyserStackReplacement;
    gridConnectionCost;
    batteryNominalCapacity?;
    electrolyserNominalCapacity;
    solarNominalCapacity;
    windNominalCapacity;
    solarReferenceCapacity;
    windReferenceCapacity;
    electrolyserReferenceCapacity;
    electrolyserReferencePurchaseCost;
    solarPVFarmReferenceCost;
    windFarmReferenceCost;
    solarEpcCosts;
    solarLandProcurementCost;
    solarPVCostReductionWithScale;
    solarReferenceFoldIncrease;
    solarOpex?;
    stackReplacementType: StackReplacementType;
    stackLifetime;
    stackDegradation;
    maximumDegradationBeforeReplacement;
    technology: Technology;
    totalNominalPowerPlantCapacity;
    electrolyserWaterCost;
    windCostReductionWithScale;
    windEpcCosts;
    windLandProcurementCost;
    windReferenceFoldIncrease;
    windOpex?;
    plantLife;
    additionalTransmissionCharges?;
    principalPPACost?;
    profile: SECType;
    region: string;
    electrolyserMaximumLoad;
    electrolyserMinimumLoad;
    timeBetweenOverloading;
    maximumLoadWhenOverloading;
    waterRequirementOfElectrolyser;
    h2RetailPrice;
    oxygenRetailPrice;
    averageElectricitySpotPrice;
    shareOfTotalInvestmentFinancedViaEquity;
    directEquityShare;
    indirectEquityShare;
    shareOfTotalInvestmentFinancedViaLoan;
    salvageCostShare;
    decommissioningCostShare;
    loanTerm;
    interestOnLoan;
    capitalDepreciaitonProfile: string;
    taxRate;
    projectLife;
    inflationRate;
  };
}

interface DownloadedData {
  solarData: any[];
  windData: any[];
}

const isSolar = (tech: string): boolean => tech !== "Wind";
const isWind = (tech: string): boolean => tech !== "Solar";

export default function WorkingData(props: Props) {
  const [data, setState] = useState<DownloadedData>({
    solarData: [],
    windData: [],
  });

  // TODO: Error handling if we can't load solar and wind data
  // TODO: Add some validation for correct number of rows
  useEffect(() => {
    Promise.all([loadSolar(), loadWind()]).then(([solar, wind]) => {
      if (solar.length !== 8760) {
        console.error("Solar data is not 8760 rows in length");
      }

      if (wind.length !== 8760) {
        console.error("Wind data is not 8760 rows in length");
      }

      setState({ solarData: solar, windData: wind });
    });
  }, []);

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
    batteryCosts,
    batteryEfficiency,
    solarOpex = 0,
    windOpex = 0,
    additionalUpfrontCosts,
    additionalAnnualCosts,
    batteryReplacementCost = 0,
    batteryLifetime = 0,
    discountRate,
    plantLife,
    durationOfStorage,
    timeBetweenOverloading,
    maximumLoadWhenOverloading,
    electrolyserMinimumLoad,
    electrolyserMaximumLoad,
    region,
    electrolyserWaterCost,
    stackReplacementType,
    stackLifetime,
    stackDegradation,
    maximumDegradationBeforeReplacement,
    waterRequirementOfElectrolyser,
    h2RetailPrice,
    oxygenRetailPrice,
    averageElectricitySpotPrice,
    shareOfTotalInvestmentFinancedViaEquity,
    directEquityShare,
    indirectEquityShare,
    shareOfTotalInvestmentFinancedViaLoan,
    salvageCostShare,
    decommissioningCostShare,
    loanTerm,
    interestOnLoan,
    capitalDepreciaitonProfile,
    taxRate,
    projectLife,
    inflationRate,
  } = props.data;

  const dataModel: DataModel = {
    batteryLifetime,
    batteryMinCharge: props.data.batteryMinCharge || 0,
    batteryEfficiency,
    durationOfStorage,
    batteryRatedPower,
    timeBetweenOverloading,
    maximumLoadWhenOverloading,
    electrolyserNominalCapacity,
    solarNominalCapacity,
    windNominalCapacity,
    region,
    electrolyserMaximumLoad,
    electrolyserMinimumLoad,
    // no clue what these are in the excel
    specCons: 4.5,
    elecEff: 83,
    H2VoltoMass: 0.089,
  };

  const model = new HydrogenModel(dataModel, data.solarData, data.windData);
  const hourlyOperations = model.calculateElectrolyserHourlyOperation();
  const summary = model.calculateElectrolyserOutput(hourlyOperations);

  // Duration curve charts
  const generatorData = {
    labels: Array.from(Array(hourlyOperations.Generator_CF.length).keys()).map(
      (num) => ((num / 8760) * 100).toFixed(0)
    ),
    datasets: [
      {
        label: "Generator",
        data: hourlyOperations.Generator_CF.map((x) => x * 100).sort(
          (a, b) => b - a
        ),
        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
    options: {
      ticks: {
        stepSize: 100,
      },
    },
  };

  const electrolyserData = {
    labels: Array.from(
      Array(hourlyOperations.Electrolyser_CF.length).keys()
    ).map((num) => ((num / 8760) * 100).toFixed(0)),
    datasets: [
      {
        label: "Electrolyser",
        data: hourlyOperations.Electrolyser_CF.map((x) => x * 100).sort(
          (a, b) => b - a
        ),
        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
    options: {
      ticks: {
        stepSize: 100,
      },
    },
  };

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

  const electrolyserOMCost =
    (props.data.electrolyserOMCost / 100) * electrolyserCAPEX;

  // Stack Lifetime
  const stackReplacementYears: number[] =
    stackReplacementType === "Cumulative Hours"
      ? cumulativeStackReplacementYears(
          summary["Total Time Electrolyser is Operating"] * 8760,
          stackLifetime,
          plantLife
        )
      : maxDegradationStackReplacementYears(
          stackDegradation,
          maximumDegradationBeforeReplacement,
          plantLife
        );

  const electrolyserStackReplacementCost =
    (props.data.electrolyserStackReplacement / 100) * electrolyserCAPEX;

  const electrolyserOpex = getOpexPerYearWithAdditionalCostPredicate(
    electrolyserOMCost,
    discountRate,
    plantLife,
    (year: number): boolean => stackReplacementYears.includes(year),
    electrolyserStackReplacementCost
  );

  const solarOpexCost = isSolar(technology)
    ? roundToNearestThousand(solarOpex * solarNominalCapacity)
    : 0;
  const windOpexCost = isWind(technology)
    ? roundToNearestThousand(windOpex * windNominalCapacity)
    : 0;
  const powerplantOpex = getOpexPerYear(
    solarOpexCost + windOpexCost,
    discountRate,
    plantLife
  );

  const additionalOpex = getOpexPerYear(
    additionalAnnualCosts,
    discountRate,
    plantLife
  );

  // Battery costs
  const batteryOMCost: number = roundToNearestThousand(
    (props.data.batteryOMCost || 0) * batteryRatedPower
  );
  const actualBatteryReplacementCost =
    (batteryReplacementCost / 100) * batteryCAPEX;
  const shouldAddBatteryReplacementCost = (year: number): boolean =>
    batteryLifetime > 0 && year % batteryLifetime === 0;
  const batteryOpex =
    batteryRatedPower > 0
      ? getOpexPerYearWithAdditionalCostPredicate(
          batteryOMCost,
          discountRate,
          plantLife,
          shouldAddBatteryReplacementCost,
          actualBatteryReplacementCost
        )
      : Array(plantLife).fill(0);

  // Check for PPA Agreement
  const totalPPACost =
    (props.data.principalPPACost || 0) +
    (props.data.additionalTransmissionCharges || 0);
  const electricityPurchase = getOpexPerYear(
    summary["Energy in to Electrolyser [MWh/yr]"] * totalPPACost,
    discountRate,
    plantLife
  );

  const hydrogenCost =
    props.data.profile === "Fixed"
      ? summary["Hydrogen Output for Fixed Operation [t/yr]"]
      : summary["Hydrogen Output for Variable Operation [t/yr"];
  const waterCost = getOpexPerYear(
    hydrogenCost * electrolyserWaterCost * waterRequirementOfElectrolyser,
    discountRate,
    plantLife
  );

  // guessing because I don't have excel but I think these come from summary
  const h2Produced =
    props.data.profile === "Fixed"
      ? summary["Hydrogen Output for Fixed Operation [t/yr]"]
      : summary["Hydrogen Output for Variable Operation [t/yr"];
  const electricityProduced = summary["Surplus Energy [MWh/yr]"];
  // TODO definitly wrong, but not sure what it is without excel
  const electricityConsumed = summary["Surplus Energy [MWh/yr]"];
  const { h2Sales, electricitySales, oxygenSales, annualSales } = sales(
    h2RetailPrice,
    oxygenRetailPrice,
    averageElectricitySpotPrice,
    buttFirst(h2Produced, plantLife),
    buttFirst(electricityProduced, plantLife),
    buttFirst(electricityConsumed, plantLife)
  );

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
      electrolyserOpex[i] +
      powerplantOpex[i] +
      batteryOpex[i] +
      waterCost[i] +
      electricityPurchase[i] +
      // TODO check if this is correct. Strangely taking not discounted cost here.
      additionalAnnualCosts
  );

  const cumulativeCashFlow = cashFlowAnalysis(
    annualSales,
    totalOpex,
    totalCapexCost,
    totalEpcCost,
    totalLandCost,
    shareOfTotalInvestmentFinancedViaEquity,
    directEquityShare,
    indirectEquityShare,
    shareOfTotalInvestmentFinancedViaLoan,
    salvageCostShare,
    decommissioningCostShare,
    loanTerm,
    interestOnLoan,
    capitalDepreciaitonProfile,
    taxRate,
    projectLife,
    inflationRate
  );
  return (
    <div>
      <Line data={generatorData} />
      <Line data={electrolyserData} />
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
    </div>
  );
}

function cashFlowAnalysis(
  annualSales: number[],
  totalOpex: number[],
  totalCapexCost: number,
  totalEpcCost: number,
  totalLandCost: number,
  shareOfTotalInvestmentFinancedViaEquity: number,
  directEquityShare: number,
  indirectEquityShare: number,
  shareOfTotalInvestmentFinancedViaLoan: number,
  salvageCostShare: number,
  decommissioningCostShare: number,
  loanTerm: number,
  interestOnLoan: number,
  capitalDepreciaitonProfile: string,
  taxRate: number,
  projectLife: number,
  inflationRate: number
) {
  const inflation = applyInflation(inflationRate);
  // sales
  const salesTotal = inflation(annualSales);

  // TODO double check that all arrays have 0th and decomissioning years
  // net investments
  // direct equity payment

  const totalInvestmentRequired = totalCapexCost + totalEpcCost + totalLandCost;
  const totalEquity = roundToNearestThousand(
    totalInvestmentRequired * shareOfTotalInvestmentFinancedViaEquity
  );
  const directEquityPayment = first(
    roundToNearestThousand(totalEquity * directEquityShare),
    projectLife
  );

  // indirect equity
  // Equity supported externally (grants etc) - Indirect equity is considered as a positive cash flow
  const indirectEquity = first(
    roundToNearestThousand(totalEquity * indirectEquityShare),
    projectLife
  );
  // cost financed via loan
  const totalLoan =
    totalInvestmentRequired * shareOfTotalInvestmentFinancedViaLoan;
  const costFinancedViaLoan = first(totalLoan, projectLife);

  // salvage cost
  const totalSalvageCost = totalInvestmentRequired * salvageCostShare;
  const salvageCost = decomissioning(totalSalvageCost, projectLife);

  // decomissioning cost
  const decomissioningCost = decomissioning(
    totalInvestmentRequired * decommissioningCostShare,
    projectLife
  );

  // cost of setting up the project
  const netInvestment = directEquityPayment.map(
    (_: number, i: number) =>
      directEquityPayment[i] +
      decomissioningCost[i] -
      // TODO check if costFinancedViaLoan should be positive since it's money you get in and repay later every year
      costFinancedViaLoan[i] -
      indirectEquity[i] -
      salvageCost[i]
  );

  // loan liabilities
  // loan repayment
  const loanRepayment = totalLoan / loanTerm;
  const totalLoanRepayment = projectYears(projectLife).map((year: number) => {
    if (year < loanTerm) {
      return loanRepayment;
    }
    return 0;
  });
  // interest paid on loan
  const interestPaidOnLoan = projectYears(projectLife).map((year: number) => {
    if (year < loanTerm) {
      return loanRepayment * (1 + interestOnLoan) ** year - loanRepayment;
    }
    return 0;
  });
  // fixed opex
  const totalOpexWithInflation = inflation(totalOpex);
  // depreciation
  const incomePreDepreciation = directEquityPayment.map(
    (x: number, i: number) => {
      return (
        salesTotal[i] -
        netInvestment[i] -
        totalLoanRepayment[i] -
        interestPaidOnLoan[i] -
        totalOpexWithInflation[i]
      );
    }
  );
  const totalDepreciableCapex = totalCapexCost + totalEpcCost;
  const conversionFactors = getConversionFactors(
    capitalDepreciaitonProfile,
    projectLife
  );
  const depreciation = projectYears(projectLife).map(
    (x: number, i: number) => totalDepreciableCapex + conversionFactors[i]
  );
  // tax liabilities
  const taxableIncome = incomePreDepreciation.map(
    (_: number, i: number) =>
      // TODO check that if totalLoanRepayment should include total interest paid
      incomePreDepreciation[i] + depreciation[i] - totalLoanRepayment[i]
  );

  const tax = taxableIncome.map((_: number, i: number) => {
    if (taxableIncome[i] < 0) {
      return 0;
    }
    return taxableIncome[i] * taxRate;
  });
  // net cash flows
  // after tax and depreciation
  const incomeAfterTaxAndDepreciation = incomePreDepreciation.map(
    (_: number, i: number) => incomePreDepreciation[i] - tax[i]
  );

  const cumulativeSum = (
    (sum: number) => (value: number) =>
      (sum += value)
  )(0);
  const cumulativeCashFlow = incomeAfterTaxAndDepreciation.map(cumulativeSum);
  return cumulativeCashFlow;
}

function sales(
  h2RetailPrice: number,
  oxygenRetailPrice: number,
  averageElectricitySpotPrice: number,
  h2Produced: number[],
  electricityProduced: number[],
  electricityConsumed: number[]
) {
  // The values can be used to create sales graphs.
  const h2Sales = h2Produced.map((x) => x * 1000 * h2RetailPrice);

  const electricitySales = electricityProduced.map(
    (_: number, i: number) =>
      (electricityProduced[i] - electricityConsumed[i]) *
      averageElectricitySpotPrice
  );
  const oxygenSales = h2Produced.map(
    (_: number, i: number) => 8 * h2Produced[i] * oxygenRetailPrice
  );

  const annualSales = h2Sales.map(
    (_: number, i: number) => h2Sales[i] + electricitySales[i] + oxygenSales[i]
  );
  return {
    h2Sales,
    electricitySales,
    oxygenSales,
    annualSales,
  };
}

const applyInflation = (rate: number) => {
  return (values: number[]) => {
    return values.map(
      // i corresponds to year
      (x: number, i: number) => {
        // zero-th year is always skipped as it signifies upfront costs rather than actual operations
        if (i === 0) {
          return x;
        }
        return x * (1 + rate) ** i;
      }
    );
  };
};

const getConversionFactors = (
  capitalDepreciaitonProfile: string,
  projectLife: number
) => {
  // come from conversion factors tab
  // can probs use the formula instead of hardcoded table
  // https://xplaind.com/370120/macrs
  switch (capitalDepreciaitonProfile) {
    case "Straight Line": {
      return Array(projectLife).fill(1 / projectLife);
    }
    case "MACRs - 3 year Schedule": {
      return [0.3333, 0.4445, 0.1481, 0.0741];
    }
    case "MACRs - 5 year Schedule": {
      return [0.2, 0.32, 0.192, 0.1152, 0.1152, 0.0576];
    }
    case "MACRs - 7 year Schedule": {
      return [0.1429, 0.1749, 0.1249, 0.0893, 0.892, 0.893, 0.0446];
    }
    case "MACRs - 10 year Schedule": {
      return [
        0.1, 0.18, 0.144, 0.1152, 0.0922, 0.0737, 0.0655, 0.0655, 0.0656,
        0.0655, 0.0328,
      ];
    }
    case "MACRs - 15 year Schedule": {
      return [
        0.05, 0.095, 0.0855, 0.077, 0.0693, 0.0623, 0.059, 0.059, 0.0591, 0.059,
        0.0591, 0.059, 0.0591, 0.059, 0.0591, 0.0295,
      ];
    }
    case "MACRs - 20 year Schedule": {
      return [
        0.0375, 0.0722, 0.0668, 0.0618, 0.0571, 0.0529, 0.0489, 0.0452, 0.0446,
        0.0446, 0.0446, 0.0446, 0.0446, 0.0446, 0.0446, 0.0446, 0.0446, 0.0446,
        0.0446, 0.0446, 0.0223,
      ];
    }
    default: {
      throw new Error("Unknow depreciation profile");
    }
  }
};
