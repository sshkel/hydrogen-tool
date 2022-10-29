import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import { DEFAULT_LOCATION, loadSolar, loadWind } from "../model/DataLoader";
import { InputConfiguration, UserInputFields } from "../types";
import { SideBar } from "./SideBar";
import WorkingData from "./charts/WorkingData";
import Input from "./input/Input";
import InputHomePage from "./input/InputHomePage";
import Map from "./map/Map";
import { About } from "./misc/About";
import { ToolDescription } from "./misc/ToolDescription";

function App() {
  const [state, setState] = useState<UserInputFields | undefined>();
  const [location, setLocation] = useState<string | undefined>(
    DEFAULT_LOCATION
  );
  const [inputConfiguration, setInputConfiguration] =
    useState<InputConfiguration>("Basic");

  return (
    <div className="NSW-P2X-Study">
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
              path="/design/:powerfuel"
              element={
                <InputHomePage
                  setState={setState}
                  setInputConfiguration={setInputConfiguration}
                />
              }
            />
            <Route path="/input" element={<Input setState={setState} />} />
            <Route
              path="/result"
              element={
                <WorkingData
                  data={state}
                  location={location}
                  inputConfiguration={inputConfiguration}
                  loadSolar={loadSolar}
                  loadWind={loadWind}
                />
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/tool" element={<ToolDescription />} />
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