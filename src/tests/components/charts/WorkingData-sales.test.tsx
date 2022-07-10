import { mount } from "enzyme";

import CostLineChart from "../../../components/charts/CostLineChart";
import WorkingData from "../../../components/charts/WorkingData";
import { TIMEOUT } from "../../consts";
import { readLocalCsv } from "../../resources/loader";
import {
  hybridBatteryGridSurplusRetailScenario,
  standaloneSolarScenario,
  standaloneSolarScenarioAdditionalRevenueStreams,
  standaloneSolarWithBatteryScenario,
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

  describe("Sales", () => {
    it("calculates sales for solar", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneSolarScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const hydrogenSales = [
        3_809_986.51, 3_905_236.17, 4_002_867.08, 4_102_938.75, 4_205_512.22,
        4_310_650.03, 4_418_416.28, 4_528_876.68, 4_642_098.6, 4_758_151.07,
        4_877_104.84, 4_999_032.46, 5_124_008.28, 5_252_108.48, 5_383_411.2,
        5_517_996.48, 5_655_946.39, 5_797_345.05, 5_942_278.67, 6_090_835.64,
      ];

      const electricitySales = new Array(20).fill(0);

      const oxygenSales = new Array(20).fill(0);

      const totalSales = hydrogenSales;

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const opexChart = wrapper
          .find(CostLineChart)
          .filterWhere((e) => e.prop("title") === "Sales");
        expect(opexChart).toHaveLength(1);
        const datapoints = opexChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(4);

        expect(datapoints[0].label).toEqual("Hydrogen Sales");
        datapoints[0].data.forEach((num, i) =>
          expect(num).toBeCloseTo(hydrogenSales[i], 2)
        );

        expect(datapoints[1].label).toEqual("Electricity Sales");
        datapoints[1].data.forEach((num, i) =>
          expect(num).toBeCloseTo(electricitySales[i], 2)
        );

        expect(datapoints[2].label).toEqual("Oxygen Sales");
        datapoints[2].data.forEach((num, i) =>
          expect(num).toBeCloseTo(oxygenSales[i], 2)
        );

        expect(datapoints[3].label).toEqual("Total Sales");
        datapoints[3].data.forEach((num, i) =>
          expect(num).toBeCloseTo(totalSales[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates sales for solar with oxygen and electricity sales", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneSolarScenarioAdditionalRevenueStreams}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const hydrogenSales = [
        3680527.2543005436, 3772540.435658057, 3866853.946549508,
        3963525.2952132453, 4062613.427593576, 4164178.763283415,
        4268283.2323655, 4374990.313174637, 4484365.071004003,
        4596474.197779102, 4711386.05272358, 4829170.704041669,
        4949899.971642709, 5073647.470933777, 5200488.657707121,
        5330500.874149799, 5463763.396003543, 5600357.480903632,
        5740366.417926222, 5883875.5783743765,
      ];
      const electricitySales = [
        73590.89711775075, 75430.66954569452, 77316.43628433686,
        79249.34719144527, 81230.5808712314, 83261.34539301218,
        85342.87902783748, 87476.4510035334, 89663.36227862173,
        91904.94633558727, 94202.56999397694, 96557.63424382637,
        98971.575099922, 101445.86447742004, 103982.01108935554,
        106581.56136658942, 109246.10040075415, 111977.252910773,
        114776.6842335423, 117646.10133938085,
      ];

      const oxygenSales = [
        55868.3574724455, 57265.06640925664, 58696.69306948804,
        60164.11039622524, 61668.21315613086, 63209.918485034126,
        64790.16644715999, 66409.92060833897, 68070.16862354745,
        69771.92283913612, 71516.22091011453, 73304.12643286737,
        75136.72959368904, 77015.14783353127, 78940.52652936954,
        80914.03969260378, 82936.89068491886, 85010.31295204183,
        87135.57077584286, 89313.96004523893,
      ];

      const totalSales = [
        3809986.5088907396, 3905236.1716130087, 4002867.075903333,
        4102938.7528009154, 4205512.221620938, 4310650.027161461,
        4418416.277840498, 4528876.68478651, 4642098.601906172,
        4758151.066953826, 4877104.843627671, 4999032.464718363,
        5124008.27633632, 5252108.483244729, 5383411.195325847,
        5517996.475208993, 5655946.387089216, 5797345.046766447,
        5942278.672935608, 6090835.639758997,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const opexChart = wrapper
          .find(CostLineChart)
          .filterWhere((e) => e.prop("title") === "Sales");
        expect(opexChart).toHaveLength(1);
        const datapoints = opexChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(4);

        expect(datapoints[0].label).toEqual("Hydrogen Sales");
        datapoints[0].data.forEach((num, i) =>
          expect(num).toBeCloseTo(hydrogenSales[i], 2)
        );

        expect(datapoints[1].label).toEqual("Electricity Sales");
        datapoints[1].data.forEach((num, i) =>
          expect(num).toBeCloseTo(electricitySales[i], 2)
        );

        expect(datapoints[2].label).toEqual("Oxygen Sales");
        datapoints[2].data.forEach((num, i) =>
          expect(num).toBeCloseTo(oxygenSales[i], 2)
        );

        expect(datapoints[3].label).toEqual("Total Sales");
        datapoints[3].data.forEach((num, i) =>
          expect(num).toBeCloseTo(totalSales[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates sales for solar with battery", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneSolarWithBatteryScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const hydrogenSales = [
        4711147.215573239, 4828925.895962571, 4949649.043361634,
        5073390.269445674, 5200225.026181815, 5330230.651836361,
        5463486.41813227, 5600073.578585575, 5740075.418050215,
        5883577.303501469, 6030666.736089005, 6181433.40449123,
        6335969.23960351, 6494368.470593597, 6656727.682358437,
        6823145.874417397, 6993724.521277831, 7168567.634309776,
        7347781.82516752, 7531476.370796707,
      ];

      const electricitySales = new Array(20).fill(0);

      const oxygenSales = new Array(20).fill(0);

      const totalSales = hydrogenSales;

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const opexChart = wrapper
          .find(CostLineChart)
          .filterWhere((e) => e.prop("title") === "Sales");
        expect(opexChart).toHaveLength(1);
        const datapoints = opexChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(4);

        expect(datapoints[0].label).toEqual("Hydrogen Sales");
        datapoints[0].data.forEach((num, i) =>
          expect(num).toBeCloseTo(hydrogenSales[i], 8)
        );

        expect(datapoints[1].label).toEqual("Electricity Sales");
        datapoints[1].data.forEach((num, i) =>
          expect(num).toBeCloseTo(electricitySales[i], 8)
        );

        expect(datapoints[2].label).toEqual("Oxygen Sales");
        datapoints[2].data.forEach((num, i) =>
          expect(num).toBeCloseTo(oxygenSales[i], 8)
        );

        expect(datapoints[3].label).toEqual("Total Sales");
        datapoints[3].data.forEach((num, i) =>
          expect(num).toBeCloseTo(totalSales[i], 8)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates sales for wind", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneWindScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const hydrogenSales = [
        3_858_899.06, 3_955_371.54, 4_054_255.83, 4_155_612.22, 4_259_502.53,
        4_365_990.09, 4_475_139.84, 4_587_018.34, 4_701_693.8, 4_819_236.14,
        4_939_717.05, 5_063_209.97, 5_189_790.22, 5_319_534.98, 5_452_523.35,
        5_588_836.44, 5_728_557.35, 5_871_771.28, 6_018_565.56, 6_169_029.7,
      ];

      const electricitySales = new Array(20).fill(0);

      const oxygenSales = new Array(20).fill(0);

      const totalSales = hydrogenSales;

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const opexChart = wrapper
          .find(CostLineChart)
          .filterWhere((e) => e.prop("title") === "Sales");
        expect(opexChart).toHaveLength(1);
        const datapoints = opexChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(4);

        expect(datapoints[0].label).toEqual("Hydrogen Sales");
        datapoints[0].data.forEach((num, i) =>
          expect(num).toBeCloseTo(hydrogenSales[i], 2)
        );

        expect(datapoints[1].label).toEqual("Electricity Sales");
        datapoints[1].data.forEach((num, i) =>
          expect(num).toBeCloseTo(electricitySales[i], 2)
        );

        expect(datapoints[2].label).toEqual("Oxygen Sales");
        datapoints[2].data.forEach((num, i) =>
          expect(num).toBeCloseTo(oxygenSales[i], 2)
        );

        expect(datapoints[3].label).toEqual("Total Sales");
        datapoints[3].data.forEach((num, i) =>
          expect(num).toBeCloseTo(totalSales[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates sales for wind with ppa agreement", (done) => {
      const wrapper = mount(
        <WorkingData
          data={windWithPPAScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const hydrogenSales = [
        2_298_195.53, 2_355_650.42, 2_414_541.68, 2_474_905.22, 2_536_777.85,
        2_600_197.3, 2_665_202.23, 2_731_832.29, 2_800_128.09, 2_870_131.3,
        2_941_884.58, 3_015_431.69, 3_090_817.48, 3_168_087.92, 3_247_290.12,
        3_328_472.37, 3_411_684.18, 3_496_976.29, 3_584_400.69, 3_674_010.71,
      ];

      const electricitySales = new Array(20).fill(0);

      const oxygenSales = new Array(20).fill(0);

      const totalSales = hydrogenSales;

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const opexChart = wrapper
          .find(CostLineChart)
          .filterWhere((e) => e.prop("title") === "Sales");
        expect(opexChart).toHaveLength(1);
        const datapoints = opexChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(4);

        expect(datapoints[0].label).toEqual("Hydrogen Sales");
        datapoints[0].data.forEach((num, i) =>
          expect(num).toBeCloseTo(hydrogenSales[i], 2)
        );

        expect(datapoints[1].label).toEqual("Electricity Sales");
        datapoints[1].data.forEach((num, i) =>
          expect(num).toBeCloseTo(electricitySales[i], 2)
        );

        expect(datapoints[2].label).toEqual("Oxygen Sales");
        datapoints[2].data.forEach((num, i) =>
          expect(num).toBeCloseTo(oxygenSales[i], 2)
        );

        expect(datapoints[3].label).toEqual("Total Sales");
        datapoints[3].data.forEach((num, i) =>
          expect(num).toBeCloseTo(totalSales[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates sales for hybrid with battery, grid and surplus retail", (done) => {
      const wrapper = mount(
        <WorkingData
          data={hybridBatteryGridSurplusRetailScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const hydrogenSales = [
        5_675_180.62, 5_817_060.14, 5_962_486.64, 6_111_548.81, 6_264_337.53,
        6_420_945.96, 6_581_469.61, 6_746_006.35, 6_914_656.51, 7_087_522.92,
        7_264_711.0, 7_446_328.77, 7_632_486.99, 7_823_299.17, 8_018_881.65,
        8_219_353.69, 8_424_837.53, 8_635_458.47, 8_851_344.93, 9_072_628.55,
      ];

      const electricitySales = new Array(20).fill(0);

      const oxygenSales = new Array(20).fill(0);

      const totalSales = hydrogenSales;

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const opexChart = wrapper
          .find(CostLineChart)
          .filterWhere((e) => e.prop("title") === "Sales");
        expect(opexChart).toHaveLength(1);
        const datapoints = opexChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(4);

        expect(datapoints[0].label).toEqual("Hydrogen Sales");
        datapoints[0].data.forEach((num, i) =>
          expect(num).toBeCloseTo(hydrogenSales[i], 2)
        );

        expect(datapoints[1].label).toEqual("Electricity Sales");
        datapoints[1].data.forEach((num, i) =>
          expect(num).toBeCloseTo(electricitySales[i], 2)
        );

        expect(datapoints[2].label).toEqual("Oxygen Sales");
        datapoints[2].data.forEach((num, i) =>
          expect(num).toBeCloseTo(oxygenSales[i], 2)
        );

        expect(datapoints[3].label).toEqual("Total Sales");
        datapoints[3].data.forEach((num, i) =>
          expect(num).toBeCloseTo(totalSales[i], 2)
        );

        done();
      }, TIMEOUT);
    });

    it("calculates sales for wind with battery and PPA agreement", (done) => {
      const wrapper = mount(
        <WorkingData
          data={windWithBatteryAndPPAScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const hydrogenSales = [
        3013428.708335504, 3088764.426043892, 3165983.536694988,
        3245133.1251123627, 3326261.453240171, 3409417.9895711755,
        3494653.4393104548, 3582019.775293215, 3671570.269675546,
        3763359.5264174337, 3857443.51457787, 3953879.6024423162,
        4052726.592503373, 4154044.757315957, 4257895.876248856,
        4364343.273155077, 4473451.854983954, 4585288.151358552,
        4699920.355142515, 4817418.364021078,
      ];

      const electricitySales = new Array(20).fill(0);

      const oxygenSales = new Array(20).fill(0);

      const totalSales = hydrogenSales;

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const opexChart = wrapper
          .find(CostLineChart)
          .filterWhere((e) => e.prop("title") === "Sales");
        expect(opexChart).toHaveLength(1);
        const datapoints = opexChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(4);

        expect(datapoints[0].label).toEqual("Hydrogen Sales");
        datapoints[0].data.forEach((num, i) =>
          expect(num).toBeCloseTo(hydrogenSales[i], 8)
        );

        expect(datapoints[1].label).toEqual("Electricity Sales");
        datapoints[1].data.forEach((num, i) =>
          expect(num).toBeCloseTo(electricitySales[i], 8)
        );

        expect(datapoints[2].label).toEqual("Oxygen Sales");
        datapoints[2].data.forEach((num, i) =>
          expect(num).toBeCloseTo(oxygenSales[i], 8)
        );

        expect(datapoints[3].label).toEqual("Total Sales");
        datapoints[3].data.forEach((num, i) =>
          expect(num).toBeCloseTo(totalSales[i], 8)
        );

        done();
      }, TIMEOUT);
    });
  });
});
