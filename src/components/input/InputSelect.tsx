import Grid from "@mui/material/Grid";
import * as React from "react";

import InputSelectButton from "./InputSelectButton";

interface Props {
  titles: string[];
  helperTexts: (string | undefined)[];
  buttonChildren: JSX.Element[][];
}

export default function InputSelectField(props: Props) {
  const [expanded, setExpanded] = React.useState<number>(-1);

  const onOpenExpand = (index: number) => {
    setExpanded(index);
  };
  const onCloseExpand = () => {
    setExpanded(-1);
  };

  const { titles, helperTexts, buttonChildren } = props;
  return (
    <Grid>
      {titles.map((text, index) => (
        <InputSelectButton
          text={text}
          index={index}
          helperText={helperTexts[index]}
          onOpenExpand={onOpenExpand}
          onCloseExpand={onCloseExpand}
          expanded={expanded === index}
          children={buttonChildren[index]}
        />
      ))}
    </Grid>
  );
}
