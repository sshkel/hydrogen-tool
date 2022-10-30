import "chart.js/auto";
import { Line } from "react-chartjs-2";

import { TEAL, addAlpha } from "../input/colors";

interface Props {
  title: string;
  data: number[];
}
export default function DurationCurve(props: Props) {
  const hoursPerYear = props.data.length;
  const data = {
    labels: Array.from(Array(hoursPerYear).keys()).map((num) =>
      ((num / hoursPerYear) * 100).toFixed(0)
    ),
    datasets: [
      {
        label: props.title,
        data: props.data.map((x) => x * 100).sort((a, b) => b - a),
        fill: true,
        backgroundColor: addAlpha(TEAL, 0.2),
        borderColor: addAlpha(TEAL, 1),
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div>
      <Line data={data} options={options} />
    </div>
  );
}
