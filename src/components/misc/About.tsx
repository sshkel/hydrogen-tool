import {
  Card,
  CardContent,
  Grid,
  ThemeProvider,
  Typography,
  createTheme,
  styled,
} from "@mui/material";

import { SAPPHIRE } from "../input/colors";

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
const ItemHeading = styled(Typography)(({ theme }) => ({
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
  height: "90%",
  margin: "15px",
  borderRadius: "20px",
}));
const StyledListItem = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(0.5),
  paddingLeft: "10px",
}));
export function About() {
  return (
    <ThemeProvider theme={theme}>
      <Grid container flexDirection="column" sx={{ backgroundColor: SAPPHIRE }}>
        <Grid container item alignItems="stretch">
          <Grid item xs={6}>
            <StyledCard>
              <CardContent>
                <ItemHeading>Developers</ItemHeading>

                <StyledListItem>
                  Muhammad Haider Ali Khan (Lead Developer)
                </StyledListItem>
                <StyledListItem>Phoebe Heywood (Co Developer)</StyledListItem>
                <StyledListItem>Aaron Kuswara (Co Developer)</StyledListItem>
                <StyledListItem>Jack Shepherd (Co Developer)</StyledListItem>
                <StyledListItem>
                  Iain MacGill (Project Supervisor)
                </StyledListItem>
                <StyledListItem>
                  Rahman Daiyan (Project Supervisor)
                </StyledListItem>
                <StyledListItem>Tara Tjandra (Team Lead)</StyledListItem>
                <StyledListItem>Stanis Shkel (Intern)</StyledListItem>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={6}>
            <StyledCard>
              <CardContent>
                <ItemHeading>Acknowledgements</ItemHeading>

                <StyledListItem>Rose Amal (Project Supervisor)</StyledListItem>
                <StyledListItem>
                  Charles Johnston (Tool Troubleshooting and Debugging Support)
                </StyledListItem>
                <StyledListItem>
                  Nicholas Gorman (Tool Licensing Support)
                </StyledListItem>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={6}>
            <StyledCard>
              <CardContent>
                <ItemHeading>Affiliations</ItemHeading>

                <StyledListItem>
                  University of New South Wales (UNSW)
                </StyledListItem>
                <StyledListItem>
                  Particles and Catalysis Research Group (PartCat), UNSW
                </StyledListItem>
                <StyledListItem>
                  Collaboration on Energy and Environmental Markets (CEEM), UNSW
                </StyledListItem>
                <StyledListItem>
                  ARC Training Centre for The Global Hydrogen Economy (GlobH2E)
                </StyledListItem>
                <StyledListItem>
                  Australian Government Department of Industry, Science, Energy
                  and Resources (DISER)
                </StyledListItem>
                <StyledListItem>
                  Australian Government Department of Foreign Affairs and Trade
                  (DFAT)
                </StyledListItem>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={6}>
            <StyledCard>
              <CardContent>
                <ItemHeading>Project</ItemHeading>

                <StyledListItem>
                  Part of the DFAT - Australia Germany HySupply Analysis
                </StyledListItem>
                <StyledListItem sx={{ fontWeight: "bold" }}>
                  Contact person:
                </StyledListItem>
                <StyledListItem>
                  Dr. Rahman Daiyan Chief Investigator - GlobH2e
                </StyledListItem>
                <StyledListItem>r.daiyan@unsw.edu.au</StyledListItem>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
        <Grid item>
          <StyledCard>
            <CardContent>
              <ItemHeading>Copyright information</ItemHeading>
              <Grid container direction="column">
                <Grid
                  container
                  item
                  justifyContent="space-between"
                  direction="column"
                >
                  <Grid item xs>
                    <ItemTitle>Disclaimer</ItemTitle>
                  </Grid>
                  <Grid item xs>
                    <ItemText>
                      The analysis tool has been developed primarily for
                      analysis as part of the DFAT-Germany HySupply analysis.
                      However, open source use of the tool is encouraged for
                      independent use or contribute improvements to the design
                      and functionality of the overall tool under the term of
                      the distribution license and appropriate acknowledgements.
                    </ItemText>
                  </Grid>
                </Grid>
                <Grid
                  container
                  item
                  justifyContent="space-between"
                  direction="column"
                >
                  <Grid item xs>
                    <ItemTitle>Distribution License</ItemTitle>
                  </Grid>
                  <Grid item xs>
                    <ItemText>
                      Copyright 2022 University of New South Wales (UNSW)
                    </ItemText>
                    <ItemText>
                      Permission is hereby granted, free of charge, to any
                      person obtaining a copy of this software and associated
                      documentation files (the "Software"), to deal in the
                      Software without restriction, including without limitation
                      the rights to use, copy, modify, merge, publish,
                      distribute, sublicense, and/or sell copies of the
                      Software, and to permit persons to whom the Software is
                      furnished to do so, subject to the following conditions:
                    </ItemText>
                    <ItemText>
                      The above copyright notice and this permission notice
                      shall be included in all copies or substantial portions of
                      the Software.
                    </ItemText>
                    <ItemText>
                      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
                      KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
                      WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                      PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
                      OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
                      OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
                      OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
                      SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                    </ItemText>
                  </Grid>
                </Grid>
                <Grid
                  container
                  item
                  justifyContent="space-between"
                  direction="column"
                >
                  <Grid item xs>
                    <ItemTitle>Citation</ItemTitle>
                  </Grid>
                  <Grid item xs>
                    <ItemText>
                      While tool is published under the conditions of the open
                      source MIT license making sure that the code can be used,
                      edited, and re-distributed by others, we would appreciate
                      if the tool developers are acknowledged by using the
                      following citation: M.H.A. Khan, A. Kuswara, P. Heywood,
                      R. Daiyan, I. MacGill (2022). HySupply Cost Tool V1.3,
                      UNSW
                    </ItemText>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
