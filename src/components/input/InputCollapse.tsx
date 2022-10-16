import Collapse from "@mui/material/Collapse";

interface Props {
  expanded: boolean;
  timeout?: number | "auto";
  children: JSX.Element[] | React.ReactElement | null;
  unmountOnExit?: boolean;
}

export default function InputCollapse(props: Props) {
  const { expanded, timeout = "auto", unmountOnExit = false, children } = props;
  return (
    <Collapse
      in={expanded}
      timeout={timeout}
      unmountOnExit={unmountOnExit}
      sx={{ paddingBottom: expanded ? 2 : 0 }}
    >
      {children}
    </Collapse>
  );
}
