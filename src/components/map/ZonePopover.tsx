import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import WindPowerRoundedIcon from "@mui/icons-material/WindPowerRounded";
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
import { zoneInfo } from "./ZoneInfo";

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
              <Grid container item xs>
                <Grid item>
                  <WbSunnyRoundedIcon />
                </Grid>
                <Grid item>
                  <ItemText>{zoneInfo[zone].solarCapFactor}</ItemText>
                </Grid>
                <Grid item>
                  <WindPowerRoundedIcon />
                </Grid>
                <Grid item>
                  <ItemText>{zoneInfo[zone].windCapFactor}</ItemText>
                </Grid>
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
