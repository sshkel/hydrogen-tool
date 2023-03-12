import "chart.js/auto";
import dataLabelsPlugin from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";

import { ChartData } from "../../../types";
import { ORANGE, TEAL, addAlpha } from "../../colors";

interface Props {
  title: string;
  labels: string[];
  datapoints: ChartData[];
  formula: string;
}

export default function CostBarChart(props: Props) {
  const { title, labels, datapoints, formula } = props;
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

  const options: any = {
    plugins: {
      datalabels: {
        anchor: "end",
        align: "end",
        offset: 2,
        clip: false,
        color: "#848484",
        font: {
          size: 13,
          style: "italic",
          weight: "bold",
        },
        formatter: (val: number[]) => `${(val[1] - val[0]).toFixed(2)}`,
      },
      // override label to display the length of the bar rather than coordinates
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return (context.raw[1] - context.raw[0]).toFixed(2);
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
          text: `Levelised Cost (A$/kg${formula})`,
          font: {
            size: 16,
          },
        },
      },
    },
    layout: {
      padding: {
        left: 10,
        right: 20,
        top: 20,
      },
    },
  };

  return (
    <div>
      <Bar
        title={title}
        data={graphData}
        options={options}
        plugins={[dataLabelsPlugin as any]}
      />
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
