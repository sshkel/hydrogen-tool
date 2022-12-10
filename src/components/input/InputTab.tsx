import Tab, { TabProps } from "@mui/material/Tab";
import { styled } from "@mui/material/styles";

interface Props {
  label: string;
  value: string;
  active: boolean;
}

interface StyledTabProps extends TabProps {
  active: boolean;
}

const StyledTab = styled(Tab, {
  shouldForwardProp: (prop) => prop !== "active",
})<StyledTabProps>(({ active }) => ({
  fontWeight: "bold",
  textTransform: "none",
  fontSize: "18px",
  borderRadius: "20px 20px 0px 0px",
  backgroundColor: active ? "#F2F2F2" : "#A6A6A6",
  minWidth: "180px",
  marginLeft: 20,
}));

export default function InputTab(props: Props) {
  return <StyledTab {...props} active={props.active} />;
}
