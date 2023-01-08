import Collapse from "@mui/material/Collapse";

interface Props {
  expanded: boolean;
  timeout?: number | "auto";
  children: JSX.Element[] | React.ReactElement | null;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
}

export default function InputCollapse(props: Props) {
  const { expanded, timeout = "auto", unmountOnExit = false, children } = props;
  return (
    <Collapse
      in={expanded}
      timeout={timeout}
      // This parameter was introduced to improve performance of switching between Basic/Advanced tabs
      // After removing more input fields, this was no longer needed. Keeping just in case
      // more fields are added and lag becomes noticeable again.
      // mountOnEnter={mountOnEnter}
      unmountOnExit={unmountOnExit}
    >
      {children}
    </Collapse>
  );
}
