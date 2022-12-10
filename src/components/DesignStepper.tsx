import "@fontsource/nunito/700.css";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import Grid from "@mui/material/Grid";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Step from "@mui/material/Step";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import { styled } from "@mui/material/styles";
import { useState } from "react";

import { BLUE } from "./colors";

const steps = [
  "Select location",
  "Select model",
  "Input parameters",
  "Results",
];

const ColorlibConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: "linear-gradient(90deg, #5A6FFA, #BDD7EF)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: BLUE,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: "#eaeaf0",
    borderRadius: 1,
  },
}));

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

interface StepperProps {
  activeStep: number;
}

export default function DesignStepper(props: StepperProps) {
  const { activeStep } = props;
  const [expanded, setExpanded] = useState(true);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Grid container sx={{ width: "100%", backgroundColor: "#F4F9FA" }}>
      <Grid item xs={12}>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            connector={<ColorlibConnector />}
            sx={{ paddingTop: 2 }}
          >
            {steps.map((label) => (
              <Step
                sx={{
                  "& .MuiStepLabel-alternativeLabel": {
                    fontWeight: 700,
                  },
                  "& .MuiSvgIcon-root": {
                    width: "28px",
                    height: "28px",
                  },
                }}
                key={label}
              >
                <StepLabel
                  sx={{
                    "& .MuiStepLabel-label": {
                      fontWeight: "700 !important",
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Collapse>
      </Grid>
      <Grid item display={"flex"} flexBasis={"50%"}>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="display guide"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </Grid>
    </Grid>
  );
}
