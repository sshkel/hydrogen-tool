import MapIcon from "@mui/icons-material/Map";
import { Drawer, List, ListItem, ListItemIcon } from "@mui/material";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import Toolbar from "@mui/material/Toolbar";
import { useNavigate } from "react-router-dom";

export function SideBar() {
  const drawerWidth = 60;
  const navigate = useNavigate();
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#396aff",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar />
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/")}>
            <ListItemIcon
              style={{
                justifyContent: "center",
                minWidth: 0,
              }}
            >
              <MapIcon
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
