import WorkingData from "../../../components/charts/WorkingData";
import { InputFields } from "../../../types";
import { shallow, ShallowWrapper } from "enzyme";
import CostBreakdownDoughnutChart from "../../../components/charts/CostBreakdownDoughnutChart";
import { solarPvWithBatteryScenario } from "../../scenario";

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
      const data: InputFields = {
        ...defaultInputData,
        electrolyserNominalCapacity: 10, // MW
        electrolyserReferenceCapacity: 10000, // kW
        electrolyserReferencePurchaseCost: 1000, // A$/kw
        electrolyserCostReductionWithScale: 20, // %
        electrolyserReferenceFoldIncrease: 10,
      };

      const wrapper = shallow(
        <WorkingData data={data} loadSolar={mockLoader} loadWind={mockLoader} />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Electrolyser Default CAPEX = 10_000_000
      expect(costBreakdownChart.at(0).prop("data").at(0)).toEqual(10_000_000);
    });

    it("calculates solar CAPEX as expected", () => {
      const data: InputFields = {
        ...defaultInputData,
        technology: "Solar",
        solarNominalCapacity: 15, // MW
        solarReferenceCapacity: 1000, // kW
        solarPVFarmReferenceCost: 1200, // A$/kw
        solarPVCostReductionWithScale: 20, // %
        solarReferenceFoldIncrease: 10,
      };

      const wrapper = shallow(
        <WorkingData data={data} loadSolar={mockLoader} loadWind={mockLoader} />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Solar Default CAPEX = 13_845_000
      expect(costBreakdownChart.at(0).prop("data").at(1)).toEqual(13_845_000);
    });

    it("calculates wind CAPEX as expected", () => {
      const data: InputFields = {
        ...defaultInputData,
        technology: "Wind",
        windNominalCapacity: 15, // MW
        windReferenceCapacity: 1000, // kW
        windFarmReferenceCost: 1950, // A$/kw
        windCostReductionWithScale: 20, // %
        windReferenceFoldIncrease: 10,
      };

      const wrapper = shallow(
        <WorkingData data={data} loadSolar={mockLoader} loadWind={mockLoader} />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Wind Default CAPEX = 22_498_000
      expect(costBreakdownChart.at(0).prop("data").at(1)).toEqual(22_498_000);
    });

    it("calculate does not factor in solar fields when wind technology", () => {
      const data: InputFields = {
        ...defaultInputData,
        technology: "Wind",
        solarNominalCapacity: 15, // MW
        solarReferenceCapacity: 1000, // kW
        solarPVFarmReferenceCost: 1200, // A$/kw
        solarPVCostReductionWithScale: 20, // %
        solarReferenceFoldIncrease: 10,
      };

      const wrapper = shallow(
        <WorkingData data={data} loadSolar={mockLoader} loadWind={mockLoader} />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Wind Default CAPEX = 0
      expect(costBreakdownChart.at(0).prop("data").at(1)).toEqual(0);
    });

    it("calculate does not factor in wind fields when solar technology", () => {
      const data: InputFields = {
        ...defaultInputData,
        technology: "Solar",
        windNominalCapacity: 15, // MW
        windReferenceCapacity: 1000, // kW
        windFarmReferenceCost: 1950, // A$/kw
        windCostReductionWithScale: 20, // %
        windReferenceFoldIncrease: 10,
      };

      const wrapper = shallow(
        <WorkingData data={data} loadSolar={mockLoader} loadWind={mockLoader} />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Solar Default CAPEX = 0
      expect(costBreakdownChart.at(0).prop("data").at(1)).toEqual(0);
    });

    it("calculates combination of capacity when hybrid", () => {
      const data: InputFields = {
        ...defaultInputData,
        technology: "Hybrid",
        solarNominalCapacity: 15, // MW
        solarReferenceCapacity: 1000, // kW
        solarPVFarmReferenceCost: 1200, // A$/kw
        solarPVCostReductionWithScale: 20, // %
        solarReferenceFoldIncrease: 10,
        windNominalCapacity: 15, // MW
        windReferenceCapacity: 1000, // kW
        windFarmReferenceCost: 1950, // A$/kw
        windCostReductionWithScale: 20, // %
        windReferenceFoldIncrease: 10,
      };

      const wrapper = shallow(
        <WorkingData data={data} loadSolar={mockLoader} loadWind={mockLoader} />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Power Plant CAPEX = 36_343_000
      expect(costBreakdownChart.at(0).prop("data").at(1)).toEqual(36_343_000);
    });

    it("calculates battery capex", () => {
      const data: InputFields = {
        ...defaultInputData,
        batteryRatedPower: 2, // MW
        batteryNominalCapacity: 4, // MWh
        batteryCosts: 542, // A$/kWh
      };

      const wrapper = shallow(
        <WorkingData data={data} loadSolar={mockLoader} loadWind={mockLoader} />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Battery CAPEX = 2168000
      expect(costBreakdownChart.at(0).prop("data").at(2)).toEqual(2_168_000);
    });

    it("passes down grid connection cost", () => {
      const data: InputFields = {
        ...defaultInputData,
        gridConnectionCost: 2000,
      };

      const wrapper = shallow(
        <WorkingData data={data} loadSolar={mockLoader} loadWind={mockLoader} />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Grid Connection Cost = 2000
      expect(costBreakdownChart.at(0).prop("data").at(3)).toEqual(2000);
    });

    it("passes down additional upfront costs", () => {
      const data: InputFields = {
        ...defaultInputData,
        additionalUpfrontCosts: 2000,
      };

      const wrapper = shallow(
        <WorkingData data={data} loadSolar={mockLoader} loadWind={mockLoader} />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Additional Upfront Cost = 2000
      expect(costBreakdownChart.at(0).prop("data").at(4)).toEqual(2000);
    });

    it("calculates indirect cost as percentage of electrolyser and power plant capex", () => {
      const data: InputFields = {
        ...defaultInputData,
        technology: "Hybrid",
        // Electrolyser CAPEX = 100000
        electrolyserNominalCapacity: 10, // MW
        electrolyserReferenceCapacity: 10, // kW
        electrolyserReferencePurchaseCost: 10, // A$/kw
        electrolyserCostReductionWithScale: 10, // %
        electrolyserReferenceFoldIncrease: 0,

        // Solar CAPEX = 51000
        solarNominalCapacity: 10, // MW
        solarReferenceCapacity: 10, // kW
        solarPVFarmReferenceCost: 10, // A$/kw
        solarPVCostReductionWithScale: 20, // %
        solarReferenceFoldIncrease: 10,

        // Wind CAPEX = 60000
        windNominalCapacity: 10, // MW
        windReferenceCapacity: 10, // kW
        windFarmReferenceCost: 10, // A$/kw
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
        <WorkingData data={data} loadSolar={mockLoader} loadWind={mockLoader} />
      );

      const costBreakdownChart = findCapitalCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Indirect Cost = 20_000
      expect(costBreakdownChart.at(0).prop("data").at(5)).toEqual(20_000);
    });

    it("calculates cost breakdown for complex scenario", () => {
      const wrapper = shallow(
        <WorkingData
          data={solarPvWithBatteryScenario}
          loadSolar={mockLoader}
          loadWind={mockLoader}
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
      const data: InputFields = {
        ...defaultInputData,
        // Electrolyser CAPEX = 100000
        electrolyserNominalCapacity: 10, // MW
        electrolyserReferenceCapacity: 10, // kW
        electrolyserReferencePurchaseCost: 10, // A$/kw
        electrolyserCostReductionWithScale: 10, // %
        electrolyserReferenceFoldIncrease: 0,

        electrolyserEpcCosts: 5,
        electrolyserLandProcurementCost: 0.5,
      };

      const wrapper = shallow(
        <WorkingData data={data} loadSolar={mockLoader} loadWind={mockLoader} />
      );

      const costBreakdownChart = findIndirectCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      const chartData = costBreakdownChart.at(0).prop("data");

      // EPC: 5000, Land: 1000
      expect(chartData.at(0)).toEqual(5_000);
      expect(chartData.at(1)).toEqual(1_000);
    });

    it("calculates solar indirect costs", () => {
      const data: InputFields = {
        ...defaultInputData,
        technology: "Solar",

        // Solar CAPEX = 100000
        solarNominalCapacity: 10, // MW
        solarReferenceCapacity: 10, // kW
        solarPVFarmReferenceCost: 10, // A$/kw
        solarPVCostReductionWithScale: 10, // %
        solarReferenceFoldIncrease: 0,

        // Wind CAPEX = ignored
        windNominalCapacity: 20, // MW
        windReferenceCapacity: 10, // kW
        windFarmReferenceCost: 10, // A$/kw
        windCostReductionWithScale: 10, // %
        windReferenceFoldIncrease: 0,

        solarEpcCosts: 5,
        solarLandProcurementCost: 0.5,

        windEpcCosts: 5,
        windLandProcurementCost: 1,
      };

      const wrapper = shallow(
        <WorkingData data={data} loadSolar={mockLoader} loadWind={mockLoader} />
      );

      const costBreakdownChart = findIndirectCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      const chartData = costBreakdownChart.at(0).prop("data");
      // EPC: 5000, Land: 1000
      expect(chartData.at(2)).toEqual(5_000);
      expect(chartData.at(3)).toEqual(1_000);
    });

    it("calculates wind indirect costs", () => {
      const data: InputFields = {
        ...defaultInputData,
        technology: "Wind",

        // Solar CAPEX = ignored
        solarNominalCapacity: 10, // MW
        solarReferenceCapacity: 10, // kW
        solarPVFarmReferenceCost: 10, // A$/kw
        solarPVCostReductionWithScale: 10, // %
        solarReferenceFoldIncrease: 0,

        // Wind CAPEX = 200000
        windNominalCapacity: 20, // MW
        windReferenceCapacity: 10, // kW
        windFarmReferenceCost: 10, // A$/kw
        windCostReductionWithScale: 10, // %
        windReferenceFoldIncrease: 0,

        solarEpcCosts: 5,
        solarLandProcurementCost: 0.5,

        windEpcCosts: 5,
        windLandProcurementCost: 1,
      };

      const wrapper = shallow(
        <WorkingData data={data} loadSolar={mockLoader} loadWind={mockLoader} />
      );

      const costBreakdownChart = findIndirectCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      const chartData = costBreakdownChart.at(0).prop("data");
      // EPC: 10000, Land: 2000
      expect(chartData.at(2)).toEqual(10_000);
      expect(chartData.at(3)).toEqual(2_000);
    });

    it("calculates hybrid indirect costs", () => {
      const data: InputFields = {
        ...defaultInputData,
        technology: "Hybrid",

        // Solar CAPEX = ignored
        solarNominalCapacity: 10, // MW
        solarReferenceCapacity: 10, // kW
        solarPVFarmReferenceCost: 10, // A$/kw
        solarPVCostReductionWithScale: 10, // %
        solarReferenceFoldIncrease: 0,

        // Wind CAPEX = 200000
        windNominalCapacity: 20, // MW
        windReferenceCapacity: 10, // kW
        windFarmReferenceCost: 10, // A$/kw
        windCostReductionWithScale: 10, // %
        windReferenceFoldIncrease: 0,

        solarEpcCosts: 5,
        solarLandProcurementCost: 0.5,

        windEpcCosts: 5,
        windLandProcurementCost: 1,
      };

      const wrapper = shallow(
        <WorkingData data={data} loadSolar={mockLoader} loadWind={mockLoader} />
      );

      const costBreakdownChart = findIndirectCostBreakdownChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      const chartData = costBreakdownChart.at(0).prop("data");
      // EPC: 15000, Land: 3000
      expect(chartData.at(2)).toEqual(15_000);
      expect(chartData.at(3)).toEqual(3_000);
    });

    it("calculates battery indirect costs", () => {
      const data: InputFields = {
        ...defaultInputData,

        // Battery CAPEX = 100000
        batteryRatedPower: 1, // MW
        batteryNominalCapacity: 10, // MWh
        batteryCosts: 10, // A$/kWh

        batteryEpcCosts: 10,
        batteryLandProcurementCost: 10,
      };

      const wrapper = shallow(
        <WorkingData data={data} loadSolar={mockLoader} loadWind={mockLoader} />
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
          data={solarPvWithBatteryScenario}
          loadSolar={mockLoader}
          loadWind={mockLoader}
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

const defaultInputData: InputFields = {
  additionalUpfrontCosts: 0,
  additionalAnnualCosts: 0,
  batteryEpcCosts: 0,
  batteryEfficiency: 0,
  batteryMinCharge: 0,
  batteryLandProcurementCost: 0,
  batteryRatedPower: 0,
  batteryCosts: 0,
  batteryOMCost: 0,
  batteryReplacementCost: 0,
  batteryLifetime: 0,
  discountRate: 0,
  durationOfStorage: 0,
  electrolyserCostReductionWithScale: 0,
  electrolyserEpcCosts: 0,
  electrolyserLandProcurementCost: 0,
  electrolyserReferenceFoldIncrease: 0,
  electrolyserOMCost: 0,
  electrolyserStackReplacement: 0,
  gridConnectionCost: 0,
  batteryNominalCapacity: 0,
  electrolyserNominalCapacity: 0,
  solarNominalCapacity: 0,
  windNominalCapacity: 0,
  solarReferenceCapacity: 0,
  windReferenceCapacity: 0,
  electrolyserReferenceCapacity: 0,
  electrolyserReferencePurchaseCost: 0,
  solarPVFarmReferenceCost: 0,
  windFarmReferenceCost: 0,
  solarEpcCosts: 0,
  solarLandProcurementCost: 0,
  solarPVCostReductionWithScale: 0,
  solarReferenceFoldIncrease: 0,
  solarOpex: 0,
  stackReplacementType: "Cumulative Hours",
  stackLifetime: 0,
  stackDegradation: 0,
  maximumDegradationBeforeReplacement: 0,
  technology: "Solar",
  electrolyserWaterCost: 0,
  windCostReductionWithScale: 0,
  windEpcCosts: 0,
  windLandProcurementCost: 0,
  windReferenceFoldIncrease: 0,
  windOpex: 0,
  plantLife: 0,
  additionalTransmissionCharges: 0,
  principalPPACost: 0,
  profile: "Fixed",
  location: "WA",
  electrolyserMaximumLoad: 0,
  electrolyserMinimumLoad: 0,
  timeBetweenOverloading: 0,
  maximumLoadWhenOverloading: 0,
  waterRequirementOfElectrolyser: 0,
  salesMargin: 0,
  oxygenRetailPrice: 0,
  averageElectricitySpotPrice: 0,
  shareOfTotalInvestmentFinancedViaEquity: 0,
  directEquityShare: 0,
  salvageCostShare: 0,
  decommissioningCostShare: 0,
  loanTerm: 0,
  interestOnLoan: 0,
  capitalDepreciationProfile: "Straight Line",
  taxRate: 0,
  inflationRate: 0,
  ppaAgreement: "false",
};
