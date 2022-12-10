import "@fontsource/nunito";
import "@fontsource/nunito/800.css";
import ExpandCircleIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import Box from "@mui/material/Box";
import Card, { CardProps } from "@mui/material/Card";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { clsx } from "clsx";
import React, { Suspense } from "react";

import { nameToId } from "../../utils";
import { BLUE, ORANGE } from "../colors";

export interface InputCardProps {
  title: string;
  subtitle?: boolean;
  children: JSX.Element[] | null;
  expanded?: boolean;
  onExpandChange?: () => void;
  mountOnEnter?: boolean;
  className?: string;
}

interface StyledCardProps extends CardProps {
  expanded: boolean;
  onExpandChange: boolean;
  subtitle: number;
}

interface ExpandMoreProps extends IconButtonProps {
  expanded: boolean;
}

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "expanded" && prop !== "onExpandChange",
})<StyledCardProps>(({ expanded, onExpandChange, subtitle }) => ({
  fontSize: 14,
  padding: 0.5,
  borderRadius: 2,
  boxShadow:
    "0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
  ...(expanded && {
    borderColor: ORANGE,
  }),

  ...(expanded &&
    onExpandChange && {
      borderRadius: 8,
      borderWidth: 2,
    }),

  ...(expanded &&
    subtitle && {
      paddingBottom: "12px",
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

function InputCard(props: InputCardProps) {
  const {
    title,
    subtitle = false,
    children,
    mountOnEnter,
    onExpandChange,
    className,
  } = props;
  const [expanded, setExpanded] = React.useState(!!props.expanded);

  const handleExpandClick = () => {
    if (onExpandChange) {
      onExpandChange();
    } else {
      setExpanded(!expanded);
    }
  };

  const InputCollapse = React.lazy(() => import("./InputCollapse"));

  return (
    <StyledCard
      expanded={!!expanded}
      onExpandChange={!!onExpandChange}
      subtitle={subtitle ? 1 : 0}
      variant="outlined"
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          marginBottom: expanded ? "-8px" : 0,
        }}
      >
        <Typography
          sx={{
            fontSize: subtitle ? "1rem" : 22,
            fontWeight: "800",
            color: expanded ? ORANGE : BLUE,
            padding: "8px 8px 8px 18px",
          }}
          className={clsx(
            subtitle && expanded && "selectedConfiguration",
            subtitle && expanded && className
          )}
        >
          {title}
        </Typography>
        <ExpandMore
          expanded={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label={`${nameToId(title)}-show-more`}
        >
          <ExpandCircleIcon />
        </ExpandMore>
      </Box>
      <Suspense fallback={null}>
        <InputCollapse
          expanded={expanded}
          children={children}
          mountOnEnter={mountOnEnter}
        />
      </Suspense>
    </StyledCard>
  );
}

export default React.memo(InputCard);
