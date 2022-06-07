import { mount } from "enzyme";

import CostBarChart from "../../../components/charts/CostBarChart";
import WorkingData from "../../../components/charts/WorkingData";
import { readLocalCsv } from "../../resources/loader";
import {
  solarPvWithBatteryScenario,
  solarPvWithElectrolyserScenario,
  windElectrolyserScenario,
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

  describe("Cash Flow Analysis", () => {
    it("calculates cash flow analysis for solar", (done) => {
      const wrapper = mount(
        <WorkingData
          data={solarPvWithElectrolyserScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -17500000, -15607914.35017068, -13672276.559095625, -11691997.823243694,
        -9665962.118995465, -7593025.522141032, -5472015.510365237,
        -3301730.248295047, -1080937.8546731034, 1191624.3487893892,
        3517250.607338444, 6811113.017696889, 10177946.988314295,
        13619576.808197135, 17137872.373577047, 15947362.499748051,
        19624787.40312532, 23384772.92908702, 27229383.093197763,
        31160733.511411272, 35180992.69008012, 35180992.69008012,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(CostBarChart)
          .filterWhere((e) => e.prop("title") === "Cash Flow Analysis");
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(1);
        expect(datapoints.at(0)).toEqual({
          label: "Cash Flow Analysis",
          data: cashFlowAnalysis,
        });

        done();
      }, 1500);
    });

    it("calculates cash flow analysis for wind", (done) => {
      const wrapper = mount(
        <WorkingData
          data={windElectrolyserScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -15400000, -13462998.245404894, -11480871.44694491, -9452491.478523426,
        -7376702.010891406, -5252317.806568585, -3078123.9971376946,
        -852875.3424710315, 1424704.5285622976, -429005.3972152746,
        1957194.4547891165, 5203933.338997802, 8523590.695311705,
        11917989.485533454, 15388998.245510746, 18938532.224487472,
        22568554.552938618, 26281077.439601038, 24995422.509959284,
        28879185.61775899, 32851792.803253688, 32851792.803253688,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(CostBarChart)
          .filterWhere((e) => e.prop("title") === "Cash Flow Analysis");
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(1);
        expect(datapoints.at(0)).toEqual({
          label: "Cash Flow Analysis",
          data: cashFlowAnalysis,
        });

        done();
      }, 1500);
    });
  });
});
