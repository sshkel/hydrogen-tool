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

  describe("Operating Costs", () => {
    it("calculates opex for solar", (done) => {
      const wrapper = mount(
        <WorkingData
          data={standaloneSolarScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const electrolyserOpex = [
        256_250.0, 262_656.25, 269_222.66, 275_953.22, 282_852.05, 289_923.35,
        297_171.44, 304_600.72, 312_215.74, 320_021.14, 328_021.66, 336_222.21,
        344_627.76, 353_243.46, 6_155_267.21, 371_126.41, 380_404.57,
        389_914.68, 399_662.55, 409_654.11,
      ];

      const powerPlantOpex = [
        261_375.0, 267_909.38, 274_607.11, 281_472.29, 288_509.09, 295_721.82,
        303_114.87, 310_692.74, 318_460.06, 326_421.56, 334_582.1, 342_946.65,
        351_520.32, 360_308.32, 369_316.03, 378_548.93, 388_012.66, 397_712.97,
        407_655.8, 417_847.19,
      ];

      const batteryOpex = new Array(20).fill(0);

      const additionalAnnualCosts = new Array(20).fill(0);

      const waterCosts = [
        34_917.72, 35_790.67, 36_685.43, 37_602.57, 38_542.63, 39_506.2,
        40_493.85, 41_506.2, 42_543.86, 43_607.45, 44_697.64, 45_815.08,
        46_960.46, 48_134.47, 49_337.83, 50_571.27, 51_835.56, 53_131.45,
        54_459.73, 55_821.23,
      ];

      const electricityPurchase = new Array(20).fill(0);

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const opexChart = wrapper
          .find(CostLineChart)
          .filterWhere((e) => e.prop("title") === "Operating Costs");
        expect(opexChart).toHaveLength(1);
        const datapoints = opexChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(6);
        expect(datapoints[0]).toEqual({
          label: "Electrolyser OPEX",
          data: electrolyserOpex,
        });
        expect(datapoints[1]).toEqual({
          label: "Power Plant OPEX",
          data: powerPlantOpex,
        });

        expect(datapoints[2]).toEqual({
          label: "Battery OPEX",
          data: batteryOpex,
        });

        expect(datapoints[3]).toEqual({
          label: "Additional Annual Costs",
          data: additionalAnnualCosts,
        });

        expect(datapoints[4]).toEqual({
          label: "Water Costs",
          data: waterCosts,
        });

        expect(datapoints[5]).toEqual({
          label: "Electricity Purchase",
          data: electricityPurchase,
        });

        done();
      }, TIMEOUT);
    });
  });

  it("calculates opex for solar with battery", (done) => {
    const wrapper = mount(
      <WorkingData
        data={standaloneSolarWithBatteryScenario}
        loadSolar={loadSolar}
        loadWind={loadWind}
      />
    );

    const electrolyserOpex = [
      266_500.0, 273_162.5, 279_991.56, 286_991.35, 294_166.14, 301_520.29,
      309_058.3, 316_784.75, 324_704.37, 332_821.98, 341_142.53, 349_671.09,
      6_081_990.73, 367_373.19, 376_557.52, 385_971.46, 395_620.75, 405_511.27,
      415_649.05, 426_040.27,
    ];

    const powerPlantOpex = [
      261_375.0, 267_909.38, 274_607.11, 281_472.29, 288_509.09, 295_721.82,
      303_114.87, 310_692.74, 318_460.06, 326_421.56, 334_582.1, 342_946.65,
      351_520.32, 360_308.32, 369_316.03, 378_548.93, 388_012.66, 397_712.97,
      407_655.8, 417_847.19,
    ];

    const batteryOpex = [
      38_950.0, 39_923.75, 40_921.84, 41_944.89, 42_993.51, 44_068.35,
      45_170.06, 46_299.31, 47_456.79, 8_732_736.76, 49_859.29, 51_105.78,
      52_383.42, 53_693.01, 55_035.33, 56_411.21, 57_821.49, 59_267.03,
      60_748.71, 62_267.42,
    ];

    const additionalAnnualCosts = [
      10_250.0, 10_506.25, 10_768.91, 11_038.13, 11_314.08, 11_596.93,
      11_886.86, 12_184.03, 12_488.63, 12_800.85, 13_120.87, 13_448.89,
      13_785.11, 14_129.74, 14_482.98, 14_845.06, 15_216.18, 15_596.59,
      15_986.5, 16_386.16,
    ];

    const waterCosts = [
      35681.68, 36573.72, 37488.06, 38425.27, 39385.9, 40370.55, 41379.81,
      42414.3, 43474.66, 44561.53, 45675.57, 46817.46, 47987.89, 49187.59,
      50417.28, 51677.71, 52969.65, 54293.89, 55651.24, 57042.52,
    ];

    const electricityPurchase = new Array(20).fill(0);

    // Sleep to wait for CSV to load and set state
    setTimeout(() => {
      wrapper.update();
      const opexChart = wrapper
        .find(CostLineChart)
        .filterWhere((e) => e.prop("title") === "Operating Costs");
      expect(opexChart).toHaveLength(1);
      const datapoints = opexChart.at(0).prop("datapoints");
      expect(datapoints).toHaveLength(6);
      expect(datapoints[0]).toEqual({
        label: "Electrolyser OPEX",
        data: electrolyserOpex,
      });
      expect(datapoints[1]).toEqual({
        label: "Power Plant OPEX",
        data: powerPlantOpex,
      });

      expect(datapoints[2]).toEqual({
        label: "Battery OPEX",
        data: batteryOpex,
      });

      expect(datapoints[3]).toEqual({
        label: "Additional Annual Costs",
        data: additionalAnnualCosts,
      });

      expect(datapoints[4]).toEqual({
        label: "Water Costs",
        data: waterCosts,
      });

      expect(datapoints[5]).toEqual({
        label: "Electricity Purchase",
        data: electricityPurchase,
      });

      done();
    }, TIMEOUT);
  });

  it("calculates opex for wind", (done) => {
    const wrapper = mount(
      <WorkingData
        data={standaloneWindScenario}
        loadSolar={loadSolar}
        loadWind={loadWind}
      />
    );

    const electrolyserOpex = [
      256_250.0, 262_656.25, 269_222.66, 275_953.22, 282_852.05, 289_923.35,
      297_171.44, 304_600.72, 5_307_667.62, 320_021.14, 328_021.66, 336_222.21,
      344_627.76, 353_243.46, 362_074.54, 371_126.41, 380_404.57, 6_628_549.55,
      399_662.55, 409_654.11,
    ];

    const powerPlantOpex = [
      307_500.0, 315_187.5, 323_067.19, 331_143.87, 339_422.46, 347_908.03,
      356_605.73, 365_520.87, 374_658.89, 384_025.36, 393_626.0, 403_466.65,
      413_553.31, 423_892.15, 434_489.45, 445_351.69, 456_485.48, 467_897.62,
      479_595.06, 491_584.93,
    ];

    const batteryOpex = new Array(20).fill(0);

    const additionalAnnualCosts = new Array(20).fill(0);

    const waterCosts = [
      40_075.13, 41_077.0, 42_103.93, 43_156.53, 44_235.44, 45_341.33,
      46_474.86, 47_636.73, 48_827.65, 50_048.34, 51_299.55, 52_582.04,
      53_896.59, 55_244.0, 56_625.1, 58_040.73, 59_491.75, 60_979.04, 62_503.52,
      64_066.11,
    ];

    const electricityPurchase = new Array(20).fill(0);

    // Sleep to wait for CSV to load and set state
    setTimeout(() => {
      wrapper.update();
      const opexChart = wrapper
        .find(CostLineChart)
        .filterWhere((e) => e.prop("title") === "Operating Costs");
      expect(opexChart).toHaveLength(1);
      const datapoints = opexChart.at(0).prop("datapoints");
      expect(datapoints).toHaveLength(6);
      expect(datapoints[0]).toEqual({
        label: "Electrolyser OPEX",
        data: electrolyserOpex,
      });
      expect(datapoints[1]).toEqual({
        label: "Power Plant OPEX",
        data: powerPlantOpex,
      });

      expect(datapoints[2]).toEqual({
        label: "Battery OPEX",
        data: batteryOpex,
      });

      expect(datapoints[3]).toEqual({
        label: "Additional Annual Costs",
        data: additionalAnnualCosts,
      });

      expect(datapoints[4]).toEqual({
        label: "Water Costs",
        data: waterCosts,
      });

      expect(datapoints[5]).toEqual({
        label: "Electricity Purchase",
        data: electricityPurchase,
      });

      done();
    }, TIMEOUT);
  });

  it("calculates opex for wind with PPA agreement", (done) => {
    const wrapper = mount(
      <WorkingData
        data={windWithPPAScenario}
        loadSolar={loadSolar}
        loadWind={loadWind}
      />
    );

    const electrolyserOpex = [
      256_250.0, 262_656.25, 269_222.66, 275_953.22, 282_852.05, 289_923.35,
      297_171.44, 304_600.72, 312_215.74, 5_440_359.31, 328_021.66, 336_222.21,
      344_627.76, 353_243.46, 362_074.54, 371_126.41, 380_404.57, 389_914.68,
      399_662.55, 409_654.11,
    ];

    const powerPlantOpex = new Array(20).fill(0);

    const batteryOpex = new Array(20).fill(0);

    const additionalAnnualCosts = new Array(20).fill(0);

    const waterCosts = [
      34_720.24, 35_588.25, 36_477.95, 37_389.9, 38_324.65, 39_282.76,
      40_264.83, 41_271.45, 42_303.24, 43_360.82, 44_444.84, 45_555.96,
      46_694.86, 47_862.23, 49_058.79, 50_285.26, 51_542.39, 52_830.95,
      54_151.73, 55_505.52,
    ];

    const electricityPurchase = [
      138_880.96, 142_352.98, 145_911.81, 149_559.6, 153_298.59, 157_131.06,
      161_059.34, 165_085.82, 169_212.96, 173_443.29, 177_779.37, 182_223.85,
      186_779.45, 191_448.94, 196_235.16, 201_141.04, 206_169.57, 211_323.81,
      216_606.9, 222_022.07,
    ];

    // Sleep to wait for CSV to load and set state
    setTimeout(() => {
      wrapper.update();
      const opexChart = wrapper
        .find(CostLineChart)
        .filterWhere((e) => e.prop("title") === "Operating Costs");
      expect(opexChart).toHaveLength(1);
      const datapoints = opexChart.at(0).prop("datapoints");
      expect(datapoints).toHaveLength(6);
      expect(datapoints[0]).toEqual({
        label: "Electrolyser OPEX",
        data: electrolyserOpex,
      });
      expect(datapoints[1]).toEqual({
        label: "Power Plant OPEX",
        data: powerPlantOpex,
      });

      expect(datapoints[2]).toEqual({
        label: "Battery OPEX",
        data: batteryOpex,
      });

      expect(datapoints[3]).toEqual({
        label: "Additional Annual Costs",
        data: additionalAnnualCosts,
      });

      expect(datapoints[4]).toEqual({
        label: "Water Costs",
        data: waterCosts,
      });

      expect(datapoints[5]).toEqual({
        label: "Electricity Purchase",
        data: electricityPurchase,
      });

      done();
    }, TIMEOUT);
  });

  it("calculates opex for hybrid with battery, grid and surplus retail", (done) => {
    const wrapper = mount(
      <WorkingData
        data={hybridBatteryGridSurplusRetailScenario}
        loadSolar={loadSolar}
        loadWind={loadWind}
      />
    );

    const electrolyserOpex = [
      256_250.0, 262_656.25, 269_222.66, 275_953.22, 282_852.05, 289_923.35,
      297_171.44, 304_600.72, 5_307_667.62, 320_021.14, 328_021.66, 336_222.21,
      344_627.76, 353_243.46, 362_074.54, 371_126.41, 6_466_877.61, 389_914.68,
      399_662.55, 409_654.11,
    ];

    const powerPlantOpex = [
      302_375.0, 309_934.38, 317_682.73, 325_624.8, 333_765.42, 342_109.56,
      350_662.3, 359_428.85, 368_414.58, 377_624.94, 387_065.56, 396_742.2,
      406_660.76, 416_827.28, 427_247.96, 437_929.16, 448_877.39, 460_099.32,
      471_601.8, 483_391.85,
    ];

    const batteryOpex = [
      98_400.0, 100_860.0, 103_381.5, 105_966.04, 108_615.19, 111_330.57,
      114_113.83, 116_966.68, 119_890.85, 11_541_242.25, 125_960.32, 129_109.33,
      132_337.06, 135_645.49, 139_036.62, 142_512.54, 146_075.35, 149_727.24,
      153_470.42, 157_307.18,
    ];

    const additionalAnnualCosts = new Array(20).fill(0);

    const waterCosts = [
      43_297.66, 44_380.1, 45_489.6, 46_626.84, 47_792.51, 48_987.33, 50_212.01,
      51_467.31, 52_753.99, 54_072.84, 55_424.66, 56_810.28, 58_230.54,
      59_686.3, 61_178.46, 62_707.92, 64_275.62, 65_882.51, 67_529.57,
      69_217.81,
    ];

    const electricityPurchase = new Array(20).fill(0);

    // Sleep to wait for CSV to load and set state
    setTimeout(() => {
      wrapper.update();
      const opexChart = wrapper
        .find(CostLineChart)
        .filterWhere((e) => e.prop("title") === "Operating Costs");
      expect(opexChart).toHaveLength(1);
      const datapoints = opexChart.at(0).prop("datapoints");
      expect(datapoints).toHaveLength(6);
      expect(datapoints[0]).toEqual({
        label: "Electrolyser OPEX",
        data: electrolyserOpex,
      });
      expect(datapoints[1]).toEqual({
        label: "Power Plant OPEX",
        data: powerPlantOpex,
      });

      expect(datapoints[2]).toEqual({
        label: "Battery OPEX",
        data: batteryOpex,
      });

      expect(datapoints[3]).toEqual({
        label: "Additional Annual Costs",
        data: additionalAnnualCosts,
      });

      expect(datapoints[4]).toEqual({
        label: "Water Costs",
        data: waterCosts,
      });

      expect(datapoints[5]).toEqual({
        label: "Electricity Purchase",
        data: electricityPurchase,
      });

      done();
    }, TIMEOUT);
  });

  it("calculates opex for wind with battery and PPA agreement", (done) => {
    const wrapper = mount(
      <WorkingData
        data={windWithBatteryAndPPAScenario}
        loadSolar={loadSolar}
        loadWind={loadWind}
      />
    );

    const electrolyserOpex = [
      256_250.0, 262_656.25, 269_222.66, 275_953.22, 282_852.05, 289_923.35,
      297_171.44, 304_600.72, 5_307_667.62, 320_021.14, 328_021.66, 336_222.21,
      344_627.76, 353_243.46, 362_074.54, 371_126.41, 380_404.57, 6_628_549.55,
      399_662.55, 409_654.11,
    ];

    const powerPlantOpex = new Array(20).fill(0);

    const batteryOpex = [
      38_950.0, 39_923.75, 40_921.84, 41_944.89, 42_993.51, 44_068.35,
      45_170.06, 46_299.31, 47_456.79, 4_615_984.87, 49_859.29, 51_105.78,
      52_383.42, 53_693.01, 55_035.33, 56_411.21, 57_821.49, 59_267.03,
      60_748.71, 62_267.42,
    ];

    const additionalAnnualCosts = new Array(20).fill(0);

    const waterCosts = [
      41069.04, 42095.77, 43148.16, 44226.87, 45332.54, 46465.85, 47627.5,
      48818.18, 50038.64, 51289.61, 52571.85, 53886.14, 55233.29, 56614.13,
      58029.48, 59480.22, 60967.22, 62491.4, 64053.69, 65655.03,
    ];

    const electricityPurchase = [
      42537.42, 43600.85, 44690.87, 45808.15, 46953.35, 48127.18, 49330.36,
      50563.62, 51827.71, 53123.41, 54451.49, 55812.78, 57208.1, 58638.3,
      60104.26, 61606.86, 63147.03, 64725.71, 66343.85, 68002.45,
    ];

    // Sleep to wait for CSV to load and set state
    setTimeout(() => {
      wrapper.update();
      const opexChart = wrapper
        .find(CostLineChart)
        .filterWhere((e) => e.prop("title") === "Operating Costs");
      expect(opexChart).toHaveLength(1);
      const datapoints = opexChart.at(0).prop("datapoints");
      expect(datapoints).toHaveLength(6);
      expect(datapoints[0]).toEqual({
        label: "Electrolyser OPEX",
        data: electrolyserOpex,
      });
      expect(datapoints[1]).toEqual({
        label: "Power Plant OPEX",
        data: powerPlantOpex,
      });

      expect(datapoints[2]).toEqual({
        label: "Battery OPEX",
        data: batteryOpex,
      });

      expect(datapoints[3]).toEqual({
        label: "Additional Annual Costs",
        data: additionalAnnualCosts,
      });

      expect(datapoints[4]).toEqual({
        label: "Water Costs",
        data: waterCosts,
      });

      expect(datapoints[5]).toEqual({
        label: "Electricity Purchase",
        data: electricityPurchase,
      });

      done();
    }, TIMEOUT);
  });

  it("calculates opex for solar with oxygen and electricity sales", (done) => {
    const wrapper = mount(
      <WorkingData
        data={standaloneSolarScenarioAdditionalRevenueStreams}
        loadSolar={loadSolar}
        loadWind={loadWind}
      />
    );

    const electrolyserOpex = [
      256_250.0, 262_656.25, 269_222.66, 275_953.22, 282_852.05, 289_923.35,
      297_171.44, 304_600.72, 312_215.74, 320_021.14, 328_021.66, 336_222.21,
      344_627.76, 353_243.46, 6_155_267.21, 371_126.41, 380_404.57, 389_914.68,
      399_662.55, 409_654.11,
    ];

    const powerPlantOpex = [
      261_375.0, 267_909.38, 274_607.11, 281_472.29, 288_509.09, 295_721.82,
      303_114.87, 310_692.74, 318_460.06, 326_421.56, 334_582.1, 342_946.65,
      351_520.32, 360_308.32, 369_316.03, 378_548.93, 388_012.66, 397_712.97,
      407_655.8, 417_847.19,
    ];

    const batteryOpex = new Array(20).fill(0);

    const additionalAnnualCosts = new Array(20).fill(0);

    const waterCosts = [
      34_917.72, 35_790.67, 36_685.43, 37_602.57, 38_542.63, 39_506.2,
      40_493.85, 41_506.2, 42_543.86, 43_607.45, 44_697.64, 45_815.08,
      46_960.46, 48_134.47, 49_337.83, 50_571.27, 51_835.56, 53_131.45,
      54_459.73, 55_821.23,
    ];

    const electricityPurchase = new Array(20).fill(0);

    // Sleep to wait for CSV to load and set state
    setTimeout(() => {
      wrapper.update();
      const opexChart = wrapper
        .find(CostLineChart)
        .filterWhere((e) => e.prop("title") === "Operating Costs");
      expect(opexChart).toHaveLength(1);
      const datapoints = opexChart.at(0).prop("datapoints");
      expect(datapoints).toHaveLength(6);
      expect(datapoints[0]).toEqual({
        label: "Electrolyser OPEX",
        data: electrolyserOpex,
      });
      expect(datapoints[1]).toEqual({
        label: "Power Plant OPEX",
        data: powerPlantOpex,
      });

      expect(datapoints[2]).toEqual({
        label: "Battery OPEX",
        data: batteryOpex,
      });

      expect(datapoints[3]).toEqual({
        label: "Additional Annual Costs",
        data: additionalAnnualCosts,
      });

      expect(datapoints[4]).toEqual({
        label: "Water Costs",
        data: waterCosts,
      });

      expect(datapoints[5]).toEqual({
        label: "Electricity Purchase",
        data: electricityPurchase,
      });

      done();
    }, TIMEOUT);
  });
});
