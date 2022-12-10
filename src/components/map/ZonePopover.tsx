import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import WindPowerRoundedIcon from "@mui/icons-material/WindPowerRounded";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Popover,
  Typography,
  styled,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { BLUE, GREY, WHITE } from "../colors";
import { PowerfuelPathwayCard } from "./PowerfuelPathwayCard";
import { zoneInfo } from "./ZoneInfo";

type Props = {
  zone: string;
  sideMenuState: boolean;
  closeSideMenu: () => void;
};

const ItemTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  fontWeight: "bold",
}));
const ItemText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
}));

const SideCard = styled(Card)(({ theme }) => ({
  width: "400px",
  minHeight: "60vh",
  borderRadius: "20px",
}));

export function ZonePopover(props: Props) {
  const [component, setComponent] = useState("location");
  const navigate = useNavigate();
  const startDesign = (powerfuel: string) => {
    navigate(`/design/${powerfuel}`);
  };
  type ObjectKey = keyof typeof zoneInfo;
  const zone = props.zone as ObjectKey;

  const summary = (
    <SideCard>
      <CardHeader
        title="Location summary"
        sx={{
          backgroundColor: GREY,
          paddingLeft: "20px",
        }}
        titleTypographyProps={{
          fontWeight: "bold",
        }}
      />
      <CardContent>
        <Grid
          container
          role="presentation"
          justifyContent="center"
          alignItems="center"
        >
          <Grid container item justifyContent="space-between" flexWrap="nowrap">
            <Grid item xs>
              <ItemTitle>Location:</ItemTitle>
            </Grid>

            <Grid item xs>
              <ItemText>{zoneInfo[zone].location}</ItemText>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider flexItem />
          </Grid>
          <Grid container item justifyContent="space-between" flexWrap="nowrap">
            <Grid item xs>
              <ItemTitle>Regional Centers:</ItemTitle>
            </Grid>
            <Grid item xs>
              <ItemText>{zoneInfo[zone].regionalCenters}</ItemText>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider flexItem />
          </Grid>
          <Grid
            container
            item
            justifyContent="space-between"
            flexWrap="nowrap"
            alignItems="center"
          >
            <Grid item xs>
              <ItemTitle>Solar/Wind capacity factor:</ItemTitle>
            </Grid>
            <Grid container item xs alignItems="center">
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
          <Grid item xs={12}>
            <Divider flexItem />
          </Grid>
          <Grid container item justifyContent="space-between" flexWrap="nowrap">
            <Grid item xs>
              <ItemTitle>Main industries:</ItemTitle>
            </Grid>
            <Grid item xs>
              <ItemText>{zoneInfo[zone].mainIndustries}</ItemText>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider flexItem />
          </Grid>
          <Grid container item justifyContent="space-between" flexWrap="nowrap">
            <Grid item xs>
              <ItemTitle>Water availability:</ItemTitle>
            </Grid>
            <Grid item xs>
              <ItemText>{zoneInfo[zone].waterAvailability}</ItemText>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider flexItem />
          </Grid>
          <Grid
            container
            item
            justifyContent="space-between"
            direction="column"
          >
            <Grid item>
              <ItemTitle> Infrastructure:</ItemTitle>
            </Grid>
            <Grid item>
              <ItemText>{zoneInfo[zone].infrastructure}</ItemText>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions style={{ justifyContent: "center" }}>
        <Button
          variant="contained"
          onClick={() => setComponent("powerfuel")}
          style={{
            backgroundColor: BLUE,
            textTransform: "none",
            color: WHITE,
            borderRadius: 20,
            marginBottom: 24,
            fontSize: "0.9rem",
          }}
        >
          Start Project Design
        </Button>
      </CardActions>
    </SideCard>
  );

  const powerfuel = (
    <SideCard>
      <CardHeader
        title="Select powerfuel pathway"
        titleTypographyProps={{
          fontWeight: "bold",
        }}
        sx={{ backgroundColor: GREY, paddingLeft: "20px" }}
      />
      <CardContent>
        <Grid
          container
          role="presentation"
          direction="column"
          justifyContent="center"
          alignItems="stretch"
          rowSpacing="30"
          padding="20px"
        >
          <Grid item xs={2}>
            <PowerfuelPathwayCard
              onClick={() => startDesign("hydrogen")}
              title="Hydrogen"
              subheader="General hydrogen production cost for region"
            />
          </Grid>
          <Grid item xs={2}>
            <PowerfuelPathwayCard
              onClick={() => startDesign("ammonia")}
              title="Ammonia"
              subheader="Integrated hydrogen production and conversion into Ammonia"
            />
          </Grid>
        </Grid>
      </CardContent>
    </SideCard>
  );

  return (
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
      PaperProps={{
        style: { borderRadius: "20px", border: "1px solid #C1C0BF" },
      }}
    >
      {component === "location" && summary}
      {component === "powerfuel" && powerfuel}
    </Popover>
  );
}
