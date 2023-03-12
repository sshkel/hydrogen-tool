import "chart.js/auto";
import { Line } from "react-chartjs-2";

import { ChartData } from "../../../types";
import { checkLength } from "../../../utils";
import { costLineColors } from "../../colors";

interface Props {
  title: string;
  subtitle?: string;
  projectTimeline: number;
  datapoints: ChartData[];
}

export default function CostLineChart(props: Props) {
  const { title, projectTimeline, datapoints } = props;
  checkLength(datapoints, projectTimeline);

  const graphData = {
    labels: [...Array(projectTimeline).keys()].map((i) => i + 1),
    datasets: datapoints.map((point, index) => ({
      ...{
        ...point,
        data: point.data.map((point) => point / 1_000_000),
      },
      backgroundColor: costLineColors[index],
      borderColor: costLineColors[index],
    })),
    options: {
      ticks: {
        stepSize: 100,
      },
    },
  };

  const options = {
    plugins: {
      subtitle: {
        display: !!props.subtitle,
        text: props.subtitle,
        padding: {
          bottom: 4,
        },
        align: "start" as "start",
        font: {
          size: 12,
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return context.raw.toFixed(2);
          },
        },
      },
    },
    layout: {
      padding: {
        left: 20,
        right: 20,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Year",
          font: {
            size: 16,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Annual Operating Costs (A$MM)",
          font: {
            size: 16,
          },
        },
      },
    },
  };

  return (
    <div>
      <Line title={title} data={graphData} options={options} />
    </div>
  );
}
