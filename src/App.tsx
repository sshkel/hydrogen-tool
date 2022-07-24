import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import WorkingData from "./components/charts/WorkingData";
import Input from "./components/input/Input";
import Map from "./components/map/Map";
import { loadSolar, loadWind } from "./model/DataLoader";

function App() {
  const [state, setState] = useState();

  return (
    <div className="App2">
      <Routes>
        <Route path="/" element={<Map />} />
        <Route path="/design" element={<Input setState={setState} />} />
        <Route
          path="/result"
          element={
            <WorkingData
              data={state}
              loadSolar={loadSolar}
              loadWind={loadWind}
            />
          }
        />
        <Route
          path="*"
          element={
            <main style={{ padding: "1rem" }}>
              <p>Not found</p>
            </main>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
