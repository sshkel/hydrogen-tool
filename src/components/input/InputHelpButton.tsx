import HelpIcon from "@mui/icons-material/Help";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import * as React from "react";

interface Props {
  helperText?: string;
}

export default function InputHelpButton(props: Props) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const { helperText } = props;

  if (!helperText) {
    return null;
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div style={{ display: "flex" }}>
      <IconButton
        aria-label="help"
        onClick={handleClick}
        style={{ backgroundColor: "transparent" }}
      >
        <HelpIcon />
      </IconButton>
      <Popover
        id={id}
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
