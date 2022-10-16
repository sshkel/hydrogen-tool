import "chart.js/auto";
import { Bar } from "react-chartjs-2";

import { ChartData } from "../../types";
import { LIGHT_BLUE, addAlpha } from "../input/colors";

interface Props {
  title: string;
  labels: string[];
  datapoints: ChartData[];
}

export default function CostBarChart(props: Props) {
  const { title, labels, datapoints } = props;
  const graphData = {
    labels: labels,
    datasets: datapoints.map((point) => ({
      ...point,
      backgroundColor: addAlpha(LIGHT_BLUE, 0.6),
      borderColor: addAlpha(LIGHT_BLUE, 1),
    })),
    options: {
      ticks: {
        stepSize: 100,
      },
    },
  };

  return (
    <div>
      <Bar title={title} data={graphData} />
    </div>
  );
}
