import { Chart as ChartJS } from "chart.js";
import "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";
import { Line } from "react-chartjs-2";

import { ChartData } from "../../types";
import { colors } from "../colors";

ChartJS.register(zoomPlugin);

interface Props {
  datapoints: ChartData[];
}

export default function HourlyCapacityFactors(props: Props) {
  // randomly sample for demo until we fix and have zoom in functionality
  // https://youtube.com/clip/UgkxlUpRBGgl1xSjlEPyATuGK1_Eaqu50GxV
  const { datapoints } = props;
  const samplesToPlot = datapoints[0].data.length;

  const graphData = {
    labels: [...Array(samplesToPlot).keys()].map((i) => i + 1),
    datasets: datapoints.map((point, index) => ({
      label: point.label,
      data: point.data.map((x) => x * 100),
      backgroundColor: colors[index],
      borderColor: colors[index],
    })),
  };

  const options: any = {
    responsive: true,
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        pointRadius: 0,
      },
    },
    scales: {
      x: {
        min: 0,
        // 30 days worth
        max: 24 * 30,
        type: "linear",
        ticks: {
          // forces step size to be 50 units
          precision: 0,
          stepSize: 50,
        },
        title: {
          display: true,
          text: "Hour",
          font: {
            size: 20,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Capacity Factor",
          font: {
            size: 20,
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      zoom: {
        limits: {
          x: { min: 0, max: samplesToPlot },
        },
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.2,
          },
          mode: "x",
        },
      },
    },
  };

  return (
    <div>
      <Line data={graphData} options={options} />
    </div>
  );
}
