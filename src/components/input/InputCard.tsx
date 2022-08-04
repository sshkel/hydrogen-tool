import "@fontsource/nunito";
import "@fontsource/nunito/800.css";
import ExpandCircleIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import Box from "@mui/material/Box";
import Card, { CardProps } from "@mui/material/Card";
import Collapse from "@mui/material/Collapse";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import * as React from "react";

import { BLUE, ORANGE } from "./colors";

interface InputCardProps {
  title: string;
  children: JSX.Element[] | null;
  expanded?: boolean;
  onExpandChange?: () => void;
}

interface StyledCardProps extends CardProps {
  expanded: boolean;
  onExpandChange: boolean;
}

interface ExpandMoreProps extends IconButtonProps {
  expanded: boolean;
}

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "expanded" && prop !== "onExpandChange",
})<StyledCardProps>(({ expanded, onExpandChange }) => ({
  fontSize: 14,
  padding: 0.5,
  borderRadius: 2,
  boxShadow:
    "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
  ...(expanded &&
    onExpandChange && {
      borderRadius: 8,
      borderColor: ORANGE,
      borderWidth: 2,
    }),
}));

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expanded: expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expanded }) => ({
  transform: !expanded ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),

  "& .MuiSvgIcon-root": {
    color: expanded ? ORANGE : "inherit",
  },
}));

export default function InputCard(props: InputCardProps) {
  const { title, children, onExpandChange } = props;
  const [expanded, setExpanded] = React.useState(!!props.expanded);

  const handleExpandClick = () => {
    if (onExpandChange) {
      onExpandChange();
    }
    setExpanded(!expanded);
  };

  return (
    <StyledCard
      expanded={!!expanded}
      onExpandChange={!!onExpandChange}
      variant="outlined"
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
        }}
      >
        <Typography
          sx={{
            fontSize: 22,
            fontWeight: "bold",
            color: expanded ? ORANGE : BLUE,
            padding: 1,
          }}
        >
          {title}
        </Typography>
        <ExpandMore
          expanded={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandCircleIcon />
        </ExpandMore>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </StyledCard>
  );
}
