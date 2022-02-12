import React from "react";
import Input from "./components/input/Input";
import "./App.css";
import HLineChart from "./components/charts/Charts";
const data = [
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
];

function App() {
  return (
    <div className="App2">
      <Input />
      <HLineChart data={data} />
    </div>
  );
}

export default App;
