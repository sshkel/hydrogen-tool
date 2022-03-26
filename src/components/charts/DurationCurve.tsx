import "chart.js/auto";
import { Technology } from "../../types";
import { HydrogenModel } from "../../model/Model";
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
    location: string;
    electrolyserMaximumLoad: number;
    electrolyserMinimumLoad: number;
  };
}

export default function DurationCurve(props: Props) {
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
    location,
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

  const model = new HydrogenModel(dataModel);
  let out = null;
  const getData = async () => {
    const output = await model.calculate_electrolyser_hourly_operation();
  };
  getData();

  console.log(out);
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
