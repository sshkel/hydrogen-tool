import "chart.js/auto";
import { Doughnut } from "react-chartjs-2";

import { colors } from "../input/colors";

interface Props {
  title: string;
  labels: string[];
  data: number[];
}

export default function CostBreakdownDoughnutChart(props: Props) {
  const data = {
    labels: props.labels,
    datasets: [
      {
        label: "Cost",
        backgroundColor: colors,
        data: props.data,
      },
    ],
  };

  return (
    <Doughnut
      data={data}
      options={{
        maintainAspectRatio: false,
      }}
    />
  );
}
