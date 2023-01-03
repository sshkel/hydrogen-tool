import "chart.js/auto";
import { Bar } from "react-chartjs-2";

import { ChartData } from "../../types";
import { ORANGE, TEAL, addAlpha } from "../colors";

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

  const dataLength = datapoints[0].data.length;
  const backgroundColor = new Array(dataLength).fill(addAlpha(TEAL, 0.6));
  backgroundColor.push(addAlpha(ORANGE, 0.6));
  const borderColor = new Array(dataLength).fill(addAlpha(TEAL, 0.6));
  borderColor.push(addAlpha(ORANGE, 1.0));

  const graphData = {
    labels: labels.concat(["Total"]),
    datasets: transformedPoints.map((point) => ({
      ...point,
      backgroundColor: backgroundColor,
      borderColor: borderColor,
    })),
  };

  const options = {
    plugins: {
      // override label to display the length of the bar rather than coordinates
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return (context.raw[1] - context.raw[0]).toLocaleString("en-US");
          },
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Levelised Cost ($/yr)",
          font: {
            size: 20,
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
