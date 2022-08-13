import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Popover,
  Typography,
  styled,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  sideMenuState: boolean;
  closeSideMenu: () => void;
};

const Item = styled(Typography)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "left",
}));

export function ZonePopover(props: Props) {
  const [component, setComponent] = useState("location");
  const navigate = useNavigate();
  const startDesign = () => {
    navigate("/design");
  };
  type ObjectKey = keyof typeof zoneInfo;
  const zone = "Z1" as ObjectKey;

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
              <Item>{zoneInfo[zone].location}</Item>
            </Grid>
          </Grid>
          <Grid container item justifyContent="space-between" flexWrap="nowrap">
            <Grid item xs>
              <Item>Regional Centers:</Item>
            </Grid>
            <Grid item xs>
              <Item>{zoneInfo[zone].regionalCenters}</Item>
            </Grid>
          </Grid>
          <Grid container item justifyContent="space-between" flexWrap="nowrap">
            <Grid item xs>
              <Item>Solar/Wind capacity factor:</Item>
            </Grid>
            <Grid item xs>
              <Item>
                {zoneInfo[zone].solarCapFactor} {zoneInfo[zone].windCapFactor}{" "}
              </Item>
            </Grid>
          </Grid>
          <Grid container item justifyContent="space-between" flexWrap="nowrap">
            <Grid item xs>
              <Item>Main industries:</Item>
            </Grid>
            <Grid item xs>
              <Item>{zoneInfo[zone].mainIndustries}</Item>
            </Grid>
          </Grid>
          <Grid container item justifyContent="space-between" flexWrap="nowrap">
            <Grid item xs>
              <Item>Water availability:</Item>
            </Grid>
            <Grid item xs>
              <Item>{zoneInfo[zone].waterAvailability}</Item>
            </Grid>
          </Grid>
          <Grid item>
            <Item>
              <Typography variant="h5" component="div">
                Infrastructure
              </Typography>
              <Typography variant="body2">
                {zoneInfo[zone].infrastructure}
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
          alignItems="stretch"
          rowSpacing="30"
          sx={{ width: "35vh", height: "30vh" }}
        >
          <Grid item xs={2}>
            <Card onClick={startDesign}>
              <CardActionArea>
                <CardContent>
                  <Typography variant="body2">Hydrogen</Typography>
                  <Typography variant="caption">
                    General hydrogen production cost for region
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={2}>
            <Card onClick={startDesign}>
              <CardActionArea>
                <CardContent>
                  <Typography variant="body2">Ammonia</Typography>
                  <Typography variant="caption">
                    Integrated hydrogen production and conversion into Ammonia
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <Popover
        open={props.sideMenuState}
        TransitionProps={{ onExited: () => setComponent("location") }}
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

const zoneInfo = {
  Z1: {
    location: "xxxxxxxxxxxxxx",
    regionalCenters: "Broken Hill, White Cliffs, Wilcannia, Buronga",
    solarCapFactor: "25%",
    windCapFactor: "49%",
    mainIndustries: "Agriculture, mining",
    waterAvailability: "low",
    infrastructure: `Includes existing electricity infrastructure e.g., transmission
      lines, existing renewable energy sites, gas pipelines, major
      highways, rail lines, airports Local Energy Generation: • Broken
      Hill Solar Plant @53 MW • Silverton Wind Farm @200 MW Renewable
      Energy Zone: AEMO Suggests Broken Hill can host a solar and wind
      powered REZ`,
  },
};
