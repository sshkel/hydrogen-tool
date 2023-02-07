import Grid from "@mui/material/Grid";
import * as React from "react";
import { useEffect } from "react";

import InputSelectButton from "./InputSelectButton";
import InputTitle from "./InputTitle";

interface Props {
  selectKey?: string;
  titles: string[];
  helperText?: string;
  buttonChildren: JSX.Element[][];
  prompt: string;
  selectClass: string;
  onSelectChange?: (index: number) => void;
  selectedIndex?: number;
  formState?: { [key: string]: number | string };
}

export default function InputSelectField(props: Props) {
  const {
    selectKey,
    titles,
    helperText,
    buttonChildren,
    selectClass,
    onSelectChange,
    // selectedIndex = 0,
    formState,
  } = props;

  let selectedIndex = props.selectedIndex;
  if (
    selectedIndex === undefined &&
    titles.indexOf(String((formState || {})[selectClass])) !== -1
  ) {
    selectedIndex = titles.indexOf(String((formState || {})[selectClass]));
  }

  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<number>(selectedIndex || 0);

  useEffect(() => {
    // Capture current state on unmount and in between state change of app
    return () => {
      (formState || {})[selectClass] = titles[selected];
    };
  });

  const prompt = props.prompt + " (Select one option from below)";

  const onOpenExpand = (index: number) => {
    if (onSelectChange) {
      onSelectChange(index);
    }

    setExpanded(true);
    setSelected(index);
  };

  const onCloseExpand = () => {
    setExpanded(false);
  };

  return (
    <Grid item paddingLeft={1} paddingTop={1} paddingBottom={2}>
      <InputTitle title={prompt} helperText={helperText} />
      {titles.map((text, index) => (
        <InputSelectButton
          key={selectKey ? `${selectKey}-${index}` : undefined}
          text={text}
          index={index}
          className={selectClass}
          onOpenExpand={onOpenExpand}
          onCloseExpand={onCloseExpand}
          expanded={expanded && selected === index}
          selected={selected === index}
          children={buttonChildren[index]}
        />
      ))}
    </Grid>
  );
}
