import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";

import { ProjectModelSummary } from "../../model/Model";
import {
  ELECTROLYSER_CF,
  POWER_PLANT_CF,
  RATED_CAPACITY_TIME,
  TOTAL_OPERATING_TIME,
} from "../../model/consts";
import { mean } from "../../utils";
import BasicTable from "../charts/BasicTable";

export function SummaryOfResultsPane(
  summary: ProjectModelSummary,
  electricityConsumed: number[],
  electricityProduced: number[],
  h2Produced: number[],
  lch2: number,
  netProfit: number,
  returnOnInvestment: number,
  h2RetailPrice: number
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
    <Card>
      <CardHeader title="Summary of results" />
      <BasicTable title="Summary of Results" data={summaryDict} />
    </Card>
  );
}
