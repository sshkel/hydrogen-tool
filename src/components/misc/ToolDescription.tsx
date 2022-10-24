import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  ThemeProvider,
  Typography,
  createTheme,
  styled,
} from "@mui/material";

const theme = createTheme({
  typography: {
    fontFamily: "Nunito",
  },
});
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
export function ToolDescription() {
  return (
    <ThemeProvider theme={theme}>
      <Grid container direction="column" justifyContent={"space-between"}>
        <Grid item>
          <StyledCard sx={{ alignItems: "center" }}>
            <CardContent sx={{ width: "40vw" }}>
              <ItemTitle>NSW Powerfuel Value Chain Tool</ItemTitle>
              <ItemText>
                The NSW Powerfuel Value Chain Tool has been developed to
                evaluate the cost of generating hydrogen through exclusively
                renewable powered electrolysis in Australia through an in-depth
                technoeconomic analysis.
              </ItemText>
              <ItemText>
                The tool allows the user to design 24 different combinations of
                solar and/or wind powered electrolyser system with additional
                option to include battery based on user based input, however
                guidance is provided based on costs and performance parameters
                provided in literature.
              </ItemText>
              <ItemText>
                To model the hydrogen production and system capacity factors,
                the tool comes preloaded with solar and wind traces for 41 high
                renewable energy zones across Australia, however provisions have
                been provided for users to input their own solar and wind
                traces.
              </ItemText>
              <ItemText>
                The tool can then be used to determine the levelised cost of
                hydrogen or conduct a detailed business case analysis.
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
          <StyledCard
            sx={{ flexDirection: "row-reverse", alignItems: "center" }}
          >
            <CardContent sx={{ width: "40vw" }}>
              <ItemTitle>Tool Competencies</ItemTitle>
              <ItemText>
                The tool builds upon the current state of the art and existing
                tools to provide a comprehensive, close to reality analysis by
                including factors like a detailed capital cost model that
                extends beyond just equipment cost to include EPC (engineering
                and procurement costs) and land to develop the project with
                option to finance the costs through a flexible split of equity
                and debt, as well as usually under-explored operating factors
                like variation of electrolyser efficiency with load,
                electrolyser/ power plant efficiency degradation with operating
                life, conditional options to overload the electrolyser amongst
                many other features. Moreover, the tool is a living tool with
                additional features being and expected to be added after
                consultation with various stakeholders.
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
              <ItemTitle>Analysis Methodology</ItemTitle>
              <ItemText>
                Based on the selected/ provided solar and wind traces and the
                selected design parameters of the power plant, the hourly energy
                output to the electrolyser is mapped out. Subsequently, the
                energy available is correlated with the electrolyser's specific
                energy consumption to determine the hydrogen generated.
              </ItemText>
              <ItemText>
                The equipment capital and operating costs are established, which
                through a net present value analysis are used to determine the
                levelized cost of hydrogen (LCH2 ). Additionally, a detailed
                cash flow analysis can also be conducted to evaluate the net
                profit, pay back period and return on investment.
              </ItemText>
              <ItemText>
                The tool also maps out the solar/wind traces and the
                electrolyser capacity factor as duration curves (over different
                temporal resolutions - daily, weekly, monthly and annual
                duration curves) which can be used to understand the variation
                in hydrogen generation, which can be potentially used to compare
                various power supply/electrolyser configurations and spatial
                differences between different sites. Further details are
                elaborated in the documentation provided on the GlobH2e Website
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
    </ThemeProvider>
  );
}
