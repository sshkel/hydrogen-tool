import Grid from "@mui/material/Grid";
import * as React from "react";

import InputSelectButton from "./InputSelectButton";
import InputTitle from "./InputTitle";

interface Props {
  selectKey?: string;
  titles: string[];
  helperText?: string;
  buttonChildren: JSX.Element[][];
  prompt: string;
  selectClass?: string;
  onSelectChange?: (index: number) => void;
  selectedIndex?: number;
}

export default function InputSelectField(props: Props) {
  const {
    selectKey,
    titles,
    helperText,
    buttonChildren,
    selectClass,
    selectedIndex = 0,
    onSelectChange,
  } = props;

  const [expanded, setExpanded] = React.useState<boolean>(false);
  const [selected, setSelected] = React.useState<number>(selectedIndex);

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
