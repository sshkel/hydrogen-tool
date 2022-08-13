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
  zone: string;
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
  const zone = props.zone as ObjectKey;

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
    location: "Far North West NSW",
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
  Z2: {
    location: "Central Far West NSW – Western Part",
    regionalCenters: "Broken Hill and Silverton",
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
  Z3: {
    location: "South Far West NSW",
    regionalCenters: "Mildura",
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
  Z4: {
    location: "Central North West NSW",
    regionalCenters: "Wannaring",
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

  Z5: {
    location: "Central Far West NSW – Eastern Part",
    regionalCenters: "Wilcannia and Cobar",
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
  Z6: {
    location: "Central South Far West NSW",
    regionalCenters: "Ivanhoe",
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
  Z7: {
    location: "West Riverina Murray Region",
    regionalCenters: "Hay",
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
  Z8: {
    location: "Central North NSW",
    regionalCenters: "Walgett and Lightning Ridge",
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
  Z9: {
    location: "Central Orana Region",
    regionalCenters: "Bourke, Nyngan and Dubbo",
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
  Z10: {
    location: "Central West NSW",
    regionalCenters: "Parkes and Forbes",
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
  Z11: {
    location: "East Riverina Murray Region",
    regionalCenters: "Wagga Wagga, Griffith, and Albury",
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
  Z12: {
    location: "North East NSW",
    regionalCenters: "Moree",
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
  Z13: {
    location: "New England Region",
    regionalCenters: "Narrabri, Tamworth, and Armidale",
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
  Z14: {
    location: "Hunter and Greater Sydney Metropolitan Area",
    regionalCenters:
      "Orange, Bathurst, Cowra, Lithgow, Sydney, Gosford, and Newcastle",
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
  Z15: {
    location: "Illawarra – Shoalhaven Region",
    regionalCenters:
      "Wollongong, Nowra, Batesman Bay and Australian Capital Territory (ACT)",
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
  Z16: {
    location: "South East NSW",
    regionalCenters: "Cooma",
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
  Z17: {
    location: "North Coast Region",
    regionalCenters: "Lismore, Byron Bay, and Grafton",
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
  Z18: {
    location: "Central Coast Region",
    regionalCenters: "Coffs Harbor and Port Macquarie",
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
  Z19: {
    location: "Offshore North Coast Region",
    regionalCenters: "Byron Bay",
    solarCapFactor: "-%",
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
  Z20: {
    location: "Offshore Central Coast Region",
    regionalCenters: "Coffs Harbor and Port Macquarie",
    solarCapFactor: "-%",
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
  Z21: {
    location: "Offshore Hunter Region",
    regionalCenters: "Newcastle and Greater Sydney Metropolitan Area",
    solarCapFactor: "-%",
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
  Z22: {
    location: "Offshore South East Coast",
    regionalCenters: "Wollongong, Nowra, and Batesman Bay",
    solarCapFactor: "-%",
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
