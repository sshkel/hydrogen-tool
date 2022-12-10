import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  styled,
} from "@mui/material";

import { OFF_WHITE, WHITE } from "../colors";

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
export default function AboutPage() {
  return (
    <Grid container direction="column" justifyContent="space-between">
      <Grid item sx={{ backgroundColor: OFF_WHITE }}>
        <StyledCard sx={{ alignItems: "center", backgroundColor: OFF_WHITE }}>
          <CardContent sx={{ width: "40vw", backgroundColor: OFF_WHITE }}>
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
      <Grid item sx={{ backgroundColor: OFF_WHITE }}>
        <StyledCard
          sx={{
            flexDirection: "row-reverse",
            alignItems: "center",
            backgroundColor: OFF_WHITE,
          }}
        >
          <CardContent sx={{ width: "40vw" }}>
            <ItemTitle>Tool Competencies</ItemTitle>
            <ItemText>
              An open-source, user friendly design, allows the user to select
              any location across NSW and then assess their potential hydrogen
              and powerfuels projects via two options. The first is a basic
              analysis allowing the user to define the critical parameters to
              generate a quick result, and the second is an advanced analysis
              allowing the user to define a broad range of parameters to
              evaluate their projects.
            </ItemText>
            <ItemText>
              The output from the analysis generates a breakdown of the key
              components making up the levelized cost and summarizes key
              technical outputs such as capacity factors, system availability,
              annual production rates and energy consumed.
            </ItemText>
          </CardContent>
          <CardMedia
            component="img"
            sx={{ width: "30vw", height: "40vh" }}
            image="https://nswp2xtool.s3.ap-southeast-2.amazonaws.com/assets/images/desc2.svg"
          />
        </StyledCard>
      </Grid>
      <Grid item sx={{ backgroundColor: OFF_WHITE }}>
        <StyledCard
          sx={{
            flexDirection: "row-reverse",
            alignItems: "center",
            backgroundColor: OFF_WHITE,
          }}
        >
          <CardContent sx={{ width: "40vw" }}>
            <ItemTitle>Analysis Methodology</ItemTitle>
            <ItemText>
              The backbone of the tool is built up of historical hourly solar
              and wind potential data across NSW. Depending on the renewable
              power configuration defined by the user (solar, wind or hybrid),
              an hourly energy output to the entire system is mapped out across
              a one- year period. The energy output is then correlated with the
              systems specific energy consumption to determine the mass of
              hydrogen and/or powerfuel generated at an hourly interval across a
              one-year period and subsequently the lifetime of the project.
            </ItemText>
            <ItemText>
              User defined project capital and operating costs, discount rate
              and project lifetime, along with the total quantity of hydrogen or
              powerfuel generated are used to calculate a levelized cost of
              hydrogen or the powerfuel of choice.
            </ItemText>
          </CardContent>
          <CardMedia
            component="img"
            sx={{ width: "30vw", height: "40vh" }}
            image="https://nswp2xtool.s3.ap-southeast-2.amazonaws.com/assets/images/desc3.svg"
          />
        </StyledCard>
      </Grid>
      <Grid
        item
        xs={12}
        sx={{
          background:
            "radial-gradient(circle at center, rgba(88,115,166,255) 1%, rgba(0,34,78,255))",
        }}
        padding={12}
      >
        <Typography
          align="center"
          fontSize={40}
          fontStyle="Nunito"
          fontWeight="800"
          color={WHITE}
        >
          Feedback
        </Typography>
        <br />
        <Typography
          align="center"
          fontSize={18}
          fontStyle="Nunito"
          color={WHITE}
        >
          We encourage feedback from the user to help us improve the tool.
          <br />
          <br />
          Feedback can be provided to Associate Professor Iain MacGill
          (i.macgill@unsw.edu.au) and Dr. Rahman Daiyan (r.daiyan@unsw.edu.au)
          and further updates on the tool will be provided at
          https://www.globh2e.org.au/
        </Typography>
      </Grid>
    </Grid>
  );
}
