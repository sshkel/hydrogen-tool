import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Paper,
  Popover,
  Typography,
  styled,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "left",
}));

export function ZonePopover(props: any) {
  const [component, setComponent] = useState("location");
  const navigate = useNavigate();
  const startDesign = () => {
    navigate("/design");
  };

  const summary = (
    <Card sx={{ width: "40vh", height: "60vh" }}>
      <CardHeader title="Location summary" />
      <CardContent>
        <Grid
          container
          role="presentation"
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <Grid container item justifyContent="space-between" flexWrap="nowrap">
            <Grid item xs>
              <Item>Location</Item>
            </Grid>
            <Grid item xs>
              <Item>xxxxxxxxxxxxxx</Item>
            </Grid>
          </Grid>
          <Grid container item justifyContent="space-between" flexWrap="nowrap">
            <Grid item xs>
              <Item>Regional Centers:</Item>
            </Grid>
            <Grid item xs>
              <Item>Broken Hill, White Cliffs, Wilcannia, Buronga</Item>
            </Grid>
          </Grid>
          <Grid container item justifyContent="space-between" flexWrap="nowrap">
            <Grid item xs>
              <Item>Solar/Wind capacity factor:</Item>
            </Grid>
            <Grid item xs>
              <Item>25% 49% </Item>
            </Grid>
          </Grid>
          <Grid container item justifyContent="space-between" flexWrap="nowrap">
            <Grid item xs>
              <Item>Main industries:</Item>
            </Grid>
            <Grid item xs>
              <Item>Agriculture, mining</Item>
            </Grid>
          </Grid>
          <Grid container item justifyContent="space-between" flexWrap="nowrap">
            <Grid item xs>
              <Item>Water availability:</Item>
            </Grid>
            <Grid item xs>
              <Item>Low</Item>
            </Grid>
          </Grid>
          <Grid item>
            <Item>
              <Typography variant="h5" component="div">
                Infrastructure
              </Typography>
              <Typography variant="body2">
                Includes existing electricity infrastructure e.g., transmission
                lines, existing renewable energy sites, gas pipelines, major
                highways, rail lines, airports Local Energy Generation: • Broken
                Hill Solar Plant @53 MW • Silverton Wind Farm @200 MW Renewable
                Energy Zone: AEMO Suggests Broken Hill can host a solar and wind
                powered REZ
              </Typography>
            </Item>
          </Grid>
          <Grid item></Grid>
        </Grid>
      </CardContent>
      <CardActions style={{ justifyContent: "center" }}>
        <Button variant="contained" onClick={() => setComponent("powerfuel")}>
          Start project design
        </Button>
      </CardActions>
    </Card>
  );

  const powerfuel = (
    <Card sx={{ width: "40vh", height: "60vh" }}>
      <CardHeader title="Select powerfuel pathway" />
      <CardContent>
        <Grid
          container
          role="presentation"
          direction="column"
          justifyContent="center"
          alignItems="center"
          rowSpacing="30"
          sx={{ width: "35vh", height: "30vh" }}
        >
          <Grid item>
            <Button variant="contained" onClick={startDesign}>
              Hydrogen: General hydrogen production cost for region
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={startDesign}>
              Ammonia: Integrated hydrogen production and conversion into
              Ammonia
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
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
