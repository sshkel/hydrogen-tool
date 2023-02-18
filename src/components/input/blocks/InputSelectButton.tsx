import ExpandCircleIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import { Grid } from "@mui/material";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import React, { Suspense } from "react";

import InputCard from "./InputCard";

interface Props {
  id?: string;
  index: number;
  text: string;
  helperText?: string;
  children: JSX.Element[] | null;
  expanded: boolean;
  selected: boolean;
  className?: string;
  onOpenExpand: (index: number) => void;
  onCloseExpand: () => void;
}

const StyledButton = styled(Button)({
  textTransform: "none",
  justifyContent: "space-between",
  boxShadow: "0px 0px 0px 1.5px rgba(0,0,0,0.2)",
  paddingRight: "12px",
});

function InputSelectButton(props: Props) {
  const { id, expanded, selected, index, text, children, className } = props;

  const openExpand = () => props.onOpenExpand(index);
  const closeExpand = () => props.onCloseExpand();

  const canExpand = children != null && children.length > 0;

  const showCard = expanded && canExpand;

  const InputCollapse = React.lazy(() => import("./InputCollapse"));

  return (
    <Grid item xs={12} paddingX={3}>
      {!showCard ? (
        <Grid item>
          <StyledButton
            aria-label={id}
            variant={selected ? "contained" : "outlined"}
            color={selected ? "success" : "info"}
            fullWidth
            onClick={openExpand}
          >
            {text}
            <ExpandCircleIcon />
          </StyledButton>
        </Grid>
      ) : null}
      <Suspense fallback={null}>
        <InputCollapse
          expanded={showCard}
          timeout={0}
          unmountOnExit={!selected}
          children={
            <InputCard
              className={className}
              subtitle={true}
              title={text}
              onExpandChange={closeExpand}
              expanded={true}
            >
              {children}
            </InputCard>
          }
        />
      </Suspense>
    </Grid>
  );
}

export default React.memo(InputSelectButton);
