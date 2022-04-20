import { useState } from "react";
import Input from "./components/input/Input";
import WorkingData from "./components/charts/WorkingData";

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
