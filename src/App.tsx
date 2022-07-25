import MapIcon from "@mui/icons-material/Map";
import { Drawer, List, ListItem, ListItemIcon } from "@mui/material";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import WorkingData from "./components/charts/WorkingData";
import Input from "./components/input/Input";
import Map from "./components/map/Map";
import { loadSolar, loadWind } from "./model/DataLoader";

const drawerWidth = 200;
function App() {
  const [state, setState] = useState();
  const navigate = useNavigate();

  return (
    <div className="App2">
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <Toolbar />
          <Divider />
          <List>
            {["Map"].map((text, _) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <MapIcon />
                  </ListItemIcon>
                  <ListItemText primary={text} onClick={() => navigate("/")} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Drawer>
        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: "background.default" }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <Map />
                </div>
              }
            />
            <Route
              path="/design"
              element={
                <div>
                  <Input setState={setState} />
                  <WorkingData
                    data={state}
                    loadSolar={loadSolar}
                    loadWind={loadWind}
                  />
                </div>
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
