import { mount } from "enzyme";

import CostBarChart from "../../../components/charts/CostBarChart";
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
          inputConfiguration="Advanced"
          data={standaloneSolarScenario.data}
          location={standaloneSolarScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -17500000, -15557289.35017068, -13538823.434095625, -11443177.120118694,
        -9268889.64829234, -7014463.739670329, -4678364.683332767,
        -2259019.400586766, 245184.5142278839, 2835899.7769129006,
        5514820.421165043, 8808682.831523487, 12175516.802140893,
        15617146.622023733, 19135442.187403645, 17944932.31357465,
        21622357.216951918, 25382342.74291362, 29226952.90702436,
        33158303.32523787, 37178562.50390672, 37178562.50390672,
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
          inputConfiguration="Advanced"
          data={standaloneSolarWithBatteryScenario.data}
          location={standaloneSolarWithBatteryScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -20868000, -18408473.624651816, -15854866.414919926,
        -13205385.324944738, -10458192.482720174, -7611404.069439994,
        -4663089.17082781, -1611268.599750321, 1546086.3106041043,
        4811054.94371739, 328570.5729480451, 4441266.03998769,
        8645771.518703327, 8434073.29002383, 12829141.924224444,
        17323079.89928007, 21918358.948712092, 26617512.599379912,
        31423137.716314428, 36337896.086172305, 41364516.04027663,
        41364516.04027663,
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
          inputConfiguration="Advanced"
          data={standaloneWindScenario.data}
          location={standaloneWindScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -15400000, -13418448.245404894, -11363432.69694491, -9233529.259773426,
        -7027278.236672657, -4743183.437994368, -2379711.269349123,
        64710.20351225464, 2591692.213195165, 869231.8475830522,
        3566330.75900616, 6813069.643214846, 10132726.999528749,
        13527125.789750498, 16998134.54972779, 20547668.528704517,
        24177690.85715566, 27890213.74381808, 26604558.814176325,
        30488321.92197603, 34460929.10747073, 34460929.10747073,
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
          inputConfiguration="Advanced"
          data={windWithPPAScenario.data}
          location={windWithPPAScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -7070000, -5898508.968931293, -4686746.912085868, -3433896.428819308,
        -2139119.683471084, -801557.8944891542, 579669.1892173234,
        2005463.8250164634, 3476750.826710582, 4994478.128447052,
        1896871.0006328854, 3722518.090769765, 5590018.858160066,
        7500419.644735125, 9454792.95097456, 11454238.08986998,
        13499881.857237786, 15592879.218789786, 17734414.014380585,
        19925699.679861154, 22167979.98697874, 22167979.98697874,
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
          inputConfiguration="Advanced"
          data={hybridBatteryGridSurplusRetailScenario.data}
          location={hybridBatteryGridSurplusRetailScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -23814000, -20822808.44637349, -17719840.353906315, -14502939.184127461,
        -11169894.485104136, -7718440.54360523, -4146255.0035688505,
        -450957.45003156085, 3369892.0423441594, 3308599.24067509,
        -2999936.088481782, 1927246.4166592648, 6964850.984428837,
        12115638.166392647, 17382437.527905554, 22768149.37345628,
        28275746.515145775, 29506744.285054233, 35267329.59454176,
        41159172.03676647, 47185553.040046796, 47185553.040046796,
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
          inputConfiguration="Advanced"
          data={windWithBatteryAndPPAScenario.data}
          location={windWithBatteryAndPPAScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -9498000, -7836932.425267618, -6119582.961166927, -4344798.960463718,
        -2511398.959742929, -618171.9590041209, 1336123.3167531574,
        3352759.174404368, 5433039.728496857, 3220227.2314844853,
        1525951.7451396296, 4090249.2002116367, 6713566.091660444,
        9397377.90539547, 12143197.014473872, 14952573.601279235,
        17827096.60275473, 20768394.679267116, 18538649.13476281,
        21618547.226398632, 24770354.770325348, 24770354.770325348,
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
          inputConfiguration="Advanced"
          data={gridSolarWithRetailAndAdditionalRevenueStreamsScenario.data}
          location={
            gridSolarWithRetailAndAdditionalRevenueStreamsScenario.location
          }
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -17500000, -15557289.350170678, -13538823.434095621,
        -11443177.120118689, -9268889.648292333, -7014463.7396703195,
        -4678364.683332756, -2259019.400586753, 245184.51422789972,
        2835899.7769129183, 5514820.421165062, 8808682.83152351,
        12175516.802140918, 15617146.62202376, 19135442.187403675,
        17944932.313574683, 21622357.216951955, 25382342.742913656,
        29226952.907024402, 33158303.325237915, 37178562.503906764,
        37178562.503906764,
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
          inputConfiguration="Advanced"
          data={standaloneSolarWithStackDegradationScenario.data}
          location={standaloneSolarWithStackDegradationScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -14000000, -11763005.304518683, -9476836.269500522, -7141061.811623184,
        -4755246.35674612, -2318949.821000492, 168272.4072071812,
        2706869.484233974, 5297295.127237735, 7940007.629165649,
        10635469.872647012, 13804149.342740526, 17011518.138485644,
        20258052.983205322, 23544235.23350635, 26870550.886921227,
        30237490.58813461, 28591101.89428325, 32705790.803601682,
        36872480.01202305, 41091825.46380269, 41091825.46380269,
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
          inputConfiguration="Advanced"
          data={standaloneHybridWithDegradationScenario.data}
          location={standaloneHybridWithDegradationScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -25900000, -22501608.562415905, -19049289.616482984,
        -15544122.918995492, -11986820.957674531, -8383886.265177688,
        -4746851.38189895, -1076515.4016464879, -1416523.3804004262,
        2710745.046152922, 6872069.547375511, 11843754.966705464,
        16821365.943137314, 21803794.061541215, 26790628.911983065,
        31782271.11497683, 32188063.730772283, 37627338.53108958,
        43071148.60488528, 48520096.175950855, 53972958.46383338,
        53972958.46383338,
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

    it("calculates cash flow analysis for wind with battery and degradation", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneWindWithBatteryAndDegradationScenario.data}
          location={standaloneWindWithBatteryAndDegradationScenario.location}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -19_018_000.0, -15941465.792626027, -12817191.013326934,
        -9644649.412704917, -6829296.431772739, -4578100.848399609,
        -2287311.8758749478, 43004.96785151772, 2412558.320326956,
        4821381.236274074, 5326758.627474511, 4446436.329700209,
        7947933.11938052, 11471231.613482002, 15015906.1111487,
        18581840.668236688, 22168509.97972339, 25775850.160429947,
        29403042.496965624, 33049325.525873553, 34227519.15819222,
        37910712.09433848, 36311568.273869984, 40552100.22196334,
        44813385.52125721, 49094745.20575121, 49094745.20575121,
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
