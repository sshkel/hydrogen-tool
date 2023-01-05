import { ShallowWrapper, shallow } from "enzyme";

import WorkingData, {
  DoughnutPane,
} from "../../../components/charts/WorkingData";
import { UserInputFields } from "../../../types";
import {
  basicHybridPPAScenario,
  defaultInputData,
  standaloneAdvancedAmmoniaSolarScenario,
  standaloneAmmoniaHybridWithBatteryAndDegradationScenario,
  standaloneSolarWithBatteryScenario,
} from "../../scenario";

const mockLoader: () => Promise<any[]> = () => new Promise(() => {});

const findCapitalCostBreakdownChart = (wrapper: ShallowWrapper) =>
  wrapper
    .find(DoughnutPane)
    .filterWhere((e) => e.prop("title") === "Capital Cost Breakdown");

const findIndirectCostBreakdownChart = (wrapper: ShallowWrapper) =>
  wrapper
    .find(DoughnutPane)
    .filterWhere((e) => e.prop("title") === "Indirect Cost Breakdown");

describe("Working Data calculations", () => {
  describe("Capital Cost Breakdown", () => {
    it("calculates electrolyser CAPEX as expected", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        electrolyserNominalCapacity: 10, // MW
        electrolyserReferenceCapacity: 10000, // kW
        electrolyserPurchaseCost: 1000, // $/kw
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
      expect(
        costBreakdownChart.at(0).prop("items")["Electrolyser System"]
      ).toEqual(10_000_000);
    });

    it("calculates solar CAPEX as expected", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        powerPlantType: "Solar",
        solarNominalCapacity: 15, // MW
        solarReferenceCapacity: 1000, // kW
        solarFarmBuildCost: 1200, // $/kw
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
      expect(costBreakdownChart.at(0).prop("items")["Power Plant"]).toEqual(
        13_845_000
      );
    });

    it("calculates wind CAPEX as expected", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        powerPlantType: "Wind",
        windNominalCapacity: 15, // MW
        windReferenceCapacity: 1000, // kW
        windFarmBuildCost: 1950, // $/kw
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
      expect(costBreakdownChart.at(0).prop("items")["Power Plant"]).toEqual(
        22_498_000
      );
    });

    it("calculate does not factor in solar fields when wind powerPlantType", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        powerPlantType: "Wind",
        solarNominalCapacity: 15, // MW
        solarReferenceCapacity: 1000, // kW
        solarFarmBuildCost: 1200, // $/kw
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
      expect(costBreakdownChart.at(0).prop("items")["Power Plant"]).toEqual(0);
    });

    it("calculate does not factor in wind fields when solar powerPlantType", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        powerPlantType: "Solar",
        windNominalCapacity: 15, // MW
        windReferenceCapacity: 1000, // kW
        windFarmBuildCost: 1950, // $/kw
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
      expect(costBreakdownChart.at(0).prop("items")["Power Plant"]).toEqual(0);
    });

    it("calculates combination of capacity when hybrid", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        powerPlantType: "Hybrid",
        solarNominalCapacity: 15, // MW
        solarReferenceCapacity: 1000, // kW
        solarFarmBuildCost: 1200, // $/kw
        solarPVCostReductionWithScale: 20, // %
        solarReferenceFoldIncrease: 10,
        windNominalCapacity: 15, // MW
        windReferenceCapacity: 1000, // kW
        windFarmBuildCost: 1950, // $/kw
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
      expect(costBreakdownChart.at(0).prop("items")["Power Plant"]).toEqual(
        36_343_000
      );
    });

    it("calculates battery capex", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        batteryRatedPower: 2, // MW
        batteryStorageDuration: 2, // hr
        batteryCosts: 542, // $/kWh
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
      expect(costBreakdownChart.at(0).prop("items")["Battery"]).toEqual(
        2_168_000
      );
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
      expect(costBreakdownChart.at(0).prop("items")["Grid Connection"]).toEqual(
        2000
      );
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
      expect(
        costBreakdownChart.at(0).prop("items")["Additional Upfront Costs"]
      ).toEqual(2000);
    });

    it("calculates indirect cost as percentage of electrolyser and power plant capex", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        powerPlantType: "Hybrid",
        // Electrolyser CAPEX = 100000
        electrolyserNominalCapacity: 10, // MW
        electrolyserReferenceCapacity: 10, // kW
        electrolyserPurchaseCost: 10, // $/kw
        electrolyserCostReductionWithScale: 10, // %
        electrolyserReferenceFoldIncrease: 0,

        // Solar CAPEX = 51000
        solarNominalCapacity: 10, // MW
        solarReferenceCapacity: 10, // kW
        solarFarmBuildCost: 10, // $/kw
        solarPVCostReductionWithScale: 20, // %
        solarReferenceFoldIncrease: 10,

        // Wind CAPEX = 60000
        windNominalCapacity: 10, // MW
        windReferenceCapacity: 10, // kW
        windFarmBuildCost: 10, // $/kw
        windCostReductionWithScale: 5, // %
        windReferenceFoldIncrease: 2,

        // 6% of CAPEX = 6000
        electrolyserEpcCosts: 1,
        electrolyserLandProcurementCosts: 5,

        // 10% of CAPEX = 5000 (nearest 1000)
        solarEpcCosts: 10,

        // 15% of CAPEX = 9000
        windLandProcurementCosts: 15,
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
      expect(costBreakdownChart.at(0).prop("items")["Indirect Costs"]).toEqual(
        20_000
      );
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

      const dataArray = costBreakdownChart.at(0).prop("items");

      // Electrolyser CAPEX = 10_380_000
      expect(dataArray["Electrolyser System"]).toEqual(10_380_000);
      // Power Plant CAPEX = 11_985_000
      expect(dataArray["Power Plant"]).toEqual(11_985_000);
      // Battery CAPEX = 6_784_000
      expect(dataArray["Battery"]).toEqual(6_784_000);
      // Additional Cost = 100_000
      expect(dataArray["Additional Upfront Costs"]).toEqual(100_000);
      // Indirect Cost = 224_000
      expect(dataArray["Indirect Costs"]).toEqual(224_000);
    });

    it("calculates capital cost breakdown for ammonia", () => {
      const wrapper = shallow(
        <WorkingData
          data={standaloneAdvancedAmmoniaSolarScenario.data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={standaloneAdvancedAmmoniaSolarScenario.location}
        />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      const dataArray = costBreakdownChart.at(0).prop("items");

      expect(dataArray["Electrolyser System"]).toEqual(119_746_000);
      expect(dataArray["Ammonia"]).toEqual(41_960_000);
      expect(dataArray["H2 Storage"]).toEqual(43_022_000);
      expect(dataArray["Power Plant"]).toEqual(225_359_000);
      expect(dataArray["Battery"]).toEqual(0);
      expect(dataArray["Grid Connection"]).toEqual(0);
      expect(dataArray["Additional Upfront Costs"]).toEqual(0);
      expect(dataArray["Indirect Costs"]).toEqual(0);
    });

    it("calculates capital cost breakdown for hybrid ammonia with battery", () => {
      const wrapper = shallow(
        <WorkingData
          data={standaloneAmmoniaHybridWithBatteryAndDegradationScenario.data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={
            standaloneAmmoniaHybridWithBatteryAndDegradationScenario.location
          }
        />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      const dataArray = costBreakdownChart.at(0).prop("items");

      expect(dataArray["Electrolyser System"]).toEqual(116_546_000);
      expect(dataArray["Ammonia"]).toEqual(85_241_000);
      expect(dataArray["H2 Storage"]).toEqual(50_000_000);
      expect(dataArray["Power Plant"]).toEqual(581_005_000);
      expect(dataArray["Battery"]).toEqual(4_336_000);
      expect(dataArray["Grid Connection"]).toEqual(0);
      expect(dataArray["Additional Upfront Costs"]).toEqual(0);
      expect(dataArray["Indirect Costs"]).toEqual(225_544_000);
    });
  });

  describe("Indirect Cost Breakdown", () => {
    it("calculates electrolyser indirect costs", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        // Electrolyser CAPEX = 100000
        electrolyserNominalCapacity: 10, // MW
        electrolyserReferenceCapacity: 10, // kW
        electrolyserPurchaseCost: 10, // $/kw
        electrolyserCostReductionWithScale: 10, // %
        electrolyserReferenceFoldIncrease: 0,

        electrolyserEpcCosts: 5,
        electrolyserLandProcurementCosts: 0.5,
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

      const chartData = costBreakdownChart.at(0).prop("items");

      // EPC: 5000, Land: 1000
      expect(chartData["Electrolyser EPC"]).toEqual(5_000);
      expect(chartData["Electrolyser Land"]).toEqual(1_000);
    });

    it("calculates solar indirect costs", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        powerPlantType: "Solar",

        // Solar CAPEX = 100000
        solarNominalCapacity: 10, // MW
        solarReferenceCapacity: 10, // kW
        solarFarmBuildCost: 10, // $/kw
        solarPVCostReductionWithScale: 10, // %
        solarReferenceFoldIncrease: 0,

        // Wind CAPEX = ignored
        windNominalCapacity: 20, // MW
        windReferenceCapacity: 10, // kW
        windFarmBuildCost: 10, // $/kw
        windCostReductionWithScale: 10, // %
        windReferenceFoldIncrease: 0,

        solarEpcCosts: 5,
        solarLandProcurementCosts: 0.5,

        windEpcCosts: 5,
        windLandProcurementCosts: 1,
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

      const chartData = costBreakdownChart.at(0).prop("items");
      // EPC: 5000, Land: 1000
      expect(chartData["Power Plant EPC"]).toEqual(5_000);
      expect(chartData["Power Plant Land"]).toEqual(1_000);
    });

    it("calculates wind indirect costs", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        powerPlantType: "Wind",

        // Solar CAPEX = ignored
        solarNominalCapacity: 10, // MW
        solarReferenceCapacity: 10, // kW
        solarFarmBuildCost: 10, // $/kw
        solarPVCostReductionWithScale: 10, // %
        solarReferenceFoldIncrease: 0,

        // Wind CAPEX = 200000
        windNominalCapacity: 20, // MW
        windReferenceCapacity: 10, // kW
        windFarmBuildCost: 10, // $/kw
        windCostReductionWithScale: 10, // %
        windReferenceFoldIncrease: 0,

        solarEpcCosts: 5,
        solarLandProcurementCosts: 0.5,

        windEpcCosts: 5,
        windLandProcurementCosts: 1,
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

      const chartData = costBreakdownChart.at(0).prop("items");
      // EPC: 10000, Land: 2000
      expect(chartData["Power Plant EPC"]).toEqual(10_000);
      expect(chartData["Power Plant Land"]).toEqual(2_000);
    });

    it("calculates hybrid indirect costs", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        powerPlantType: "Hybrid",

        // Solar CAPEX = ignored
        solarNominalCapacity: 10, // MW
        solarReferenceCapacity: 10, // kW
        solarFarmBuildCost: 10, // $/kw
        solarPVCostReductionWithScale: 10, // %
        solarReferenceFoldIncrease: 0,

        // Wind CAPEX = 200000
        windNominalCapacity: 20, // MW
        windReferenceCapacity: 10, // kW
        windFarmBuildCost: 10, // $/kw
        windCostReductionWithScale: 10, // %
        windReferenceFoldIncrease: 0,

        solarEpcCosts: 5,
        solarLandProcurementCosts: 0.5,

        windEpcCosts: 5,
        windLandProcurementCosts: 1,
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

      const chartData = costBreakdownChart.at(0).prop("items");
      // EPC: 15000, Land: 3000
      expect(chartData["Power Plant EPC"]).toEqual(15_000);
      expect(chartData["Power Plant Land"]).toEqual(3_000);
    });

    it("calculates battery indirect costs", () => {
      const data: UserInputFields = {
        ...defaultInputData.data,
        // Battery CAPEX = 100000
        batteryRatedPower: 5, // MW
        batteryStorageDuration: 2, // hr
        batteryCosts: 10, // $/kWh

        batteryEpcCosts: 10,
        batteryLandProcurementCosts: 10,
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

      const chartData = costBreakdownChart.at(0).prop("items");
      // EPC: 10000, Land: 10000
      expect(chartData["Battery EPC"]).toEqual(10_000);
      expect(chartData["Battery Land"]).toEqual(10_000);
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

      const chartData = costBreakdownChart.at(0).prop("items");
      // Electrolyser EPC = 104_000
      expect(chartData["Electrolyser EPC"]).toEqual(104_000);
      // Power Plant Land = 120_000
      expect(chartData["Power Plant Land"]).toEqual(120_000);
      // Battery Land = 339_000
      expect(chartData["Battery Land"]).toEqual(339_000);
    });

    it("calculates indirect costs when ppa agreement", () => {
      const wrapper = shallow(
        <WorkingData
          data={basicHybridPPAScenario.data}
          inputConfiguration="Basic"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={basicHybridPPAScenario.location}
        />
      );

      const costBreakdownChart = findIndirectCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      const chartData = costBreakdownChart.at(0).prop("items");
      expect(chartData["Electrolyser EPC"]).toEqual(0);
      expect(chartData["Electrolyser Land"]).toEqual(0);
      expect(chartData["Power Plant EPC"]).toEqual(0);
      expect(chartData["Power Plant Land"]).toEqual(0);
      expect(chartData["Battery EPC"]).toEqual(0);
      expect(chartData["Battery Land"]).toEqual(0);
    });

    it("calculates indirect cost breakdown for ammonia", () => {
      const data: UserInputFields = {
        ...standaloneAdvancedAmmoniaSolarScenario.data,
        ammoniaEpcCosts: 1,
        ammoniaLandProcurementCosts: 0.5,
      };

      const wrapper = shallow(
        <WorkingData
          data={data}
          inputConfiguration="Advanced"
          loadSolar={mockLoader}
          loadWind={mockLoader}
          location={standaloneAdvancedAmmoniaSolarScenario.location}
        />
      );

      const costBreakdownChart = findIndirectCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      const chartData = costBreakdownChart.at(0).prop("items");
      expect(chartData["Ammonia EPC"]).toEqual(41_960_000);
      expect(chartData["Ammonia Land"]).toEqual(20_980_000);
      expect(chartData["Electrolyser EPC"]).toEqual(0);
      expect(chartData["Electrolyser Land"]).toEqual(0);
      expect(chartData["Power Plant EPC"]).toEqual(0);
      expect(chartData["Power Plant Land"]).toEqual(0);
      expect(chartData["Battery EPC"]).toEqual(0);
      expect(chartData["Battery Land"]).toEqual(0);
    });
  });

  it("calculates indirect cost breakdown for hybrid ammonia with battery", () => {
    const wrapper = shallow(
      <WorkingData
        data={standaloneAmmoniaHybridWithBatteryAndDegradationScenario.data}
        inputConfiguration="Advanced"
        loadSolar={mockLoader}
        loadWind={mockLoader}
        location={
          standaloneAmmoniaHybridWithBatteryAndDegradationScenario.location
        }
      />
    );

    const costBreakdownChart = findIndirectCostBreakdownChart(wrapper);

    expect(costBreakdownChart).toHaveLength(1);

    const chartData = costBreakdownChart.at(0).prop("items");
    expect(chartData["Ammonia EPC"]).toEqual(0);
    expect(chartData["Ammonia Land"]).toEqual(0);
    expect(chartData["Electrolyser EPC"]).toEqual(49_964_000);
    expect(chartData["Electrolyser Land"]).toEqual(9_993_000);
    expect(chartData["Power Plant EPC"]).toEqual(137_989_000);
    expect(chartData["Power Plant Land"]).toEqual(27_598_000);
    expect(chartData["Battery EPC"]).toEqual(0);
    expect(chartData["Battery Land"]).toEqual(0);
  });
});
