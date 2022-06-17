import { mount } from "enzyme";

import CostBarChart from "../../../components/charts/CostBarChart";
import WorkingData from "../../../components/charts/WorkingData";
import { TIMEOUT } from "../../consts";
import { readLocalCsv } from "../../resources/loader";
import {
  hybridBatteryGridSurplusRetailScenario,
  solarPvWithBatteryScenario,
  solarPvWithElectrolyserScenario,
  windElectrolyserScenario,
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
      }, TIMEOUT);
    });

    it("calculates cash flow analysis for solar with battery", (done) => {
      const wrapper = mount(
        <WorkingData
          data={solarPvWithBatteryScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -20868000, -18468842.924651816, -16014006.597419927, -13502099.03700724,
        -10931693.462584237, -8301327.423800658, -5609501.909047491,
        -2854680.4314254937, -35288.091862947214, 2850289.3811886627,
        -1860332.402528136, 2252363.0645115087, 6456868.5432271445,
        6245170.314547649, 10640238.948748263, 15134176.923803892,
        19729455.973235913, 24428609.623903733, 29234234.74083825,
        34148993.11069612, 39175613.06480045, 39175613.06480045,
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
      }, TIMEOUT);
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
      }, TIMEOUT);
    });

    it("calculates cash flow analysis for wind with ppa agreement", (done) => {
      const wrapper = mount(
        <WorkingData
          data={windWithPPAScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -7070000, -5918961.468931293, -4740661.974585868, -3534419.9928818084,
        -2299536.9616351468, -1035296.8546073188, 259034.25509620504,
        1584208.6425423168, 2940997.389674581, 4330190.855485152,
        1155293.1107794903, 2980940.2009163694, 4848440.96830667,
        6758841.754881728, 8713215.061121162, 10712660.200016582,
        12758303.967384389, 14851301.328936389, 16992836.12452719,
        19184121.79000776, 21426402.097125344, 21426402.097125344,
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
      }, TIMEOUT);
    });

    it("calculates cash flow analysis for hybrid with battery, grid and surplus retail", (done) => {
      const wrapper = mount(
        <WorkingData
          data={hybridBatteryGridSurplusRetailScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -23814000, -20891698.94637349, -17901443.366406314, -14841534.39693996,
        -11710230.703236947, -8505747.41719136, -5226255.048994633,
        -1869878.3715929883, 1565304.7227436965, 1301052.37394604,
        -5267822.241017633, -340639.7358765863, 4696964.831892986,
        9847752.013856797, 15114551.375369702, 20500263.22092043,
        26007860.362609923, 27238858.13251838, 32999443.442005906,
        38891285.88423062, 44917666.88751095, 44917666.88751095,
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
      }, TIMEOUT);
    });

    it("calculates cash flow analysis for wind with battery and PPA agreement", (done) => {
      const wrapper = mount(
        <WorkingData
          data={windWithBatteryAndPPAScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -9498000, -7864407.625267617, -6192010.6411669245, -4479838.932463715,
        -2726898.131042925, -932169.0095866157, 905393.1399061012,
        2786859.1431361362, 4713326.596446922, 2419568.916147054,
        621463.8169325157, 3185761.2720045242, 5809078.163453333,
        8492889.977188362, 11238709.086266765, 14048085.67307213,
        16922608.674547628, 19863906.751060013, 17634161.20655571,
        20714059.298191532, 23865866.842118252, 23865866.842118252,
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
      }, TIMEOUT);
    });
  });
});
