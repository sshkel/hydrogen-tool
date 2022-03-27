import 'chart.js/auto';
import { Technology } from '../../types';
import { calculateBatteryCapex, calculateCapex, getIndirectCost, getOpexPerYear } from './cost-functions';
import CostBreakdownDoughnutChart from './CostBreakdownDoughnutChart';
import CostLineChart from './CostLineChart';

interface Props {
  data?: {
    additionalUpfrontCosts: number;
    batteryEpcCosts?: number;
    batteryLandProcurementCost?: number;
    batteryRatedPower?: number;
    batteryCosts?: number;
    discountRate: number;
    durationOfStorage: number;
    electrolyserCostReductionWithScale: number;
    electrolyserEpcCosts: number;
    electrolyserLandProcurementCost: number;
    electrolyserReferenceFoldIncrease: number;
    electrolyserOMCost: number;
    electrolyserStackReplacement: number;
    gridConnectionCost: number;
    batteryNominalCapacity?: number;
    electrolyserNominalCapacity: number;
    solarNominalCapacity: number;
    windNominalCapacity: number;
    solarReferenceCapacity: number;
    windReferenceCapacity: number;
    electrolyserReferenceCapacity: number;
    electrolyserReferencePurchaseCost: number;
    solarPVFarmReferenceCost: number;
    windFarmReferenceCost: number;
    solarEpcCosts: number;
    solarLandProcurementCost: number;
    solarPVCostReductionWithScale: number;
    solarReferenceFoldIncrease: number;
    technology: Technology;
    totalNominalPowerPlantCapacity: number;
    windCostReductionWithScale: number;
    windEpcCosts: number;
    windLandProcurementCost: number;
    windReferenceFoldIncrease: number;
    plantLife: number;
  };
}

export default function WorkingData(props: Props) {
  if (!props.data) {
    return null;
  }
  const { electrolyserNominalCapacity, electrolyserReferenceCapacity, electrolyserReferencePurchaseCost, electrolyserCostReductionWithScale, electrolyserReferenceFoldIncrease,
          solarNominalCapacity, solarReferenceCapacity, solarPVFarmReferenceCost, solarPVCostReductionWithScale, solarReferenceFoldIncrease,
          windNominalCapacity, windReferenceCapacity, windFarmReferenceCost, windCostReductionWithScale, windReferenceFoldIncrease,
          batteryRatedPower, batteryNominalCapacity, batteryCosts,
          discountRate, plantLife
  } = props.data;

  const electrolyserCAPEX = calculateCapex(electrolyserNominalCapacity, electrolyserReferenceCapacity, electrolyserReferencePurchaseCost, electrolyserCostReductionWithScale, electrolyserReferenceFoldIncrease);
  
  const { technology } = props.data;

  const solarCAPEX = technology !== 'Wind' ? calculateCapex(solarNominalCapacity, solarReferenceCapacity, solarPVFarmReferenceCost, solarPVCostReductionWithScale, solarReferenceFoldIncrease) : 0;
  const windCAPEX = technology !== 'Solar' ? calculateCapex(windNominalCapacity, windReferenceCapacity, windFarmReferenceCost, windCostReductionWithScale, windReferenceFoldIncrease) : 0;
  const powerPlantCAPEX = solarCAPEX + windCAPEX;

  const batteryCAPEX = calculateBatteryCapex(batteryRatedPower, batteryNominalCapacity, batteryCosts);

  const gridConnectionCost = props.data.gridConnectionCost || 0;
  const additionalUpfrontCosts = props.data.additionalUpfrontCosts;

  const electrolyserEpcCost = getIndirectCost(electrolyserCAPEX, props.data.electrolyserEpcCosts);
  const electrolyserLandCost =  getIndirectCost(electrolyserCAPEX, props.data.electrolyserLandProcurementCost);

  const solarEpcCost = getIndirectCost(solarCAPEX, props.data.solarEpcCosts);
  const solarLandCost = getIndirectCost(solarCAPEX, props.data.solarLandProcurementCost);

  const windEpcCost = getIndirectCost(windCAPEX, props.data.windEpcCosts);
  const windLandCost = getIndirectCost(windCAPEX, props.data.windLandProcurementCost);

  const batteryEpcCost = getIndirectCost(batteryCAPEX, props.data.batteryEpcCosts);
  const batteryLandCost = getIndirectCost(batteryCAPEX, props.data.batteryLandProcurementCost);

  const totalIndirectCosts = electrolyserEpcCost + electrolyserLandCost + solarEpcCost + solarLandCost + windEpcCost + windLandCost;

  const electrolyserOMCost = (props.data.electrolyserOMCost / 100) * electrolyserCAPEX;

  // TODO: Get correct formula
  const electrolyserStackReplacementCost = (props.data.electrolyserStackReplacement / 100) * electrolyserCAPEX;

  const electrolyserOpex = getOpexPerYear(electrolyserOMCost + electrolyserStackReplacementCost, discountRate, plantLife);

  return (
    <div>
      <CostBreakdownDoughnutChart
          title="Capital Cost Breakdown"
          labels={["Electrolyser System", "Power Plant", "Battery", "Grid Connection", "Additional Upfront Costs", "Indirect Costs"]}
          data={[electrolyserCAPEX, powerPlantCAPEX, batteryCAPEX, gridConnectionCost, additionalUpfrontCosts, totalIndirectCosts]}
      />
      <CostBreakdownDoughnutChart
          title="Indirect Cost Breakdown"
          labels={["Electrolyser EPC", "Electrolyser Land", "Power Plant EPC", "Power Plant Land", "Battery EPC", "Battery Land"]}
          data={[electrolyserEpcCost, electrolyserLandCost, solarEpcCost + windEpcCost, solarLandCost + windLandCost, batteryEpcCost, batteryLandCost]}
      />
      <CostLineChart
        plantLife={plantLife}
        datapoints={[ { label: "Electrolyser OPEX", data: electrolyserOpex } ]}
      />
    </div>
  );
}

