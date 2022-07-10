import { mount } from "enzyme";

import CostBarChart from "../../../components/charts/CostBarChart";
import WorkingData from "../../../components/charts/WorkingData";
import { TIMEOUT } from "../../consts";
import { readLocalCsv } from "../../resources/loader";
import {
  hybridBatteryGridSurplusRetailScenario,
  standaloneSolarScenario,
  standaloneSolarScenarioAdditionalRevenueStreams,
  standaloneSolarWithBatteryScenario,
  standaloneSolarWithStackDegradationScenario,
  standaloneWindScenario,
  windWithBatteryAndPPAScenario,
  windWithPPAScenario,
} from "../../scenario";

describe("Working Data calculations", () => {
  let loadSolar: () => Promise<any[]>;
  let loadWind: () => Promise<any[]>;
  beforeAll(() => {
    console.error = function () {};
    loadSolar = async () =>
      await readLocalCsv(__dirname + "/../../resources/solar-traces.csv");
    loadWind = async () =>
      await readLocalCsv(__dirname + "/../../resources/wind-traces.csv");
  });

  describe("LCH2", () => {
    it("calculates lch2 for solar", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneSolarScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const costBreakdown = [
        2.078, 1.385, 0, 0.374, 0.367, 0, 0, 0.201, 0.05, 0, 0, 0, 0,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(CostBarChart)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(1);
        datapoints[0].data.forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for solar with battery", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneSolarWithBatteryScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const costBreakdown = [
        1.62, 1.41, 0.03, 0.37, 0.37, 0, 0, 0.23, 0.05, 1.44, 0, 0.03, 0,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(CostBarChart)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(1);
        datapoints[0].data.forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for wind", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneWindScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const costBreakdown = [
        1.45, 1.21, 0, 0.38, 0.32, 0, 0, 0.41, 0.05, 0, 0, 0, 0,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(CostBarChart)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(1);
        datapoints[0].data.forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for wind with ppa agreement", (done) => {
      const wrapper = mount(
        <WorkingData
          data={windWithPPAScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const costBreakdown = [
        0, 1.393, 0, 0, 0.369, 0.15, 0, 0.283, 0.05, 0, 0.014, 0, 0,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(CostBarChart)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(1);
        datapoints[0].data.forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for hybrid with battery, grid and surplus retail", (done) => {
      const wrapper = mount(
        <WorkingData
          data={hybridBatteryGridSurplusRetailScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const costBreakdown = [
        1.676, 1.117, 0, 0.349, 0.296, 0, 0, 0.385, 0.05, 1.617, 0.064, 0, 0,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(CostBarChart)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(1);
        datapoints[0].data.forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for wind with battery and PPA agreement", (done) => {
      const wrapper = mount(
        <WorkingData
          data={windWithBatteryAndPPAScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const costBreakdown = [
        0, 1.178, 0, 0, 0.312, 0, 0, 0.396, 0.05, 0.681, 0, 0, 0,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(CostBarChart)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(1);
        datapoints[0].data.forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for solar with oxygen and electricity sales", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneSolarScenarioAdditionalRevenueStreams}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const costBreakdown = [
        2.08, 1.39, 0, 0.37, 0.37, 0, 0.105, 0.2, 0.05, 0, 0, 0, 0.079,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(CostBarChart)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(1);

        datapoints[0].data.forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for solar with stack degradation", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneSolarWithStackDegradationScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const costBreakdown = [
        2.24, 2.24, 0, 0.4, 0.59, 0, 0, 0.28, 0.05, 0, 0, 0, 0.08,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(CostBarChart)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(1);

        // TODO: Work out why it doesn't align with chart? Is it just negative values don't work?
        datapoints[0].data.forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });
  });
});
