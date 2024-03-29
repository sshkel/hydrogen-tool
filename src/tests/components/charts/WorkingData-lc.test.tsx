/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import { render, waitFor } from "@testing-library/react";

import * as levelisedCost from "../../../components/results/LevelisedCost";
import WorkingData from "../../../components/results/WorkingData";
import { TIMEOUT } from "../../consts";
import { readLocalCsv } from "../../resources/loader";
import {
  basicHybridPPAScenario,
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

jest.setTimeout(20_000);

describe("Working Data calculations", () => {
  let loadNationalSolar: () => Promise<any[]>;
  let loadNationalWind: () => Promise<any[]>;
  let loadNSWSolar: () => Promise<any[]>;
  let loadNSWWind: () => Promise<any[]>;
  let spy: jest.SpyInstance<
    JSX.Element,
    [lcBreakdownData: { [key: string]: number }, powerfuel: string]
  >;
  beforeEach(() => {
    sessionStorage.clear();
    spy = jest.spyOn(levelisedCost, "LcBreakdownPane");
  });

  beforeAll(() => {
    console.error = function () {};
    loadNationalSolar = async () =>
      await readLocalCsv(__dirname + "/../../resources/solar-traces.csv");
    loadNationalWind = async () =>
      await readLocalCsv(__dirname + "/../../resources/wind-traces.csv");

    loadNSWSolar = async () =>
      await readLocalCsv(__dirname + "/../../../../public/assets/solar.csv");
    loadNSWWind = async () =>
      await readLocalCsv(__dirname + "/../../../../public/assets/wind.csv");
  });

  describe("LC", () => {
    it("calculates lch2 for solar", async () => {
      render(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneSolarScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={standaloneSolarScenario.location}
        />
      );

      const costBreakDown: { [key: string]: number } = {
        "Additional Costs": 0,
        "Battery Cost": 0,
        "Electricity Purchase": 0,
        "Electrolyser CAPEX": 1.385,
        "Electrolyser O&M": 0.367,
        "Grid Connection Cost": 0,
        "Indirect Costs": 0,
        "Power Plant CAPEX": 2.078,
        "Power Plant OPEX": 0.374,
        "Stack Replacement": 0.201,
        "Water Cost": 0.05,
      };

      await waitFor(
        () => {
          expect(spy.mock.calls[0]).toHaveLength(2);
          const actualCost = spy.mock.calls[0][0];
          Object.keys(actualCost).forEach((key: string) =>
            expect(actualCost[key as keyof typeof actualCost]).toBeCloseTo(
              costBreakDown[key],
              2
            )
          );
        },
        { timeout: TIMEOUT }
      );
    });

    it("calculates lch2 for solar with battery", async () => {
      render(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneSolarWithBatteryScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={standaloneSolarWithBatteryScenario.location}
        />
      );

      const costBreakDown: { [key: string]: number } = {
        "Power Plant CAPEX": 1.62,
        "Electrolyser CAPEX": 1.41,
        "Indirect Costs": 0.03,
        "Power Plant OPEX": 0.37,
        "Electrolyser O&M": 0.37,
        "Electricity Purchase": 0,
        "Stack Replacement": 0.23,
        "Water Cost": 0.05,
        "Battery Cost": 1.44,
        "Grid Connection Cost": 0,
        "Additional Costs": 0.03,
      };

      await waitFor(
        () => {
          expect(spy.mock.calls[0]).toHaveLength(2);
          const actualCost = spy.mock.calls[0][0];
          Object.keys(actualCost).forEach((key: string) =>
            expect(actualCost[key as keyof typeof actualCost]).toBeCloseTo(
              costBreakDown[key],
              2
            )
          );
        },
        { timeout: TIMEOUT }
      );
    });

    it("calculates lch2 for wind", async () => {
      render(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneWindScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={standaloneWindScenario.location}
        />
      );

      const costBreakDown: { [key: string]: number } = {
        "Power Plant CAPEX": 1.45,
        "Electrolyser CAPEX": 1.21,
        "Indirect Costs": 0,
        "Power Plant OPEX": 0.38,
        "Electrolyser O&M": 0.32,
        "Electricity Purchase": 0,
        "Stack Replacement": 0.41,
        "Water Cost": 0.05,
        "Battery Cost": 0,
        "Grid Connection Cost": 0,
        "Additional Costs": 0,
      };
      await waitFor(
        () => {
          expect(spy.mock.calls[0]).toHaveLength(2);
          const actualCost = spy.mock.calls[0][0];
          Object.keys(actualCost).forEach((key: string) =>
            expect(actualCost[key as keyof typeof actualCost]).toBeCloseTo(
              costBreakDown[key],
              2
            )
          );
        },
        { timeout: TIMEOUT }
      );
    });

    it("calculates lch2 for wind with ppa agreement", async () => {
      render(
        <WorkingData
          inputConfiguration="Advanced"
          data={windWithPPAScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={windWithPPAScenario.location}
        />
      );

      const costBreakDown: { [key: string]: number } = {
        "Power Plant CAPEX": 0,
        "Electrolyser CAPEX": 1.393,
        "Indirect Costs": 0,
        "Power Plant OPEX": 0,
        "Electrolyser O&M": 0.369,
        "Electricity Purchase": 0.15,
        "Stack Replacement": 0.283,
        "Water Cost": 0.05,
        "Battery Cost": 0,
        "Grid Connection Cost": 0.014,
        "Additional Costs": 0,
      };

      await waitFor(
        () => {
          expect(spy.mock.calls[0]).toHaveLength(2);
          const actualCost = spy.mock.calls[0][0];
          Object.keys(actualCost).forEach((key: string) =>
            expect(actualCost[key as keyof typeof actualCost]).toBeCloseTo(
              costBreakDown[key],
              2
            )
          );
        },
        { timeout: TIMEOUT }
      );
    });

    it("calculates lch2 for hybrid with battery, grid and oversize ratio", async () => {
      render(
        <WorkingData
          inputConfiguration="Advanced"
          data={hybridBatteryGridOversizeRatioScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={hybridBatteryGridOversizeRatioScenario.location}
        />
      );

      const costBreakDown: { [key: string]: number } = {
        "Power Plant CAPEX": 1.676,
        "Electrolyser CAPEX": 1.117,
        "Indirect Costs": 0,
        "Power Plant OPEX": 0.349,
        "Electrolyser O&M": 0.296,
        "Electricity Purchase": 0,
        "Stack Replacement": 0.385,
        "Water Cost": 0.05,
        "Battery Cost": 1.617,
        "Grid Connection Cost": 0.064,
        "Additional Costs": 0,
      };
      await waitFor(
        () => {
          expect(spy.mock.calls[0]).toHaveLength(2);
          const actualCost = spy.mock.calls[0][0];
          Object.keys(actualCost).forEach((key: string) =>
            expect(actualCost[key as keyof typeof actualCost]).toBeCloseTo(
              costBreakDown[key],
              2
            )
          );
        },
        { timeout: TIMEOUT }
      );
    });

    it("calculates lch2 for wind with battery and PPA agreement", async () => {
      render(
        <WorkingData
          inputConfiguration="Advanced"
          data={windWithBatteryAndPPAScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={windWithBatteryAndPPAScenario.location}
        />
      );

      const costBreakDown: { [key: string]: number } = {
        "Power Plant CAPEX": 0,
        "Electrolyser CAPEX": 1.178,
        "Indirect Costs": 0,
        "Power Plant OPEX": 0,
        "Electrolyser O&M": 0.312,
        "Electricity Purchase": 0,
        "Stack Replacement": 0.396,
        "Water Cost": 0.05,
        "Battery Cost": 0.681,
        "Grid Connection Cost": 0,
        "Additional Costs": 0,
      };
      await waitFor(
        () => {
          expect(spy.mock.calls[0]).toHaveLength(2);
          const actualCost = spy.mock.calls[0][0];
          Object.keys(actualCost).forEach((key: string) =>
            expect(actualCost[key as keyof typeof actualCost]).toBeCloseTo(
              costBreakDown[key],
              2
            )
          );
        },
        { timeout: TIMEOUT }
      );
    });

    it("calculates lch2 for solar with basic configuration", async () => {
      render(
        <WorkingData
          inputConfiguration={basicSolarScenario.inputConfiguration}
          data={basicSolarScenario.data}
          loadSolar={loadNSWSolar}
          loadWind={loadNSWWind}
          location={basicSolarScenario.location}
        />
      );

      const costBreakDown: { [key: string]: number } = {
        "Power Plant CAPEX": 1.765,
        "Electrolyser CAPEX": 1.199,
        "Indirect Costs": 1.067,
        "Power Plant OPEX": 0.33,
        "Electrolyser O&M": 0.32,
        "Electricity Purchase": 0,
        "Stack Replacement": 0,
        "Water Cost": 0.075,
        "Battery Cost": 0,
        "Grid Connection Cost": 0,
        "Additional Costs": 0,
      };
      await waitFor(
        () => {
          expect(spy.mock.calls[0]).toHaveLength(2);
          const actualCost = spy.mock.calls[0][0];
          Object.keys(actualCost).forEach((key: string) =>
            expect(actualCost[key as keyof typeof actualCost]).toBeCloseTo(
              costBreakDown[key],
              2
            )
          );
        },
        { timeout: TIMEOUT }
      );
    });

    it("calculates lch2 for solar with stack degradation", async () => {
      render(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneSolarWithStackDegradationScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={standaloneSolarWithStackDegradationScenario.location}
        />
      );

      const costBreakDown: { [key: string]: number } = {
        "Power Plant CAPEX": 2.24,
        "Electrolyser CAPEX": 2.24,
        "Indirect Costs": 0,
        "Power Plant OPEX": 0.4,
        "Electrolyser O&M": 0.59,
        "Electricity Purchase": 0,
        "Stack Replacement": 0.28,
        "Water Cost": 0.05,
        "Battery Cost": 0,
        "Grid Connection Cost": 0,
        "Additional Costs": 0,
      };
      await waitFor(
        () => {
          expect(spy.mock.calls[0]).toHaveLength(2);
          const actualCost = spy.mock.calls[0][0];
          Object.keys(actualCost).forEach((key: string) =>
            expect(actualCost[key as keyof typeof actualCost]).toBeCloseTo(
              costBreakDown[key],
              2
            )
          );
        },
        { timeout: TIMEOUT }
      );
    });

    it("calculates lch2 for hybrid with degradation", async () => {
      render(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneHybridWithDegradationScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={standaloneHybridWithDegradationScenario.location}
        />
      );

      const costBreakDown: { [key: string]: number } = {
        "Power Plant CAPEX": 2.402,
        "Electrolyser CAPEX": 0.89,
        "Indirect Costs": 0,
        "Power Plant OPEX": 0.523,
        "Electrolyser O&M": 0.236,
        "Electricity Purchase": 0,
        "Stack Replacement": 0.328,
        "Water Cost": 0.05,
        "Battery Cost": 0,
        "Grid Connection Cost": 0,
        "Additional Costs": 0,
      };
      await waitFor(
        () => {
          expect(spy.mock.calls[0]).toHaveLength(2);
          const actualCost = spy.mock.calls[0][0];
          Object.keys(actualCost).forEach((key: string) =>
            expect(actualCost[key as keyof typeof actualCost]).toBeCloseTo(
              costBreakDown[key],
              2
            )
          );
        },
        { timeout: TIMEOUT }
      );
    });

    it("calculates lch2 for wind with battery and degradation", async () => {
      render(
        <WorkingData
          inputConfiguration="Advanced"
          data={standaloneWindWithBatteryAndDegradationScenario.data}
          loadSolar={loadNationalSolar}
          loadWind={loadNationalWind}
          location={standaloneWindWithBatteryAndDegradationScenario.location}
        />
      );

      const costBreakDown: { [key: string]: number } = {
        "Power Plant CAPEX": 1.451,
        "Electrolyser CAPEX": 0.967,
        "Indirect Costs": 0,
        "Power Plant OPEX": 0.423,
        "Electrolyser O&M": 0.282,
        "Electricity Purchase": 0,
        "Stack Replacement": 0.271,
        "Water Cost": 0.05,
        "Battery Cost": 0.392,
        "Grid Connection Cost": 0,
        "Additional Costs": 0,
      };
      await waitFor(
        () => {
          expect(spy.mock.calls[0]).toHaveLength(2);
          const actualCost = spy.mock.calls[0][0];
          Object.keys(actualCost).forEach((key: string) =>
            expect(actualCost[key as keyof typeof actualCost]).toBeCloseTo(
              costBreakDown[key],
              2
            )
          );
        },
        { timeout: TIMEOUT }
      );
    });

    it("calculates lch2 for basic hybrid with ppa agreement", async () => {
      render(
        <WorkingData
          inputConfiguration={basicHybridPPAScenario.inputConfiguration}
          data={basicHybridPPAScenario.data}
          loadSolar={loadNSWSolar}
          loadWind={loadNSWWind}
          location={basicHybridPPAScenario.location}
        />
      );

      const costBreakDown: { [key: string]: number } = {
        "Power Plant CAPEX": 0,
        "Electrolyser CAPEX": 0.727,
        "Indirect Costs": 0.264,
        "Power Plant OPEX": 0,
        "Electrolyser O&M": 0.194,
        "Electricity Purchase": 0.667,
        "Stack Replacement": 0.149,
        "Water Cost": 0.075,
        "Battery Cost": 0,
        "Grid Connection Cost": 0,
        "Additional Costs": 0,
      };
      await waitFor(
        () => {
          expect(spy.mock.calls[0]).toHaveLength(2);
          const actualCost = spy.mock.calls[0][0];
          Object.keys(actualCost).forEach((key: string) =>
            expect(actualCost[key as keyof typeof actualCost]).toBeCloseTo(
              costBreakDown[key],
              2
            )
          );
        },
        { timeout: TIMEOUT }
      );
    });

    it("calculates lcnh3 for ammonia solar", async () => {
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

      const costBreakDown: { [key: string]: number } = {
        "Power Plant CAPEX": 0.56,
        "Electrolyser CAPEX": 0.446,
        "H2 Storage CAPEX": 0.16,
        "Ammonia Plant CAPEX": 0.156,
        "Indirect Costs": 0,
        "Power Plant OPEX": 0.07,
        "Electrolyser OPEX": 0.118,
        "H2 Storage OPEX": 0.034,
        "Ammonia Plant OPEX": 0.033,
        "Electricity Purchase": 0,
        "Stack Replacement": 0.065,
        "Water Cost": 0.009,
        "Battery Cost": 0,
        "Grid Connection Cost": 0,
        "Additional Costs": 0,
      };
      await waitFor(
        () => {
          expect(spy.mock.calls[0]).toHaveLength(2);
          const actualCost = spy.mock.calls[0][0];
          Object.keys(actualCost).forEach((key: string) =>
            expect(actualCost[key as keyof typeof actualCost]).toBeCloseTo(
              costBreakDown[key],
              2
            )
          );
        },
        { timeout: TIMEOUT }
      );
    });

    it("calculates lch2 for ammonia hybrid with battery and degradation", async () => {
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

      const costBreakDown: { [key: string]: number } = {
        "Power Plant CAPEX": 0.507,
        "Electrolyser CAPEX": 0.152,
        "H2 Storage CAPEX": 0.065,
        "Ammonia Plant CAPEX": 0.111,
        "Indirect Costs": 0.225,
        "Power Plant OPEX": 0.09,
        "Electrolyser OPEX": 0.04,
        "H2 Storage OPEX": 0.014,
        "Ammonia Plant OPEX": 0.024,
        "Electricity Purchase": 0,
        "Stack Replacement": 0.048,
        "Water Cost": 0.014,
        "Battery Cost": 0.009,
        "Grid Connection Cost": 0,
        "Additional Costs": 0,
      };
      await waitFor(
        () => {
          expect(spy.mock.calls[0]).toHaveLength(2);
          const actualCost = spy.mock.calls[0][0];
          Object.keys(actualCost).forEach((key: string) =>
            expect(actualCost[key as keyof typeof actualCost]).toBeCloseTo(
              costBreakDown[key],
              2
            )
          );
        },
        { timeout: TIMEOUT }
      );
    });

    it("calculates lch2 for methanol hybrid with battery", async () => {
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

      const costBreakDown: { [key: string]: number } = {
        "Power Plant CAPEX": 0.688,
        "Electrolyser CAPEX": 0.631,
        "H2 Storage CAPEX": 0.018,
        "Methanol Plant CAPEX": 0.041,
        "Carbon Capture CAPEX": 0.093,
        "Indirect Costs": 0.427,
        "Power Plant OPEX": 0.127,
        "Electrolyser OPEX": 0.184,
        "H2 Storage OPEX": 0.005,
        "Methanol Plant OPEX": 0.024,
        "Carbon Capture OPEX": 0.054,
        "Electricity Purchase": 0,
        "Stack Replacement": 0.296,
        "Water Cost": 0.014,
        "Battery Cost": 0.17,
        "Grid Connection Cost": 0,
        "Additional Costs": 0,
      };
      await waitFor(
        () => {
          expect(spy.mock.calls[0]).toHaveLength(2);
          const actualCost = spy.mock.calls[0][0];

          Object.keys(actualCost).forEach((key: string) =>
            expect(actualCost[key as keyof typeof actualCost]).toBeCloseTo(
              costBreakDown[key],
              2
            )
          );
        },
        { timeout: TIMEOUT }
      );
    });

    it("calculates lch2 for grid connected methane with wind battery and degradation", async () => {
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

      const costBreakDown: { [key: string]: number } = {
        "Power Plant CAPEX": 1.865,
        "Electrolyser CAPEX": 1.057,
        "H2 Storage CAPEX": 0.033,
        "Methane Plant CAPEX": 0.111,
        "Carbon Capture CAPEX": 1.232,
        "Indirect Costs": 0.915,
        "Power Plant OPEX": 0.455,
        "Electrolyser OPEX": 0.298,
        "H2 Storage OPEX": 0.004,
        "Methane Plant OPEX": 0.062,
        "Carbon Capture OPEX": 0.694,
        "Electricity Purchase": 0,
        "Stack Replacement": 0.259,
        "Water Cost": 0.062,
        "Battery Cost": 0.189,
        "Grid Connection Cost": 0.52,
        "Additional Costs": 0,
      };
      await waitFor(
        () => {
          expect(spy.mock.calls[0]).toHaveLength(2);
          const actualCost = spy.mock.calls[0][0];
          Object.keys(actualCost).forEach((key: string) =>
            expect(actualCost[key as keyof typeof actualCost]).toBeCloseTo(
              costBreakDown[key],
              2
            )
          );
        },
        { timeout: TIMEOUT }
      );
    });
  });
});
