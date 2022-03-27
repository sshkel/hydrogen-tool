import "chart.js/auto";
import { Technology } from "../../types";
import { HydrogenModel, loadSolar, loadWind } from "../../model/Model";
import { DataModel } from "../../model/Model";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

interface Props {
  data?: {
    batteryLifetime: number;
    batteryMinCharge: number;
    batteryEfficiency: number;
    durationOfStorage: number;
    batteryRatedPower: number;
    timeBetweenOverloading: number;
    maximumLoadWhenOverloading: number;
    electrolyserNominalCapacity: number;
    solarNominalCapacity: number;
    windNominalCapacity: number;
    region: string;
    electrolyserMaximumLoad: number;
    electrolyserMinimumLoad: number;
  };
}
interface DownloadedData {
  solarData: any[];
  windData: any[];
}
export default function DurationCurve(props: Props) {
  const [data, setState] = useState<DownloadedData>({
    solarData: [],
    windData: [],
  });

  useEffect(() => {
    Promise.all([loadSolar(), loadWind()]).then(([solar, wind]) => {
      setState({ solarData: solar, windData: wind });
    });
  }, []);

  if (!props.data) {
    return null;
  }

  let {
    batteryLifetime: battLifetime,
    batteryMinCharge: battMin,
    batteryEfficiency,
    durationOfStorage: batteryHours,
    batteryRatedPower: batteryPower,
    timeBetweenOverloading: elecOverloadRecharge,
    maximumLoadWhenOverloading: elecOverload,
    electrolyserNominalCapacity: elecCapacity,
    solarNominalCapacity: solarCapacity,
    windNominalCapacity: windCapacity,
    region: location,
    electrolyserMaximumLoad,
    electrolyserMinimumLoad,
  } = props.data;

  const dataModel: DataModel = {
    battLifetime,
    battMin,
    batteryEfficiency,
    batteryHours,
    batteryPower,
    elecOverloadRecharge,
    elecOverload,
    elecCapacity,
    solarCapacity,
    windCapacity,
    location,
    electrolyserMaximumLoad,
    electrolyserMinimumLoad,
    // no clue what these are in the excel
    specCons: 4.5,
    elecEff: 83,
    H2VoltoMass: 0.089,
  };

  const model = new HydrogenModel(dataModel, data.solarData, data.windData);
  const result = model.calculate_electrolyser_hourly_operation();

  const generatorData = {
    labels: Array.from(Array(result.generator_cf.length).keys()).map((num) =>
      ((num / 8760) * 100).toFixed(0)
    ),
    datasets: [
      {
        label: "Generator",
        data: result.generator_cf.map((x) => x * 100).sort((a, b) => b - a),
        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
    options: {
      ticks: {
        stepSize: 100,
      },
    },
  };

  console.log(result);
  return (
    <div>
      <Line data={generatorData} />
    </div>
  );
}
