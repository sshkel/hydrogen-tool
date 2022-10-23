import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import { SideBar } from "./components/SideBar";
import WorkingData from "./components/charts/WorkingData";
import Input from "./components/input/Input";
import InputHomePage from "./components/input/InputHomePage";
import Map from "./components/map/Map";
import { About } from "./components/misc/About";
import { ToolDescription } from "./components/misc/ToolDescription";
import { loadSolar, loadWind } from "./model/DataLoader";
import { InputConfiguration, UserInputFields } from "./types";

function App() {
  const [state, setState] = useState<UserInputFields | undefined>();
  const [location, setLocation] = useState<string | undefined>("Z1");
  const [inputConfiguration, setInputConfiguration] =
    useState<InputConfiguration>("Basic");

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
