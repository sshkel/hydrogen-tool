import "@fontsource/nunito/700.css";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton, {
  ListItemButtonProps,
} from "@mui/material/ListItemButton";
import ListItemText, { ListItemTextProps } from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import { CSSObject, Theme, styled } from "@mui/material/styles";
import React from "react";
import { useNavigate } from "react-router-dom";

import { BLUE } from "./colors";

const drawerWidth = 260;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  backgroundColor: BLUE,
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  backgroundColor: BLUE,
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const StyledListItem = styled(ListItem)({
  height: 48,
  // hover states
  "& .MuiListItemButton-root:hover": {
    height: 48,
    backgroundColor: "#2C55D1",
  },
});

interface StyledListItemButtonProps extends ListItemButtonProps {
  open: boolean;
}

const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "open",
})<StyledListItemButtonProps>(({ open }) => ({
  height: 48,
  justifyContent: open ? "initial" : "center",
}));

interface StyledListItemTextProps extends ListItemTextProps {
  open: boolean;
}

const StyledListItemText = styled(ListItemText, {
  shouldForwardProp: (prop) => prop !== "open",
})<StyledListItemTextProps>(({ open }) => ({
  opacity: open ? 1 : 0,
  color: "white",

  "& .MuiTypography-root": {
    fontWeight: 700,
  },
}));

export function SideBar() {
  const [open, setOpen] = React.useState(false);

  const iconStyle = {
    fontSize: 30,
    color: "white",
    marginRight: open ? "20px" : 0,
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const navigate = useNavigate();
  return (
    <Drawer
      onMouseEnter={() => handleDrawerOpen()}
      onMouseLeave={() => handleDrawerClose()}
      variant="permanent"
      anchor="left"
      open={open}
    >
      <Toolbar />
      <List>
        <StyledListItem disableGutters>
          <StyledListItemButton onClick={() => navigate("/")} open={open}>
            <HomeRoundedIcon sx={iconStyle} />
            <StyledListItemText primary="Home" open={open} />
          </StyledListItemButton>
        </StyledListItem>

        <StyledListItem disableGutters>
          <StyledListItemButton onClick={() => navigate("/map")} open={open}>
            <SettingsSuggestRoundedIcon sx={iconStyle} />
            <StyledListItemText primary="Design Tool" open={open} />
          </StyledListItemButton>
        </StyledListItem>

        <StyledListItem disableGutters>
          <StyledListItemButton onClick={() => navigate("/about")} open={open}>
            <PeopleAltRoundedIcon sx={iconStyle} />
            <StyledListItemText primary="About" open={open} />
          </StyledListItemButton>
        </StyledListItem>

        <StyledListItem disableGutters>
          <StyledListItemButton
            onClick={() => navigate("/contact")}
            open={open}
          >
            <EmailRoundedIcon sx={iconStyle} />
            <StyledListItemText primary="Contact Us" open={open} />
          </StyledListItemButton>
        </StyledListItem>
      </List>
    </Drawer>
  );
}
