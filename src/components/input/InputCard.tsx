import "@fontsource/nunito";
import "@fontsource/nunito/800.css";
import ExpandCircleIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Collapse from "@mui/material/Collapse";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { SxProps, Theme, createTheme, styled } from "@mui/material/styles";
import { ThemeProvider } from "@mui/system";
import * as React from "react";

const theme = createTheme({
  typography: {
    fontFamily: "Nunito",
  },
  palette: {
    info: {
      main: "rgba(0, 0, 0, 0.54)",
      contrastText: "#000",
    },
  },
});

interface CardProps {
  title: string;
  children: JSX.Element[] | null;
  expanded?: boolean;
  onExpandChange?: () => void;
  sx?: SxProps<Theme>;
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
  const { title, children, onExpandChange } = props;
  const [expanded, setExpanded] = React.useState(!!props.expanded);

  const handleExpandClick = () => {
    if (onExpandChange) {
      onExpandChange();
    }
    setExpanded(!expanded);
  };

  return (
    <ThemeProvider theme={theme}>
      <Card
        sx={{
          fontSize: 14,
          padding: 0.5,
          ...props.sx,
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
              fontSize: 22,
              fontWeight: "bold",
              color: expanded ? "#ED7D31" : "#396AFF",
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
                color: expanded ? "#ED7D31" : "inherit",
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
