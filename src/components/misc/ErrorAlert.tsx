import { Alert, AlertTitle } from "@mui/material";

// TODO put a download button for dumping state so we can debug this easier
export default function ErrorAlert() {
  return (
    <Alert severity="error">
      <AlertTitle>Invalid inputs</AlertTitle>
      Electrolyser capacity was 0. Please check the inputs.
    </Alert>
  );
}
