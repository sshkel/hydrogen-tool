import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Popover,
  ThemeProvider,
  Typography,
  createTheme,
  styled,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { BLUE, GREY } from "../input/colors";

type Props = {
  zone: string;
  sideMenuState: boolean;
  closeSideMenu: () => void;
};

const theme = createTheme({
  typography: {
    fontFamily: "Nunito",
  },
});

const ItemTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  fontWeight: "bold",
}));
const ItemText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
}));
const ItemCaption = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  padding: theme.spacing(1),
}));

const SideCard = styled(Card)(({ theme }) => ({
  width: "400px",
  minHeight: "60vh",
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
    <SideCard>
      <ThemeProvider theme={theme}>
        <CardHeader title="Location summary" sx={{ backgroundColor: GREY }} />
        <CardContent>
          <Grid
            container
            role="presentation"
            justifyContent="center"
            alignItems="center"
          >
            <Grid
              container
              item
              justifyContent="space-between"
              flexWrap="nowrap"
            >
              <Grid item xs>
                <ItemTitle>Location:</ItemTitle>
              </Grid>
              <Grid item xs>
                <ItemText>{zoneInfo[zone].location}</ItemText>
              </Grid>
            </Grid>
            <Grid
              container
              item
              justifyContent="space-between"
              flexWrap="nowrap"
            >
              <Grid item xs>
                <ItemTitle>Regional Centers:</ItemTitle>
              </Grid>
              <Grid item xs>
                <ItemText>{zoneInfo[zone].regionalCenters}</ItemText>
              </Grid>
            </Grid>
            <Grid
              container
              item
              justifyContent="space-between"
              flexWrap="nowrap"
            >
              <Grid item xs>
                <ItemTitle>Solar/Wind capacity factor:</ItemTitle>
              </Grid>
              <Grid item xs>
                <ItemText>
                  {zoneInfo[zone].solarCapFactor} {zoneInfo[zone].windCapFactor}{" "}
                </ItemText>
              </Grid>
            </Grid>
            <Grid
              container
              item
              justifyContent="space-between"
              flexWrap="nowrap"
            >
              <Grid item xs>
                <ItemTitle>Main industries:</ItemTitle>
              </Grid>
              <Grid item xs>
                <ItemText>{zoneInfo[zone].mainIndustries}</ItemText>
              </Grid>
            </Grid>
            <Grid
              container
              item
              justifyContent="space-between"
              flexWrap="nowrap"
            >
              <Grid item xs>
                <ItemTitle>Water availability:</ItemTitle>
              </Grid>
              <Grid item xs>
                <ItemText>{zoneInfo[zone].waterAvailability}</ItemText>
              </Grid>
            </Grid>
            <Grid item>
              <ItemTitle>
                Infrastructure:
                <ItemText>{zoneInfo[zone].infrastructure}</ItemText>
              </ItemTitle>
            </Grid>
            <Grid item></Grid>
          </Grid>
        </CardContent>
        <CardActions style={{ justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={() => setComponent("powerfuel")}
            style={{ backgroundColor: BLUE }}
          >
            Start project design
          </Button>
        </CardActions>
      </ThemeProvider>
    </SideCard>
  );

  const powerfuel = (
    <SideCard>
      <ThemeProvider theme={theme}>
        <CardHeader
          title="Select powerfuel pathway"
          sx={{ backgroundColor: GREY }}
        />
        <CardContent>
          <Grid
            container
            role="presentation"
            direction="column"
            justifyContent="center"
            alignItems="stretch"
            rowSpacing="30"
          >
            <Grid item xs={2}>
              <Card onClick={startDesign}>
                <CardActionArea>
                  <CardContent>
                    <ItemTitle>Hydrogen</ItemTitle>
                    <ItemCaption>
                      General hydrogen production cost for region
                    </ItemCaption>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={2}>
              <Card onClick={startDesign}>
                <CardActionArea>
                  <CardContent>
                    <ItemTitle>Ammonia</ItemTitle>
                    <ItemCaption>
                      Integrated hydrogen production and conversion into Ammonia
                    </ItemCaption>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </ThemeProvider>
    </SideCard>
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
