/* eslint-disable testing-library/no-wait-for-multiple-assertions */

import WorkingData from "../../../components/results/WorkingData";
import {TIMEOUT} from "../../consts";
import {readLocalCsv} from "../../resources/loader";
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
import * as summaryOfResults from "../../../components/results/SummaryOfResults"
import {render, waitFor} from "@testing-library/react";

describe("Model summary", () => {
    let loadNationalSolar: () => Promise<any[]>;
    let loadNationalWind: () => Promise<any[]>;
    let loadNSWSolar: () => Promise<any[]>;
    let loadNSWWind: () => Promise<any[]>;
    let spy: jest.SpyInstance<JSX.Element, [summaryTable: { [key: string]: number }]>;

    beforeEach(() => {
        sessionStorage.clear();
        spy = jest.spyOn(summaryOfResults, 'SummaryOfResultsPane')
    });

    beforeAll(() => {
        console.error = function () {
        };
        loadNationalSolar = async () =>
            await readLocalCsv(__dirname + "/../../resources/solar-traces.csv");
        loadNationalWind = async () =>
            await readLocalCsv(__dirname + "/../../resources/wind-traces.csv");

        loadNSWSolar = async () =>
            await readLocalCsv(__dirname + "/../../../../assets/solar.csv");
        loadNSWWind = async () =>
            await readLocalCsv(__dirname + "/../../../../assets/wind.csv");
    });

    describe("Summary of Results", () => {
        it("calculates summary of results for solar", async () => {
            render(
                <WorkingData
                    inputConfiguration="Advanced"
                    data={standaloneSolarScenario.data}
                    location={standaloneSolarScenario.location}
                    loadSolar={loadNationalSolar}
                    loadWind={loadNationalWind}
                />
            );

            await waitFor(() => {
                const data = spy.mock.calls[0][0];
                expect(data["Power Plant Capacity Factor"]).toEqual(31.39);
                expect(
                    data["Time Electrolyser is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(26.97);
                expect(
                    data["Total Time Electrolyser is Operating (% of hrs/yr)"]
                ).toEqual(46.31);
                expect(data["Electrolyser Capacity Factor"]).toEqual(38.89);
                expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toEqual(
                    34_066
                );
                expect(
                    data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
                ).toEqual(7_180);
                expect(data["Hydrogen Output (t/yr)"]).toEqual(681);
                expect(data["LCH2 ($/kg)"]).toEqual(4.46);
            }, {timeout: TIMEOUT});
        });

        it("calculates summary of results for solar with battery", async () => {
            render(
                <WorkingData
                    inputConfiguration="Advanced"
                    data={standaloneSolarWithBatteryScenario.data}
                    location={standaloneSolarWithBatteryScenario.location}
                    loadSolar={loadNationalSolar}
                    loadWind={loadNationalWind}
                />
            );

         await waitFor(() => {
                const data = spy.mock.calls[0][0];

                expect(data["Power Plant Capacity Factor"]).toEqual(29.66);
                expect(
                    data["Time Electrolyser is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(30);
                expect(
                    data["Total Time Electrolyser is Operating (% of hrs/yr)"]
                ).toEqual(54.99);
                expect(data["Electrolyser Capacity Factor"]).toEqual(42.76);
                expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toEqual(37457);
                expect(
                    data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
                ).toEqual(1517);
                expect(data["Hydrogen Output (t/yr)"]).toEqual(696);
                expect(data["LCH2 ($/kg)"]).toEqual(5.6);

                
            }, {timeout: TIMEOUT});
        });

        it("calculates summary of results for wind", async () => {
            render(
                <WorkingData
                    inputConfiguration="Advanced"
                    data={standaloneWindScenario.data}
                    location={standaloneWindScenario.location}
                    loadSolar={loadNationalSolar}
                    loadWind={loadNationalWind}
                />
            );

         await waitFor(() => {
                const data = spy.mock.calls[0][0];

                expect(data["Power Plant Capacity Factor"]).toEqual(38.68);
                expect(
                    data["Time Electrolyser is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(15.11);
                expect(
                    data["Total Time Electrolyser is Operating (% of hrs/yr)"]
                ).toEqual(76.87);
                expect(data["Electrolyser Capacity Factor"]).toEqual(44.63);
                expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toEqual(
                    39_098
                );
                expect(
                    data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
                ).toEqual(1559);
                expect(data["Hydrogen Output (t/yr)"]).toEqual(782);
                expect(data["LCH2 ($/kg)"]).toEqual(3.81);

                
            }, {timeout: TIMEOUT});
        });

        it("calculates summary of results for wind with ppa agreement", async () => {
            render(
                <WorkingData
                    inputConfiguration="Advanced"
                    data={windWithPPAScenario.data}
                    location={windWithPPAScenario.location}
                    loadSolar={loadNationalSolar}
                    loadWind={loadNationalWind}
                />
            );

         await waitFor(() => {
                const data = spy.mock.calls[0][0];

                expect(data["Power Plant Capacity Factor"]).toEqual(28.53);
                expect(
                    data["Time Electrolyser is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(14.7);
                expect(
                    data["Total Time Electrolyser is Operating (% of hrs/yr)"]
                ).toEqual(69.7);
                expect(data["Electrolyser Capacity Factor"]).toEqual(38.67);
                expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toEqual(
                    33_873
                );
                expect(
                    data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
                ).toEqual(3619);
                expect(data["Hydrogen Output (t/yr)"]).toEqual(677);
                expect(data["LCH2 ($/kg)"]).toEqual(2.31);

                
            }, {timeout: TIMEOUT});
        });

        it("calculates summary of results for hybrid with battery, grid and oversize ratio", async () => {
            render(
                <WorkingData
                    inputConfiguration="Advanced"
                    data={hybridBatteryGridOversizeRatioScenario.data}
                    location={hybridBatteryGridOversizeRatioScenario.location}
                    loadSolar={loadNationalSolar}
                    loadWind={loadNationalWind}
                />
            );

         await waitFor(() => {
                const data = spy.mock.calls[0][0];

                expect(data["Power Plant Capacity Factor"]).toEqual(32.52);
                expect(
                    data["Time Electrolyser is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(17.85);
                expect(
                    data["Total Time Electrolyser is Operating (% of hrs/yr)"]
                ).toEqual(83.6);
                expect(data["Electrolyser Capacity Factor"]).toEqual(48.22);
                expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toEqual(
                    42_242
                );
                expect(
                    data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
                ).toEqual(484);
                expect(data["Hydrogen Output (t/yr)"]).toEqual(845);
                expect(data["LCH2 ($/kg)"]).toEqual(5.55);
                
            }, {timeout: TIMEOUT});
        });

        it("calculates summary of results for wind with battery and PPA agreement", async () => {
            render(
                <WorkingData
                    inputConfiguration="Advanced"
                    data={windWithBatteryAndPPAScenario.data}
                    location={windWithBatteryAndPPAScenario.location}
                    loadSolar={loadNationalSolar}
                    loadWind={loadNationalWind}
                />
            );

         await waitFor(() => {
                const data = spy.mock.calls[0][0];

                expect(data["Power Plant Capacity Factor"]).toEqual(32.11);
                expect(
                    data["Time Electrolyser is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(17.92);
                expect(
                    data["Total Time Electrolyser is Operating (% of hrs/yr)"]
                ).toEqual(78.07);
                expect(data["Electrolyser Capacity Factor"]).toEqual(45.74);
                expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toEqual(
                    40_067
                );
                expect(
                    data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
                ).toEqual(2124);
                expect(data["Hydrogen Output (t/yr)"]).toEqual(801);
                expect(data["LCH2 ($/kg)"]).toEqual(2.67);

                
            }, {timeout: TIMEOUT});
        });

        it("calculates summary of results for solar with basic configuration", async () => {
            render(
                <WorkingData
                    inputConfiguration={basicSolarScenario.inputConfiguration}
                    data={basicSolarScenario.data}
                    location={basicSolarScenario.location}
                    loadSolar={loadNSWSolar}
                    loadWind={loadNSWWind}
                />
            );

         await waitFor(() => {
                const data = spy.mock.calls[0][0];

                expect(data["Power Plant Capacity Factor"]).toEqual(22.23);
                expect(
                    data["Time Electrolyser is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(14.86);
                expect(
                    data["Total Time Electrolyser is Operating (% of hrs/yr)"]
                ).toEqual(42.67);
                expect(data["Electrolyser Capacity Factor"]).toEqual(29.29);
                expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toEqual(3_333);
                expect(
                    data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
                ).toEqual(462);
                expect(data["Hydrogen Output (t/yr)"]).toEqual(100);
                expect(data["LCH2 ($/kg)"]).toEqual(4.79);

                
            }, {timeout: TIMEOUT});
        });

        it("calculates summary of results for hybrid PPA with basic configuration", async () => {
            render(
                <WorkingData
                    inputConfiguration={basicHybridPPAScenario.inputConfiguration}
                    data={basicHybridPPAScenario.data}
                    location={basicHybridPPAScenario.location}
                    loadSolar={loadNSWSolar}
                    loadWind={loadNSWWind}
                />
            );

         await waitFor(() => {
                const data = spy.mock.calls[0][0];

                expect(data["Power Plant Capacity Factor"]).toEqual(38.87);
                expect(
                    data["Time Electrolyser is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(21.88);
                expect(
                    data["Total Time Electrolyser is Operating (% of hrs/yr)"]
                ).toEqual(95.62);
                expect(data["Electrolyser Capacity Factor"]).toEqual(71);
                expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toEqual(
                    6_666_000
                );
                expect(
                    data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
                ).toEqual(633_065);
                expect(data["Hydrogen Output (t/yr)"]).toEqual(100_000);
                expect(data["LCH2 ($/kg)"]).toEqual(2.08);

                
            }, {timeout: TIMEOUT});
        });

        it("calculates summary of results for solar with stack degradation", async () => {
            render(
                <WorkingData
                    inputConfiguration="Advanced"
                    data={standaloneSolarWithStackDegradationScenario.data}
                    location={standaloneSolarWithStackDegradationScenario.location}
                    loadSolar={loadNationalSolar}
                    loadWind={loadNationalWind}
                />
            );

         await waitFor(() => {
                const data = spy.mock.calls[0][0];

                expect(data["Power Plant Capacity Factor"]).toEqual(25.79);
                expect(
                    data["Time Electrolyser is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(0.94);
                expect(
                    data["Total Time Electrolyser is Operating (% of hrs/yr)"]
                ).toEqual(42.12);
                expect(data["Electrolyser Capacity Factor"]).toEqual(25.51);
                expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toEqual(
                    22_345
                );
                expect(
                    data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
                ).toEqual(251);
                expect(data["Hydrogen Output (t/yr)"]).toEqual(418);
                expect(data["LCH2 ($/kg)"]).toEqual(5.81);

                
            }, {timeout: TIMEOUT});
        });

        it("calculates summary of results for hybrid with degradation", async () => {
            render(
                <WorkingData
                    inputConfiguration="Advanced"
                    data={standaloneHybridWithDegradationScenario.data}
                    location={standaloneHybridWithDegradationScenario.location}
                    loadSolar={loadNationalSolar}
                    loadWind={loadNationalWind}
                />
            );

         await waitFor(() => {
                const data = spy.mock.calls[0][0];

                expect(data["Power Plant Capacity Factor"]).toEqual(27.74);
                expect(
                    data["Time Electrolyser is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(30.74);
                expect(
                    data["Total Time Electrolyser is Operating (% of hrs/yr)"]
                ).toEqual(85.2);
                expect(data["Electrolyser Capacity Factor"]).toEqual(61.06);
                expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toEqual(
                    53_489
                );
                expect(
                    data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
                ).toEqual(12_118);
                expect(data["Hydrogen Output (t/yr)"]).toEqual(1038);
                expect(data["LCH2 ($/kg)"]).toEqual(4.43);

                
            }, {timeout: TIMEOUT});
        });

        it("calculates summary of results for wind with battery and degradation", async () => {
            render(
                <WorkingData
                    inputConfiguration="Advanced"
                    data={standaloneWindWithBatteryAndDegradationScenario.data}
                    location={standaloneWindWithBatteryAndDegradationScenario.location}
                    loadSolar={loadNationalSolar}
                    loadWind={loadNationalWind}
                />
            );

         await waitFor(() => {
                const data = spy.mock.calls[0][0];

                expect(data["Power Plant Capacity Factor"]).toEqual(36.76);
                expect(
                    data["Time Electrolyser is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(24.06);
                expect(
                    data["Total Time Electrolyser is Operating (% of hrs/yr)"]
                ).toEqual(85.88);
                expect(data["Electrolyser Capacity Factor"]).toEqual(51.7);
                expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toEqual(
                    45_289
                );
                expect(
                    data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
                ).toEqual(3_018);
                expect(data["Hydrogen Output (t/yr)"]).toEqual(867);
                expect(data["LCH2 ($/kg)"]).toEqual(3.84);

                
            }, {timeout: TIMEOUT});
        });

        it("calculates summary of results for ammonia solar", async () => {
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

         await waitFor(() => {
                const data = spy.mock.calls[0][0];

                expect(data["Power Plant Capacity Factor"]).toEqual(24.15);
                expect(
                    data["Time Electrolyser is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(31.79);
                expect(
                    data["Total Time Electrolyser is Operating (% of hrs/yr)"]
                ).toEqual(47.23);
                expect(
                    data["Time Ammonia Plant is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(55.52);
                expect(
                    data["Total Time Ammonia Plant is Operating (% of hrs/yr)"]
                ).toEqual(57.33);
                expect(data["Electrolyser Capacity Factor"]).toEqual(38.81);
                expect(data["Ammonia Capacity Factor"]).toEqual(56.52);
                expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toEqual(
                    166_196
                );
                expect(
                    data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
                ).toEqual(165_552);
                expect(data["Hydrogen Output (t/yr)"]).toEqual(4991);
                expect(data["Ammonia Output (TPA)"]).toEqual(28_338);
                expect(data["LCH2 ($/kg)"]).toEqual(9.99);
                expect(data["LCNH3 ($/kg)"]).toEqual(1.76);

                
            }, {timeout: TIMEOUT});
        });

        it("calculates summary of results for ammonia hybrid with battery and degradation", async () => {
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

         await waitFor(() => {
                const data = spy.mock.calls[0][0];

                expect(data["Power Plant Capacity Factor"]).toEqual(32.21);
                expect(
                    data["Time Electrolyser is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(39.69);
                expect(
                    data["Total Time Electrolyser is Operating (% of hrs/yr)"]
                ).toEqual(99.8);
                expect(
                    data["Time Ammonia Plant is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(93.65); // check why ammonia is mismatched
                expect(
                    data["Total Time Ammonia Plant is Operating (% of hrs/yr)"]
                ).toEqual(96.44);
                expect(data["Electrolyser Capacity Factor"]).toEqual(1037.57);
                expect(data["Ammonia Capacity Factor"]).toEqual(95.55);
                expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toEqual(
                    13_344_422
                );
                expect(
                    data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
                ).toEqual(-12_026_316);
                expect(data["Hydrogen Output (t/yr)"]).toEqual(256_449);
                expect(data["Ammonia Output (TPA)"]).toEqual(95_810);
                expect(data["LCH2 ($/kg)"]).toEqual(0.54);
                expect(data["LCNH3 ($/kg)"]).toEqual(1.45);

                
            }, {timeout: TIMEOUT});
        });

        it("calculates summary of results for methanol hybrid with battery", async () => {
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

         await waitFor(() => {
                const data = spy.mock.calls[0][0];

                expect(data["Power Plant Capacity Factor"]).toEqual(40.42);
                expect(
                    data["Time Electrolyser is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(60.2);
                expect(
                    data["Total Time Electrolyser is Operating (% of hrs/yr)"]
                ).toEqual(97.37);
                expect(
                    data["Time Methanol Plant is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(91.87);
                expect(
                    data["Total Time Methanol Plant is Operating (% of hrs/yr)"]
                ).toEqual(91.87);
                expect(data["Electrolyser Capacity Factor"]).toEqual(83.78);
                expect(data["Methanol Capacity Factor"]).toEqual(91.87);
                expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toEqual(
                    4_496_287
                );
                expect(
                    data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
                ).toEqual(2_120_876);
                expect(data["Hydrogen Output (t/yr)"]).toEqual(74_938);
                expect(data["Methanol Output (TPA)"]).toEqual(336_250);
                expect(data["LCH2 ($/kg)"]).toEqual(9);
                expect(data["LCMeOH ($/kg)"]).toEqual(2.01);

                
            }, {timeout: TIMEOUT});
        });

        it("calculates summary of results for methane wind with battery and degradation", async () => {
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

            await waitFor(() => {
                const data = spy.mock.calls[0][0];

                expect(data["Power Plant Capacity Factor"]).toEqual(37.24);
                expect(
                    data["Time Electrolyser is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(43.25);
                expect(
                    data["Total Time Electrolyser is Operating (% of hrs/yr)"]
                ).toEqual(97.93);
                expect(
                    data["Time Methane Plant is at its Maximum Capacity (% of hrs/yr)"]
                ).toEqual(69.49);
                expect(
                    data["Total Time Methane Plant is Operating (% of hrs/yr)"]
                ).toEqual(70.58);
                expect(data["Electrolyser Capacity Factor"]).toEqual(73.57);
                expect(data["Methane Capacity Factor"]).toEqual(70.51);
                expect(data["Energy Consumed by Electrolyser (MWh/yr)"]).toEqual(
                    9_604_273
                );
                expect(
                    data["Excess Energy Not Utilised by Electrolyser (MWh/yr)"]
                ).toEqual(3_710_175);
                expect(data["Hydrogen Output (t/yr)"]).toEqual(183_611);
                expect(data["Methane Output (TPA)"]).toEqual(282_816);
                expect(data["LCH2 ($/kg)"]).toEqual(6.77);
                expect(data["LCSNG ($/kg)"]).toEqual(4.32);
                
            }, {timeout: TIMEOUT});
        });
    });
});
