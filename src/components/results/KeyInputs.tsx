import FactoryRoundedIcon from "@mui/icons-material/FactoryRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import SignalCellularAltRoundedIcon from "@mui/icons-material/SignalCellularAltRounded";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";

import { roundToNearestInteger } from "../../model/cost-functions";
import { BLUE } from "../colors";
import { zoneInfo } from "../map/ZoneInfo";
import { ItemText, ItemTitle, StyledCard } from "./Styles";

export function KeyInputsPane(
  location: string,
  electrolyserNominalCapacity: number,
  powerplantCapacity: number
) {
  type ObjectKey = keyof typeof zoneInfo;
  const zone = location as ObjectKey;
  return (
    <StyledCard>
      <CardHeader
        id="key-inputs"
        title="Key Inputs"
        titleTypographyProps={{
          fontWeight: "bold",
          fontSize: 20,
        }}
      />
      <CardContent
        sx={{
          paddingTop: 0,
        }}
      >
        <Grid container item>
          <Grid item xs={4}>
            <Grid container item flexWrap={"nowrap"} spacing={2}>
              <Grid item>
                <LocationOnRoundedIcon
                  fontSize="large"
                  style={{ color: BLUE }}
                />
              </Grid>
              <Grid
                id="key-inputs-location"
                container
                item
                direction={"column"}
              >
                <Grid>
                  <ItemTitle>Location</ItemTitle>
                </Grid>
                <Grid>
                  <ItemText>{zoneInfo[zone]?.location}</ItemText>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={4}>
            <Grid container item flexWrap={"nowrap"} spacing={2}>
              <Grid item>
                <SignalCellularAltRoundedIcon
                  fontSize="large"
                  style={{ color: BLUE }}
                />
              </Grid>
              <Grid
                id="key-inputs-electrolyser-capacity"
                container
                item
                direction={"column"}
              >
                <Grid item>
                  <ItemTitle>Electrolyster Capacity</ItemTitle>
                </Grid>
                <Grid item>
                  <ItemText>
                    {roundToNearestInteger(
                      electrolyserNominalCapacity
                    ).toLocaleString("en-US") + " MW"}
                  </ItemText>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <Grid container item flexWrap={"nowrap"} spacing={2}>
              <Grid item>
                <FactoryRoundedIcon fontSize="large" style={{ color: BLUE }} />
              </Grid>
              <Grid
                id="key-inputs-power-plant-capacity"
                container
                item
                direction={"column"}
              >
                <ItemTitle>Power Plant Capacity</ItemTitle>
                <Grid item>
                  <ItemText>
                    {roundToNearestInteger(powerplantCapacity).toLocaleString(
                      "en-US"
                    ) + " MW"}
                  </ItemText>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );
}
