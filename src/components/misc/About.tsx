import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItem,
  ThemeProvider,
  Typography,
  createTheme,
  styled,
} from "@mui/material";

import { BLUE } from "../input/colors";

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

const StyledCard = styled(Card)(({ theme }) => ({
  ...theme.typography.body2,
  border: "none",
  boxShadow: "none",
}));
export function About() {
  return (
    <ThemeProvider theme={theme}>
      <Grid container direction="column" justifyContent={"space-between"}>
        <Grid item>
          <StyledCard>
            <CardHeader title="Developers" />
            <CardContent>
              <List>
                <ListItem>Muhammad Haider Ali Khan (Lead Developer)</ListItem>
                <ListItem>Phoebe Heywood (Co Developer)</ListItem>
                <ListItem>Aaron Kuswara (Co Developer)</ListItem>
                <ListItem>Iain MacGill (Project Supervisor)</ListItem>
                <ListItem>Rahman Daiyan (Project Supervisor)</ListItem>
                <ListItem>Tara Tjandra (DR PR MC DJ)</ListItem>
                <ListItem>Stanis Shkel (PIR KTLO MVP)</ListItem>
              </List>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item>
          <StyledCard>
            <CardHeader title="Acknowledgements" />
            <CardContent>
              <List>
                <ListItem>Rose Amal (Project Supervisor)</ListItem>
                <ListItem>
                  Charles Johnston (Tool Troubleshooting and Debugging Support)
                </ListItem>
                <ListItem>Nicholas Gorman (Tool Licensing Support)</ListItem>
                <ListItem>
                  Jack Shepherd (Tool Troubleshooting and Debugging Support)
                </ListItem>
              </List>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item>
          <StyledCard>
            <CardHeader title="Affiliations" />
            <CardContent>
              <List>
                <ListItem>University of New South Wales (UNSW)</ListItem>
                <ListItem>
                  Particles and Catalysis Research Group (PartCat), UNSW
                </ListItem>
                <ListItem>
                  Collaboration on Energy and Environmental Markets (CEEM), UNSW
                </ListItem>
                <ListItem>
                  ARC Training Centre for The Global Hydrogen Economy (GlobH2E)
                </ListItem>
                <ListItem>
                  Australian Government Department of Industry, Science, Energy
                  and Resources (DISER)
                </ListItem>
                <ListItem>
                  Australian Government Department of Foreign Affairs and Trade
                  (DFAT)
                </ListItem>
              </List>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item>
          <StyledCard>
            <CardHeader title="Project" />
            <CardContent>
              Part of the DFAT - Australia Germany HySupply Analysis
              <List>
                <ListItem sx={{ fontWeight: "bold" }}>Contact person:</ListItem>
                <ListItem>
                  Dr. Rahman Daiyan Chief Investigator - GlobH2e
                </ListItem>
                <ListItem>r.daiyan@unsw.edu.au</ListItem>
              </List>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
      <Card>
        <CardHeader title="Copyright information" />
        <CardContent>
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
                  The analysis tool has been developed primarily for analysis as
                  part of the DFAT-Germany HySupply analysis. However, open
                  source use of the tool is encouraged for independent use or
                  contribute improvements to the design and functionality of the
                  overall tool under the term of the distribution license and
                  appropriate acknowledgements.
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
                  Permission is hereby granted, free of charge, to any person
                  obtaining a copy of this software and associated documentation
                  files (the "Software"), to deal in the Software without
                  restriction, including without limitation the rights to use,
                  copy, modify, merge, publish, distribute, sublicense, and/or
                  sell copies of the Software, and to permit persons to whom the
                  Software is furnished to do so, subject to the following
                  conditions:
                </ItemText>
                <ItemText>
                  The above copyright notice and this permission notice shall be
                  included in all copies or substantial portions of the
                  Software.
                </ItemText>
                <ItemText>
                  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
                  KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
                  WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                  PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
                  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
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
                  edited, and re-distributed by others, we would appreciate if
                  the tool developers are acknowledged by using the following
                  citation: M.H.A. Khan, A. Kuswara, P. Heywood, R. Daiyan, I.
                  MacGill (2022). HySupply Cost Tool V1.3, UNSW
                </ItemText>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
}
