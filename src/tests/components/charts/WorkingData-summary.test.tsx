import { mount } from "enzyme";

import SummaryOfResultsTable from "../../../components/charts/SummaryOfResultsTable";
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
          inputConfiguration="Advanced"
          data={standaloneSolarScenario.data}
          location={standaloneSolarScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(SummaryOfResultsTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"]).toBeCloseTo(31.389);
        expect(
          data["Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"]
        ).toBeCloseTo(26.975);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"]
        ).toBeCloseTo(46.313);
        expect(data["Electrolyser Capacity Factor"]).toBeCloseTo(38.888);
        expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toBeCloseTo(
          34_066.072
        );
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
        ).toBeCloseTo(7_179.6);
        expect(data["Hydrogen Output [t/yr]"]).toBeCloseTo(681.321);
        expect(data["LCH2"]).toBeCloseTo(4.456);

        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for solar with battery", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneSolarWithBatteryScenario.data}
          location={standaloneSolarWithBatteryScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(SummaryOfResultsTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"]).toBeCloseTo(29.66);
        expect(
          data["Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"]
        ).toBeCloseTo(29.486);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"]
        ).toBeCloseTo(54.989);
        expect(data["Electrolyser Capacity Factor"]).toBeCloseTo(42.759);
        expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toBeCloseTo(
          37457.06
        );
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
        ).toBeCloseTo(1516.739);
        expect(data["Hydrogen Output [t/yr]"]).toBeCloseTo(696.228);
        expect(data["LCH2"]).toBeCloseTo(5.602);

        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for wind", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneWindScenario.data}
          location={standaloneWindScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(SummaryOfResultsTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"]).toBeCloseTo(38.676);
        expect(
          data["Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"]
        ).toBeCloseTo(15.114);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"]
        ).toBeCloseTo(76.872);
        expect(data["Electrolyser Capacity Factor"]).toBeCloseTo(44.632);
        expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toBeCloseTo(
          39_097.684
        );
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
        ).toBeCloseTo(1558.586);
        expect(data["Hydrogen Output [t/yr]"]).toBeCloseTo(781.954);
        expect(data["LCH2"]).toBeCloseTo(3.815);

        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for wind with ppa agreement", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={windWithPPAScenario.data}
          location={windWithPPAScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(SummaryOfResultsTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"]).toBeCloseTo(28.533);
        expect(
          data["Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"]
        ).toBeCloseTo(14.703);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"]
        ).toBeCloseTo(69.703);
        expect(data["Electrolyser Capacity Factor"]).toBeCloseTo(38.668);
        expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toBeCloseTo(
          33_873.405
        );
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
        ).toBeCloseTo(3619.361);
        expect(data["Hydrogen Output [t/yr]"]).toBeCloseTo(677.468);
        expect(data["LCH2"]).toBeCloseTo(2.31);

        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for hybrid with battery, grid and surplus retail", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={hybridBatteryGridSurplusRetailScenario.data}
          location={hybridBatteryGridSurplusRetailScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(SummaryOfResultsTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"]).toBeCloseTo(32.516);
        expect(
          data["Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"]
        ).toBeCloseTo(17.523);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"]
        ).toBeCloseTo(83.596);
        expect(data["Electrolyser Capacity Factor"]).toBeCloseTo(48.221);
        expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toBeCloseTo(
          42_241.618
        );
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
        ).toBeCloseTo(484.237);
        expect(data["Hydrogen Output [t/yr]"]).toBeCloseTo(844.832);
        expect(data["LCH2"]).toBeCloseTo(5.554);
        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for wind with battery and PPA agreement", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={windWithBatteryAndPPAScenario.data}
          location={windWithBatteryAndPPAScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(SummaryOfResultsTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"]).toBeCloseTo(32.109);
        expect(
          data["Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"]
        ).toBeCloseTo(17.489);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"]
        ).toBeCloseTo(78.071);
        expect(data["Electrolyser Capacity Factor"]).toBeCloseTo(45.739);
        expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toBeCloseTo(
          40_067.358
        );
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
        ).toBeCloseTo(2124.017);
        expect(data["Hydrogen Output [t/yr]"]).toBeCloseTo(801.347);
        expect(data["LCH2"]).toBeCloseTo(2.669);

        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for solar with oxygen and electricity sales but not really", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={gridSolarWithRetailAndAdditionalRevenueStreamsScenario.data}
          location={
            gridSolarWithRetailAndAdditionalRevenueStreamsScenario.location
          }
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(SummaryOfResultsTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"]).toBeCloseTo(31.389);
        expect(
          data["Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"]
        ).toBeCloseTo(26.975);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"]
        ).toBeCloseTo(46.313);
        expect(data["Electrolyser Capacity Factor"]).toBeCloseTo(38.888);
        expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toBeCloseTo(
          34_066.072
        );
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
        ).toBeCloseTo(7179.6);
        expect(data["Hydrogen Output [t/yr]"]).toBeCloseTo(681.321);
        expect(data["LCH2"]).toBeCloseTo(4.46);

        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for solar with stack degradation", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneSolarWithStackDegradationScenario.data}
          location={standaloneSolarWithStackDegradationScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(SummaryOfResultsTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"]).toBeCloseTo(25.794);
        expect(
          data["Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"]
        ).toBeCloseTo(0.936);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"]
        ).toBeCloseTo(42.123);
        expect(data["Electrolyser Capacity Factor"]).toBeCloseTo(25.508);
        expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toBeCloseTo(
          22_344.641
        );
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
        ).toBeCloseTo(250.61);
        expect(data["Hydrogen Output [t/yr]"]).toBeCloseTo(417.583);
        expect(data["LCH2"]).toBeCloseTo(5.808);

        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for hybrid with degradation", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneHybridWithDegradationScenario.data}
          location={standaloneHybridWithDegradationScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(SummaryOfResultsTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"]).toBeCloseTo(27.738);
        expect(
          data["Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"]
        ).toBeCloseTo(30.739);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"]
        ).toBeCloseTo(85.198);
        expect(data["Electrolyser Capacity Factor"]).toBeCloseTo(61.06);
        expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toBeCloseTo(
          53_488.536
        );
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
        ).toBeCloseTo(12_117.619);
        expect(data["Hydrogen Output [t/yr]"]).toBeCloseTo(1037.638);
        expect(data["LCH2"]).toBeCloseTo(4.429);

        done();
      }, TIMEOUT);
    });

    it("calculates summary of results for wind with battery and degradation", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneWindWithBatteryAndDegradationScenario.data}
          location={standaloneWindWithBatteryAndDegradationScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const summaryTable = wrapper
          .find(SummaryOfResultsTable)
          .filterWhere((e) => e.prop("title") === "Summary of Results");
        expect(summaryTable).toHaveLength(1);
        const data = summaryTable.at(0).prop("data");

        expect(data["Power Plant Capacity Factor"]).toBeCloseTo(36.763);
        expect(
          data["Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)"]
        ).toBeCloseTo(23.758);
        expect(
          data["Total Time Electrolyser is Operating (% of 8760 hrs/yr)"]
        ).toBeCloseTo(85.883);
        expect(data["Electrolyser Capacity Factor"]).toBeCloseTo(51.699);
        expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toBeCloseTo(
          45_288.612
        );
        expect(
          data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
        ).toBeCloseTo(3_017.854);
        expect(data["Hydrogen Output [t/yr]"]).toBeCloseTo(866.564);
        expect(data["LCH2"]).toBeCloseTo(3.836);

        done();
      }, TIMEOUT);
    });
  });
});
