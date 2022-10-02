import Grid from "@mui/material/Grid";
import * as React from "react";

import InputSelectButton from "./InputSelectButton";
import InputTitle from "./InputTitle";

interface Props {
  titles: string[];
  helperTexts: (string | undefined)[];
  buttonChildren: JSX.Element[][];
  prompt?: string;
}

export default function InputSelectField(props: Props) {
  const [expanded, setExpanded] = React.useState<number>(-1);
  const [selected, setSelected] = React.useState<number>(0);

  const onOpenExpand = (index: number) => {
    // TODO: test empty children
    if (buttonChildren[index].length > 0) {
      setExpanded(index);
    } else {
      setExpanded(-1);
    }
    setSelected(index);
  };
  const onCloseExpand = () => {
    setExpanded(-1);
  };

  const {
    titles,
    helperTexts,
    buttonChildren,
    prompt = "Select one option from below",
  } = props;
  return (
    <Grid sx={{ marginX: 2, marginY: 0.5 }}>
      <InputTitle title={prompt} />
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
