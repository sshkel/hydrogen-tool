import { Alert, AlertTitle } from "@mui/material";

interface Props {
  message: string;
  state?: { [key: string]: any };
}
// TODO put the state dump behind a debug flag
export default function ErrorAlert(props: Props) {
  return (
    <div>
      <Alert severity="error">
        <AlertTitle>Oops, something went wrong</AlertTitle>
        {props.message}
        <pre>{JSON.stringify(props.state, null, 2)}</pre>
      </Alert>
    </div>
  );
}
