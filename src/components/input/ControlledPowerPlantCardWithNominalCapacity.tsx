import React from "react";

import { PowerPlantType } from "../../types";
import { isOffshore } from "../../utils";
import HideableInputNumberField from "./HideableInputNumberField";
import InputCard from "./InputCard";
import InputNumberField from "./InputNumberField";
import InputSelect from "./InputSelect";
import { InputScreenProps } from "./types";

const POWER_PLANT_TYPES: PowerPlantType[] = ["Wind", "Solar", "Hybrid"];

export default function ControlledPowerPlantCard(props: InputScreenProps) {
  const [powerPlantType, setPowerPlantType] =
    React.useState<PowerPlantType>("Wind");

  const onSelectChange = (index: number) => {
    setPowerPlantType(POWER_PLANT_TYPES[index]);
  };

  const isNotSolar = () => powerPlantType === "Wind";
  const isNotWind = () => powerPlantType === "Solar";

  function getPowerPlantCards() {
    return [
      isOffshore(props.location)
        ? [
            <InputSelect
              key="windPowerPlantCapacitySelect"
              selectKey="windPowerPlantCapacitySelect"
              prompt="Power Plant Capacity"
              titles={["Nominal Capacity", "Oversize Ratio"]}
              selectClass="powerCapacityConfiguration"
              helperText="Wind farm capacity in MW or as a ratio of electrolyser capacity"
              buttonChildren={[
                [
                  <InputNumberField
                    key="windNominalCapacity"
                    inputKey="windNominalCapacity"
                    formState={props.formState}
                  />,
                ],
                [
                  <InputNumberField
                    key="powerPlantOversizeRatio"
                    inputKey="powerPlantOversizeRatio"
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
          ]
        : [
            <InputSelect
              key="windPowerPlantCapacitySelect"
              selectKey="windPowerPlantCapacitySelect"
              prompt="Power Plant Capacity"
              titles={["Nominal Capacity", "Oversize Ratio"]}
              selectClass="powerCapacityConfiguration"
              helperText="Wind farm capacity in MW or as a ratio of electrolyser capacity"
              buttonChildren={[
                [
                  <InputNumberField
                    key="windNominalCapacity"
                    inputKey="windNominalCapacity"
                    formState={props.formState}
                  />,
                ],
                [
                  <InputNumberField
                    key="powerPlantOversizeRatio"
                    inputKey="powerPlantOversizeRatio"
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
          titles={["Nominal Capacity", "Oversize Ratio"]}
          selectClass="powerCapacityConfiguration"
          helperText="Solar farm capacity in MW or as a ratio of electrolyser capacity"
          buttonChildren={[
            [
              <InputNumberField
                key="solarNominalCapacity"
                inputKey="solarNominalCapacity"
                formState={props.formState}
              />,
            ],
            [
              <InputNumberField
                key="powerPlantOversizeRatio"
                inputKey="powerPlantOversizeRatio"
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
          titles={["Nominal Capacity", "Oversize Ratio"]}
          helperText="Solar and Wind farm capacity in MW as a ratio of electrolyser capacity"
          buttonChildren={[
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
          buttonChildren={getPowerPlantCards()}
          selectedIndex={POWER_PLANT_TYPES.indexOf(powerPlantType)}
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
          buttonChildren={[
            [
              <HideableInputNumberField
                key="solarFarmBuildCost"
                inputKey="solarFarmBuildCost"
                hide={isNotSolar()}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="solarReferenceCapacity"
                inputKey="solarReferenceCapacity"
                hide={isNotSolar()}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="solarPVCostReductionWithScale"
                inputKey="solarPVCostReductionWithScale"
                hide={isNotSolar()}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="solarReferenceFoldIncrease"
                inputKey="solarReferenceFoldIncrease"
                hide={isNotSolar()}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="windFarmBuildCost"
                inputKey="windFarmBuildCost"
                hide={isNotWind()}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="windReferenceCapacity"
                inputKey="windReferenceCapacity"
                hide={isNotWind()}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="windCostReductionWithScale"
                inputKey="windCostReductionWithScale"
                hide={isNotWind()}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="windReferenceFoldIncrease"
                inputKey="windReferenceFoldIncrease"
                hide={isNotWind()}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="solarEpcCosts"
                inputKey="solarEpcCosts"
                hide={isNotSolar()}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="solarLandProcurementCosts"
                inputKey="solarLandProcurementCosts"
                hide={isNotSolar()}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="windEpcCosts"
                inputKey="windEpcCosts"
                hide={isNotWind()}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="windLandProcurementCosts"
                inputKey="windLandProcurementCosts"
                hide={isNotWind()}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="solarOpex"
                inputKey="solarOpex"
                hide={isNotSolar()}
                formState={props.formState}
              />,
              <HideableInputNumberField
                key="windOpex"
                inputKey="windOpex"
                hide={isNotWind()}
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
