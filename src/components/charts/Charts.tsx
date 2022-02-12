import React from "react";
import {
  LineChart,
  Line,
  Label,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: any[];
}

export default function HLineChart(props: Props) {
  const { data } = props;
  const ticks = [0, 25, 50, 75, 100];
  return (
    <LineChart
      width={730}
      height={550}
      data={data}
      margin={{ top: 15, right: 30, left: 20, bottom: 15 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      {/* TODO fix legen to appear on the x axis */}
      <XAxis
        dataKey="name"
        label={{ value: "duraton of year", position: "insidebottom", dy: 15 }}
        ticks={ticks}
        unit="%"
        domain={[0, 100]}
        interval={0}
      />
      <YAxis
        label={{
          value: "Capacity factor of power plant",
          angle: -90,
          position: "insideLeft",
          dy: 100,
        }}
        ticks={ticks}
        unit="%"
      />
      <Tooltip />
      <Legend verticalAlign="top" />
      <Line name="Powerplant" type="monotone" dataKey="pv" stroke="#8884d8" />
      <Line name="Electrolizer" type="monotone" dataKey="uv" stroke="#82ca9d" />
    </LineChart>
  );
}
