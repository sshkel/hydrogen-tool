import "@fontsource/nunito/700.css";
import Box from "@mui/material/Box";
import Step from "@mui/material/Step";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import { styled } from "@mui/material/styles";

import { BLUE } from "./colors";

const steps = [
  "Select location",
  "Select model",
  "Input parameters",
  "Results",
];

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
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

export default function HorizontalLabelPositionBelowStepper(props: {
  activeStep: number;
}) {
  return (
    <Box sx={{ width: "100%", backgroundColor: "#F4F9FA", paddingY: 1 }}>
      <Stepper
        activeStep={props.activeStep}
        alternativeLabel
        connector={<ColorlibConnector />}
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
    </Box>
  );
}
