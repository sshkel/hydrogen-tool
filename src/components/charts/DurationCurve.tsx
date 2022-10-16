import "chart.js/auto";
import { Line } from "react-chartjs-2";

import { TEAL, addAlpha } from "../input/colors";

interface Props {
  title: string;
  data: number[];
}
export default function DurationCurve(props: Props) {
  const data = {
    labels: Array.from(Array(props.data.length).keys()).map((num) =>
      ((num / 8760) * 100).toFixed(0)
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
    options: {
      ticks: {
        stepSize: 100,
      },
    },
  };

  return (
    <div>
      <Line data={data} />
    </div>
  );
}
