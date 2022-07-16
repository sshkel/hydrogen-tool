import { mount } from "enzyme";

import BasicTable from "../../../components/charts/BasicTable";
import WorkingData from "../../../components/charts/WorkingData";
import { TIMEOUT } from "../../consts";
import { readLocalCsv } from "../../resources/loader";
import {
  gridSolarWithRetailAndAdditionalRevenueStreamsScenario,
  hybridBatteryGridSurplusRetailScenario,
  standaloneHybridWithDegradationScenario,
  standaloneSolarScenario,
  standaloneSolarWithBatteryScenario,
  standaloneSolarWithStackDegradationScenario,
  standaloneWindScenario,
  standaloneWindWithBatteryAndDegradationScenario,
  windWithBatteryAndPPAScenario,
  windWithPPAScenario,
} from "../../scenario";

describe("Model summary", () => {
  let loadSolar: () => Promise<any[]>;
  let loadWind: () => Promise<any[]>;
  beforeAll(() => {
    console.error = function () {};
    loadSolar = async () =>
      await readLocalCsv(__dirname + "/../../resources/solar-traces.csv");
    loadWind = async () =>
      await readLocalCsv(__dirname + "/../../resources/wind-traces.csv");
  });

  describe("Summary of Results", () => {
    it("calculates summary of results for solar", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneSolarScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(BasicTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"].at(0)).toBeCloseTo(31.389);
        expect(
          data[
            "Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"
          ].at(0)
        ).toBeCloseTo(26.975);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"].at(0)
        ).toBeCloseTo(46.313);
        expect(data["Electrolyser Capacity Factor"].at(0)).toBeCloseTo(38.888);
        expect(
          data["Energy Consumed by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(34_066.072);
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(7_179.6);
        expect(data["Hydrogen Output [t/yr]"].at(0)).toBeCloseTo(681.321);
        expect(data["LCH2"].at(0)).toBeCloseTo(4.456);
        expect(data["H2 Retail Price"].at(0)).toBeCloseTo(5.456);

        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for solar with battery", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneSolarWithBatteryScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(BasicTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"].at(0)).toBeCloseTo(29.66);
        expect(
          data[
            "Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"
          ].at(0)
        ).toBeCloseTo(29.486);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"].at(0)
        ).toBeCloseTo(54.989);
        expect(data["Electrolyser Capacity Factor"].at(0)).toBeCloseTo(42.759);
        expect(
          data["Energy Consumed by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(37457.06);
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(1516.739);
        expect(data["Hydrogen Output [t/yr]"].at(0)).toBeCloseTo(696.228);
        expect(data["LCH2"].at(0)).toBeCloseTo(5.602);
        expect(data["H2 Retail Price"].at(0)).toBeCloseTo(6.602);

        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for wind", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneWindScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(BasicTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"].at(0)).toBeCloseTo(38.676);
        expect(
          data[
            "Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"
          ].at(0)
        ).toBeCloseTo(15.114);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"].at(0)
        ).toBeCloseTo(76.872);
        expect(data["Electrolyser Capacity Factor"].at(0)).toBeCloseTo(44.632);
        expect(
          data["Energy Consumed by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(39_097.684);
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(1558.586);
        expect(data["Hydrogen Output [t/yr]"].at(0)).toBeCloseTo(781.954);
        expect(data["LCH2"].at(0)).toBeCloseTo(3.815);
        expect(data["H2 Retail Price"].at(0)).toBeCloseTo(4.815);

        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for wind with ppa agreement", (done) => {
      const wrapper = mount(
        <WorkingData
          data={windWithPPAScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(BasicTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"].at(0)).toBeCloseTo(28.533);
        expect(
          data[
            "Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"
          ].at(0)
        ).toBeCloseTo(14.703);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"].at(0)
        ).toBeCloseTo(69.703);
        expect(data["Electrolyser Capacity Factor"].at(0)).toBeCloseTo(38.668);
        expect(
          data["Energy Consumed by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(33_873.405);
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(3619.361);
        expect(data["Hydrogen Output [t/yr]"].at(0)).toBeCloseTo(677.468);
        expect(data["LCH2"].at(0)).toBeCloseTo(2.31);
        expect(data["H2 Retail Price"].at(0)).toBeCloseTo(3.31);

        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for hybrid with battery, grid and surplus retail", (done) => {
      const wrapper = mount(
        <WorkingData
          data={hybridBatteryGridSurplusRetailScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(BasicTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"].at(0)).toBeCloseTo(32.516);
        expect(
          data[
            "Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"
          ].at(0)
        ).toBeCloseTo(17.523);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"].at(0)
        ).toBeCloseTo(83.596);
        expect(data["Electrolyser Capacity Factor"].at(0)).toBeCloseTo(48.221);
        expect(
          data["Energy Consumed by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(42_241.618);
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(484.237);
        expect(data["Hydrogen Output [t/yr]"].at(0)).toBeCloseTo(844.832);
        expect(data["LCH2"].at(0)).toBeCloseTo(5.554);
        expect(data["H2 Retail Price"].at(0)).toBeCloseTo(6.554);

        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for wind with battery and PPA agreement", (done) => {
      const wrapper = mount(
        <WorkingData
          data={windWithBatteryAndPPAScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(BasicTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"].at(0)).toBeCloseTo(32.109);
        expect(
          data[
            "Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"
          ].at(0)
        ).toBeCloseTo(17.489);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"].at(0)
        ).toBeCloseTo(78.071);
        expect(data["Electrolyser Capacity Factor"].at(0)).toBeCloseTo(45.739);
        expect(
          data["Energy Consumed by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(40_067.358);
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(2124.017);
        expect(data["Hydrogen Output [t/yr]"].at(0)).toBeCloseTo(801.347);
        expect(data["LCH2"].at(0)).toBeCloseTo(2.669);
        expect(data["H2 Retail Price"].at(0)).toBeCloseTo(3.669);

        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for solar with oxygen and electricity sales", (done) => {
      const wrapper = mount(
        <WorkingData
          data={gridSolarWithRetailAndAdditionalRevenueStreamsScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(BasicTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"].at(0)).toBeCloseTo(31.389);
        expect(
          data[
            "Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"
          ].at(0)
        ).toBeCloseTo(26.975);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"].at(0)
        ).toBeCloseTo(46.313);
        expect(data["Electrolyser Capacity Factor"].at(0)).toBeCloseTo(38.888);
        expect(
          data["Energy Consumed by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(34_066.072);
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(7179.6);
        expect(data["Hydrogen Output [t/yr]"].at(0)).toBeCloseTo(681.321);
        expect(data["LCH2"].at(0)).toBeCloseTo(4.27);
        expect(data["H2 Retail Price"].at(0)).toBeCloseTo(5.27);

        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for solar with stack degradation", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneSolarWithStackDegradationScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(BasicTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"].at(0)).toBeCloseTo(25.794);
        expect(
          data[
            "Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"
          ].at(0)
        ).toBeCloseTo(0.936);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"].at(0)
        ).toBeCloseTo(42.123);
        expect(data["Electrolyser Capacity Factor"].at(0)).toBeCloseTo(25.508);
        expect(
          data["Energy Consumed by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(22_344.641);
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(250.61);
        expect(data["Hydrogen Output [t/yr]"].at(0)).toBeCloseTo(417.583);
        expect(data["LCH2"].at(0)).toBeCloseTo(5.728);
        expect(data["H2 Retail Price"].at(0)).toBeCloseTo(8.728);

        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for hybrid with degradation", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneHybridWithDegradationScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(BasicTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"].at(0)).toBeCloseTo(27.738);
        expect(
          data[
            "Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"
          ].at(0)
        ).toBeCloseTo(30.739);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"].at(0)
        ).toBeCloseTo(85.198);
        expect(data["Electrolyser Capacity Factor"].at(0)).toBeCloseTo(61.06);
        expect(
          data["Energy Consumed by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(53_488.536);
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(12_117.619);
        expect(data["Hydrogen Output [t/yr]"].at(0)).toBeCloseTo(1037.638);
        expect(data["LCH2"].at(0)).toBeCloseTo(4.429);
        expect(data["H2 Retail Price"].at(0)).toBeCloseTo(5.429);

        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for wind with battery and degradation", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneWindWithBatteryAndDegradationScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(BasicTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"].at(0)).toBeCloseTo(36.763);
        expect(
          data[
            "Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"
          ].at(0)
        ).toBeCloseTo(23.758);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"].at(0)
        ).toBeCloseTo(85.883);
        expect(data["Electrolyser Capacity Factor"].at(0)).toBeCloseTo(51.699);
        expect(
          data["Energy Consumed by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(45_288.612);
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"].at(0)
        ).toBeCloseTo(3_017.854);
        expect(data["Hydrogen Output [t/yr]"].at(0)).toBeCloseTo(866.564);
        expect(data["LCH2"].at(0)).toBeCloseTo(3.836);
        expect(data["H2 Retail Price"].at(0)).toBeCloseTo(4.836);

        done();
      }, TIMEOUT);
    });
  });
});
