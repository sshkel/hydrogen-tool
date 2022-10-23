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
  selectedIndex: number;
  expanded: boolean;
  onOpenExpand: (index: number) => void;
  onCloseExpand: () => void;
}

export default function ControlledInputSelectField(props: Props) {
  const {
    expanded,
    selectedIndex,
    selectKey,
    titles,
    helperText,
    buttonChildren,
    prompt = "Select one option from below",
    selectClass,
    onOpenExpand,
    onCloseExpand,
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
          expanded={expanded && selectedIndex === index}
          selected={selectedIndex === index}
          children={buttonChildren[index]}
        />
      ))}
    </Grid>
  );
}
