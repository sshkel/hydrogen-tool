import {
  Card,
  CardContent,
  Grid,
  Typography,
  TypographyProps,
  styled,
} from "@mui/material";

import { GREY } from "../colors";

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
  return (
    <Grid container flexDirection="column" sx={{ backgroundColor: GREY }}>
      <Grid container item alignItems="stretch">
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <ItemHeading>The Development Team</ItemHeading>

              <StyledListItem
                variant="body2"
                variantMapping={{ body2: "span" }}
              >
                The Powerfuel Value Chain Cost Tool was developed by NSW
                Powerfuels including:
                <ul>
                  <li>Hydrogen Network NSW Decarbonisation</li>
                  <li>
                    Innovation Hub ARC Training Centre for The Global Hydrogen
                  </li>
                  <li>Economy NSW Office of Chief Scientist and Engineer</li>
                </ul>
              </StyledListItem>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              <ItemHeading>Contact</ItemHeading>
              <StyledListItem>
                Dr. Rahman Daiyan
                <br />
                UNSW Sydney
                <br />
                r.daiyan@unsw.edu.au
              </StyledListItem>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Grid>
  );
}
