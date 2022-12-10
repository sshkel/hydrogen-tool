import "chart.js/auto";
import { Line } from "react-chartjs-2";

import { ChartData } from "../../types";
import { checkLength } from "../../utils";
import { colors } from "../colors";

interface Props {
  title: string;
  projectTimeline: number;
  datapoints: ChartData[];
}

export default function CostLineChart(props: Props) {
  const { title, projectTimeline, datapoints } = props;
  checkLength(datapoints, projectTimeline);

  const graphData = {
    labels: [...Array(projectTimeline).keys()].map((i) => i + 1),
    datasets: datapoints.map((point, index) => ({
      ...point,
      backgroundColor: colors[index],
      borderColor: colors[index],
    })),
    options: {
      ticks: {
        stepSize: 100,
      },
    },
  };

  return (
    <div>
      <Line title={title} data={graphData} />
    </div>
  );
}
