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
  width: "450px",
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
          padding: "24px 28px",
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
          paddingX="4px"
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
              <ItemTitle> Infrastructure:</ItemTitle>
            </Grid>
            <Grid item xs>
              <ItemText>{zoneInfo[zone].infrastructure}</ItemText>
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
            <Grid item xs>
              <ItemTitle>Water availability:</ItemTitle>
            </Grid>
            <Grid item xs>
              <ItemText>
                Details of regional water availability can be found in the{" "}
                <a
                  href={
                    "https://water.dpie.nsw.gov.au/science-data-and-modelling/data"
                  }
                >
                  NSW DPIE Water Database
                </a>
                . Further analysis from a P2X scaling perspective is available
                in the accompanying NSW P2X Industry Feasibility Study
              </ItemText>
            </Grid>
          </Grid>

          {zoneInfo[zone].electricityNetworkPrompt && (
            <div>
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
                  <ItemTitle> Note:</ItemTitle>
                </Grid>
                <Grid item>
                  <ItemText>
                    {" "}
                    This region currently has no/limited existing electricity
                    transmission networks; thus, special transmission would be
                    required to connect with the NEM or specific powerplants
                    that are offsite. A map of NSW’s electricity grid can be
                    found{" "}
                    <a
                      href={
                        "https://www.aemo.com.au/aemo/apps/visualisations/map.html"
                      }
                    >
                      here.
                    </a>
                  </ItemText>
                </Grid>
              </Grid>
            </div>
          )}
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
        sx={{ backgroundColor: GREY, padding: "24px 28px" }}
      />
      <CardContent>
        <Grid
          container
          role="presentation"
          direction="column"
          justifyContent="center"
          alignItems="stretch"
          rowSpacing={1}
          padding="8px"
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
              subheader="Integrated hydrogen production and conversion into ammonia"
            />
          </Grid>
          <Grid item xs={2}>
            <PowerfuelPathwayCard
              onClick={() => startDesign("methanol")}
              title="Methanol"
              subheader="Integrated hydrogen production, carbon sourcing and conversion into methanol"
            />
          </Grid>
          <Grid item xs={2}>
            <PowerfuelPathwayCard
              onClick={() => startDesign("methane")}
              title="Methane"
              subheader="Integrated hydrogen production, carbon sourcing and conversion into methane"
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
      anchorPosition={{ top: 75, left: 100 }}
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
