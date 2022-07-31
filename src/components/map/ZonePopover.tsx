import { Button, ListItemButton, Popover } from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function ZonePopover(props: any) {
  const [component, setComponent] = useState("location");
  const navigate = useNavigate();
  const startDesign = () => {
    navigate("/design");
  };
  const summary = (
    <Box sx={{ width: 300 }} role="presentation">
      <List>
        <ListItem key={"Location summary"}>
          <ListItemText primary={"Location summary"} />
        </ListItem>
        <Divider />
        <ListItem key={"Info"}>
          <ListItemText primary={"Info"} />
        </ListItem>
        A bunch of information about the project
      </List>
      <Divider />
      <Button variant="contained" onClick={() => setComponent("powerfuel")}>
        Start project design
      </Button>
    </Box>
  );
  const powerfuel = (
    <Box sx={{ width: 300 }} role="presentation">
      <List>
        <ListItem key={"Hydrogen"}>
          <ListItemButton onClick={startDesign}>
            <ListItemText primary={"Hydrogen"} />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem key={"Ammonia"}>
          <ListItemButton onClick={startDesign}>
            <ListItemText primary={"Ammonia"} />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
    </Box>
  );

  return (
    <div>
      <Popover
        open={props.sideMenuState}
        onClose={props.closeSideMenu}
        anchorReference="anchorPosition"
        anchorPosition={{ top: 20, left: 100 }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {component === "location" && summary}
        {component === "powerfuel" && powerfuel}
      </Popover>
    </div>
  );
}
