import InputCard from "../InputCard";
import InputNumberField from "../InputNumberField";
import InputSelect from "../InputSelect";

export default function AmmoniaControlledPowerPlantCard() {
  return (
    <InputCard
      title="Power Plant Parameters"
      children={[
        <InputCard
          subtitle
          mountOnEnter
          key="powerCapacityConfiguration"
          title="Power Plant Capacity"
          children={[
            <InputNumberField
              key="renewableEnergyPlantOversizing"
              inputKey="renewableEnergyPlantOversizing"
            />,
            <InputNumberField
              key="solarToWindPercentage"
              inputKey="solarToWindPercentage"
            />,
          ]}
        />,
        <InputSelect
          key="powerPlantConfigurationSelect"
          selectKey="powerPlantConfigurationSelect"
          prompt="Power Plant Configuration"
          selectClass="powerPlantConfiguration"
          titles={["Standalone", "Grid Connected"]}
          buttonChildren={[
            [],
            [
              <InputNumberField
                key="gridConnectionCost"
                inputKey="gridConnectionCost"
              />,
              <InputNumberField
                key="additionalTransmissionCharges"
                inputKey="additionalTransmissionCharges"
              />,
            ],
          ]}
        />,
        <InputCard
          subtitle
          mountOnEnter
          key="powerPlantEfficiency"
          title="Power Plant Efficiency"
          children={[
            <InputNumberField
              key="powerPlantDegradationRate"
              inputKey="powerPlantDegradationRate"
            />,
          ]}
        />,
      ]}
    />
  );
}
