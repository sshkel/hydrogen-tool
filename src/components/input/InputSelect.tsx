import Grid from "@mui/material/Grid";
import * as React from "react";

import InputSelectButton from "./InputSelectButton";
import InputTitle from "./InputTitle";

interface Props {
  titles: string[];
  helperTexts: (string | undefined)[];
  buttonChildren: JSX.Element[][];
}

export default function InputSelectField(props: Props) {
  const [expanded, setExpanded] = React.useState<number>(-1);
  const [selected, setSelected] = React.useState<number>(0);

  const onOpenExpand = (index: number) => {
    setExpanded(index);
    setSelected(index);
  };
  const onCloseExpand = () => {
    setExpanded(-1);
  };

  const { titles, helperTexts, buttonChildren } = props;
  return (
    <Grid sx={{ marginX: 2, marginY: 0.5 }}>
      <InputTitle title="Select one option from below" />
      {titles.map((text, index) => (
        <InputSelectButton
          text={text}
          index={index}
          helperText={helperTexts[index]}
          onOpenExpand={onOpenExpand}
          onCloseExpand={onCloseExpand}
          expanded={expanded === index}
          selected={selected === index}
          children={buttonChildren[index]}
        />
      ))}
    </Grid>
  );
}
