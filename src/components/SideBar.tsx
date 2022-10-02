import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import { Drawer, List, ListItem } from "@mui/material";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import Toolbar from "@mui/material/Toolbar";
import { useNavigate } from "react-router-dom";

import { BLUE } from "./input/colors";

export function SideBar() {
  const drawerWidth = 70;
  const navigate = useNavigate();
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: BLUE,
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/")}
            sx={{
              minHeight: 48,
              justifyContent: "center",
              px: 3.5,
            }}
          >
            <LocationOnRoundedIcon
              fontSize="large"
              style={{
                color: "white",
              }}
            />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate("/about")}
            sx={{
              minHeight: 48,
              justifyContent: "center",
              px: 3.5,
            }}
          >
            <PeopleAltRoundedIcon
              fontSize="large"
              style={{
                color: "white",
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}
