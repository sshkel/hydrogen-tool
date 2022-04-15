import React, { useState } from "react";
import Input from "./components/input/Input";
import "./App.css";
import WorkingData from "./components/charts/WorkingData";
import DurationCurve from "./components/charts/DurationCurve";

function App() {
  const [state, setState] = useState();

  return (
    <div className="App2">
      <Input setState={setState} />
      <WorkingData data={state} />
    </div>
  );
}

export default App;
