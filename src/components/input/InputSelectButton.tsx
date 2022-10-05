import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import React, { Suspense } from "react";

import InputCard from "./InputCard";
import InputHelpButton from "./InputHelpButton";

interface Props {
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
});

function InputSelectButton(props: Props) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const { expanded, selected, index, text, helperText, children, className } =
    props;

  const handleClose = (event: any) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? "help-screen" : undefined;

  const openExpand = () => props.onOpenExpand(index);
  const closeExpand = () => props.onCloseExpand();

  const canExpand = children != null && children.length > 0;

  const showCard = expanded && canExpand;

  const InputCollapse = React.lazy(() => import("./InputCollapse"));

  return (
    <div>
      {!showCard ? (
        <div style={{ display: "flex" }}>
          <StyledButton
            variant={selected ? "contained" : "outlined"}
            color={selected ? "success" : "info"}
            className={className}
            fullWidth
            endIcon={<InputHelpButton helperText={helperText} />}
            onClick={openExpand}
          >
            {text}
          </StyledButton>
          <Popover
            id={popoverId}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <Typography sx={{ p: 2 }}>{helperText}</Typography>
          </Popover>
        </div>
      ) : null}
      <Suspense fallback={null}>
        <InputCollapse
          expanded={showCard}
          timeout={0}
          unmountOnExit={!selected}
          children={
            <InputCard
              title={text}
              onExpandChange={closeExpand}
              expanded={true}
            >
              {children}
            </InputCard>
          }
        />
      </Suspense>
    </div>
  );
}

export default React.memo(InputSelectButton);
