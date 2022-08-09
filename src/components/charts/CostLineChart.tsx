import "chart.js/auto";
import { Line } from "react-chartjs-2";

import { ChartData } from "../../types";
import { checkLength } from "../../utils";

interface Props {
  title: string;
  projectTimeline: number;
  datapoints: ChartData[];
}

const colours = [
  "#3E7DCC",
  "#8F9CB3",
  "#00C8C8",
  "#F9D84A",
  "#8CC0FF",
  "#4D525A",
];

export default function CostLineChart(props: Props) {
  const { title, projectTimeline, datapoints } = props;
  checkLength(datapoints, projectTimeline);

  const graphData = {
    labels: [...Array(projectTimeline).keys()].map((i) => i + 1),
    datasets: datapoints.map((point, index) => ({
      ...point,
      backgroundColor: colours[index],
      borderColor: colours[index],
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
