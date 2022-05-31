import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { ChartData } from "../../types";

interface Props {
  datapoints: ChartData[];
}

const colours = ["#3E7DCC", "#00C8C8"];

export default function HourlyCapacityFactors(props: Props) {
  // randomly sample for demo until we fix and have zoom in functionality
  // https://youtube.com/clip/UgkxlUpRBGgl1xSjlEPyATuGK1_Eaqu50GxV
  const sampleToPlot = 120;
  const randomStart = Math.floor(Math.random() * 8760);
  const { datapoints } = props;

  const graphData = {
    labels: [...Array(sampleToPlot).keys()].map((i) => i + 1),
    datasets: datapoints.map((point, index) => ({
      label: point.label,
      data: point.data
        .slice(randomStart, randomStart + sampleToPlot)
        .map((x) => x * 100),
      backgroundColor: colours[index],
      borderColor: colours[index],
    })),
  };

  return (
    <div>
      <Line data={graphData} />
    </div>
  );
}
