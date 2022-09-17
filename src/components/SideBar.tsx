import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import { Drawer, List, ListItem, ListItemIcon } from "@mui/material";
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
      <Divider />
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
            <ListItemIcon
              style={{
                justifyContent: "center",
                minWidth: 0,
              }}
            >
              <LocationOnRoundedIcon
                fontSize="large"
                style={{
                  color: "white",
                }}
              />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
    </Drawer>
  );
}
