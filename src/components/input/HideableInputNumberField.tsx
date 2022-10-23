import InputNumberField from "./InputNumberField";

interface Props {
  inputKey: string;
  hide: boolean;
}

export default function HideableInputNumberField({ hide, inputKey }: Props) {
  if (hide) {
    return null;
  }
  return <InputNumberField inputKey={inputKey} />;
}
