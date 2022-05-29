import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { ChartData } from "../../types";

interface Props {
  labels: string[];
  datapoints: ChartData[];
}

export default function CostBarChart(props: Props) {
  const { labels, datapoints } = props;
  const graphData = {
    labels: labels,
    datasets: datapoints.map((point) => ({
      ...point,
      backgroundColor: "rgba(75,192,192,0.2)",
      borderColor: "rgba(75,192,192,1)",
    })),
    options: {
      ticks: {
        stepSize: 100,
      },
    },
  };

  return (
    <div>
      <Bar data={graphData} />
    </div>
  );
}
