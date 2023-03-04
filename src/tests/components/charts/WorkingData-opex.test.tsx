/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import { render, waitFor } from "@testing-library/react";

import * as opex from "../../../components/results/OperatingCosts";
import WorkingData from "../../../components/results/WorkingData";
import { TIMEOUT } from "../../consts";
import { readLocalCsv } from "../../resources/loader";
import {
  basicSolarScenario,
  gridConnectedMethaneWindWithBatteryAndDegradationScenario,
  hybridBatteryGridOversizeRatioScenario,
  standaloneAdvancedAmmoniaSolarScenario,
  standaloneAmmoniaHybridWithBatteryAndDegradationScenario,
  standaloneHybridWithDegradationScenario,
  standaloneMethanolHybridWithBatteryScenario,
  standaloneSolarScenario,
  standaloneSolarWithBatteryScenario,
  standaloneSolarWithStackDegradationScenario,
  standaloneWindScenario,
  standaloneWindWithBatteryAndDegradationScenario,
  windWithBatteryAndPPAScenario,
  windWithPPAScenario,
} from "../../scenario";

describe("Working Data calculations", () => {
  let loadNationalSolar: () => Promise<any[]>;
  let loadNationalWind: () => Promise<any[]>;
  let loadNSWSolar: () => Promise<any[]>;
  let loadNSWWind: () => Promise<any[]>;
  let spy: jest.SpyInstance<
    JSX.Element,
    [
      operatingCosts: {
        projectTimeline: number;
        costs: { [key: string]: number[] };
      }
    ]
  >;
  beforeEach(() => {
    sessionStorage.clear();
    spy = jest.spyOn(opex, "OperatingCostsPane");
  });

  beforeAll(() => {
    console.error = function () {};
    loadNationalSolar = async () =>
      await readLocalCsv(__dirname + "/../../resources/solar-traces.csv");
    loadNationalWind = async () =>
      await readLocalCsv(__dirname + "/../../resources/wind-traces.csv");

    loadNSWSolar = async () =>
      await readLocalCsv(__dirname + "/../../../../assets/solar.csv");
    loadNSWWind = async () =>
      await readLocalCsv(__dirname + "/../../../../assets/wind.csv");
  });

  describe("Operating Costs", () => {
    it("calculates opex for solar", async () => {
      render(
        <WorkingData
          data={standaloneSolarScenario.data}
          location={standaloneSolarScenario.location}
          inputConfiguration={standaloneSolarScenario.inputConfiguration}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
        />
      );
      const expected: { [key: string]: number[] } = {
        "Electrolyser OPEX": [
          256_250.0, 262_656.25, 269_222.66, 275_953.22, 282_852.05, 289_923.35,
          297_171.44, 304_600.72, 312_215.74, 320_021.14, 328_021.66,
          336_222.21, 344_627.76, 353_243.46, 6_155_267.21, 371_126.41,
          380_404.57, 389_914.68, 399_662.55, 409_654.11,
        ],

        "Power Plant OPEX": [
          261_375.0, 267_909.38, 274_607.11, 281_472.29, 288_509.09, 295_721.82,
          303_114.87, 310_692.74, 318_460.06, 326_421.56, 334_582.1, 342_946.65,
          351_520.32, 360_308.32, 369_316.03, 378_548.93, 388_012.66,
          397_712.97, 407_655.8, 417_847.19,
        ],

        "Battery OPEX": new Array(20).fill(0),

        "Additional Annual Costs": new Array(20).fill(0),

        "Water Costs": [
          34_917.72, 35_790.67, 36_685.43, 37_602.57, 38_542.63, 39_506.2,
          40_493.85, 41_506.2, 42_543.86, 43_607.45, 44_697.64, 45_815.08,
          46_960.46, 48_134.47, 49_337.83, 50_571.27, 51_835.56, 53_131.45,
          54_459.73, 55_821.23,
        ],

        "Electricity Purchase": new Array(20).fill(0),
      };
      await waitFor(
        () => {
          expect(spy.mock.calls[0]).toHaveLength(1);
          const actualCost = spy.mock.calls[0][0].costs;
          expect(actualCost).toEqual(expected);
        },
        { timeout: TIMEOUT }
      );
    });
  });

  it("calculates opex for solar with battery", async () => {
    render(
      <WorkingData
        data={standaloneSolarWithBatteryScenario.data}
        location={standaloneSolarWithBatteryScenario.location}
        inputConfiguration={
          standaloneSolarWithBatteryScenario.inputConfiguration
        }
        loadSolar={loadNationalSolar}
        loadWind={loadNationalWind}
      />
    );
    const expected: { [key: string]: number[] } = {
      "Electrolyser OPEX": [
        266_500.0, 273_162.5, 279_991.56, 286_991.35, 294_166.14, 301_520.29,
        309_058.3, 316_784.75, 324_704.37, 332_821.98, 341_142.53, 349_671.09,
        6_081_990.73, 367_373.19, 376_557.52, 385_971.46, 395_620.75,
        405_511.27, 415_649.05, 426_040.27,
      ],

      "Power Plant OPEX": [
        261_375.0, 267_909.38, 274_607.11, 281_472.29, 288_509.09, 295_721.82,
        303_114.87, 310_692.74, 318_460.06, 326_421.56, 334_582.1, 342_946.65,
        351_520.32, 360_308.32, 369_316.03, 378_548.93, 388_012.66, 397_712.97,
        407_655.8, 417_847.19,
      ],

      "Battery OPEX": [
        38_950.0, 39_923.75, 40_921.84, 41_944.89, 42_993.51, 44_068.35,
        45_170.06, 46_299.31, 47_456.79, 8_732_736.76, 49_859.29, 51_105.78,
        52_383.42, 53_693.01, 55_035.33, 56_411.21, 57_821.49, 59_267.03,
        60_748.71, 62_267.42,
      ],

      "Additional Annual Costs": [
        10_250.0, 10_506.25, 10_768.91, 11_038.13, 11_314.08, 11_596.93,
        11_886.86, 12_184.03, 12_488.63, 12_800.85, 13_120.87, 13_448.89,
        13_785.11, 14_129.74, 14_482.98, 14_845.06, 15_216.18, 15_596.59,
        15_986.5, 16_386.16,
      ],

      "Water Costs": [
        35681.68, 36573.72, 37488.06, 38425.27, 39385.9, 40370.55, 41379.81,
        42414.3, 43474.66, 44561.53, 45675.57, 46817.46, 47987.89, 49187.59,
        50417.28, 51677.71, 52969.65, 54293.89, 55651.24, 57042.52,
      ],

      "Electricity Purchase": new Array(20).fill(0),
    };
    await waitFor(
      () => {
        expect(spy.mock.calls[0]).toHaveLength(1);
        const actualCost = spy.mock.calls[0][0].costs;
        expect(actualCost).toEqual(expected);
      },
      { timeout: TIMEOUT }
    );
  });

  it("calculates opex for wind", async () => {
    render(
      <WorkingData
        data={standaloneWindScenario.data}
        location={standaloneWindScenario.location}
        inputConfiguration={standaloneWindScenario.inputConfiguration}
        loadSolar={loadNationalSolar}
        loadWind={loadNationalWind}
      />
    );
    const expected: { [key: string]: number[] } = {
      "Electrolyser OPEX": [
        256_250.0, 262_656.25, 269_222.66, 275_953.22, 282_852.05, 289_923.35,
        297_171.44, 304_600.72, 5_307_667.62, 320_021.14, 328_021.66,
        336_222.21, 344_627.76, 353_243.46, 362_074.54, 371_126.41, 380_404.57,
        6_628_549.55, 399_662.55, 409_654.11,
      ],

      "Power Plant OPEX": [
        307_500.0, 315_187.5, 323_067.19, 331_143.87, 339_422.46, 347_908.03,
        356_605.73, 365_520.87, 374_658.89, 384_025.36, 393_626.0, 403_466.65,
        413_553.31, 423_892.15, 434_489.45, 445_351.69, 456_485.48, 467_897.62,
        479_595.06, 491_584.93,
      ],

      "Battery OPEX": new Array(20).fill(0),

      "Additional Annual Costs": new Array(20).fill(0),

      "Water Costs": [
        40_075.13, 41_077.0, 42_103.93, 43_156.53, 44_235.44, 45_341.33,
        46_474.86, 47_636.73, 48_827.65, 50_048.34, 51_299.55, 52_582.04,
        53_896.59, 55_244.0, 56_625.1, 58_040.73, 59_491.75, 60_979.04,
        62_503.52, 64_066.11,
      ],

      "Electricity Purchase": new Array(20).fill(0),
    };
    await waitFor(
      () => {
        expect(spy.mock.calls[0]).toHaveLength(1);
        const actualCost = spy.mock.calls[0][0].costs;
        expect(actualCost).toEqual(expected);
      },
      { timeout: TIMEOUT }
    );
  });

  it("calculates opex for wind with PPA agreement", async () => {
    render(
      <WorkingData
        data={windWithPPAScenario.data}
        location={windWithPPAScenario.location}
        inputConfiguration={windWithPPAScenario.inputConfiguration}
        loadSolar={loadNationalSolar}
        loadWind={loadNationalWind}
      />
    );
    const expected: { [key: string]: number[] } = {
      "Electrolyser OPEX": [
        256_250.0, 262_656.25, 269_222.66, 275_953.22, 282_852.05, 289_923.35,
        297_171.44, 304_600.72, 312_215.74, 5_440_359.31, 328_021.66,
        336_222.21, 344_627.76, 353_243.46, 362_074.54, 371_126.41, 380_404.57,
        389_914.68, 399_662.55, 409_654.11,
      ],

      "Power Plant OPEX": new Array(20).fill(0),

      "Battery OPEX": new Array(20).fill(0),

      "Additional Annual Costs": new Array(20).fill(0),

      "Water Costs": [
        34_720.24, 35_588.25, 36_477.95, 37_389.9, 38_324.65, 39_282.76,
        40_264.83, 41_271.45, 42_303.24, 43_360.82, 44_444.84, 45_555.96,
        46_694.86, 47_862.23, 49_058.79, 50_285.26, 51_542.39, 52_830.95,
        54_151.73, 55_505.52,
      ],

      "Electricity Purchase": [
        138_880.96, 142_352.98, 145_911.81, 149_559.6, 153_298.59, 157_131.06,
        161_059.34, 165_085.82, 169_212.96, 173_443.29, 177_779.37, 182_223.85,
        186_779.45, 191_448.94, 196_235.16, 201_141.04, 206_169.57, 211_323.81,
        216_606.9, 222_022.07,
      ],
    };
    await waitFor(
      () => {
        expect(spy.mock.calls[0]).toHaveLength(1);
        const actualCost = spy.mock.calls[0][0].costs;
        expect(actualCost).toEqual(expected);
      },
      { timeout: TIMEOUT }
    );
  });

  it("calculates opex for hybrid with battery, grid and oversize ratio", async () => {
    render(
      <WorkingData
        data={hybridBatteryGridOversizeRatioScenario.data}
        location={hybridBatteryGridOversizeRatioScenario.location}
        inputConfiguration={
          hybridBatteryGridOversizeRatioScenario.inputConfiguration
        }
        loadSolar={loadNationalSolar}
        loadWind={loadNationalWind}
      />
    );
    const expected: { [key: string]: number[] } = {
      "Electrolyser OPEX": [
        256_250.0, 262_656.25, 269_222.66, 275_953.22, 282_852.05, 289_923.35,
        297_171.44, 304_600.72, 5_307_667.62, 320_021.14, 328_021.66,
        336_222.21, 344_627.76, 353_243.46, 362_074.54, 371_126.41,
        6_466_877.61, 389_914.68, 399_662.55, 409_654.11,
      ],

      "Power Plant OPEX": [
        302_375.0, 309_934.38, 317_682.73, 325_624.8, 333_765.42, 342_109.56,
        350_662.3, 359_428.85, 368_414.58, 377_624.94, 387_065.56, 396_742.2,
        406_660.76, 416_827.28, 427_247.96, 437_929.16, 448_877.39, 460_099.32,
        471_601.8, 483_391.85,
      ],

      "Battery OPEX": [
        98_400.0, 100_860.0, 103_381.5, 105_966.04, 108_615.19, 111_330.57,
        114_113.83, 116_966.68, 119_890.85, 11_541_242.25, 125_960.32,
        129_109.33, 132_337.06, 135_645.49, 139_036.62, 142_512.54, 146_075.35,
        149_727.24, 153_470.42, 157_307.18,
      ],

      "Additional Annual Costs": new Array(20).fill(0),

      "Water Costs": [
        43_297.66, 44_380.1, 45_489.6, 46_626.84, 47_792.51, 48_987.33,
        50_212.01, 51_467.31, 52_753.99, 54_072.84, 55_424.66, 56_810.28,
        58_230.54, 59_686.3, 61_178.46, 62_707.92, 64_275.62, 65_882.51,
        67_529.57, 69_217.81,
      ],

      "Electricity Purchase": new Array(20).fill(0),
    };
    await waitFor(
      () => {
        expect(spy.mock.calls[0]).toHaveLength(1);
        const actualCost = spy.mock.calls[0][0].costs;
        expect(actualCost).toEqual(expected);
      },
      { timeout: TIMEOUT }
    );
  });

  it("calculates opex for wind with battery and PPA agreement", async () => {
    render(
      <WorkingData
        data={windWithBatteryAndPPAScenario.data}
        location={windWithBatteryAndPPAScenario.location}
        inputConfiguration={windWithBatteryAndPPAScenario.inputConfiguration}
        loadSolar={loadNationalSolar}
        loadWind={loadNationalWind}
      />
    );
    const expected: { [key: string]: number[] } = {
      "Electrolyser OPEX": [
        256_250.0, 262_656.25, 269_222.66, 275_953.22, 282_852.05, 289_923.35,
        297_171.44, 304_600.72, 5_307_667.62, 320_021.14, 328_021.66,
        336_222.21, 344_627.76, 353_243.46, 362_074.54, 371_126.41, 380_404.57,
        6_628_549.55, 399_662.55, 409_654.11,
      ],

      "Power Plant OPEX": new Array(20).fill(0),

      "Battery OPEX": [
        38_950.0, 39_923.75, 40_921.84, 41_944.89, 42_993.51, 44_068.35,
        45_170.06, 46_299.31, 47_456.79, 4_615_984.87, 49_859.29, 51_105.78,
        52_383.42, 53_693.01, 55_035.33, 56_411.21, 57_821.49, 59_267.03,
        60_748.71, 62_267.42,
      ],

      "Additional Annual Costs": new Array(20).fill(0),

      "Water Costs": [
        41069.04, 42095.77, 43148.16, 44226.87, 45332.54, 46465.85, 47627.5,
        48818.18, 50038.64, 51289.61, 52571.85, 53886.14, 55233.29, 56614.13,
        58029.48, 59480.22, 60967.22, 62491.4, 64053.69, 65655.03,
      ],

      "Electricity Purchase": [
        42537.42, 43600.85, 44690.87, 45808.15, 46953.35, 48127.18, 49330.36,
        50563.62, 51827.71, 53123.41, 54451.49, 55812.78, 57208.1, 58638.3,
        60104.26, 61606.86, 63147.03, 64725.71, 66343.85, 68002.45,
      ],
    };
    await waitFor(
      () => {
        expect(spy.mock.calls[0]).toHaveLength(1);
        const actualCost = spy.mock.calls[0][0].costs;
        expect(actualCost).toEqual(expected);
      },
      { timeout: TIMEOUT }
    );
  });

  it("calculates opex for solar with basic configuration", async () => {
    render(
      <WorkingData
        data={basicSolarScenario.data}
        location={basicSolarScenario.location}
        inputConfiguration={basicSolarScenario.inputConfiguration}
        loadSolar={loadNSWSolar}
        loadWind={loadNSWWind}
      />
    );
    const expected: { [key: string]: number[] } = {
      "Electrolyser OPEX": [
        38950, 39923.75, 40921.84, 41944.89, 42993.51, 44068.35, 45170.06,
        46299.31, 47456.79, 48643.21, 49859.29, 51105.78, 52383.42, 53693.01,
        55035.33, 56411.21, 57821.49, 59267.03, 60748.71, 62267.42,
      ],

      "Power Plant OPEX": [
        39975, 40974.38, 41998.73, 43048.7, 44124.92, 45228.04, 46358.74,
        47517.71, 48705.66, 49923.3, 51171.38, 52450.66, 53761.93, 55105.98,
        56483.63, 57895.72, 59343.11, 60826.69, 62347.36, 63906.04,
      ],

      "Battery OPEX": new Array(20).fill(0),

      "Additional Annual Costs": new Array(20).fill(0),

      "Water Costs": [
        9082.92, 9309.99, 9542.74, 9781.31, 10025.85, 10276.49, 10533.4,
        10796.74, 11066.66, 11343.32, 11626.91, 11917.58, 12215.52, 12520.91,
        12833.93, 13154.78, 13483.65, 13820.74, 14166.26, 14520.41,
      ],

      "Electricity Purchase": new Array(20).fill(0),
    };
    await waitFor(
      () => {
        expect(spy.mock.calls[0]).toHaveLength(1);
        const actualCost = spy.mock.calls[0][0].costs;
        expect(actualCost).toEqual(expected);
      },
      { timeout: TIMEOUT }
    );
  });

  it("calculates opex for solar with stack degradation", async () => {
    render(
      <WorkingData
        data={standaloneSolarWithStackDegradationScenario.data}
        location={standaloneSolarWithStackDegradationScenario.location}
        inputConfiguration={
          standaloneSolarWithStackDegradationScenario.inputConfiguration
        }
        loadSolar={loadNationalSolar}
        loadWind={loadNationalWind}
      />
    );
    const expected: { [key: string]: number[] } = {
      "Electrolyser OPEX": [
        256_250.0, 262_656.25, 269_222.66, 275_953.22, 282_852.05, 289_923.35,
        297_171.44, 304_600.72, 312_215.74, 320_021.14, 328_021.66, 336_222.21,
        344_627.76, 353_243.46, 362_074.54, 371_126.41, 6_466_877.61,
        389_914.68, 399_662.55, 409_654.11,
      ],

      "Power Plant OPEX": [
        174_250.0, 178_606.25, 183_071.41, 187_648.19, 192_339.4, 197_147.88,
        202_076.58, 207_128.49, 212_306.7, 217_614.37, 223_054.73, 228_631.1,
        234_346.88, 240_205.55, 246_210.69, 252_365.96, 258_675.1, 265_141.98,
        271_770.53, 278_564.79,
      ],

      "Battery OPEX": new Array(20).fill(0),

      "Additional Annual Costs": new Array(20).fill(0),

      "Water Costs": [
        22_903.26, 23_243.4, 23_588.6, 23_938.93, 24_294.46, 24_655.27,
        25_021.43, 25_393.04, 25_770.16, 26_152.89, 26_541.3, 26_935.48,
        27_335.51, 27_741.48, 28_153.48, 28_571.6, 28_995.94, 34_850.01,
        35_367.59, 35_892.85,
      ],

      "Electricity Purchase": new Array(20).fill(0),
    };
    await waitFor(
      () => {
        expect(spy.mock.calls[0]).toHaveLength(1);
        const actualCost = spy.mock.calls[0][0].costs;
        expect(actualCost).toEqual(expected);
      },
      { timeout: TIMEOUT }
    );
  });

  it("calculates opex for hybrid with degradation", async () => {
    render(
      <WorkingData
        data={standaloneHybridWithDegradationScenario.data}
        location={standaloneHybridWithDegradationScenario.location}
        inputConfiguration={
          standaloneHybridWithDegradationScenario.inputConfiguration
        }
        loadSolar={loadNationalSolar}
        loadWind={loadNationalWind}
      />
    );
    const expected: { [key: string]: number[] } = {
      "Electrolyser OPEX": [
        256_250.0, 262_656.25, 269_222.66, 275_953.22, 282_852.05, 289_923.35,
        297_171.44, 5_178_212.31, 312_215.74, 320_021.14, 328_021.66,
        336_222.21, 344_627.76, 353_243.46, 362_074.54, 6_309_148.89,
        380_404.57, 389_914.68, 399_662.55, 409_654.11,
      ],

      "Power Plant OPEX": [
        568_875.0, 583_096.88, 597_674.3, 612_616.15, 627_931.56, 643_629.85,
        659_720.59, 676_213.61, 693_118.95, 710_446.92, 728_208.1, 746_413.3,
        765_073.63, 784_200.47, 803_805.48, 823_900.62, 844_498.13, 865_610.59,
        887_250.85, 909_432.12,
      ],

      "Battery OPEX": new Array(20).fill(0),

      "Additional Annual Costs": new Array(20).fill(0),

      "Water Costs": [
        59_435.89, 59_975.3, 60_505.16, 61_030.48, 61_474.47, 61_770.48,
        62_061.16, 62_356.08, 67_842.66, 68_160.05, 68_474.05, 68_798.22,
        69_113.8, 69_430.23, 69_758.42, 70_082.87, 76_251.82, 76_596.73,
        76_956.75, 77_307.82,
      ],

      "Electricity Purchase": new Array(20).fill(0),
    };
    await waitFor(
      () => {
        expect(spy.mock.calls[0]).toHaveLength(1);
        const actualCost = spy.mock.calls[0][0].costs;
        expect(actualCost).toEqual(expected);
      },
      { timeout: TIMEOUT }
    );
  });

  it("calculates opex for wind with battery and degradation", async () => {
    render(
      <WorkingData
        data={standaloneWindWithBatteryAndDegradationScenario.data}
        location={standaloneWindWithBatteryAndDegradationScenario.location}
        inputConfiguration={
          standaloneWindWithBatteryAndDegradationScenario.inputConfiguration
        }
        loadSolar={loadNationalSolar}
        loadWind={loadNationalWind}
      />
    );
    const expected: { [key: string]: number[] } = {
      "Electrolyser OPEX": [
        256_250.0, 262_656.25, 269_222.66, 275_953.22, 282_852.05, 289_923.35,
        297_171.44, 304_600.72, 312_215.74, 320_021.14, 5_576_368.3, 336_222.21,
        344_627.76, 353_243.46, 362_074.54, 371_126.41, 380_404.57, 389_914.68,
        399_662.55, 409_654.11, 419_895.46, 7_316_678.44, 441_152.67,
        452_181.49, 463_486.02,
      ],

      "Power Plant OPEX": [
        384_375.0, 393_984.37, 403_833.98, 413_929.83, 424_278.08, 434_885.03,
        445_757.16, 456_901.09, 468_323.61, 480_031.7, 492_032.5, 504_333.31,
        516_941.64, 529_865.18, 543_111.81, 556_689.61, 570_606.85, 584_872.02,
        599_493.82, 614_481.17, 629_843.19, 645_589.27, 661_729.01, 678_272.23,
        695_229.04,
      ],

      "Battery OPEX": [
        19_475.0, 19_961.88, 20_460.92, 20_972.44, 21_496.76, 22_034.17,
        22_585.03, 23_149.66, 23_728.4, 2_799_544.9, 24_929.65, 25_552.89,
        26_191.71, 26_846.5, 27_517.67, 28_205.61, 28_910.75, 29_633.52,
        30_374.35, 3_583_654.15, 31_912.06, 32_709.86, 33_527.6, 34_365.79,
        35_224.94,
      ],

      "Additional Annual Costs": new Array(25).fill(0),

      "Water Costs": [
        49677.06, 50135.31, 50603.37, 51070.35, 51545.68, 52022.76, 52503.61,
        52985, 53471.87, 53962.99, 54457.05, 61301.91, 61853.46, 62404.31,
        62959.23, 63512.24, 64070.4, 64622.57, 65169.79, 65717.35, 66265.07,
        66813.29, 75154.49, 75760.99, 76364.77,
      ],

      "Electricity Purchase": new Array(25).fill(0),
    };
    await waitFor(
      () => {
        expect(spy.mock.calls[0]).toHaveLength(1);
        const actualCost = spy.mock.calls[0][0].costs;
        expect(actualCost).toEqual(expected);
      },
      { timeout: TIMEOUT }
    );
  });

  it("calculates opex for ammonia solar", async () => {
    render(
      <WorkingData
        data={standaloneAdvancedAmmoniaSolarScenario.data}
        location={standaloneAdvancedAmmoniaSolarScenario.location}
        inputConfiguration={
          standaloneAdvancedAmmoniaSolarScenario.inputConfiguration
        }
        loadSolar={loadNSWSolar}
        loadWind={loadNSWWind}
      />
    );
    const expected: { [key: string]: number[] } = {
      "Electrolyser OPEX": [
        3_068_850.0, 3_145_571.25, 3_224_210.53, 3_304_815.79, 3_387_436.19,
        3_472_122.09, 3_558_925.15, 3_647_898.28, 3_739_095.73, 3_832_573.13,
        3_928_387.45, 4_026_597.14, 4_127_262.07, 4_230_443.62, 73_706_790.29,
        4_444_609.83, 4_555_725.07, 4_669_618.2, 4_786_358.66, 4_906_017.62,
      ],

      "Power Plant OPEX": [
        1816300, 1861707.5, 1908250.19, 1955956.44, 2004855.35, 2054976.74,
        2106351.16, 2159009.93, 2212985.18, 2268309.81, 2325017.56, 2383143,
        2442721.57, 2503789.61, 2566384.35, 2630543.96, 2696307.56, 2763715.25,
        2832808.13, 2903628.33,
      ],

      "Battery OPEX": new Array(20).fill(0),

      "Additional Annual Costs": new Array(20).fill(0),

      "Water Costs": [
        229563.5, 235302.58, 241185.15, 247214.78, 253395.15, 259730.03,
        266223.28, 272878.86, 279700.83, 286693.35, 293860.68, 301207.2,
        308737.38, 316455.82, 324367.21, 332476.39, 340788.3, 349308.01,
        358040.71, 366991.73,
      ],

      "Electricity Purchase": new Array(20).fill(0),

      "H2 Storage OPEX": [
        881_500.0, 903_537.5, 926_125.94, 949_279.09, 973_011.06, 997_336.34,
        1_022_269.75, 1_047_826.49, 1_074_022.15, 1_100_872.71, 1_128_394.53,
        1_156_604.39, 1_185_519.5, 1_215_157.49, 1_245_536.42, 1_276_674.83,
        1_308_591.7, 1_341_306.5, 1_374_839.16, 1_409_210.14,
      ],

      "Ammonia OPEX": [
        860177.99, 881682.44, 903724.5, 926317.62, 949475.56, 973212.44,
        997542.76, 1022481.32, 1048043.36, 1074244.44, 1101100.55, 1128628.07,
        1156843.77, 1185764.86, 1215408.98, 1245794.21, 1276939.06, 1308862.54,
        1341584.1, 1375123.71,
      ],
    };
    await waitFor(
      () => {
        expect(spy.mock.calls[0]).toHaveLength(1);
        const actualCost = spy.mock.calls[0][0].costs;
        expect(actualCost).toEqual(expected);
      },
      { timeout: TIMEOUT }
    );
  });

  it("calculates opex for ammonia hybrid with battery and degradation", async () => {
    render(
      <WorkingData
        data={standaloneAmmoniaHybridWithBatteryAndDegradationScenario.data}
        location={
          standaloneAmmoniaHybridWithBatteryAndDegradationScenario.location
        }
        inputConfiguration={
          standaloneAmmoniaHybridWithBatteryAndDegradationScenario.inputConfiguration
        }
        loadSolar={loadNSWSolar}
        loadWind={loadNSWWind}
      />
    );
    const expected: { [key: string]: number[] } = {
      "Electrolyser OPEX": [
        2_986_850.0, 3_061_521.25, 3_138_059.28, 3_216_510.76, 3_296_923.53,
        3_379_346.62, 3_463_830.29, 3_550_426.04, 3_639_186.69, 63_405_147.64,
        3_823_420.52, 3_919_006.03, 4_016_981.18, 4_117_405.71, 4_220_340.86,
        4_325_849.38, 4_433_995.61, 4_544_845.5, 79_184_341.0, 4_774_928.31,
      ],

      "Power Plant OPEX": [
        6686075, 6853226.87, 7024557.55, 7200171.49, 7380175.77, 7564680.17,
        7753797.17, 7947642.1, 8146333.15, 8349991.48, 8558741.27, 8772709.8,
        8992027.55, 9216828.23, 9447248.94, 9683430.16, 9925515.92, 10173653.82,
        10427995.16, 10688695.04,
      ],

      "Battery OPEX": [
        39_975.0, 40_974.38, 41_998.73, 43_048.7, 44_124.92, 45_228.04,
        46_358.74, 47_517.71, 48_705.66, 5_600_369.88, 51_171.38, 52_450.66,
        53_761.93, 55_105.98, 56_483.63, 57_895.72, 59_343.11, 60_826.69,
        62_347.36, 63_906.04,
      ],

      "Additional Annual Costs": new Array(20).fill(0),

      "Water Costs": [
        1126871.05, 1143606.76, 1160591.02, 1177827.52, 1195320.01, 1213072.28,
        1231088.21, 1249371.7, 1267926.72, 1286757.32, 1442490.21, 1463913.34,
        1485654.62, 1507718.8, 1530110.66, 1552835.08, 1575896.99, 1599301.4,
        1623053.4, 1801472.61,
      ],

      "Electricity Purchase": new Array(20).fill(0),

      "H2 Storage OPEX": [
        1_025_000.0, 1_050_625.0, 1_076_890.62, 1_103_812.89, 1_131_408.21,
        1_159_693.42, 1_188_685.75, 1_218_402.9, 1_248_862.97, 1_280_084.54,
        1_312_086.66, 1_344_888.82, 1_378_511.04, 1_412_973.82, 1_448_298.17,
        1_484_505.62, 1_521_618.26, 1_559_658.72, 1_598_650.19, 1_638_616.44,
      ],

      "Ammonia OPEX": [
        1_747_432.52, 1_791_118.33, 1_835_896.29, 1_881_793.7, 1_928_838.54,
        1_977_059.5, 2_026_485.99, 2_077_148.14, 2_129_076.85, 2_182_303.77,
        2_236_861.36, 2_292_782.89, 2_350_102.47, 2_408_855.03, 2_469_076.4,
        2_530_803.31, 2_594_073.4, 2_658_925.23, 2_725_398.36, 2_793_533.32,
      ],
    };
    await waitFor(
      () => {
        expect(spy.mock.calls[0]).toHaveLength(1);
        const actualCost = spy.mock.calls[0][0].costs;
        expect(actualCost).toEqual(expected);
      },
      { timeout: TIMEOUT }
    );
  });

  it("calculates opex for methanol hybrid with battery", async () => {
    render(
      <WorkingData
        data={standaloneMethanolHybridWithBatteryScenario.data}
        location={standaloneMethanolHybridWithBatteryScenario.location}
        inputConfiguration={
          standaloneMethanolHybridWithBatteryScenario.inputConfiguration
        }
        loadSolar={loadNSWSolar}
        loadWind={loadNSWWind}
      />
    );
    const expected: { [key: string]: number[] } = {
      "Electrolyser OPEX": [
        38_452_875.0, 39_414_196.88, 40_399_551.8, 41_409_540.59, 42_444_779.11,
        43_505_898.58, 44_593_546.05, 777_049_850.32, 46_851_094.32,
        48_022_371.68, 49_222_930.97, 50_453_504.24, 51_714_841.85,
        53_007_712.89, 923_668_086.96, 55_691_228.36, 57_083_509.07,
        58_510_596.79, 59_973_361.71, 61_472_695.76, 63_009_513.15,
        1_097_951_096.09, 66_199_369.75, 67_854_354.0, 69_550_712.85,
      ],

      "Power Plant OPEX": [
        26502400, 27164960, 27844084, 28540186.1, 29253690.75, 29985033.02,
        30734658.85, 31503025.32, 32290600.95, 33097865.97, 33925312.62,
        34773445.44, 35642781.58, 36533851.12, 37447197.39, 38383377.33,
        39342961.76, 40326535.81, 41334699.2, 42368066.68, 43427268.35,
        44512950.06, 45625773.81, 46766418.15, 47935578.61,
      ],

      "Battery OPEX": [
        684_700.0, 701_817.5, 719_362.94, 737_347.01, 755_780.69, 774_675.2,
        794_042.08, 813_893.14, 834_240.46, 288_723_068.94, 876_473.89,
        898_385.73, 920_845.38, 943_866.51, 967_463.18, 991_649.75, 1_016_441.0,
        1_041_852.02, 1_067_898.32, 369_589_938.11, 1_121_960.68, 1_150_009.69,
        1_178_759.94, 1_208_228.93, 1_238_434.66,
      ],

      "Additional Annual Costs": new Array(25).fill(0),

      "Water Costs": [
        2939535.39, 3013023.78, 3088349.37, 3165558.1, 3244697.06, 3325814.48,
        3408959.85, 3494183.84, 3581538.44, 3671076.9, 3762853.82, 3856925.17,
        3953348.3, 4052182, 4153486.55, 4257323.72, 4363756.81, 4472850.73,
        4584672, 4699288.8, 4816771.02, 4937190.29, 5060620.05, 5187135.55,
        5316813.94,
      ],

      "Electricity Purchase": new Array(25).fill(0),

      "H2 Storage OPEX": [
        1_125_450.0, 1_153_586.25, 1_182_425.91, 1_211_986.55, 1_242_286.22,
        1_273_343.37, 1_305_176.96, 1_337_806.38, 1_371_251.54, 1_405_532.83,
        1_440_671.15, 1_476_687.93, 1_513_605.13, 1_551_445.26, 1_590_231.39,
        1_629_987.17, 1_670_736.85, 1_712_505.27, 1_755_317.9, 1_799_200.85,
        1_844_180.87, 1_890_285.39, 1_937_542.53, 1_985_981.09, 2_035_630.62,
      ],

      "Methanol OPEX": [
        5_025_575.0, 5_151_214.38, 5_279_994.73, 5_411_994.6, 5_547_294.47,
        5_685_976.83, 5_828_126.25, 5_973_829.41, 6_123_175.14, 6_276_254.52,
        6_433_160.88, 6_593_989.91, 6_758_839.65, 6_927_810.64, 7_101_005.91,
        7_278_531.06, 7_460_494.33, 7_647_006.69, 7_838_181.86, 8_034_136.41,
        8_234_989.82, 8_440_864.56, 8_651_886.18, 8_868_183.33, 9_089_887.91,
      ],

      "CC OPEX": [
        11_359_815.57, 11_643_810.96, 11_934_906.23, 12_233_278.89,
        12_539_110.86, 12_852_588.63, 13_173_903.35, 13_503_250.93,
        13_840_832.2, 14_186_853.01, 14_541_524.33, 14_905_062.44, 15_277_689.0,
        15_659_631.23, 16_051_122.01, 16_452_400.06, 16_863_710.06,
        17_285_302.81, 17_717_435.38, 18_160_371.27, 18_614_380.55,
        19_079_740.06, 19_556_733.56, 20_045_651.9, 20_546_793.2,
      ],
    };
    await waitFor(
      () => {
        expect(spy.mock.calls[0]).toHaveLength(1);
        const actualCost = spy.mock.calls[0][0].costs;
        expect(actualCost).toEqual(expected);
      },
      { timeout: TIMEOUT }
    );
  });

  it("calculates opex for grid connected methane with wind and degradation", async () => {
    render(
      <WorkingData
        data={gridConnectedMethaneWindWithBatteryAndDegradationScenario.data}
        location={
          gridConnectedMethaneWindWithBatteryAndDegradationScenario.location
        }
        inputConfiguration={
          gridConnectedMethaneWindWithBatteryAndDegradationScenario.inputConfiguration
        }
        loadSolar={loadNSWSolar}
        loadWind={loadNSWWind}
      />
    );
    const expected: { [key: string]: number[] } = {
      "Electrolyser OPEX": [
        40_894_425.0, 41_916_785.63, 42_964_705.27, 44_038_822.9, 45_139_793.47,
        46_268_288.31, 47_424_995.51, 48_610_620.4, 49_825_885.91,
        51_071_533.06, 889_920_151.48, 53_657_029.42, 54_998_455.16,
        56_373_416.54, 57_782_751.95, 59_227_320.75, 60_708_003.77,
        62_225_703.86, 63_781_346.46, 65_375_880.12, 67_010_277.12,
        1_167_652_357.27, 70_402_672.4, 72_162_739.21, 73_966_807.69,
        75_815_977.88, 77_711_377.33, 79_654_161.76, 81_645_515.81,
        83_686_653.7,
      ],

      "Power Plant OPEX": [
        62577275, 64141706.87, 65745249.55, 67388880.79, 69073602.81,
        70800442.88, 72570453.95, 74384715.3, 76244333.18, 78150441.51,
        80104202.55, 82106807.61, 84159477.8, 86263464.74, 88420051.36,
        90630552.65, 92896316.46, 95218724.37, 97599192.48, 100039172.3,
        102540151.6, 105103655.39, 107731246.78, 110424527.95, 113185141.15,
        116014769.68, 118915138.92, 121888017.39, 124935217.82, 128058598.27,
      ],

      "Battery OPEX": [
        727_750.0, 745_943.75, 764_592.34, 783_707.15, 803_299.83, 823_382.33,
        843_966.89, 865_066.06, 886_692.71, 908_860.03, 931_581.53, 954_871.07,
        978_742.84, 1_003_211.41, 282_203_359.85, 1_053_998.99, 1_080_348.97,
        1_107_357.69, 1_135_041.63, 1_163_417.67, 1_192_503.11, 1_222_315.69,
        1_252_873.58, 1_284_195.42, 1_316_300.31, 1_349_207.82, 1_382_938.01,
        1_417_511.46, 1_452_949.25, 1_489_272.98,
      ],

      "Additional Annual Costs": [
        1_025.0, 1_050.63, 1_076.89, 1_103.81, 1_131.41, 1_159.69, 1_188.69,
        1_218.4, 1_248.86, 1_280.08, 1_312.09, 1_344.89, 1_378.51, 1_412.97,
        1_448.3, 1_484.51, 1_521.62, 1_559.66, 1_598.65, 1_638.62, 1_679.58,
        1_721.57, 1_764.61, 1_808.73, 1_853.94, 1_900.29, 1_947.8, 1_996.5,
        2_046.41, 2_097.57,
      ],

      "Water Costs": [
        9685737.96, 9745630.47, 9804827.61, 9863380.64, 9921528.5, 9979216.86,
        10035846.49, 10091654.43, 10146528.12, 10200426.34, 10253594.7,
        11497818.32, 11555019.23, 11611189.53, 11666123.75, 11719972.66,
        11772854.54, 11824838.01, 11875900.16, 11926116.78, 11975443.99,
        12023918.65, 13467930.98, 13519838.5, 13570426.62, 13619598.32,
        13667390.39, 13714058.16, 13759209.13, 13803085.32,
      ],

      "Electricity Purchase": new Array(30).fill(0),

      "H2 Storage OPEX": [
        512_500.0, 525_312.5, 538_445.31, 551_906.45, 565_704.11, 579_846.71,
        594_342.88, 609_201.45, 624_431.48, 640_042.27, 656_043.33, 672_444.41,
        689_255.52, 706_486.91, 724_149.08, 742_252.81, 760_809.13, 779_829.36,
        799_325.09, 819_308.22, 839_790.93, 860_785.7, 882_305.34, 904_362.97,
        926_972.05, 950_146.35, 973_900.01, 998_247.51, 1_023_203.7,
        1_048_783.79,
      ],

      "Methane OPEX": [
        8_579_109.59, 8_793_587.33, 9_013_427.01, 9_238_762.69, 9_469_731.75,
        9_706_475.05, 9_949_136.92, 10_197_865.35, 10_452_811.98, 10_714_132.28,
        10_981_985.59, 11_256_535.23, 11_537_948.61, 11_826_397.32,
        12_122_057.26, 12_425_108.69, 12_735_736.41, 13_054_129.82,
        13_380_483.06, 13_714_995.14, 14_057_870.02, 14_409_316.77,
        14_769_549.69, 15_138_788.43, 15_517_258.14, 15_905_189.59,
        16_302_819.33, 16_710_389.81, 17_128_149.56, 17_556_353.3,
      ],

      "CC OPEX": [
        95_324_192.81, 97_707_297.63, 100_149_980.07, 102_653_729.57,
        105_220_072.81, 107_850_574.63, 110_546_839.0, 113_310_509.97,
        116_143_272.72, 119_046_854.54, 122_023_025.9, 125_073_601.55,
        128_200_441.59, 131_405_452.63, 134_690_588.94, 138_057_853.67,
        141_509_300.01, 145_047_032.51, 148_673_208.32, 152_390_038.53,
        156_199_789.49, 160_104_784.23, 164_107_403.83, 168_210_088.93,
        172_415_341.15, 176_725_724.68, 181_143_867.8, 185_672_464.49,
        190_314_276.11, 195_072_133.01,
      ],
    };
    await waitFor(
      () => {
        expect(spy.mock.calls[0]).toHaveLength(1);
        const actualCost = spy.mock.calls[0][0].costs;
        expect(actualCost).toEqual(expected);
      },
      { timeout: TIMEOUT }
    );
  });
});
