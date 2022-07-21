import { Feature, GeoJsonProperties, Geometry } from "geojson";
import { useState } from "react";

import WorkingData from "./components/charts/WorkingData";
import Input from "./components/input/Input";
import Map from "./components/map/Map";
import { loadSolar, loadWind } from "./model/DataLoader";

function App() {
  const [state, setState] = useState();

  return (
    <div className="App2">
      <Map />
      <Input setState={setState} />
      <WorkingData data={state} loadSolar={loadSolar} loadWind={loadWind} />
    </div>
  );
}

export default App;
