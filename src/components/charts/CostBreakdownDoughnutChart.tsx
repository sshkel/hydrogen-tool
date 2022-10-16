import "chart.js/auto";
import { Doughnut } from "react-chartjs-2";

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
        backgroundColor: [
          "#0D56D9",
          "#5792CF",
          "#22C6F0",
          "#F2E68F",
          "#FF0000",
          "#A21A24",
        ],
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
