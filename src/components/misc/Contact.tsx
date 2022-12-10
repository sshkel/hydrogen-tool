import {
  Card,
  CardContent,
  Grid,
  Typography,
  TypographyProps,
  styled,
  useTheme,
} from "@mui/material";

import { BLUE, GREY, OFF_WHITE, WHITE } from "../colors";
import { OFFICE_OF_CHIEF_SCIENTIST } from "../logos";

const ItemHeading = styled(Typography)(({ theme }) => ({
  ...theme.typography.h5,
  padding: theme.spacing(1),
  fontWeight: "bold",
}));
const StyledCard = styled(Card)(({ theme }) => ({
  ...theme.typography.body2,
  height: "90%",
  margin: "15px",
  borderRadius: "20px",
}));
const StyledListItem = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(0.1),
  paddingLeft: "10px",
}));
export function Contact() {
  const theme = useTheme();

  return (
    <Grid container flexDirection="column">
      <Grid
        item
        container
        alignItems="stretch"
        sx={{ backgroundColor: OFF_WHITE }}
        padding={12}
      >
        <Grid item xs={12}>
          <Typography
            fontSize={40}
            fontStyle="Nunito"
            fontWeight="800"
            color="#284069"
          >
            The Development Team
          </Typography>
        </Grid>

        <Grid item xs={4}>
          <img src={OFFICE_OF_CHIEF_SCIENTIST} />
        </Grid>

        <Grid item xs={12}>
          <Typography fontSize={18} fontStyle="Nunito">
            NSW Powerfuels including Hydrogen Network
            <br />
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
        padding={12}
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
