import "@fontsource/nunito";
import "@fontsource/nunito/800.css";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/system";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import { DEFAULT_LOCATION, loadSolar, loadWind } from "../model/DataLoader";
import { InputConfiguration, UserInputFields } from "../types";
import { SideBar } from "./SideBar";
import WorkingData from "./charts/WorkingData";
import { BLACK, BLUE, ORANGE, WHITE } from "./colors";
import InputHomePage from "./input/InputHomePage";
import Map from "./map/Map";
import { AboutPage } from "./misc/AboutPage";
import { Contact } from "./misc/Contact";

function App() {
  const [state, setState] = useState<UserInputFields | undefined>();
  const [location, setLocation] = useState<string | undefined>(
    DEFAULT_LOCATION
  );
  const [inputConfiguration, setInputConfiguration] =
    useState<InputConfiguration>("Basic");

  const theme = createTheme({
    typography: {
      fontFamily: "Nunito",
    },
    palette: {
      primary: {
        main: BLUE,
        contrastText: WHITE,
      },
      secondary: {
        main: "#F2F2F2",
        contrastText: BLACK,
      },
      info: {
        main: "rgba(0, 0, 0, 0.54)",
        contrastText: BLACK,
      },
      success: {
        main: ORANGE,
        light: "#f5b58a",
        dark: "#d35f12",
        contrastText: WHITE,
      },
    },
  });

  return (
    <div className="NSW-P2X-Study">
      <ThemeProvider theme={theme}>
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
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<AboutPage />} />
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
      </ThemeProvider>
    </div>
  );
}

export default App;
