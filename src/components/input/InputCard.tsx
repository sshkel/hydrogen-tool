import "@fontsource/nunito";
import ExpandCircleIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Collapse from "@mui/material/Collapse";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { createTheme, styled } from "@mui/material/styles";
import { ThemeProvider } from "@mui/system";
import * as React from "react";

const theme = createTheme({
  typography: {
    fontFamily: "Nunito",
  },
});

interface CardProps {
  title: string;
  children: JSX.Element[] | null;
}

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function InputCard(props: CardProps) {
  const { title, children } = props;
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <ThemeProvider theme={theme}>
      <Card
        sx={{
          fontSize: 14,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            flexFlow: "wrap",
            alignItems: "stretch",
          }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: "bold",
              color: expanded ? "orange" : "blue",
              padding: 1,
            }}
          >
            {title}
          </Typography>
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandCircleIcon
              sx={{
                color: expanded ? "orange" : "inherit",
              }}
            />
          </ExpandMore>
        </Box>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {children}
        </Collapse>
      </Card>
    </ThemeProvider>
  );
}
