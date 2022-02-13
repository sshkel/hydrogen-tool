import React, { useState } from "react";
import Input from "./components/input/Input";
import "./App.css";
import Dashboard from "./components/charts/Dashboard";

function App() {
  const [state, setState] = useState();

  return (
    <div className="App2">
      <Input setState={setState} />
      <Dashboard data={state} />
    </div>
  );
}

export default App;
