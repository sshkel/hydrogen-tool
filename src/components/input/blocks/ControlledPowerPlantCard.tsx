import React from "react";

import { PowerPlantType } from "../../../types";
import { InputScreenProps } from "../../../types";
import { isOffshore, isSolar, isWind } from "../../../utils";
import HideableInputNumberField from "./HideableInputNumberField";
import InputCard from "./InputCard";
import InputNumberField from "./InputNumberField";
import InputSelect from "./InputSelect";

const POWER_PLANT_TYPES: PowerPlantType[] = ["Wind", "Solar", "Hybrid"];

interface Props extends InputScreenProps {
  withNominalCapacity: boolean;
}

function getPowerPlantCards(props: Props) {
  if (props.withNominalCapacity) {
    if (isOffshore(props.location)) {
      return [
        [
          <InputSelect
            key="windPowerPlantCapacitySelect"
            selectKey="windPowerPlantCapacitySelect"
            prompt="Power Plant Capacity"
            titles={["Oversize Ratio", "Nominal Capacity"]}
            selectClass="powerCapacityConfiguration"
            helperText="Wind farm capacity in MW or as a ratio of electrolyser capacity"
            formState={props.formState}
            buttonChildren={[
              [
                <InputNumberField
                  key="powerPlantOversizeRatio"
                  inputKey="powerPlantOversizeRatio"
                  formState={props.formState}
                />,
              ],
              [
                <InputNumberField
                  key="windNominalCapacity"
                  inputKey="windNominalCapacity"
                  formState={props.formState}
                />,
              ],
            ]}
          />,
          <InputNumberField
            key="windDegradation"
            inputKey="windDegradation"
            formState={props.formState}
          />,
        ],
      ];
    }
    return [
      [
        <InputSelect
          key="windPowerPlantCapacitySelect"
          selectKey="windPowerPlantCapacitySelect"
          prompt="Power Plant Capacity"
          titles={["Oversize Ratio", "Nominal Capacity"]}
          selectClass="powerCapacityConfiguration"
          helperText="Wind farm capacity in MW or as a ratio of electrolyser capacity"
          formState={props.formState}
          buttonChildren={[
            [
              <InputNumberField
                key="powerPlantOversizeRatio"
                inputKey="powerPlantOversizeRatio"
                formState={props.formState}
              />,
            ],
            [
              <InputNumberField
                key="windNominalCapacity"
                inputKey="windNominalCapacity"
                formState={props.formState}
              />,
            ],
          ]}
        />,
        <InputNumberField
          key="windDegradation"
          inputKey="windDegradation"
          formState={props.formState}
        />,
      ],
      [
        <InputSelect
          key="solarPowerPlantCapacitySelect"
          selectKey="solarPowerPlantCapacitySelect"
          prompt="Power Plant Capacity"
          titles={["Oversize Ratio", "Nominal Capacity"]}
          selectClass="powerCapacityConfiguration"
          helperText="Solar farm capacity in MW or as a ratio of electrolyser capacity"
          formState={props.formState}
          buttonChildren={[
            [
              <InputNumberField
                key="powerPlantOversizeRatio"
                inputKey="powerPlantOversizeRatio"
                formState={props.formState}
              />,
            ],
            [
              <InputNumberField
                key="solarNominalCapacity"
                inputKey="solarNominalCapacity"
                formState={props.formState}
              />,
            ],
          ]}
        />,
        <InputNumberField
          key="solarDegradation"
          inputKey="solarDegradation"
          formState={props.formState}
        />,
      ],
      [
        <InputSelect
          key="hybridPowerPlantCapacitySelect"
          selectKey="hybridPowerPlantCapacitySelect"
          prompt="Power Plant Capacity"
          selectClass="powerCapacityConfiguration"
          titles={["Oversize Ratio", "Nominal Capacity"]}
          helperText="Solar and Wind farm capacity in MW as a ratio of electrolyser capacity"
          formState={props.formState}
          buttonChildren={[
            [
              <InputNumberField
                key="powerPlantOversizeRatio"
                inputKey="powerPlantOversizeRatio"
                formState={props.formState}
              />,
              <InputNumberField
                key="solarToWindPercentage"
                inputKey="solarToWindPercentage"
                formState={props.formState}
              />,
            ],
            [
              <InputNumberField
                key="windNominalCapacity"
                inputKey="windNominalCapacity"
                formState={props.formState}
              />,
              <InputNumberField
                key="solarNominalCapacity"
                inputKey="solarNominalCapacity"
                formState={props.formState}
              />,
            ],
          ]}
        />,
        <InputNumberField
          key="windDegradation"
          inputKey="windDegradation"
          formState={props.formState}
        />,
        <InputNumberField
          key="solarDegradation"
          inputKey="solarDegradation"
          formState={props.formState}
        />,
      ],
    ];
  }
  if (isOffshore(props.location)) {
    return [
      [
        <InputNumberField
          key="powerPlantOversizeRatio"
          inputKey="powerPlantOversizeRatio"
          formState={props.formState}
        />,
        <InputNumberField
          key="windDegradation"
          inputKey="windDegradation"
          formState={props.formState}
        />,
      ],
    ];
  } else {
    return [
      [
        <InputNumberField
          key="powerPlantOversizeRatio"
          inputKey="powerPlantOversizeRatio"
          formState={props.formState}
        />,
        <InputNumberField
          key="windDegradation"
          inputKey="windDegradation"
          formState={props.formState}
        />,
      ],
      [
        <InputNumberField
          key="powerPlantOversizeRatio"
          inputKey="powerPlantOversizeRatio"
          formState={props.formState}
        />,
        <InputNumberField
          key="solarDegradation"
          inputKey="solarDegradation"
          formState={props.formState}
        />,
      ],
      [
        <InputNumberField
          key="powerPlantOversizeRatio"
          inputKey="powerPlantOversizeRatio"
          formState={props.formState}
        />,
        <InputNumberField
          key="solarToWindPercentage"
          inputKey="solarToWindPercentage"
          formState={props.formState}
        />,
        <InputNumberField
          key="windDegradation"
          inputKey="windDegradation"
          formState={props.formState}
        />,
        <InputNumberField
          key="solarDegradation"
          inputKey="solarDegradation"
          formState={props.formState}
        />,
      ],
    ];
  }
}

export default function ControlledPowerPlantCard(props: Props) {
  const [powerPlantType, setPowerPlantType] = React.useState<PowerPlantType>(
    isOffshore(props.location) ? "Wind" : "Hybrid"
  );

  const onSelectChange = (index: number) => {
    setPowerPlantType(POWER_PLANT_TYPES[index]);
  };

  return (
    <InputCard
      title="Power Plant Parameters"
      children={[
        <InputSelect
          key="powerPlantType"
          selectKey="powerPlantType"
          prompt="Power Plant Type"
          titles={isOffshore(props.location) ? ["Wind"] : POWER_PLANT_TYPES}
          selectClass="powerPlantType"
          onSelectChange={onSelectChange}
          buttonChildren={getPowerPlantCards(props)}
          selectedIndex={POWER_PLANT_TYPES.indexOf(powerPlantType)}
          formState={props.formState}
        />,
        <InputSelect
          key="powerPlantConfigurationSelect"
          selectKey="powerPlantConfigurationSelect"
          prompt="Power Plant Configuration"
          selectClass="powerPlantConfiguration"
          titles={["Standalone", "Grid Connected"]}
          formState={props.formState}
          buttonChildren={[
            [],
            [
              <InputNumberField
                key="gridConnectionCost"
                inputKey="gridConnectionCost"
                formState={props.formState}
              />,
              <InputNumberField
                key="additionalTransmissionCharges"
                inputKey="additionalTransmissionCharges"
                formState={props.formState}
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
          formState={props.formState}
          buttonChildren={[
            [
              <HideableInputNumberField
                key="solarReferenceCapacity"
                inputKey="solarReferenceCapacity"
                hide={!isSolar(powerPlantType)}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="solarFarmBuildCost"
                inputKey="solarFarmBuildCost"
                hide={!isSolar(powerPlantType)}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="solarPVCostReductionWithScale"
                inputKey="solarPVCostReductionWithScale"
                hide={!isSolar(powerPlantType)}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="solarReferenceFoldIncrease"
                inputKey="solarReferenceFoldIncrease"
                hide={!isSolar(powerPlantType)}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="windReferenceCapacity"
                inputKey="windReferenceCapacity"
                hide={!isWind(powerPlantType)}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="windFarmBuildCost"
                inputKey="windFarmBuildCost"
                hide={!isWind(powerPlantType)}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="windCostReductionWithScale"
                inputKey="windCostReductionWithScale"
                hide={!isWind(powerPlantType)}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="windReferenceFoldIncrease"
                inputKey="windReferenceFoldIncrease"
                hide={!isWind(powerPlantType)}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="solarEpcCosts"
                inputKey="solarEpcCosts"
                hide={!isSolar(powerPlantType)}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="solarLandProcurementCosts"
                inputKey="solarLandProcurementCosts"
                hide={!isSolar(powerPlantType)}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="windEpcCosts"
                inputKey="windEpcCosts"
                hide={!isWind(powerPlantType)}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="windLandProcurementCosts"
                inputKey="windLandProcurementCosts"
                hide={!isWind(powerPlantType)}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="solarOpex"
                inputKey="solarOpex"
                hide={!isSolar(powerPlantType)}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="windOpex"
                inputKey="windOpex"
                hide={!isWind(powerPlantType)}
                formState={props.formState}
              />,
            ],
            [
              <InputNumberField
                key="principalPPACost"
                inputKey="principalPPACost"
                formState={props.formState}
              />,
            ],
          ]}
        />,
      ]}
    />
  );
}
