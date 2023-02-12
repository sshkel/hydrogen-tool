/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import { render, waitFor } from "@testing-library/react";

import * as durationCurves from "../../../components/results/DurationCurves";
import WorkingData from "../../../components/results/WorkingData";
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
import { readLocalCsv } from "../../resources/loader";
import methanolHybridBatteryElectrolyserDurationCurve from "../../resources/methanol-hybrid-battery-electrolyser-duration-curve.json";
import methanolHybridBatteryGeneratorDurationCurve from "../../resources/methanol-hybrid-battery-generator-duration-curve.json";
import methanolHybridBatteryMethanolDurationCurve from "../../resources/methanol-hybrid-battery-methanol-duration-curve.json";
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
  standaloneMethanolHybridWithBatteryScenario,
  standaloneSolarScenario,
  standaloneSolarWithBatteryScenario,
  standaloneWindScenario,
  windWithBatteryAndPPAScenario,
  windWithPPAScenario,
} from "../../scenario";

describe("Working Data calculations", () => {
  let loadSolar: () => Promise<any[]>;
  let loadWind: () => Promise<any[]>;
  let spy: jest.SpyInstance<
    JSX.Element[],
    [durationCurves: { [key: string]: number[] }]
  >;

  beforeEach(() => {
    sessionStorage.clear();
    spy = jest.spyOn(durationCurves, "DurationCurves");
  });

  beforeAll(() => {
    console.error = function () {};
    loadSolar = async () =>
      await readLocalCsv(__dirname + "/../../resources/solar-traces.csv");
    loadWind = async () =>
      await readLocalCsv(__dirname + "/../../resources/wind-traces.csv");
  });

  describe("Duration Curves", () => {
    it("Hydrogen model: calculates duration curves as 8760 percentages for solar", async () => {
      render(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneSolarScenario.data}
          loadSolar={loadSolar}
          loadWind={loadWind}
          location={standaloneSolarScenario.location}
        />
      );

      await waitFor(
        () => {
          expect(Object.keys(spy.mock.calls[0][0])).toHaveLength(2);
          const curves = spy.mock.calls[0][0];
          expect(curves["Power Plant Duration Curve"]).toHaveLength(8760);
          curves["Power Plant Duration Curve"].forEach((val, index) => {
            expect(val).toEqual(solarGeneratorDurationCurve[index]);
          });

          expect(curves["Electrolyser Duration Curve"]).toHaveLength(8760);
          curves["Electrolyser Duration Curve"].forEach((val, index) => {
            expect(val).toBeCloseTo(solarElectrolyserDurationCurve[index], 8);
          });
        },
        { timeout: TIMEOUT }
      );
    });

    it("Hydrogen model: calculates duration curves as 8760 percentages for solar with battery", async () => {
      render(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneSolarWithBatteryScenario.data}
          loadSolar={loadSolar}
          loadWind={loadWind}
          location={standaloneSolarWithBatteryScenario.location}
        />
      );

      await waitFor(
        () => {
          expect(Object.keys(spy.mock.calls[0][0])).toHaveLength(2);
          const curves = spy.mock.calls[0][0];
          expect(curves["Power Plant Duration Curve"]).toHaveLength(8760);
          curves["Power Plant Duration Curve"].forEach((val, index) => {
            expect(val).toEqual(solarBatteryGeneratorDurationCurve[index]);
          });

          expect(curves["Electrolyser Duration Curve"]).toHaveLength(8760);
          curves["Electrolyser Duration Curve"].forEach((val, index) => {
            expect(val).toBeCloseTo(
              solarBatteryElectrolyserDurationCurve[index],
              8
            );
          });
        },
        { timeout: TIMEOUT }
      );
    });

    it("Hydrogen model: calculates duration curves as 8760 percentages for wind", async () => {
      render(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneWindScenario.data}
          loadSolar={loadSolar}
          loadWind={loadWind}
          location={standaloneWindScenario.location}
        />
      );

      await waitFor(
        () => {
          expect(Object.keys(spy.mock.calls[0][0])).toHaveLength(2);
          const curves = spy.mock.calls[0][0];
          expect(curves["Power Plant Duration Curve"]).toHaveLength(8760);
          curves["Power Plant Duration Curve"].forEach((val, index) => {
            expect(val).toEqual(windGeneratorDurationCurve[index]);
          });

          expect(curves["Electrolyser Duration Curve"]).toHaveLength(8760);
          curves["Electrolyser Duration Curve"].forEach((val, index) => {
            expect(val).toEqual(windElectrolyserDurationCurve[index]);
          });
        },
        { timeout: TIMEOUT }
      );
    });

    it("Hydrogen model: calculates duration curves as 8760 percentages for wind with PPA agreement", async () => {
      render(
        <WorkingData
          inputConfiguration="Advanced"
          data={windWithPPAScenario.data}
          loadSolar={loadSolar}
          loadWind={loadWind}
          location={windWithPPAScenario.location}
        />
      );
      await waitFor(
        () => {
          expect(Object.keys(spy.mock.calls[0][0])).toHaveLength(2);
          const curves = spy.mock.calls[0][0];
          expect(curves["Power Plant Duration Curve"]).toHaveLength(8760);
          curves["Power Plant Duration Curve"].forEach((val, index) => {
            expect(val).toEqual(windPPAGeneratorDurationCurve[index]);
          });

          expect(curves["Electrolyser Duration Curve"]).toHaveLength(8760);
          curves["Electrolyser Duration Curve"].forEach((val, index) => {
            expect(val).toEqual(windPPAElectrolyserDurationCurve[index]);
          });
        },
        { timeout: TIMEOUT }
      );
    });

    it("Hydrogen model: calculates duration curves as 8760 percentages for hybrid with battery and surplus retail", async () => {
      render(
        <WorkingData
          inputConfiguration="Advanced"
          data={hybridBatteryGridOversizeRatioScenario.data}
          loadSolar={loadSolar}
          loadWind={loadWind}
          location={hybridBatteryGridOversizeRatioScenario.location}
        />
      );
      await waitFor(
        () => {
          expect(Object.keys(spy.mock.calls[0][0])).toHaveLength(2);
          const curves = spy.mock.calls[0][0];
          expect(curves["Power Plant Duration Curve"]).toHaveLength(8760);
          curves["Power Plant Duration Curve"].forEach((val, index) => {
            expect(val).toEqual(
              hybridBatteryOversizeRatioGeneratorDurationCurve[index]
            );
          });

          expect(curves["Electrolyser Duration Curve"]).toHaveLength(8760);
          curves["Electrolyser Duration Curve"].forEach((val, index) => {
            expect(val).toBeCloseTo(
              hybridBatteryOversizeRatioElectrolyserDurationCurve[index],
              8
            );
          });
        },
        { timeout: TIMEOUT }
      );
    });

    it("Hydrogen model: calculates duration curves as 8760 percentages for wind with battery and ppa agreement", async () => {
      render(
        <WorkingData
          inputConfiguration="Advanced"
          data={windWithBatteryAndPPAScenario.data}
          loadSolar={loadSolar}
          loadWind={loadWind}
          location={windWithBatteryAndPPAScenario.location}
        />
      );

      await waitFor(
        () => {
          expect(Object.keys(spy.mock.calls[0][0])).toHaveLength(2);
          const curves = spy.mock.calls[0][0];
          expect(curves["Power Plant Duration Curve"]).toHaveLength(8760);
          curves["Power Plant Duration Curve"].forEach((val, index) => {
            expect(val).toEqual(windBatteryPPAGeneratorDurationCurve[index]);
          });

          expect(curves["Electrolyser Duration Curve"]).toHaveLength(8760);
          curves["Electrolyser Duration Curve"].forEach((val, index) => {
            expect(val).toBeCloseTo(
              windBatteryPPAElectrolyserDurationCurve[index],
              8
            );
          });
        },
        { timeout: TIMEOUT }
      );
    });
  });

  it("Hydrogen model: calculates duration curves as 8760 percentages for hybrid with degradation", async () => {
    render(
      <WorkingData
        inputConfiguration="Advanced"
        data={standaloneHybridWithDegradationScenario.data}
        loadSolar={loadSolar}
        loadWind={loadWind}
        location={standaloneHybridWithDegradationScenario.location}
      />
    );
    await waitFor(
      () => {
        expect(Object.keys(spy.mock.calls[0][0])).toHaveLength(2);
        const curves = spy.mock.calls[0][0];
        expect(curves["Power Plant Duration Curve"]).toHaveLength(8760);
        curves["Power Plant Duration Curve"].forEach((val, index) => {
          expect(val).toEqual(hybridDegradationGeneratorDurationCurve[index]);
        });

        expect(curves["Electrolyser Duration Curve"]).toHaveLength(8760);
        curves["Electrolyser Duration Curve"].forEach((val, index) => {
          expect(val).toEqual(
            hybridDegradationElectrolyserDurationCurve[index]
          );
        });
      },
      { timeout: TIMEOUT }
    );
  });

  it("Ammonia model: calculates duration curves as 8760 percentages for solar", async () => {
    render(
      <WorkingData
        inputConfiguration="Advanced"
        data={standaloneAmmoniaSolarScenario.data}
        loadSolar={loadSolar}
        loadWind={loadWind}
        location={standaloneAmmoniaSolarScenario.location}
      />
    );
    await waitFor(
      () => {
        expect(Object.keys(spy.mock.calls[0][0])).toHaveLength(3);
        const curves = spy.mock.calls[0][0];
        expect(curves["Power Plant Duration Curve"]).toHaveLength(8760);
        curves["Power Plant Duration Curve"].forEach((val, index) => {
          expect(val).toEqual(ammoniaSolarGeneratorDurationCurve[index]);
        });

        expect(curves["Electrolyser Duration Curve"]).toHaveLength(8760);
        curves["Electrolyser Duration Curve"].forEach((val, index) => {
          expect(val).toBeCloseTo(
            ammoniaSolarElectrolyserDurationCurve[index],
            8
          );
        });

        expect(curves["Ammonia Duration Curve"]).toHaveLength(8760);
        curves["Ammonia Duration Curve"].forEach((val, index) => {
          expect(val).toBeCloseTo(ammoniaSolarAmmoniaDurationCurve[index], 8);
        });
      },
      { timeout: TIMEOUT }
    );
  });

  it("Ammonia model: calculates duration curves as 8760 percentages for solar with battery", async () => {
    render(
      <WorkingData
        inputConfiguration="Advanced"
        data={standaloneAmmoniaSolarWithBatteryScenario.data}
        loadSolar={loadSolar}
        loadWind={loadWind}
        location={standaloneAmmoniaSolarWithBatteryScenario.location}
      />
    );
    await waitFor(
      () => {
        expect(Object.keys(spy.mock.calls[0][0])).toHaveLength(3);
        const curves = spy.mock.calls[0][0];
        expect(curves["Power Plant Duration Curve"]).toHaveLength(8760);
        curves["Power Plant Duration Curve"].forEach((val, index) => {
          expect(val).toEqual(
            ammoniaSolarGeneratorDurationCurveWithBattery[index]
          );
        });

        expect(curves["Electrolyser Duration Curve"]).toHaveLength(8760);
        curves["Electrolyser Duration Curve"].forEach((val, index) => {
          expect(val).toBeCloseTo(
            ammoniaSolarElectrolyserDurationCurveWithBattery[index],
            8
          );
        });
        expect(curves["Ammonia Duration Curve"]).toHaveLength(8760);
        curves["Ammonia Duration Curve"].forEach((val, index) => {
          expect(val).toBeCloseTo(
            ammoniaSolarAmmoniaDurationCurveWithBattery[index],
            8
          );
        });
      },
      { timeout: TIMEOUT }
    );
  });

  it("Methanol model: calculates duration curves as 8760 percentages for hybrid with battery", async () => {
    render(
      <WorkingData
        inputConfiguration="Advanced"
        data={standaloneMethanolHybridWithBatteryScenario.data}
        loadSolar={loadSolar}
        loadWind={loadWind}
        location={"South West NSW"}
      />
    );
    await waitFor(
      () => {
        expect(Object.keys(spy.mock.calls[0][0])).toHaveLength(3);
        const curves = spy.mock.calls[0][0];
        expect(curves["Power Plant Duration Curve"]).toHaveLength(8760);
        curves["Power Plant Duration Curve"].forEach((val, index) => {
          expect(val).toEqual(
            methanolHybridBatteryGeneratorDurationCurve[index]
          );
        });

        expect(curves["Electrolyser Duration Curve"]).toHaveLength(8760);
        curves["Electrolyser Duration Curve"].forEach((val, index) => {
          expect(val).toBeCloseTo(
            methanolHybridBatteryElectrolyserDurationCurve[index],
            8
          );
        });
        expect(curves["Methanol Duration Curve"]).toHaveLength(8760);
        curves["Methanol Duration Curve"].forEach((val, index) => {
          expect(val).toBeCloseTo(
            methanolHybridBatteryMethanolDurationCurve[index],
            8
          );
        });
      },
      { timeout: TIMEOUT }
    );
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
