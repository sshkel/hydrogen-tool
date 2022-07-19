import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";

import WorkingData from "./components/charts/WorkingData";
import Input from "./components/input/Input";
import { loadSolar, loadWind } from "./model/DataLoader";

function App() {
  const [state, setState] = useState();

  return (
    <div className="App2">
      <div id="map">
        <MapContainer
          center={[-32.27554173488815, 147.97835713324858]}
          zoom={7}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>
      <Input setState={setState} />
      <WorkingData data={state} loadSolar={loadSolar} loadWind={loadWind} />
    </div>
  );
}

export default App;
