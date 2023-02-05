import InputNumberField from "./InputNumberField";

interface Props {
  inputKey: string;
  hide: boolean;
  formState: { [key: string]: number | string };
}

export default function HideableInputNumberField({
  hide,
  inputKey,
  formState,
}: Props) {
  if (hide) {
    return null;
  }
  return <InputNumberField inputKey={inputKey} formState={formState} />;
}
