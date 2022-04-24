import { useState } from "react";
import Input from "./components/input/Input";
import WorkingData from "./components/charts/WorkingData";
import { loadSolar, loadWind } from "./model/DataLoader";

function App() {
  const [state, setState] = useState();

  return (
    <div className="App2">
      <Input setState={setState} />
      <WorkingData data={state} loadSolar={loadSolar} loadWind={loadWind} />
    </div>
  );
}

export default App;
