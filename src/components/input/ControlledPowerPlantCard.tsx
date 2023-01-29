import React from "react";

import { PowerPlantType } from "../../types";
import { isOffshore } from "../../utils";
import ControlledInputSelect from "./ControlledInputSelect";
import HideableInputNumberField from "./HideableInputNumberField";
import InputCard from "./InputCard";
import InputNumberField from "./InputNumberField";
import InputSelect from "./InputSelect";

const POWER_PLANT_TYPES: PowerPlantType[] = ["Wind", "Solar", "Hybrid"];

interface Props {
  location: string;
}

export default function ControlledAmmoniaPowerPlantCard(props: Props) {
  const [powerPlantType, setPowerPlantType] =
    React.useState<PowerPlantType>("Wind");

  const [powerPlantTypeSelectedIndex, setPowerPlantTypeSelectedIndex] =
    React.useState<number>(0);
  const [powerPlantTypeExpanded, setPowerPlantTypeExpanded] =
    React.useState<boolean>(false);

  const onSelectOpen = (
    indexSetter: (i: number) => void,
    expandSetter: (bool: boolean) => void,
    typeSetter?: (type: PowerPlantType) => void
  ) => {
    return (index: number) => {
      indexSetter(index);
      expandSetter(true);
      if (typeSetter) {
        typeSetter(POWER_PLANT_TYPES[index]);
      }
    };
  };

  const onSelectClose = (expandSetter: (bool: boolean) => void) => {
    return () => {
      expandSetter(false);
    };
  };

  const isNotSolar = () => powerPlantType === "Wind";
  const isNotWind = () => powerPlantType === "Solar";

  function getPowerPlantCards() {
    if (isOffshore(props.location)) {
      return [
        [
          <InputNumberField
            key="powerPlantOversizeRatio"
            inputKey="powerPlantOversizeRatio"
          />,
          <InputNumberField key="windDegradation" inputKey="windDegradation" />,
        ],
      ];
    } else {
      return [
        [
          <InputNumberField
            key="powerPlantOversizeRatio"
            inputKey="powerPlantOversizeRatio"
          />,
          <InputNumberField key="windDegradation" inputKey="windDegradation" />,
        ],
        [
          <InputNumberField
            key="powerPlantOversizeRatio"
            inputKey="powerPlantOversizeRatio"
          />,
          <InputNumberField
            key="solarDegradation"
            inputKey="solarDegradation"
          />,
        ],
        [
          <InputNumberField
            key="powerPlantOversizeRatio"
            inputKey="powerPlantOversizeRatio"
          />,
          <InputNumberField
            key="solarToWindPercentage"
            inputKey="solarToWindPercentage"
          />,
          <InputNumberField key="windDegradation" inputKey="windDegradation" />,
          <InputNumberField
            key="solarDegradation"
            inputKey="solarDegradation"
          />,
        ],
      ];
    }
  }
  return (
    <InputCard
      title="Power Plant Parameters"
      children={[
        <ControlledInputSelect
          key="powerPlantType"
          selectKey="powerPlantType"
          prompt="Power Plant Type"
          titles={isOffshore(props.location) ? ["Wind"] : POWER_PLANT_TYPES}
          selectClass="powerPlantType"
          selectedIndex={powerPlantTypeSelectedIndex}
          expanded={powerPlantTypeExpanded}
          onOpenExpand={onSelectOpen(
            setPowerPlantTypeSelectedIndex,
            setPowerPlantTypeExpanded,
            setPowerPlantType
          )}
          onCloseExpand={onSelectClose(setPowerPlantTypeExpanded)}
          buttonChildren={getPowerPlantCards()}
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
        <InputSelect
          key="powerSupplyOptionSelect"
          selectKey="powerSupplyOptionSelect"
          prompt="Power Supply Option"
          selectClass="powerSupplyOption"
          titles={["Self Build", "Power Purchase Agreement (PPA)"]}
          buttonChildren={[
            [
              <HideableInputNumberField
                key="solarFarmBuildCost"
                inputKey="solarFarmBuildCost"
                hide={isNotSolar()}
              />,
              <HideableInputNumberField
                key="solarReferenceCapacity"
                inputKey="solarReferenceCapacity"
                hide={isNotSolar()}
              />,
              <HideableInputNumberField
                key="solarPVCostReductionWithScale"
                inputKey="solarPVCostReductionWithScale"
                hide={isNotSolar()}
              />,
              <HideableInputNumberField
                key="solarReferenceFoldIncrease"
                inputKey="solarReferenceFoldIncrease"
                hide={isNotSolar()}
              />,
              <HideableInputNumberField
                key="windFarmBuildCost"
                inputKey="windFarmBuildCost"
                hide={isNotWind()}
              />,
              <HideableInputNumberField
                key="windReferenceCapacity"
                inputKey="windReferenceCapacity"
                hide={isNotWind()}
              />,
              <HideableInputNumberField
                key="windCostReductionWithScale"
                inputKey="windCostReductionWithScale"
                hide={isNotWind()}
              />,
              <HideableInputNumberField
                key="windReferenceFoldIncrease"
                inputKey="windReferenceFoldIncrease"
                hide={isNotWind()}
              />,
              <HideableInputNumberField
                key="solarEpcCosts"
                inputKey="solarEpcCosts"
                hide={isNotSolar()}
              />,
              <HideableInputNumberField
                key="solarLandProcurementCosts"
                inputKey="solarLandProcurementCosts"
                hide={isNotSolar()}
              />,
              <HideableInputNumberField
                key="windEpcCosts"
                inputKey="windEpcCosts"
                hide={isNotWind()}
              />,
              <HideableInputNumberField
                key="windLandProcurementCosts"
                inputKey="windLandProcurementCosts"
                hide={isNotWind()}
              />,
              <HideableInputNumberField
                key="solarOpex"
                inputKey="solarOpex"
                hide={isNotSolar()}
              />,
              <HideableInputNumberField
                key="windOpex"
                inputKey="windOpex"
                hide={isNotWind()}
              />,
            ],
            [
              <InputNumberField
                key="principalPPACost"
                inputKey="principalPPACost"
              />,
            ],
          ]}
        />,
      ]}
    />
  );
}
