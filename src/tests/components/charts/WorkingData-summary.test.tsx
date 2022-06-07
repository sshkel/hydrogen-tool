import { mount } from "enzyme";

import BasicTable from "../../../components/charts/BasicTable";
import WorkingData from "../../../components/charts/WorkingData";
import { TIMEOUT } from "../../consts";
import { readLocalCsv } from "../../resources/loader";
import {
  solarPvWithBatteryScenario,
  solarPvWithElectrolyserScenario,
  windElectrolyserScenario,
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

  describe("LCH2", () => {
    it("calculates lch2 for solar", (done) => {
      const wrapper = mount(
        <WorkingData
          data={solarPvWithElectrolyserScenario}
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

    it("calculates lch2 for solar with battery", (done) => {
      const wrapper = mount(
        <WorkingData
          data={solarPvWithBatteryScenario}
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

    it("calculates lch2 for wind", (done) => {
      const wrapper = mount(
        <WorkingData
          data={windElectrolyserScenario}
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

    it("calculates lch2 for wind with ppa agreement", (done) => {
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
        expect(data["LCH2"].at(0)).toBeCloseTo(2.096);
        expect(data["H2 Retail Price"].at(0)).toBeCloseTo(3.096);

        done();
      }, TIMEOUT);
    });
  });
});
