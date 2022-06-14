import { mount } from "enzyme";

import CostLineChart from "../../../components/charts/CostLineChart";
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

  describe("Sales", () => {
    it("calculates sales for solar", (done) => {
      const wrapper = mount(
        <WorkingData
          data={solarPvWithElectrolyserScenario}
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

    it("calculates sales for solar with battery", (done) => {
      const wrapper = mount(
        <WorkingData
          data={solarPvWithBatteryScenario}
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
          data={windElectrolyserScenario}
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
        2_149_639.3, 2_203_380.28, 2_258_464.78, 2_314_926.4, 2_372_799.56,
        2_432_119.55, 2_492_922.54, 2_555_245.61, 2_619_126.75, 2_684_604.91,
        2_751_720.04, 2_820_513.04, 2_891_025.86, 2_963_301.51, 3_037_384.05,
        3_113_318.65, 3_191_151.62, 3_270_930.41, 3_352_703.67, 3_436_521.26,
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
        2970891.291104858, 3045163.5733824796, 3121292.6627170406,
        3199324.9792849664, 3279308.10376709, 3361290.8063612673,
        3445323.076520299, 3531456.1534333057, 3619742.5572691383,
        3710236.121200866, 3802992.0242308876, 3898066.8248366597,
        3995518.4954575757, 4095406.4578440143, 4197791.619290115,
        4302736.409772367, 4410304.820016676, 4520562.440517093,
        4633576.50153002, 4749415.91406827,
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
