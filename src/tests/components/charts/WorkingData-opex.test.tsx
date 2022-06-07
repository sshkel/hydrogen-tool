import { mount } from "enzyme";

import CostLineChart from "../../../components/charts/CostLineChart";
import WorkingData from "../../../components/charts/WorkingData";
import { readLocalCsv } from "../../resources/loader";
import {
  solarPvWithBatteryScenario,
  solarPvWithElectrolyserScenario,
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
    it("calculates duration curves as 8760 percentages for solar", (done) => {
      const wrapper = mount(
        <WorkingData
          data={solarPvWithElectrolyserScenario}
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
      }, 1500);
    });
  });

  it("calculates duration curves as 8760 percentages for solar with battery", (done) => {
    const wrapper = mount(
      <WorkingData
        data={solarPvWithBatteryScenario}
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
    }, 1500);
  });
});
