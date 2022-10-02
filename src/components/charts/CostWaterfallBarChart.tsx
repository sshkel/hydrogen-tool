import "chart.js/auto";
import { Bar } from "react-chartjs-2";

import { ChartData } from "../../types";

interface Props {
  title: string;
  labels: string[];
  datapoints: ChartData[];
}

export default function CostBarChart(props: Props) {
  const { title, labels, datapoints } = props;
  const transformedPoints = datapoints.map((ds: ChartData) => {
    return {
      ...ds,
      data: buildWaterfall(ds.data),
    };
  });

  const graphData = {
    labels: labels.concat(["Total"]),
    datasets: transformedPoints.map((point) => ({
      ...point,
      backgroundColor: "rgba(75,192,192,0.2)",
      borderColor: "rgba(75,192,192,1)",
    })),
  };

  const options = {
    ticks: {
      stepSize: 100,
    },
    plugins: {
      // override label to display the length of the bar rather than coordinates
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return (context.raw[1] - context.raw[0]).toLocaleString("en-US");
          },
        },
      },
    },
  };

  return (
    <div>
      <Bar title={title} data={graphData} options={options} />
    </div>
  );
}

function buildWaterfall(data: number[]): number[][] {
  let acc = 0;
  const points = data.map((curr: number) => {
    const prev = acc;
    acc = acc + curr;
    return [prev, acc];
  });
  // append total to the end
  points.push([0, points[points.length - 1][1]]);
  return points;
}
