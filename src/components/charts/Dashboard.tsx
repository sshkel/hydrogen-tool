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

export default function Dashboard(props: any) {
  const { capacityFactor, capitalCost, indirectCost, sales } = props;
  const ticks = [0, 25, 50, 75, 100];
  return (
    <div>
      <PieChart width={730} height={250}>
        <Pie
          data={capitalCost}
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
      <PieChart width={730} height={250}>
        <Pie
          data={indirectCost}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={90}
          fill="#82ca9d"
          label
        >
          <Label value="Total indirect Cost" position="center" />
        </Pie>
      </PieChart>

      <LineChart
        width={730}
        height={550}
        data={capacityFactor}
        margin={{ top: 15, right: 30, left: 20, bottom: 15 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {/* TODO fix legend to appear on the x axis */}
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
        <Line
          name="Electrolizer"
          type="monotone"
          dataKey="uv"
          stroke="#82ca9d"
        />
      </LineChart>
      {/* Sales */}
      <LineChart
        width={730}
        height={550}
        data={sales}
        margin={{ top: 15, right: 30, left: 20, bottom: 15 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {/* TODO fix legend to appear on the x axis */}
        <XAxis
          dataKey="name"
          label={{
            value: "operational year",
            position: "insidebottom",
            dy: 15,
          }}
          ticks={ticks}
          unit="%"
          domain={[0, 100]}
          interval={0}
        />
        <YAxis
          label={{
            value: "Dollaridoo$",
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
        <Line
          name="Electrolizer"
          type="monotone"
          dataKey="uv"
          stroke="#82ca9d"
        />
      </LineChart>
    </div>
  );
}

Dashboard.defaultProps = {
  capacityFactor: [
    {
      uv: 40,
      pv: 24,
    },
    {
      uv: 30,
      pv: 13,
    },
    {
      uv: 20,
      pv: 98,
    },
    {
      uv: 27,
      pv: 39,
    },
    {
      uv: 18,
      pv: 48,
    },
    {
      uv: 23,
      pv: 38,
    },
    {
      uv: 34,
      pv: 43,
    },
  ],
  capitalCost: [
    { name: "A", value: 400 },
    { name: "B", value: 300 },
    { name: "C", value: 300 },
    { name: "D", value: 200 },
  ],
  indirectCost: [
    { name: "A", value: 400 },
    { name: "B", value: 300 },
    { name: "C", value: 300 },
    { name: "D", value: 200 },
  ],

  sales: [
    {
      uv: 40,
      pv: 24,
    },
    {
      uv: 30,
      pv: 13,
    },
    {
      uv: 20,
      pv: 98,
    },
    {
      uv: 27,
      pv: 39,
    },
    {
      uv: 18,
      pv: 48,
    },
    {
      uv: 23,
      pv: 38,
    },
    {
      uv: 34,
      pv: 43,
    },
  ],
};
