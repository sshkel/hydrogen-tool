import "chart.js/auto";
import { Technology } from "../../types";
import { HydrogenModel, loadSolar, loadWind } from "../../model/Model";
import { DataModel } from "../../model/Model";
import { useEffect, useState } from "react";

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
      console.log(solar);
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
  console.log(result);
  return (
    <div>
      {/* <CostBreakdownDoughnutChart
        title="Indirect Cost Breakdown"
        labels={[
          "Electrolyser EPC",
          "Electrolyser Land",
          "Power Plant EPC",
          "Power Plant Land",
          "Battery EPC",
          "Battery Land",
        ]}
        data={[
          electrolyserEpcCost,
          electrolyserLandCost,
          solarEpcCost,
          solarLandCost,
          windEpcCost,
          windLandCost,
        ]}
      /> */}
    </div>
  );
}
