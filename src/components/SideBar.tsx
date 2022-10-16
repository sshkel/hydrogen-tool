import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import { Drawer, List, ListItem } from "@mui/material";
import ListItemButton from "@mui/material/ListItemButton";
import Toolbar from "@mui/material/Toolbar";
import { useNavigate } from "react-router-dom";

import { BLUE } from "./input/colors";

export function SideBar() {
  const drawerWidth = 75;
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
        <ListItem disableGutters>
          <ListItemButton
            onClick={() => navigate("/")}
            sx={{
              minHeight: 48,
              justifyContent: "center",
              px: 3.5,
            }}
          >
            <LocationOnRoundedIcon
              sx={{ fontSize: 30 }}
              style={{
                color: "white",
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disableGutters>
          <ListItemButton
            onClick={() => navigate("/tool")}
            sx={{
              minHeight: 48,
              justifyContent: "center",
              px: 3.5,
            }}
          >
            <MenuBookRoundedIcon
              sx={{ fontSize: 30 }}
              style={{
                color: "white",
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disableGutters>
          <ListItemButton
            onClick={() => navigate("/about")}
            sx={{
              minHeight: 48,
              justifyContent: "center",
              px: 3.5,
            }}
          >
            <PeopleAltRoundedIcon
              sx={{ fontSize: 30 }}
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
