import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  styled,
} from "@mui/material";

const ItemTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.h5,
  padding: theme.spacing(1),
  fontWeight: "bold",
}));
const ItemText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  ...theme.typography.body2,
  border: "none",
  boxShadow: "none",
  display: "flex",
  justifyContent: "center",
  margin: "10px",
}));
export function AboutPage() {
  return (
    <Grid container direction="column" justifyContent={"space-between"}>
      <Grid item>
        <StyledCard sx={{ alignItems: "center" }}>
          <CardContent sx={{ width: "40vw" }}>
            <ItemTitle>NSW Powerfuel Value Chain Tool</ItemTitle>
            <ItemText>
              The NSW Powerfuel Value Chain Tool has been developed to
              investigate pathways to deploy Power-to-X technologies and help
              the NSW Government’s aim to make the state a global Power-to-X
              innovation hub.
            </ItemText>
            <ItemText>
              Targeting a broad range of stakeholders, the tool can be used to
              evaluate the opportunity and potential costs of generating
              hydrogen and a selection of key powerfuels (ammonia, methanol,
              synthetic natural gas, and sustainable aviation fuel) using
              renewable power sources across NSW.
            </ItemText>
            <ItemText>
              A key function of the tool is to generate a levelized cost for
              hydrogen or powerfuel, which users can evaluate to determine the
              potential for developing their own projects in various locations
              across NSW.
            </ItemText>
          </CardContent>
          <CardMedia
            component="img"
            sx={{ width: "40vw", height: "50vh" }}
            image="https://nswp2xtool.s3.ap-southeast-2.amazonaws.com/assets/images/desc1.svg"
          />
        </StyledCard>
      </Grid>
      <Grid item>
        <StyledCard sx={{ flexDirection: "row-reverse", alignItems: "center" }}>
          <CardContent sx={{ width: "40vw" }}>
            <ItemTitle>Disclaimer</ItemTitle>
            <ItemText>
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
              NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
              HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
              WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
              OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
              DEALINGS IN THE SOFTWARE.
            </ItemText>
          </CardContent>
          <CardMedia
            component="img"
            sx={{ width: "30vw", height: "40vh" }}
            image="https://nswp2xtool.s3.ap-southeast-2.amazonaws.com/assets/images/desc2.svg"
          />
        </StyledCard>
      </Grid>
      <Grid item>
        <StyledCard
          sx={{
            flexDirection: "row-reverse",
            alignItems: "center",
          }}
        >
          <CardContent sx={{ width: "40vw" }}>
            <ItemTitle>Distribution License</ItemTitle>
            <ItemText>
              Copyright 2022 University of New South Wales (UNSW) Permission is
              hereby granted, free of charge, to any person using this web-based
              tool and associated documentation files (the "Software"), to deal
              in the Software without restriction, including without limitation
              the rights to use, publish, distribute, sublicensing of the
              Software, and to permit persons to whom the Software is furnished
              to do so, subject to the following conditions: The above copyright
              notice and this permission notice shall be included in all copies
              or substantial portions of the Software.
            </ItemText>
            <ItemText>
              The Powerfuel Value Chain Tool has been developed primarily for
              analysis as part of the NSW Power-to-X Industry Feasibility Study.
              Nevertheless, the NSW Government encourages the open-source use of
              the tool as well as is open for feedback to report issues and
              suggest improvements to design and functionality of the overall
              tool (refer to contact page)
            </ItemText>
          </CardContent>
          <CardMedia
            component="img"
            sx={{ width: "30vw", height: "40vh" }}
            image="https://nswp2xtool.s3.ap-southeast-2.amazonaws.com/assets/images/desc3.svg"
          />
        </StyledCard>
      </Grid>
    </Grid>
  );
}
