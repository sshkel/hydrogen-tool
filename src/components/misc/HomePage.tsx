import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

import GLOBH2E_LOGO from "../../assets/globh2e-logo.png";
import NSW_OCSE_LOGO from "../../assets/nsw-ocse-logo.png";
import POWERFUELS_LOGO from "../../assets/powerfuels-logo.png";
import { BLACK, BLUE, NAVY, OFF_WHITE, WHITE } from "../colors";

const LOGO_HEIGHT = 80;

export default function HomePage() {
  const navigate = useNavigate();
  const startDesign = () => {
    navigate("/map");
  };

  return (
    <Grid container flexDirection="column">
      <Grid
        item
        container
        justifyContent="space-evenly"
        sx={{ backgroundColor: OFF_WHITE }}
        paddingTop={8}
        paddingX={12}
        rowSpacing={12}
      >
        <Grid item xs={4} display="flex" justifyContent="center">
          <img
            alt="NSW Office of the Chief Scientist and Engineer logo"
            src={NSW_OCSE_LOGO}
            height={LOGO_HEIGHT}
          />
        </Grid>
        <Grid item xs={4} display="flex" justifyContent="center">
          <img
            alt="Powerfuels logo"
            src={POWERFUELS_LOGO}
            height={LOGO_HEIGHT}
          />
        </Grid>
        <Grid item xs={4} display="flex" justifyContent="center">
          <img alt="GlobH2E logo" src={GLOBH2E_LOGO} height={LOGO_HEIGHT} />
        </Grid>
        <Grid
          item
          xs={12}
          alignItems="center"
          display="flex"
          flexDirection="column"
          flexShrink={1}
        >
          <Typography
            fontSize={32}
            fontStyle="Nunito"
            color={NAVY}
            align="center"
          >
            Welcome to the
          </Typography>
          <Typography
            fontSize={50}
            fontStyle="Nunito"
            fontWeight="800"
            color={NAVY}
            align="center"
          >
            NSW Powerfuel Value Chain Tool
          </Typography>
          <Typography
            fontSize={18}
            fontStyle="Nunito"
            color={BLACK}
            align="center"
            paddingX={10}
          >
            The NSW Powerfuel Value Chain Tool is developed to investigate
            pathways to deploy Power-to-X technologies in NSW. Targeting a wide
            range of stakeholders, the tool can be used to evaluate the
            opportunity and potential costs of generating hydrogen and several
            key powerfuels (including ammonia) using renewable power sources
            across NSW. The key function of the tool is to calculate the
            levelised cost for hydrogen and other powerfuels, which users can
            then evaluate the feasibility and determine the potential for
            developing their own Power-to-X projects in various locations across
            NSW.
          </Typography>
          <Grid
            container
            item
            justifyContent="center"
            flexDirection="row"
            spacing={2}
          >
            <Grid item>
              <Button
                variant="contained"
                onClick={() => startDesign()}
                sx={{
                  marginY: 4,
                  width: 120,
                  backgroundColor: BLUE,
                  textTransform: "none",
                  color: WHITE,
                  borderRadius: 20,
                  marginBottom: 24,
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  minWidth: "40px",
                }}
              >
                Start
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                href="./assets/NSW P2X Tool Documentation.pdf"
                target="_blank"
                sx={{
                  marginY: 4,
                  width: 120,
                  backgroundColor: BLUE,
                  textTransform: "none",
                  color: WHITE,
                  borderRadius: 20,
                  marginBottom: 24,
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  minWidth: "40px",
                }}
              >
                User Guide
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid
        item
        xs={12}
        sx={{
          background:
            "radial-gradient(circle at center, rgba(88,115,166,255) 1%, rgba(0,34,78,255))",
        }}
        padding={8}
      >
        <Typography
          align="center"
          fontSize={10}
          fontStyle="Nunito"
          color={WHITE}
        >
          <b>Disclaimer</b>
          <br />
          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
          IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
          CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
          TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
          SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. <br />
          <br />
          <b>Distribution License</b>
          <br />
          Copyright 2023 University of New South Wales (UNSW)
          <br />
          Permission is hereby granted, free of charge, to any person using this
          web-based tool and associated documentation files (the "Software"), to
          deal in the Software without restriction, including without limitation
          the rights to use, publish, distribute, sublicensing of the Software,
          and to permit persons to whom the Software is furnished to do so,
          subject to the following conditions:
          <br />
          <br />
          The above copyright notice and this permission notice shall be
          included in all copies or substantial portions of the Software.
        </Typography>
      </Grid>
    </Grid>
  );
}
