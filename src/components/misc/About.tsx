import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItem,
  ThemeProvider,
  createTheme,
} from "@mui/material";

const theme = createTheme({
  typography: {
    fontFamily: "Nunito",
  },
});

export function About() {
  return (
    <ThemeProvider theme={theme}>
      <Grid container direction="column" justifyContent={"space-between"}>
        <Grid item>
          <Card>
            <CardHeader title="Developers" />
            <CardContent>
              <List>
                <ListItem>Muhammad Haider Ali Khan (Lead Developer)</ListItem>
                <ListItem>Phoebe Heywood (Co Developer)</ListItem>
                <ListItem>Aaron Kuswara (Co Developer)</ListItem>
                <ListItem>Iain MacGill (Project Supervisor)</ListItem>
                <ListItem>Rahman Daiyan (Project Supervisor)</ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item>
          <Card>
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
          </Card>
        </Grid>
        <Grid item>
          <Card>
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
          </Card>
        </Grid>
        <Grid item>
          <Card>
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
          </Card>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
