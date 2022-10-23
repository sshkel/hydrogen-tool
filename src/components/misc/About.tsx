import {
  Card,
  CardContent,
  Grid,
  Link,
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
  padding: theme.spacing(0.1),
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

                <StyledListItem>Muhammad Haider Ali Khan</StyledListItem>
                <StyledListItem>Phoebe Heywood</StyledListItem>
                <StyledListItem>Aaron Kuswara</StyledListItem>
                <StyledListItem>Jack Shepherd</StyledListItem>
                <StyledListItem>Iain MacGill</StyledListItem>
                <StyledListItem>Rahman Daiyan</StyledListItem>
                <StyledListItem>Rose Amal</StyledListItem>
                <StyledListItem>Charles Johnston</StyledListItem>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={6}>
            <StyledCard>
              <CardContent>
                <ItemHeading>Acknowledgements</ItemHeading>
                <StyledListItem>
                  The project is funded by the NSW Office of Chief Scientist and
                  Engineer and NSW Decarbonisation Innovation Hub
                </StyledListItem>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={6}>
            <StyledCard>
              <CardContent>
                <ItemHeading>Affiliations</ItemHeading>
                <StyledListItem>
                  ARC Training Centre for The Global Hydrogen Economy (GlobH2E)
                </StyledListItem>
                <StyledListItem>
                  NSW Decarbonisation Innovation Hub
                </StyledListItem>
                <StyledListItem>
                  NSW Powerfuels including Hydrogen Network.
                </StyledListItem>
                <StyledListItem>
                  University of New South Wales (UNSW)
                </StyledListItem>
                <StyledListItem>
                  Particles and Catalysis Research Group (PartCat), UNSW
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
                  Part of NSW Power to X Industry Feasibility Study.
                </StyledListItem>
                <StyledListItem sx={{ fontWeight: "bold" }}>
                  Contact person:
                </StyledListItem>
                <StyledListItem>
                  Dr. Rahman Daiyan Chief Investigator - GlobH2e
                </StyledListItem>
                <StyledListItem>
                  <Link href="mailto:r.daiyan@unsw.edu.au">
                    r.daiyan@unsw.edu.au
                  </Link>
                </StyledListItem>
                <StyledListItem>Lecturer & ARC DECRA Fellow,</StyledListItem>
                <StyledListItem>
                  Particles and Catalysis Research Group
                </StyledListItem>
                <StyledListItem>
                  School of Chemical Engineering Chief Investigator
                </StyledListItem>
                <StyledListItem>
                  ARC Training Centre for The Global Hydrogen Economy
                </StyledListItem>
                <StyledListItem>
                  DFAT Australia-Germany Hydrogen Value Chain Feasibility Study
                </StyledListItem>
                <StyledListItem>
                  Australian Trailblazer for Recycling and Clean Energy
                  (ATRaCE),
                </StyledListItem>
                <StyledListItem>
                  NSW Power-to-X Feasibility Study,
                </StyledListItem>
                <StyledListItem>
                  Co-ordinator, Powerfuels including Hydrogen Network,
                </StyledListItem>
                <StyledListItem>
                  NSW Decarbonisation Innovation Hub
                </StyledListItem>
                <StyledListItem>
                  Tyree Energy Technology Building (H6)
                </StyledListItem>
                <StyledListItem>
                  The University of New South Wales
                </StyledListItem>
                <StyledListItem>Kensington, NSW 2052</StyledListItem>
                <StyledListItem sx={{ paddingBottom: "10px" }}>
                  <Link href="www.pcrg.unsw.edu.au">www.pcrg.unsw.edu.au</Link>
                </StyledListItem>
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
                      analysis as part of the NSW Power to X Industry
                      Feasibility Study analysis. However, open source use of
                      the tool is encouraged for independent use or contribute
                      improvements to the design and functionality of the
                      overall tool under the term of the distribution license
                      and appropriate acknowledgements.
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
              </Grid>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
