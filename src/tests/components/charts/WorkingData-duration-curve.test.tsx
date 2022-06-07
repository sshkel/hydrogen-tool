import WorkingData from "../../../components/charts/WorkingData";
import { mount } from "enzyme";
import { readLocalCsv } from "../../resources/loader";
import DurationCurve from "../../../components/charts/DurationCurve";
import {
  hybridBatterySurplusRetailScenario,
  solarPvWithBatteryScenario,
  solarPvWithElectrolyserScenario,
  windElectrolyserScenario,
  windWithBatteryAndPPAScenario,
  windWithPPAScenario,
} from "../../scenario";
import solarBatteryGeneratorDurationCurve from "../../resources/solar-battery-generator-duration-curve.json";
import solarBatteryElectrolyserDurationCurve from "../../resources/solar-battery-electrolyser-duration-curve.json";
import solarGeneratorDurationCurve from "../../resources/solar-generator-duration-curve.json";
import solarElectrolyserDurationCurve from "../../resources/solar-electrolyser-duration-curve.json";
import windGeneratorDurationCurve from "../../resources/wind-generator-duration-curve.json";
import windElectrolyserDurationCurve from "../../resources/wind-electrolyser-duration-curve.json";
import windPPAGeneratorDurationCurve from "../../resources/wind-ppa-generator-duration-curve.json";
import windPPAElectrolyserDurationCurve from "../../resources/wind-ppa-electrolyser-duration-curve.json";
import hybridBatteryRetailGeneratorDurationCurve from "../../resources/hybrid-battery-retail-generator-duration-curve.json";
import hybridBatteryRetailElectrolyserDurationCurve from "../../resources/hybrid-battery-retail-electrolyser-duration-curve.json";
import windBatteryPPAGeneratorDurationCurve from "../../resources/wind-battery-ppa-generator-duration-curve.json";
import windBatteryPPAElectrolyserDurationCurve from "../../resources/wind-battery-ppa-electrolyser-duration-curve.json";

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
    it("calculates duration curves as 8760 percentages for solar", (done) => {
      const wrapper = mount(
        <WorkingData
          data={solarPvWithElectrolyserScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const generatorDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere((e) => e.prop("title") === "Generator Duration Curve");
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
            expect(val).toEqual(solarElectrolyserDurationCurve[index]);
          }
        );

        done();
      }, 1500);
    });

    it("calculates duration curves as 8760 percentages for solar with battery", (done) => {
      const wrapper = mount(
        <WorkingData
          data={solarPvWithBatteryScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const generatorDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere((e) => e.prop("title") === "Generator Duration Curve");
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
            expect(val).toEqual(solarBatteryElectrolyserDurationCurve[index]);
          }
        );

        done();
      }, 1500);
    });

    it("calculates duration curves as 8760 percentages for wind", (done) => {
      const wrapper = mount(
        <WorkingData
          data={windElectrolyserScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const generatorDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere((e) => e.prop("title") === "Generator Duration Curve");
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
      }, 1500);
    });

    it("calculates duration curves as 8760 percentages for wind with PPA agreement", (done) => {
      const wrapper = mount(
        <WorkingData
          data={windWithPPAScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const generatorDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere((e) => e.prop("title") === "Generator Duration Curve");
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
      }, 1500);
    });

    it("calculates duration curves as 8760 percentages for hybrid with battery and surplus retail", (done) => {
      const wrapper = mount(
        <WorkingData
          data={hybridBatterySurplusRetailScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const generatorDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere((e) => e.prop("title") === "Generator Duration Curve");
        expect(generatorDurationCurve).toHaveLength(1);
        expect(generatorDurationCurve.at(0).prop("data")).toHaveLength(8760);

        (generatorDurationCurve.at(0).prop("data") as number[]).forEach(
          (val, index) => {
            expect(val).toEqual(
              hybridBatteryRetailGeneratorDurationCurve[index]
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
            expect(val).toEqual(
              hybridBatteryRetailElectrolyserDurationCurve[index]
            );
          }
        );

        done();
      }, 1500);
    });

    it("calculates duration curves as 8760 percentages for wind with battery and ppa agreement", (done) => {
      const wrapper = mount(
        <WorkingData
          data={windWithBatteryAndPPAScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const generatorDurationCurve = wrapper
          .find(DurationCurve)
          .filterWhere((e) => e.prop("title") === "Generator Duration Curve");
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
            expect(val).toEqual(windBatteryPPAElectrolyserDurationCurve[index]);
          }
        );

        done();
      }, 1500);
    });
  });
});

//
// writeLocalFile(
//   "/Users/ttjandra/Documents/projects/hydrogen-tool/src/tests/resources/solar-generator-duration-curve.json",
//   JSON.stringify(generatorDurationCurve.at(0).prop("data"))
// );

//
// writeLocalFile(
//   "/Users/ttjandra/Documents/projects/hydrogen-tool/src/tests/resources/solar-electrolyser-duration-curve.json",
//   JSON.stringify(electrolyserDurationCurve.at(0).prop("data"))
// );
