import {Alert, AlertTitle} from "@mui/material";
import Button from "@mui/material/Button";

interface Props {
    message: string;
    state?: { [key: string]: any };
}

// TODO put the state dump behind a debug flag
export default function ErrorAlert(props: Props) {
    return (
        <div>
            <Alert severity="error" action={<Button color="inherit" size="small"
                                                    href={`data:text/json;charset=utf-8,${encodeURIComponent(
                                                        JSON.stringify(props.state, null, 2)
                                                    )}`}
                                                    download="debug_state.json"
            >
                {`Export Debug Report`}
            </Button>}>
                <AlertTitle>Oops, something went wrong</AlertTitle>
                {props.message}
            </Alert>
        </div>
    );
}
