import { ShallowWrapper, shallow } from "enzyme";

import CostBreakdownDoughnutChart from "../../../components/charts/CostBreakdownDoughnutChart";
import WorkingData from "../../../components/charts/WorkingData";
import { UserInputFields } from "../../../types";
import {
  defaultInputData,
  standaloneSolarWithBatteryScenario,
} from "../../scenario";

const mockLoader: () => Promise<any[]> = () => new Promise(() => {});

const findCapitalCostBreakdownChart = (wrapper: ShallowWrapper) =>
  wrapper
    .find(CostBreakdownDoughnutChart)
    .filterWhere((e) => e.prop("title") === "Capital Cost Breakdown");

const findIndirectCostBreakdownChart = (wrapper: ShallowWrapper) =>
  wrapper
    .find(CostBreakdownDoughnutChart)
    .filterWhere((e) => e.prop("title") === "Indirect Cost Breakdown");

describe("Working Data calculations", () => {
  describe("Capital Cost Breakdown", () => {
    it("calculates electrolyser CAPEX as expected", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        electrolyserNominalCapacity: 10, // MW
        electrolyserReferenceCapacity: 10000, // kW
        electrolyserPurchaseCost: 1000, // A$/kw
        electrolyserCostReductionWithScale: 20, // %
        electrolyserReferenceFoldIncrease: 10,
      };

      const wrapper = shallow(
        <WorkingData
          data={data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={defaultInputData.location}
        />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Electrolyser Default CAPEX = 10_000_000
      expect(costBreakdownChart.at(0).prop("data").at(0)).toEqual(10_000_000);
    });

    it("calculates solar CAPEX as expected", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        technology: "Solar",
        solarNominalCapacity: 15, // MW
        solarReferenceCapacity: 1000, // kW
        solarFarmBuildCost: 1200, // A$/kw
        solarPVCostReductionWithScale: 20, // %
        solarReferenceFoldIncrease: 10,
      };

      const wrapper = shallow(
        <WorkingData
          data={data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={defaultInputData.location}
        />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Solar Default CAPEX = 13_845_000
      expect(costBreakdownChart.at(0).prop("data").at(1)).toEqual(13_845_000);
    });

    it("calculates wind CAPEX as expected", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        technology: "Wind",
        windNominalCapacity: 15, // MW
        windReferenceCapacity: 1000, // kW
        windFarmBuildCost: 1950, // A$/kw
        windCostReductionWithScale: 20, // %
        windReferenceFoldIncrease: 10,
      };

      const wrapper = shallow(
        <WorkingData
          data={data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={defaultInputData.location}
        />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Wind Default CAPEX = 22_498_000
      expect(costBreakdownChart.at(0).prop("data").at(1)).toEqual(22_498_000);
    });

    it("calculate does not factor in solar fields when wind technology", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        technology: "Wind",
        solarNominalCapacity: 15, // MW
        solarReferenceCapacity: 1000, // kW
        solarFarmBuildCost: 1200, // A$/kw
        solarPVCostReductionWithScale: 20, // %
        solarReferenceFoldIncrease: 10,
      };

      const wrapper = shallow(
        <WorkingData
          data={data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={defaultInputData.location}
        />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Wind Default CAPEX = 0
      expect(costBreakdownChart.at(0).prop("data").at(1)).toEqual(0);
    });

    it("calculate does not factor in wind fields when solar technology", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        technology: "Solar",
        windNominalCapacity: 15, // MW
        windReferenceCapacity: 1000, // kW
        windFarmBuildCost: 1950, // A$/kw
        windCostReductionWithScale: 20, // %
        windReferenceFoldIncrease: 10,
      };

      const wrapper = shallow(
        <WorkingData
          data={data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={defaultInputData.location}
        />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Solar Default CAPEX = 0
      expect(costBreakdownChart.at(0).prop("data").at(1)).toEqual(0);
    });

    it("calculates combination of capacity when hybrid", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        technology: "Hybrid",
        solarNominalCapacity: 15, // MW
        solarReferenceCapacity: 1000, // kW
        solarFarmBuildCost: 1200, // A$/kw
        solarPVCostReductionWithScale: 20, // %
        solarReferenceFoldIncrease: 10,
        windNominalCapacity: 15, // MW
        windReferenceCapacity: 1000, // kW
        windFarmBuildCost: 1950, // A$/kw
        windCostReductionWithScale: 20, // %
        windReferenceFoldIncrease: 10,
      };

      const wrapper = shallow(
        <WorkingData
          data={data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={defaultInputData.location}
        />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Power Plant CAPEX = 36_343_000
      expect(costBreakdownChart.at(0).prop("data").at(1)).toEqual(36_343_000);
    });

    it("calculates battery capex", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        batteryRatedPower: 2, // MW
        batteryStorageDuration: 2, // hr
        batteryCosts: 542, // A$/kWh
      };

      const wrapper = shallow(
        <WorkingData
          data={data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={defaultInputData.location}
        />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Battery CAPEX = 2168000
      expect(costBreakdownChart.at(0).prop("data").at(2)).toEqual(2_168_000);
    });

    it("passes down grid connection cost", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        powerPlantConfiguration: "Grid Connected",
        gridConnectionCost: 2000,
      };

      const wrapper = shallow(
        <WorkingData
          data={data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={defaultInputData.location}
        />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Grid Connection Cost = 2000
      expect(costBreakdownChart.at(0).prop("data").at(3)).toEqual(2000);
    });

    it("passes down additional upfront costs", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        additionalUpfrontCosts: 2000,
      };

      const wrapper = shallow(
        <WorkingData
          data={data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={defaultInputData.location}
        />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Additional Upfront Cost = 2000
      expect(costBreakdownChart.at(0).prop("data").at(4)).toEqual(2000);
    });

    it("calculates indirect cost as percentage of electrolyser and power plant capex", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        technology: "Hybrid",
        // Electrolyser CAPEX = 100000
        electrolyserNominalCapacity: 10, // MW
        electrolyserReferenceCapacity: 10, // kW
        electrolyserPurchaseCost: 10, // A$/kw
        electrolyserCostReductionWithScale: 10, // %
        electrolyserReferenceFoldIncrease: 0,

        // Solar CAPEX = 51000
        solarNominalCapacity: 10, // MW
        solarReferenceCapacity: 10, // kW
        solarFarmBuildCost: 10, // A$/kw
        solarPVCostReductionWithScale: 20, // %
        solarReferenceFoldIncrease: 10,

        // Wind CAPEX = 60000
        windNominalCapacity: 10, // MW
        windReferenceCapacity: 10, // kW
        windFarmBuildCost: 10, // A$/kw
        windCostReductionWithScale: 5, // %
        windReferenceFoldIncrease: 2,

        // 6% of CAPEX = 6000
        electrolyserEpcCosts: 1,
        electrolyserLandProcurementCost: 5,

        // 10% of CAPEX = 5000 (nearest 1000)
        solarEpcCosts: 10,

        // 15% of CAPEX = 9000
        windLandProcurementCost: 15,
      };

      const wrapper = shallow(
        <WorkingData
          data={data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={defaultInputData.location}
        />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Indirect Cost = 20_000
      expect(costBreakdownChart.at(0).prop("data").at(5)).toEqual(20_000);
    });

    it("calculates cost breakdown for complex scenario", () => {
      const wrapper = shallow(
        <WorkingData
          data={standaloneSolarWithBatteryScenario.data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={standaloneSolarWithBatteryScenario.location}
        />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      const dataArray: number[] = costBreakdownChart.at(0).prop("data");

      // Electrolyser CAPEX = 10_380_000
      expect(dataArray.at(0)).toEqual(10_380_000);
      // Power Plant CAPEX = 11_985_000
      expect(dataArray.at(1)).toEqual(11_985_000);
      // Battery CAPEX = 6_784_000
      expect(dataArray.at(2)).toEqual(6_784_000);
      // Additional Cost = 100_000
      expect(dataArray.at(4)).toEqual(100_000);
      // Indirect Cost = 224_000
      expect(dataArray.at(5)).toEqual(224_000);
    });
  });

  describe("Indirect Cost Breakdown", () => {
    it("calculates electrolyser indirect costs", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        // Electrolyser CAPEX = 100000
        electrolyserNominalCapacity: 10, // MW
        electrolyserReferenceCapacity: 10, // kW
        electrolyserPurchaseCost: 10, // A$/kw
        electrolyserCostReductionWithScale: 10, // %
        electrolyserReferenceFoldIncrease: 0,

        electrolyserEpcCosts: 5,
        electrolyserLandProcurementCost: 0.5,
      };

      const wrapper = shallow(
        <WorkingData
          data={data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={defaultInputData.location}
        />
      );

      const costBreakdownChart = findIndirectCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      const chartData = costBreakdownChart.at(0).prop("data");

      // EPC: 5000, Land: 1000
      expect(chartData.at(0)).toEqual(5_000);
      expect(chartData.at(1)).toEqual(1_000);
    });

    it("calculates solar indirect costs", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        technology: "Solar",

        // Solar CAPEX = 100000
        solarNominalCapacity: 10, // MW
        solarReferenceCapacity: 10, // kW
        solarFarmBuildCost: 10, // A$/kw
        solarPVCostReductionWithScale: 10, // %
        solarReferenceFoldIncrease: 0,

        // Wind CAPEX = ignored
        windNominalCapacity: 20, // MW
        windReferenceCapacity: 10, // kW
        windFarmBuildCost: 10, // A$/kw
        windCostReductionWithScale: 10, // %
        windReferenceFoldIncrease: 0,

        solarEpcCosts: 5,
        solarLandProcurementCost: 0.5,

        windEpcCosts: 5,
        windLandProcurementCost: 1,
      };

      const wrapper = shallow(
        <WorkingData
          data={data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={defaultInputData.location}
        />
      );

      const costBreakdownChart = findIndirectCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      const chartData = costBreakdownChart.at(0).prop("data");
      // EPC: 5000, Land: 1000
      expect(chartData.at(2)).toEqual(5_000);
      expect(chartData.at(3)).toEqual(1_000);
    });

    it("calculates wind indirect costs", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        technology: "Wind",

        // Solar CAPEX = ignored
        solarNominalCapacity: 10, // MW
        solarReferenceCapacity: 10, // kW
        solarFarmBuildCost: 10, // A$/kw
        solarPVCostReductionWithScale: 10, // %
        solarReferenceFoldIncrease: 0,

        // Wind CAPEX = 200000
        windNominalCapacity: 20, // MW
        windReferenceCapacity: 10, // kW
        windFarmBuildCost: 10, // A$/kw
        windCostReductionWithScale: 10, // %
        windReferenceFoldIncrease: 0,

        solarEpcCosts: 5,
        solarLandProcurementCost: 0.5,

        windEpcCosts: 5,
        windLandProcurementCost: 1,
      };

      const wrapper = shallow(
        <WorkingData
          data={data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={defaultInputData.location}
        />
      );

      const costBreakdownChart = findIndirectCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      const chartData = costBreakdownChart.at(0).prop("data");
      // EPC: 10000, Land: 2000
      expect(chartData.at(2)).toEqual(10_000);
      expect(chartData.at(3)).toEqual(2_000);
    });

    it("calculates hybrid indirect costs", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        technology: "Hybrid",

        // Solar CAPEX = ignored
        solarNominalCapacity: 10, // MW
        solarReferenceCapacity: 10, // kW
        solarFarmBuildCost: 10, // A$/kw
        solarPVCostReductionWithScale: 10, // %
        solarReferenceFoldIncrease: 0,

        // Wind CAPEX = 200000
        windNominalCapacity: 20, // MW
        windReferenceCapacity: 10, // kW
        windFarmBuildCost: 10, // A$/kw
        windCostReductionWithScale: 10, // %
        windReferenceFoldIncrease: 0,

        solarEpcCosts: 5,
        solarLandProcurementCost: 0.5,

        windEpcCosts: 5,
        windLandProcurementCost: 1,
      };

      const wrapper = shallow(
        <WorkingData
          data={data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={defaultInputData.location}
        />
      );

      const costBreakdownChart = findIndirectCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      const chartData = costBreakdownChart.at(0).prop("data");
      // EPC: 15000, Land: 3000
      expect(chartData.at(2)).toEqual(15_000);
      expect(chartData.at(3)).toEqual(3_000);
    });

    it("calculates battery indirect costs", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        // Battery CAPEX = 100000
        batteryRatedPower: 5, // MW
        batteryStorageDuration: 2, // hr
        batteryCosts: 10, // A$/kWh

        batteryEpcCosts: 10,
        batteryLandProcurementCost: 10,
      };

      const wrapper = shallow(
        <WorkingData
          data={data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={defaultInputData.location}
        />
      );

      const costBreakdownChart = findIndirectCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      const chartData = costBreakdownChart.at(0).prop("data");
      // EPC: 10000, Land: 10000
      expect(chartData.at(4)).toEqual(10_000);
      expect(chartData.at(5)).toEqual(10_000);
    });

    it("calculates indirect costs in complex scenarios", () => {
      const wrapper = shallow(
        <WorkingData
          data={standaloneSolarWithBatteryScenario.data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={standaloneSolarWithBatteryScenario.location}
        />
      );

      const costBreakdownChart = findIndirectCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      const chartData = costBreakdownChart.at(0).prop("data");
      // Electrolyser EPC = 104_000
      expect(chartData.at(0)).toEqual(104_000);
      // Power Plant Land = 120_000
      expect(chartData.at(3)).toEqual(120_000);
      // Battery Land = 339_000
      expect(chartData.at(5)).toEqual(339_000);
    });
  });
});
