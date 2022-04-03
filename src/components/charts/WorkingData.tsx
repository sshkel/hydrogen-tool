import 'chart.js/auto';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { loadSolar, loadWind } from '../../model/DataLoader';
import { DataModel, HydrogenModel } from '../../model/Model';
import { Technology } from '../../types';
import { calculateBatteryCapex, calculateCapex, getIndirectCost, getOpexPerYear, getOpexPerYearWithAdditionalCostPredicate, roundToNearestThousand } from './cost-functions';
import CostBreakdownDoughnutChart from './CostBreakdownDoughnutChart';
import CostLineChart from './CostLineChart';

interface Props {
  data?: {
    additionalUpfrontCosts: number;
    additionalAnnualCosts: number;
    batteryEpcCosts?: number;
    batteryEfficiency: number;
    batteryMinCharge?: number;
    batteryLandProcurementCost?: number;
    batteryRatedPower?: number;
    batteryCosts?: number;
    batteryOMCost?: number;
    batteryReplacementCost?: number;
    batteryLifetime?: number;
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
    solarOpex?: number;
    technology: Technology;
    totalNominalPowerPlantCapacity: number;
    windCostReductionWithScale: number;
    windEpcCosts: number;
    windLandProcurementCost: number;
    windReferenceFoldIncrease: number;
    windOpex?: number;
    plantLife: number;

    region: string;
    electrolyserMaximumLoad: number;
    electrolyserMinimumLoad: number;
    timeBetweenOverloading: number;
    maximumLoadWhenOverloading: number;
  };
}

interface DownloadedData {
  solarData: any[];
  windData: any[];
}

const isSolar = (tech: string): boolean => tech !== 'Wind';
const isWind = (tech: string): boolean => tech !== 'Solar';

export default function WorkingData(props: Props) {
  const [data, setState] = useState<DownloadedData>({
    solarData: [],
    windData: [],
  });

  // TODO: Error handling if we can't load solar and wind data
  useEffect(() => {
    Promise.all([loadSolar(), loadWind()]).then(([solar, wind]) => {
      setState({ solarData: solar, windData: wind });
    });
  }, []);

  if (!props.data) {
    return null;
  }

  const { electrolyserNominalCapacity, electrolyserReferenceCapacity, electrolyserReferencePurchaseCost, electrolyserCostReductionWithScale, electrolyserReferenceFoldIncrease,
      solarNominalCapacity, solarReferenceCapacity, solarPVFarmReferenceCost, solarPVCostReductionWithScale, solarReferenceFoldIncrease,
      windNominalCapacity, windReferenceCapacity, windFarmReferenceCost, windCostReductionWithScale, windReferenceFoldIncrease,
      batteryRatedPower = 0, batteryNominalCapacity, batteryCosts, batteryEfficiency,
      solarOpex = 0, windOpex = 0,
      additionalUpfrontCosts, additionalAnnualCosts,
      batteryReplacementCost = 0, batteryLifetime = 0,
      discountRate, plantLife, durationOfStorage,
      timeBetweenOverloading, maximumLoadWhenOverloading, electrolyserMinimumLoad, electrolyserMaximumLoad, region
  } = props.data;

  // let {
  //   batteryLifetime: battLifetime,
  //   batteryMinCharge: battMin,
  //   batteryEfficiency,
  //   durationOfStorage: batteryHours,
  //   batteryRatedPower: batteryPower,
  //   timeBetweenOverloading: elecOverloadRecharge,
  //   maximumLoadWhenOverloading: elecOverload,
  //   electrolyserNominalCapacity: elecCapacity,
  //   solarNominalCapacity: solarCapacity,
  //   windNominalCapacity: windCapacity,
  //   region: location,
  //   electrolyserMaximumLoad,
  //   electrolyserMinimumLoad,
  // } = props.data;

  const dataModel: DataModel = {
    batteryLifetime,
    batteryMinCharge: props.data.batteryMinCharge || 0,
    batteryEfficiency,
    durationOfStorage,
    batteryRatedPower,
    timeBetweenOverloading,
    maximumLoadWhenOverloading,
    electrolyserNominalCapacity,
    solarNominalCapacity,
    windNominalCapacity,
    region,
    electrolyserMaximumLoad,
    electrolyserMinimumLoad,
    // no clue what these are in the excel
    specCons: 4.5,
    elecEff: 83,
    H2VoltoMass: 0.089,
  };

  const model = new HydrogenModel(dataModel, data.solarData, data.windData);
  const result = model.calculateElectrolyserHourlyOperation();


  // Duration curve charts
  const generatorData = {
    labels: Array.from(Array(result.Generator_CF.length).keys()).map((num) =>
      ((num / 8760) * 100).toFixed(0)
    ),
    datasets: [
      {
        label: "Generator",
        data: result.Generator_CF.map((x) => x * 100).sort((a, b) => b - a),
        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
    options: {
      ticks: {
        stepSize: 100,
      },
    },
  };

  const electrolyserData = {
    labels: Array.from(Array(result.Electrolyser_CF.length).keys()).map((num) =>
      ((num / 8760) * 100).toFixed(0)
    ),
    datasets: [
      {
        label: "Electrolyser",
        data: result.Electrolyser_CF.map((x) => x * 100).sort((a, b) => b - a),
        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
    options: {
      ticks: {
        stepSize: 100,
      },
    },
  };


  const electrolyserCAPEX = calculateCapex(electrolyserNominalCapacity, electrolyserReferenceCapacity, electrolyserReferencePurchaseCost, electrolyserCostReductionWithScale, electrolyserReferenceFoldIncrease);
  
  const { technology } = props.data;

  const solarCAPEX = isSolar(technology) ? calculateCapex(solarNominalCapacity, solarReferenceCapacity, solarPVFarmReferenceCost, solarPVCostReductionWithScale, solarReferenceFoldIncrease) : 0;
  const windCAPEX = isWind(technology) ? calculateCapex(windNominalCapacity, windReferenceCapacity, windFarmReferenceCost, windCostReductionWithScale, windReferenceFoldIncrease) : 0;
  const powerPlantCAPEX = solarCAPEX + windCAPEX;

  const batteryCAPEX = calculateBatteryCapex(batteryRatedPower, batteryNominalCapacity, batteryCosts);

  const gridConnectionCost = props.data.gridConnectionCost || 0;

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

  // Actual Operating Hours (S3.L) = get_tabulated_outputs().['Total Time Electrolyser is Operating'] * 8760;
  // Stack Life Consumed (S3.N) = Actual Operating Hours * $year / stackLifetime [ input ]

  // Total Energy Output (S3.H) = get_tabulated_outputs().['Generator Capacity Factor'] * 100 * 8760 * nominalPowerPlantCapacity

  // TODO: Get correct formula
  const electrolyserStackReplacementCost = (props.data.electrolyserStackReplacement / 100) * electrolyserCAPEX;

  const electrolyserOpex = getOpexPerYear(electrolyserOMCost + electrolyserStackReplacementCost, discountRate, plantLife);

  const solarOpexCost = isSolar(technology) ? roundToNearestThousand(solarOpex * solarNominalCapacity) : 0;
  const windOpexCost = isWind(technology) ? roundToNearestThousand(windOpex * windNominalCapacity) : 0;
  const powerplantOpex = getOpexPerYear(solarOpexCost + windOpexCost, discountRate, plantLife);

  const additionalOpex = getOpexPerYear(additionalAnnualCosts, discountRate, plantLife);

  // Battery costs
  const batteryOMCost: number = roundToNearestThousand((props.data.batteryOMCost || 0) * batteryRatedPower);
  const actualBatteryReplacementCost = batteryReplacementCost / 100 * batteryCAPEX;
  const shouldAddBatteryReplacementCost = (year: number): boolean => batteryLifetime > 0 && year % batteryLifetime === 0;
  const batteryOpex = batteryRatedPower > 0 ? getOpexPerYearWithAdditionalCostPredicate(batteryOMCost, discountRate, plantLife, shouldAddBatteryReplacementCost, actualBatteryReplacementCost)
                                            : Array(plantLife).fill(0);

  return (
    <div>
      <Line data={generatorData} />
      <Line data={electrolyserData} />
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
        datapoints={[
          { label: "Electrolyser OPEX", data: electrolyserOpex },
          { label: "Powerplant OPEX", data: powerplantOpex },
          { label: "Battery OPEX", data: batteryOpex},
          { label: "Additional Annual Costs", data: additionalOpex }
        ]}
      />
    </div>
  );
}

