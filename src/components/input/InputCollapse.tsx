import Collapse from "@mui/material/Collapse";

interface Props {
  expanded: boolean;
  timeout?: number | "auto";
  children: JSX.Element[] | React.ReactElement | null;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
}

export default function InputCollapse(props: Props) {
  const {
    expanded,
    timeout = "auto",
    unmountOnExit = false,
    mountOnEnter = false,
    children,
  } = props;
  return (
    <Collapse
      in={expanded}
      timeout={timeout}
      mountOnEnter={mountOnEnter}
      unmountOnExit={unmountOnExit}
    >
      {children}
    </Collapse>
  );
}
