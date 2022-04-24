import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { ChartData } from "../../types";

interface Props {
  plantLife: number;
  datapoints: ChartData[];
}

export default function CostBarChart(props: Props) {
  const { plantLife, datapoints } = props;

  const graphData = {
    labels: [...Array(plantLife).keys()].map((i) => i + 1),
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
