import Grid from "@mui/material/Grid";
import * as React from "react";

import InputSelectButton from "./InputSelectButton";
import InputTitle from "./InputTitle";

interface Props {
  selectKey?: string;
  titles: string[];
  helperText?: string;
  buttonChildren: JSX.Element[][];
  prompt?: string;
  selectClass?: string;
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

  const {
    selectKey,
    titles,
    helperText,
    buttonChildren,
    prompt = "Select one option from below",
    selectClass,
  } = props;
  return (
    <Grid container paddingLeft={0.5}>
      <InputTitle title={prompt} helperText={helperText} />
      {titles.map((text, index) => (
        <InputSelectButton
          key={selectKey ? `${selectKey}-${index}` : undefined}
          text={text}
          index={index}
          className={selectClass}
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
