import { Paper } from "@mui/material";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Label,
} from "recharts";
interface Props {
  data?: {
    nominalElectrolyserCapacity: number;
    nominalSolarCapacity: number;
    nominalWindCapacity: number;
  };
}
export default function Dashboard(props: any) {
  const timeline = Array.from(Array(10).keys());

  const linear = timeline.map((e) => {
    return {
      electrolizer: (e * props.data.nominalElectrolyserCapacity) % 100,
      solar: (e * props.data.nominalSolarCapacity) % 100,
      wind: (e * props.data.nominalWindCapacity) % 100,
    };
  });
  console.log(linear);
  //   const { capacityFactor, capitalCost, indirectCost, sales, operatingCosts } =props;
  const ticks = [0, 25, 50, 75, 100];
  return (
    <div>
      <PieChart width={730} height={250}>
        <Pie
          data={linear}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={90}
          fill="#82ca9d"
          label
        >
          <Label value="Total capital Cost" position="center" />
        </Pie>
      </PieChart>

      <LineChart
        width={730}
        height={550}
        data={linear}
        margin={{ top: 15, right: 30, left: 20, bottom: 15 }}
      >
        <CartesianGrid />
        {/* TODO fix legend to appear on the x axis */}
        <XAxis
          dataKey="name"
          label={{ value: "duraton of year", position: "insidebottom", dy: 15 }}
        />
        <YAxis
          label={{
            value: "Capacity factor of power plant",
            angle: -90,
            position: "insideLeft",
            dy: 100,
          }}
        />
        <Tooltip />
        <Legend verticalAlign="top" />
        <Line
          name="Electrolizer"
          type="monotone"
          dataKey="electrolizer"
          stroke="#8884d8"
        />
        <Line name="Solar" type="monotone" dataKey="solar" stroke="#82ca9d" />
        <Line name="Wind" type="monotone" dataKey="wind" stroke="#838ca9d" />
      </LineChart>
    </div>
  );
}

Dashboard.defaultProps = {
  data: {
    nominalElectrolyserCapacity: 4,
    nominalSolarCapacity: 2,
    nominalWindCapacity: 5,
  },
};
