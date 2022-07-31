import HelpIcon from "@mui/icons-material/Help";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import * as React from "react";

interface Props {
  helperText?: string;
}

export default function InputHelpButton(props: Props) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const { helperText } = props;

  if (!helperText) {
    return null;
  }

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const id = open ? "help-button" : undefined;
  const popoverId = open ? "help-popup" : undefined;

  return (
    <div style={{ display: "inline-flex" }}>
      <IconButton
        aria-label={id}
        aria-owns={popoverId}
        aria-haspopup="true"
        onClick={handlePopoverOpen}
        style={{ backgroundColor: "transparent" }}
        size="small"
      >
        <HelpIcon fontSize="inherit" />
      </IconButton>
      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
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
