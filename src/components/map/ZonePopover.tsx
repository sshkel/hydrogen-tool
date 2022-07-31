import { Button, Grid, Paper, Popover, styled } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export function ZonePopover(props: any) {
  const [component, setComponent] = useState("location");
  const navigate = useNavigate();
  const startDesign = () => {
    navigate("/design");
  };

  const summary = (
    <Grid
      container
      role="presentation"
      direction="column"
      justifyContent="center"
    >
      <Grid item>
        <Item>Location Summary</Item>
      </Grid>
      <Grid item>
        <Item>Location </Item>
      </Grid>
      <Grid item>
        <Item>Infrastructure</Item>
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={() => setComponent("powerfuel")}>
          Start project design
        </Button>
      </Grid>
    </Grid>
  );
  const powerfuel = (
    <Grid
      container
      role="presentation"
      direction="column"
      alignItems="center"
      spacing={3}
    >
      <Grid item>Powerfuel pathway</Grid>
      <Grid item>
        <Button variant="contained" onClick={startDesign}>
          Hydrogen
        </Button>
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={startDesign}>
          Ammonia
        </Button>
      </Grid>
    </Grid>
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
