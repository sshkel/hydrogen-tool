import { mount } from "enzyme";

import CostBarChart from "../../../components/charts/CostBarChart";
import WorkingData from "../../../components/charts/WorkingData";
import { TIMEOUT } from "../../consts";
import { readLocalCsv } from "../../resources/loader";
import {
  hybridBatteryGridSurplusRetailScenario,
  standaloneHybridWithDegradationScenario,
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

  describe("Cash Flow Analysis", () => {
    it("calculates cash flow analysis for solar", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneSolarScenario}
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
          data={standaloneSolarWithBatteryScenario}
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
          data={standaloneWindScenario}
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
        -7070000, -5918961.468931293, -4740661.974585868, -3534419.992881808,
        -2299536.9616351463, -1035296.8546073178, 259034.25509620598,
        1584208.642542318, 2940997.3896745825, 4330190.855485153,
        1155293.1107794908, 2980940.2009163704, 4848440.968306672,
        6758841.75488173, 8713215.061121166, 10712660.200016586,
        12758303.967384392, 14851301.328936394, 16992836.124527194,
        19184121.790007763, 21426402.097125348, 21426402.097125348,
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
        -9498000, -7864407.625267617, -6192010.641166925, -4479838.932463717,
        -2726898.131042928, -932169.0095866197, 905393.1399060963,
        2786859.1431361297, 4713326.596446914, 2419568.9161470444,
        621463.8169325036, 3185761.2720045107, 5809078.163453318,
        8492889.977188345, 11238709.086266747, 14048085.673072109,
        16922608.674547605, 19863906.75105999, 17634161.206555683,
        20714059.298191506, 23865866.842118226, 23865866.842118226,
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

    it("calculates cash flow analysis for solar with oxygen and electricity sales", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneSolarScenarioAdditionalRevenueStreams}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -17500000, -15607914.350170678, -13672276.559095621,
        -11691997.823243689, -9665962.118995458, -7593025.522141023,
        -5472015.510365225, -3301730.248295034, -1080937.854673088,
        1191624.3487894065, 3517250.6073384634, 6811113.017696911,
        10177946.98831432, 13619576.808197161, 17137872.373577077,
        15947362.499748085, 19624787.403125357, 23384772.929087058,
        27229383.093197804, 31160733.511411317, 35180992.690080166,
        35180992.690080166,
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

    it("calculates cash flow analysis for solar with stack degradation", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneSolarWithStackDegradationScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -14000000, -11803505.304518683, -9583598.769500522, -7340118.374123184,
        -5072904.33330862, -2781799.2469770545, -466648.254418795,
        1872700.8060673485, 4236397.232116944, 6624587.286666839,
        9037414.021585733, 12206093.491679247, 15413462.287424365,
        18659997.13214404, 21946179.38244507, 25272495.035859946,
        28639434.73707333, 26993046.043221965, 31107734.952540398,
        35274424.16096176, 39493769.6127414, 39493769.6127414,
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

    it("calculates cash flow analysis for hybrid with degradation", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneHybridWithDegradationScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -25900000, -22576533.562415905, -19246800.241482984,
        -15912377.559620492, -12574488.214315157, -9240157.70323433,
        -5921454.605907008, -2619727.4562547468, -3118912.6512446934,
        537489.2476593186, 4175938.0580413393, 9147623.477371292,
        14125234.453803143, 19107662.57220704, 24094497.42264889,
        29086139.625642657, 29491932.24143811, 34931207.04175541,
        40375017.11555111, 45823964.68661668, 51276826.974499196,
        51276826.974499196,
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
