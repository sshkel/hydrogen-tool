import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import * as React from "react";

import InputCard from "./InputCard";
import InputHelpButton from "./InputHelpButton";

interface Props {
  index: number;
  text: string;
  helperText?: string;
  children: JSX.Element[] | null;
  expanded: boolean;
  onOpenExpand: (index: number) => void;
  onCloseExpand: () => void;
}

const StyledButton = styled(Button)({
  textTransform: "none",
  justifyContent: "space-between",
  boxShadow: "0px 0px 0px 1.5px rgba(0,0,0,0.2)",
});

export default function InputSelectButton(props: Props) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const { expanded, index, text, helperText, children } = props;

  const handleClose = (event: any) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? "help-screen" : undefined;

  const openExpand = () => props.onOpenExpand(index);
  const closeExpand = () => props.onCloseExpand();
  return expanded ? (
    <InputCard title={text} onExpandChange={closeExpand} expanded={true}>
      {children}
    </InputCard>
  ) : (
    <div style={{ display: "flex" }}>
      <StyledButton
        variant="outlined"
        color="info"
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
  );
}
