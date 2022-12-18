import { mount } from "enzyme";

import DurationCurve from "../../../components/charts/DurationCurve";
import WorkingData from "../../../components/charts/WorkingData";
import { TIMEOUT } from "../../consts";
import ammoniaSolarAmmoniaDurationCurveWithBattery from "../../resources/ammonia-solar-ammonia-duration-curve-with-battery.json";
import ammoniaSolarAmmoniaDurationCurve from "../../resources/ammonia-solar-ammonia-duration-curve.json";
import ammoniaSolarElectrolyserDurationCurveWithBattery from "../../resources/ammonia-solar-electrolyser-duration-curve-with-battery.json";
import ammoniaSolarElectrolyserDurationCurve from "../../resources/ammonia-solar-electrolyser-duration-curve.json";
import ammoniaSolarGeneratorDurationCurveWithBattery from "../../resources/ammonia-solar-generator-duration-curve-with-battery.json";
import ammoniaSolarGeneratorDurationCurve from "../../resources/ammonia-solar-generator-duration-curve.json";
import hybridBatteryOversizeRatioElectrolyserDurationCurve from "../../resources/hybrid-battery-oversize-ratio-electrolyser-duration-curve.json";
import hybridBatteryOversizeRatioGeneratorDurationCurve from "../../resources/hybrid-battery-oversize-ratio-generator-duration-curve.json";
import hybridDegradationElectrolyserDurationCurve from "../../resources/hybrid-degradation-electrolyser-duration-curve.json";
import hybridDegradationGeneratorDurationCurve from "../../resources/hybrid-degradation-generator-duration-curve.json";
import { readLocalCsv, writeLocalFile } from "../../resources/loader";
import solarBatteryElectrolyserDurationCurve from "../../resources/solar-battery-electrolyser-duration-curve.json";
import solarBatteryGeneratorDurationCurve from "../../resources/solar-battery-generator-duration-curve.json";
import solarElectrolyserDurationCurve from "../../resources/solar-electrolyser-duration-curve.json";
import solarGeneratorDurationCurve from "../../resources/solar-generator-duration-curve.json";
import windBatteryPPAElectrolyserDurationCurve from "../../resources/wind-battery-ppa-electrolyser-duration-curve.json";
import windBatteryPPAGeneratorDurationCurve from "../../resources/wind-battery-ppa-generator-duration-curve.json";
import windElectrolyserDurationCurve from "../../resources/wind-electrolyser-duration-curve.json";
import windGeneratorDurationCurve from "../../resources/wind-generator-duration-curve.json";
import windPPAElectrolyserDurationCurve from "../../resources/wind-ppa-electrolyser-duration-curve.json";
import windPPAGeneratorDurationCurve from "../../resources/wind-ppa-generator-duration-curve.json";
import {
  hybridBatteryGridOversizeRatioScenario,
  standaloneAmmoniaSolarScenario,
  standaloneAmmoniaSolarWithBatteryScenario,
  standaloneHybridWithDegradationScenario,
  standaloneSolarScenario,
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

  describe("Duration Curves", () => {
    it("Hydrogen model: calculates duration curves as 8760 percentages for solar", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneSolarScenario.data}
          loadSolar={loadSolar}
          loadWind={loadWind}
          location={standaloneSolarScenario.location}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const generatorDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere((e) => e.prop("title") === "Power Plant Duration Curve");
        expect(generatorDurationCurve).toHaveLength(1);
        expect(generatorDurationCurve.at(0).prop("data")).toHaveLength(8760);

        (generatorDurationCurve.at(0).prop("data") as number[]).forEach(
          (val, index) => {
            expect(val).toEqual(solarGeneratorDurationCurve[index]);
          }
        );

        const electrolyserDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere(
            (e) => e.prop("title") === "Electrolyser Duration Curve"
          );
        expect(electrolyserDurationCurve).toHaveLength(1);
        expect(electrolyserDurationCurve.at(0).prop("data")).toHaveLength(8760);
        (electrolyserDurationCurve.at(0).prop("data") as number[]).forEach(
          (val, index) => {
            expect(val).toBeCloseTo(solarElectrolyserDurationCurve[index], 8);
          }
        );

        done();
      }, TIMEOUT);
    });

    it("Hydrogen model: calculates duration curves as 8760 percentages for solar with battery", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneSolarWithBatteryScenario.data}
          loadSolar={loadSolar}
          loadWind={loadWind}
          location={standaloneSolarWithBatteryScenario.location}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const generatorDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere((e) => e.prop("title") === "Power Plant Duration Curve");
        expect(generatorDurationCurve).toHaveLength(1);
        expect(generatorDurationCurve.at(0).prop("data")).toHaveLength(8760);
        (generatorDurationCurve.at(0).prop("data") as number[]).forEach(
          (val, index) => {
            expect(val).toEqual(solarBatteryGeneratorDurationCurve[index]);
          }
        );

        const electrolyserDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere(
            (e) => e.prop("title") === "Electrolyser Duration Curve"
          );
        expect(electrolyserDurationCurve).toHaveLength(1);
        expect(electrolyserDurationCurve.at(0).prop("data")).toHaveLength(8760);
        (electrolyserDurationCurve.at(0).prop("data") as number[]).forEach(
          (val, index) => {
            expect(val).toBeCloseTo(
              solarBatteryElectrolyserDurationCurve[index],
              8
            );
          }
        );

        done();
      }, TIMEOUT);
    });

    it("Hydrogen model: calculates duration curves as 8760 percentages for wind", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneWindScenario.data}
          loadSolar={loadSolar}
          loadWind={loadWind}
          location={standaloneWindScenario.location}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const generatorDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere((e) => e.prop("title") === "Power Plant Duration Curve");
        expect(generatorDurationCurve).toHaveLength(1);
        expect(generatorDurationCurve.at(0).prop("data")).toHaveLength(8760);
        (generatorDurationCurve.at(0).prop("data") as number[]).forEach(
          (val, index) => {
            expect(val).toEqual(windGeneratorDurationCurve[index]);
          }
        );

        const electrolyserDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere(
            (e) => e.prop("title") === "Electrolyser Duration Curve"
          );
        expect(electrolyserDurationCurve).toHaveLength(1);
        expect(electrolyserDurationCurve.at(0).prop("data")).toHaveLength(8760);
        (electrolyserDurationCurve.at(0).prop("data") as number[]).forEach(
          (val, index) => {
            expect(val).toEqual(windElectrolyserDurationCurve[index]);
          }
        );

        done();
      }, TIMEOUT);
    });

    it("Hydrogen model: calculates duration curves as 8760 percentages for wind with PPA agreement", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={windWithPPAScenario.data}
          loadSolar={loadSolar}
          loadWind={loadWind}
          location={windWithPPAScenario.location}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const generatorDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere((e) => e.prop("title") === "Power Plant Duration Curve");
        expect(generatorDurationCurve).toHaveLength(1);
        expect(generatorDurationCurve.at(0).prop("data")).toHaveLength(8760);

        (generatorDurationCurve.at(0).prop("data") as number[]).forEach(
          (val, index) => {
            expect(val).toEqual(windPPAGeneratorDurationCurve[index]);
          }
        );

        const electrolyserDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere(
            (e) => e.prop("title") === "Electrolyser Duration Curve"
          );
        expect(electrolyserDurationCurve).toHaveLength(1);
        expect(electrolyserDurationCurve.at(0).prop("data")).toHaveLength(8760);
        (electrolyserDurationCurve.at(0).prop("data") as number[]).forEach(
          (val, index) => {
            expect(val).toEqual(windPPAElectrolyserDurationCurve[index]);
          }
        );

        done();
      }, TIMEOUT);
    });

    it("Hydrogen model: calculates duration curves as 8760 percentages for hybrid with battery and surplus retail", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={hybridBatteryGridOversizeRatioScenario.data}
          loadSolar={loadSolar}
          loadWind={loadWind}
          location={hybridBatteryGridOversizeRatioScenario.location}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const generatorDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere((e) => e.prop("title") === "Power Plant Duration Curve");
        expect(generatorDurationCurve).toHaveLength(1);
        expect(generatorDurationCurve.at(0).prop("data")).toHaveLength(8760);

        (generatorDurationCurve.at(0).prop("data") as number[]).forEach(
          (val, index) => {
            expect(val).toEqual(
              hybridBatteryOversizeRatioGeneratorDurationCurve[index]
            );
          }
        );

        const electrolyserDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere(
            (e) => e.prop("title") === "Electrolyser Duration Curve"
          );

        expect(electrolyserDurationCurve).toHaveLength(1);
        expect(electrolyserDurationCurve.at(0).prop("data")).toHaveLength(8760);
        (electrolyserDurationCurve.at(0).prop("data") as number[]).forEach(
          (val, index) => {
            expect(val).toBeCloseTo(
              hybridBatteryOversizeRatioElectrolyserDurationCurve[index],
              8
            );
          }
        );

        done();
      }, TIMEOUT);
    });

    it("Hydrogen model: calculates duration curves as 8760 percentages for wind with battery and ppa agreement", (done) => {
      const wrapper = mount(
        <WorkingData
          inputConfiguration="Advanced"
          data={windWithBatteryAndPPAScenario.data}
          loadSolar={loadSolar}
          loadWind={loadWind}
          location={windWithBatteryAndPPAScenario.location}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const generatorDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere((e) => e.prop("title") === "Power Plant Duration Curve");
        expect(generatorDurationCurve).toHaveLength(1);
        expect(generatorDurationCurve.at(0).prop("data")).toHaveLength(8760);

        (generatorDurationCurve.at(0).prop("data") as number[]).forEach(
          (val, index) => {
            expect(val).toEqual(windBatteryPPAGeneratorDurationCurve[index]);
          }
        );

        const electrolyserDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere(
            (e) => e.prop("title") === "Electrolyser Duration Curve"
          );
        expect(electrolyserDurationCurve).toHaveLength(1);
        expect(electrolyserDurationCurve.at(0).prop("data")).toHaveLength(8760);
        (electrolyserDurationCurve.at(0).prop("data") as number[]).forEach(
          (val, index) => {
            expect(val).toBeCloseTo(
              windBatteryPPAElectrolyserDurationCurve[index],
              8
            );
          }
        );

        done();
      }, TIMEOUT);
    });
  });

  it("Hydrogen model: calculates duration curves as 8760 percentages for hybrid with degradation", (done) => {
    const wrapper = mount(
      <WorkingData
        inputConfiguration="Advanced"
        data={standaloneHybridWithDegradationScenario.data}
        loadSolar={loadSolar}
        loadWind={loadWind}
        location={standaloneHybridWithDegradationScenario.location}
      />
    );

    // Sleep to wait for CSV to load and set state
    setTimeout(() => {
      wrapper.update();
      const generatorDurationCurve = wrapper
        .find(DurationCurve)
        .filterWhere((e) => e.prop("title") === "Power Plant Duration Curve");
      expect(generatorDurationCurve).toHaveLength(1);
      expect(generatorDurationCurve.at(0).prop("data")).toHaveLength(8760);

      (generatorDurationCurve.at(0).prop("data") as number[]).forEach(
        (val, index) => {
          expect(val).toEqual(hybridDegradationGeneratorDurationCurve[index]);
        }
      );

      const electrolyserDurationCurve = wrapper
        .find(DurationCurve)
        .filterWhere((e) => e.prop("title") === "Electrolyser Duration Curve");
      expect(electrolyserDurationCurve).toHaveLength(1);
      expect(electrolyserDurationCurve.at(0).prop("data")).toHaveLength(8760);
      (electrolyserDurationCurve.at(0).prop("data") as number[]).forEach(
        (val, index) => {
          expect(val).toEqual(
            hybridDegradationElectrolyserDurationCurve[index]
          );
        }
      );

      done();
    }, TIMEOUT);
  });

  it("Ammonia model: calculates duration curves as 8760 percentages for solar", (done) => {
    const wrapper = mount(
      <WorkingData
        inputConfiguration="Advanced"
        data={standaloneAmmoniaSolarScenario.data}
        loadSolar={loadSolar}
        loadWind={loadWind}
        location={standaloneAmmoniaSolarScenario.location}
      />
    );

    // Sleep to wait for CSV to load and set state
    setTimeout(() => {
      wrapper.update();
      const generatorDurationCurve = wrapper
        .find(DurationCurve)
        .filterWhere((e) => e.prop("title") === "Power Plant Duration Curve");

      expect(generatorDurationCurve).toHaveLength(1);
      expect(generatorDurationCurve.at(0).prop("data")).toHaveLength(8760);

      (generatorDurationCurve.at(0).prop("data") as number[]).forEach(
        (val, index) => {
          expect(val).toEqual(ammoniaSolarGeneratorDurationCurve[index]);
        }
      );

      const electrolyserDurationCurve = wrapper
        .find(DurationCurve)
        .filterWhere((e) => e.prop("title") === "Electrolyser Duration Curve");

      expect(electrolyserDurationCurve).toHaveLength(1);
      expect(electrolyserDurationCurve.at(0).prop("data")).toHaveLength(8760);
      (electrolyserDurationCurve.at(0).prop("data") as number[]).forEach(
        (val, index) => {
          expect(val).toBeCloseTo(
            ammoniaSolarElectrolyserDurationCurve[index],
            8
          );
        }
      );

      const ammoniaDurationCurve = wrapper
        .find(DurationCurve)
        .filterWhere((e) => e.prop("title") === "Ammonia Duration Curve");

      expect(ammoniaDurationCurve).toHaveLength(1);
      expect(ammoniaDurationCurve.at(0).prop("data")).toHaveLength(8760);
      (ammoniaDurationCurve.at(0).prop("data") as number[]).forEach(
        (val, index) => {
          expect(val).toBeCloseTo(ammoniaSolarAmmoniaDurationCurve[index], 8);
        }
      );

      done();
    }, TIMEOUT);
  });

  it("Ammonia model: calculates duration curves as 8760 percentages for solar with battery", (done) => {
    const wrapper = mount(
      <WorkingData
        inputConfiguration="Advanced"
        data={standaloneAmmoniaSolarWithBatteryScenario.data}
        loadSolar={loadSolar}
        loadWind={loadWind}
        location={standaloneAmmoniaSolarWithBatteryScenario.location}
      />
    );

    // Sleep to wait for CSV to load and set state
    setTimeout(() => {
      wrapper.update();
      const generatorDurationCurve = wrapper
        .find(DurationCurve)
        .filterWhere((e) => e.prop("title") === "Power Plant Duration Curve");
      // writeLocalFile(
      //   "/Users/stanisshkel/work/hydrogen-tool/src/tests/resources/ammonia-solar-generator-duration-curve-with-battery.json",
      //   JSON.stringify(generatorDurationCurve.at(0).prop("data"))
      // );
      expect(generatorDurationCurve).toHaveLength(1);
      expect(generatorDurationCurve.at(0).prop("data")).toHaveLength(8760);

      (generatorDurationCurve.at(0).prop("data") as number[]).forEach(
        (val, index) => {
          expect(val).toEqual(
            ammoniaSolarGeneratorDurationCurveWithBattery[index]
          );
        }
      );

      const electrolyserDurationCurve = wrapper
        .find(DurationCurve)
        .filterWhere((e) => e.prop("title") === "Electrolyser Duration Curve");
      // writeLocalFile(
      //   "/Users/stanisshkel/work/hydrogen-tool/src/tests/resources/ammonia-solar-electrolyser-duration-curve-with-battery.json",
      //   JSON.stringify(electrolyserDurationCurve.at(0).prop("data"))
      // );
      expect(electrolyserDurationCurve).toHaveLength(1);
      expect(electrolyserDurationCurve.at(0).prop("data")).toHaveLength(8760);
      (electrolyserDurationCurve.at(0).prop("data") as number[]).forEach(
        (val, index) => {
          expect(val).toBeCloseTo(
            ammoniaSolarElectrolyserDurationCurveWithBattery[index],
            8
          );
        }
      );

      const ammoniaDurationCurve = wrapper
        .find(DurationCurve)
        .filterWhere((e) => e.prop("title") === "Ammonia Duration Curve");

      expect(ammoniaDurationCurve).toHaveLength(1);
      expect(ammoniaDurationCurve.at(0).prop("data")).toHaveLength(8760);
      (ammoniaDurationCurve.at(0).prop("data") as number[]).forEach(
        (val, index) => {
          expect(val).toBeCloseTo(
            ammoniaSolarAmmoniaDurationCurveWithBattery[index],
            8
          );
        }
      );

      done();
    }, TIMEOUT);
  });
});

//
// writeLocalFile(
//   "/Users/ttjandra/Documents/projects/hydrogen-tool/src/tests/resources/hybrid-battery-oversize-ratio-generator-duration-curve.json",
//   JSON.stringify(generatorDurationCurve.at(0).prop("data"))
// );

//
// writeLocalFile(
//   "/Users/ttjandra/Documents/projects/hydrogen-tool/src/tests/resources/hybrid-battery-oversize-ratio-electrolyser-duration-curve.json",
//   JSON.stringify(electrolyserDurationCurve.at(0).prop("data"))
// );
