import { Card, CardActionArea, CardHeader } from "@mui/material";

import { BLACK, BLUE, WHITE } from "../colors";

type Props = {
  onClick: () => void;
  title: string;
  subheader: string;
};

export function PowerfuelPathwayCard(props: Props) {
  const { onClick, title, subheader } = props;
  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: "12px",
        border: "0.5px solid darkgrey",
      }}
    >
      <CardActionArea>
        <CardHeader
          title={title}
          subheader={subheader}
          titleTypographyProps={{
            fontWeight: "bold",
            fontSize: 14,
          }}
          subheaderTypographyProps={{
            fontSize: 12,
            lineHeight: 1.2,
            fontStyle: "italic",
            color: BLACK,
          }}
          sx={{
            padding: "12px",
            "&:hover": {
              backgroundColor: BLUE,
              color: WHITE,
            },

            "&:hover .MuiCardHeader-subheader": {
              color: WHITE,
            },
          }}
        />
      </CardActionArea>
    </Card>
  );
}
