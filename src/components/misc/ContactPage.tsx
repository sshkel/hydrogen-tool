import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import GLOBH2E_LOGO from "../../assets/globh2e-logo.png";
import POWERFUELS_LOGO from "../../assets/powerfuels-logo.png";
import NSW_OCSE_LOGO from "../../assets/nsw-ocse-logo.png";
import { NAVY, OFF_WHITE, WHITE } from "../colors";

const LOGO_HEIGHT = 120;

export default function ContactPage() {
  return (
    <Grid container flexDirection="column">
      <Grid
        item
        container
        alignItems="stretch"
        sx={{ backgroundColor: OFF_WHITE }}
        padding={12}
        rowSpacing={4}
      >
        <Grid item xs={12}>
          <Typography
            fontSize={40}
            fontStyle="Nunito"
            fontWeight="800"
            color={NAVY}
          >
            The Development Team
          </Typography>
        </Grid>

        <Grid item xs={4} display="flex" justifyContent="center">
          <img
            alt="NSW Office of the Chief Scientist and Engineer logo"
            src={NSW_OCSE_LOGO}
            height={LOGO_HEIGHT}
          />
        </Grid>
        <Grid item xs={4} display="flex" justifyContent="center">
          <img
            alt="NSW Government logo"
            src={POWERFUELS_LOGO}
            height={LOGO_HEIGHT}
          />
        </Grid>
        <Grid item xs={4} display="flex" justifyContent="center">
          <img alt="GlobH2E logo" src={GLOBH2E_LOGO} height={LOGO_HEIGHT} />
        </Grid>

        <Grid item xs={12} paddingLeft={4}>
          <Typography fontSize={18} fontStyle="Nunito">
            NSW Decarbonisation Innovation Hub
          </Typography>
        </Grid>
      </Grid>
      <Grid
        item
        xs={12}
        sx={{
          background:
            "radial-gradient(circle at center, rgba(88,115,166,255) 1%, rgba(0,34,78,255))",
        }}
        padding={20}
      >
        <Typography
          align="center"
          fontSize={40}
          fontStyle="Nunito"
          fontWeight="800"
          color={WHITE}
        >
          Contact Details
        </Typography>
        <br />
        <Typography
          align="center"
          fontSize={18}
          fontStyle="Nunito"
          color={WHITE}
        >
          Dr. Rahman Daiyan
          <br />
          UNSW Sydney
          <br />
          r.daiyan@unsw.edu.au
        </Typography>
      </Grid>
    </Grid>
  );
}
