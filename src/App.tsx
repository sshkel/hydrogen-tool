import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import { SideBar } from "./components/SideBar";
import WorkingData from "./components/charts/WorkingData";
import Input from "./components/input/Input";
import InputHomePage from "./components/input/InputHomePage";
import Map from "./components/map/Map";
import { loadSolar, loadWind } from "./model/DataLoader";
import { InputFields } from "./types";

function App() {
  const [state, setState] = useState<InputFields | undefined>();
  const [location, setLocation] = useState<string | undefined>();

  return (
    <div className="App2">
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <SideBar />
        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: "background.default" }}
        >
          <Routes>
            <Route path="/" element={<Map setLocation={setLocation} />} />
            <Route
              path="/input"
              element={<InputHomePage setState={setState} />}
            />
            <Route path="/design" element={<Input setState={setState} />} />
            <Route
              path="/result"
              element={
                <WorkingData
                  data={state}
                  location={location}
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
        </Box>
      </Box>
    </div>
  );
}

export default App;
