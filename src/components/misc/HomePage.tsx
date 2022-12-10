import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

import { BLACK, BLUE, NAVY, OFF_WHITE, WHITE } from "../colors";
import { OFFICE_OF_CHIEF_SCIENTIST } from "../logos";

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
        alignItems="stretch"
        sx={{ backgroundColor: OFF_WHITE }}
        paddingTop={8}
        paddingX={12}
      >
        <Grid item xs={4}>
          <img
            alt="Office of NSW Chief Scientist logo"
            src={OFFICE_OF_CHIEF_SCIENTIST}
          />
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
            fontSize={40}
            fontStyle="Nunito"
            fontWeight="800"
            color={NAVY}
            align="center"
          >
            NSW Powerfuel Value Chain Tool
          </Typography>
          <Typography
            fontSize={14}
            fontStyle="Nunito"
            color={BLACK}
            align="center"
            paddingX={10}
          >
            The NSW Powerfuel Value Chain Tool has been developed to investigate
            pathways to deploy Power-to-X technologies and help the NSW
            Government’s aim to make the state a global Power-to-X innovation
            hub. Targeting a broad range of stakeholders, the tool can be used
            to evaluate the opportunity and potential costs of generating
            hydrogen and a selection of key powerfuels (ammonia, methanol,
            synthetic natural gas, and sustainable aviation fuel) using
            renewable power sources across NSW. A key function of the tool is to
            generate a levelized cost for hydrogen or powerfuel, which users can
            evaluate to determine the potential for developing their own
            projects in various locations across NSW.
          </Typography>
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
            Enter
          </Button>
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
          fontSize={14}
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
          Copyright 2022 University of New South Wales (UNSW)
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
