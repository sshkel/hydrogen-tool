import { ChartOptions } from "chart.js";
import "chart.js/auto";
import dataLabelsPlugin from "chartjs-plugin-datalabels";
import { Doughnut } from "react-chartjs-2";

import { colors } from "../colors";

interface Props {
  title: string;
  items: { [key: string]: number };
}

export default function CostBreakdownDoughnutChart(props: Props) {
  const sortedItems = Object.entries(props.items)
    .sort(([, a], [, b]) => a - b)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

  const labels = [];
  const values = [];

  for (const [key, val] of Object.entries(sortedItems)) {
    if (val !== 0) {
      labels.push(key);
      values.push(val);
    }
  }

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Cost",
        backgroundColor: colors,
        data: values,
      },
    ],
  };

  const options: ChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as "bottom",
        title: {
          display: true,
          padding: 8,
        },
      },
      datalabels: {
        anchor: "end",
        align: "end",
        offset: 2,
        clip: false,
        color: "#848484",
        font: {
          size: 15,
          style: "italic",
          weight: "bold",
        },
        formatter: (val) => `$${val.toLocaleString("en-US")}`,
        // TODO: Highest index wins on overlap, investigate whether
        // to use a sort on the props for ascending values.
        // Used to only display one label if overlap occurs
        display: "auto",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return ` ${context.label}: $${context.formattedValue}`;
          },
        },
      },
    },
    layout: {
      padding: { top: 30 },
    },
  };

  return (
    <Doughnut
      data={data}
      plugins={[dataLabelsPlugin as any]}
      options={options}
    />
  );
}
