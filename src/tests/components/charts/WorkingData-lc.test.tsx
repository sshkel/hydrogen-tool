import { mount } from "enzyme";

import WorkingData, {
  WaterFallPane,
} from "../../../components/charts/WorkingData";
import { TIMEOUT } from "../../consts";
import { readLocalCsv } from "../../resources/loader";
import {
  basicHybridPPAScenario,
  basicSolarScenario,
  hybridBatteryGridOversizeRatioScenario,
  standaloneAdvancedAmmoniaSolarScenario,
  standaloneAmmoniaHybridWithBatteryAndDegradationScenario,
  standaloneHybridWithDegradationScenario,
  standaloneMethanolHybridWithBatteryScenario,
  standaloneSolarScenario,
  standaloneSolarWithBatteryScenario,
  standaloneSolarWithStackDegradationScenario,
  standaloneWindScenario,
  standaloneWindWithBatteryAndDegradationScenario,
  windWithBatteryAndPPAScenario,
  windWithPPAScenario,
} from "../../scenario";

describe("Working Data calculations", () => {
  let loadNationalSolar: () => Promise<any[]>;
  let loadNationalWind: () => Promise<any[]>;
  let loadNSWSolar: () => Promise<any[]>;
  let loadNSWWind: () => Promise<any[]>;

  beforeEach(() => {
    sessionStorage.clear();
  });

  beforeAll(() => {
    console.error = function () {};
    loadNationalSolar = async () =>
      await readLocalCsv(__dirname + "/../../resources/solar-traces.csv");
    loadNationalWind = async () =>
      await readLocalCsv(__dirname + "/../../resources/wind-traces.csv");

    loadNSWSolar = async () =>
      await readLocalCsv(__dirname + "/../../../../assets/solar.csv");
    loadNSWWind = async () =>
      await readLocalCsv(__dirname + "/../../../../assets/wind.csv");
  });

  describe("LC", () => {
    it("calculates lch2 for solar", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneSolarScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={standaloneSolarScenario.location}
        />
      );

      const costBreakdown = [
        2.078, 1.385, 0, 0.374, 0.367, 0, 0.201, 0.05, 0, 0, 0,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(WaterFallPane)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("items");
        Object.values(datapoints).forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for solar with battery", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneSolarWithBatteryScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={standaloneSolarWithBatteryScenario.location}
        />
      );

      const costBreakdown = [
        1.62, 1.41, 0.03, 0.37, 0.37, 0, 0.23, 0.05, 1.44, 0, 0.03,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(WaterFallPane)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("items");
        Object.values(datapoints).forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for wind", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneWindScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={standaloneWindScenario.location}
        />
      );

      const costBreakdown = [1.45, 1.21, 0, 0.38, 0.32, 0, 0.41, 0.05, 0, 0, 0];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(WaterFallPane)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("items");
        Object.values(datapoints).forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for wind with ppa agreement", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={windWithPPAScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={windWithPPAScenario.location}
        />
      );

      const costBreakdown = [
        0, 1.393, 0, 0, 0.369, 0.15, 0.283, 0.05, 0, 0.014, 0,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(WaterFallPane)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("items");

        Object.values(datapoints).forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for hybrid with battery, grid and oversize ratio", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={hybridBatteryGridOversizeRatioScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={hybridBatteryGridOversizeRatioScenario.location}
        />
      );

      const costBreakdown = [
        1.676, 1.117, 0, 0.349, 0.296, 0, 0.385, 0.05, 1.617, 0.064, 0,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(WaterFallPane)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("items");

        Object.values(datapoints).forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for wind with battery and PPA agreement", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={windWithBatteryAndPPAScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={windWithBatteryAndPPAScenario.location}
        />
      );

      const costBreakdown = [
        0, 1.178, 0, 0, 0.312, 0, 0.396, 0.05, 0.681, 0, 0,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(WaterFallPane)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("items");

        Object.values(datapoints).forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for solar with basic configuration", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration={basicSolarScenario.inputConfiguration}
          data={basicSolarScenario.data}
          loadSolar={loadNSWSolar}
          loadWind={loadNSWWind}
          location={basicSolarScenario.location}
        />
      );

      const costBreakdown = [
        1.441, 1.208, 0.954, 0.33, 0.32, 0, 0, 0.075, 0, 0, 0, 0,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(WaterFallPane)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("items");

        Object.values(datapoints).forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for solar with stack degradation", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneSolarWithStackDegradationScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={standaloneSolarWithStackDegradationScenario.location}
        />
      );

      const costBreakdown = [2.24, 2.24, 0, 0.4, 0.59, 0, 0.28, 0.05, 0, 0, 0];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(WaterFallPane)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("items");

        Object.values(datapoints).forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for hybrid with degradation", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneHybridWithDegradationScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={standaloneHybridWithDegradationScenario.location}
        />
      );

      const costBreakdown = [
        2.402, 0.89, 0, 0.523, 0.236, 0, 0.328, 0.05, 0, 0, 0,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(WaterFallPane)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("items");
        Object.values(datapoints).forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for wind with battery and degradation", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneWindWithBatteryAndDegradationScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={standaloneWindWithBatteryAndDegradationScenario.location}
        />
      );

      const costBreakdown = [
        1.451, 0.967, 0, 0.423, 0.282, 0, 0.271, 0.05, 0.392, 0, 0,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(WaterFallPane)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("items");
        Object.values(datapoints).forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for basic hybrid with ppa agreement", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration={basicHybridPPAScenario.inputConfiguration}
          data={basicHybridPPAScenario.data}
          loadSolar={loadNSWSolar}
          loadWind={loadNSWWind}
          location={basicHybridPPAScenario.location}
        />
      );

      // lcPowerPlantCAPEX,
      // lcElectrolyserCAPEX,
      // lcIndirectCosts,
      // lcPowerPlantOPEX,
      // lcElectrolyserOPEX,
      // lcElectricityPurchase,
      // lcStackReplacement,
      // lcWater,
      // lcBattery,
      // lcGridConnection,
      // lcAdditionalCosts,
      const costBreakdown = [
        0, 0.733, 0.264, 0, 0.194, 0.667, 0.149, 0.075, 0, 0, 0,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(WaterFallPane)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCH2"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("items");

        Object.values(datapoints).forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lcnh3 for ammonia solar", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneAdvancedAmmoniaSolarScenario.data}
          location={standaloneAdvancedAmmoniaSolarScenario.location}
          inputConfiguration={
            standaloneAdvancedAmmoniaSolarScenario.inputConfiguration
          }
          loadSolar={loadNSWSolar}
          loadWind={loadNSWWind}
        />
      );

      // lcPowerPlantCAPEX
      // lcElectrolyserCAPEX
      // lcH2StorageCAPEX
      // lcAmmoniaPlantCAPEX
      // lcIndirectCosts
      // lcPowerPlantOPEX
      // lcElectrolyserOPEX
      // lcH2StorageOPEX
      // lcAmmoniaPlantOPEX
      // lcElectricityPurchase
      // lcStackReplacement
      // lcWater
      // lcBattery
      // lcGridConnection
      // lcAdditionalCosts
      const costBreakdown = [
        0.75, 0.4, 0.14, 0.14, 0, 0.09, 0.11, 0.03, 0.03, 0, 0.06, 0.008, 0, 0,
        0,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(WaterFallPane)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCNH3"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("items");
        Object.values(datapoints).forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for ammonia hybrid with battery and degradation", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneAmmoniaHybridWithBatteryAndDegradationScenario.data}
          location={
            standaloneAmmoniaHybridWithBatteryAndDegradationScenario.location
          }
          inputConfiguration={
            standaloneAmmoniaHybridWithBatteryAndDegradationScenario.inputConfiguration
          }
          loadSolar={loadNSWSolar}
          loadWind={loadNSWWind}
        />
      );

      // lcPowerPlantCAPEX
      // lcElectrolyserCAPEX
      // lcH2StorageCAPEX
      // lcAmmoniaPlantCAPEX
      // lcIndirectCosts
      // lcPowerPlantOPEX
      // lcElectrolyserOPEX
      // lcH2StorageOPEX
      // lcAmmoniaPlantOPEX
      // lcElectricityPurchase
      // lcStackReplacement
      // lcWater
      // lcBattery
      // lcGridConnection
      // lcAdditionalCosts
      const costBreakdown = [
        0.572, 0.115, 0.049, 0.084, 0.222, 0.102, 0.03, 0.01, 0.018, 0, 0.036,
        0.201, 0.007, 0, 0,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(WaterFallPane)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCNH3"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("items");
        Object.values(datapoints).forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 3)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates lch2 for methanol hybrid with battery", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneMethanolHybridWithBatteryScenario.data}
          location={standaloneMethanolHybridWithBatteryScenario.location}
          inputConfiguration={
            standaloneMethanolHybridWithBatteryScenario.inputConfiguration
          }
          loadSolar={loadNSWSolar}
          loadWind={loadNSWWind}
        />
      );

      // lcPowerPlantCAPEX
      // lcElectrolyserCAPEX
      // lcH2StorageCAPEX
      // lcMethanolPlantCAPEX
      // lcCCCAPEX
      // lcIndirectCosts
      // lcPowerPlantOPEX
      // lcElectrolyserOPEX
      // lcH2StorageOPEX
      // lcMethanolPlantOPEX
      // lcCCOPEX
      // lcElectricityPurchase
      // lcStackReplacement
      // lcWater
      // lcBattery
      // lcGridConnection
      // lcAdditionalCosts
      const costBreakdown = [
        0.6478, 0.383, 0.0112, 0.025, 0.0566, 0.3058, 0.1208, 0.1116, 0.0033,
        0.0146, 0.033, 0, 0.1792, 0.0111, 0.1034, 0, 0,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(WaterFallPane)
          .filterWhere(
            (e) => e.prop("title") === "Breakdown of Cost Components in LCMeOH"
          );
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("items");
        Object.values(datapoints).forEach((cost, i) =>
          expect(cost).toBeCloseTo(costBreakdown[i], 3)
        );

        done();
      }, TIMEOUT);
    });
  });
});
