import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "../../components/App";
import { readLocalCsv as mockReadLocalCsv } from "../resources/loader";

jest.mock("../../model/DataLoader", () => ({
  __esModule: true,
  loadSolar: async () =>
    await mockReadLocalCsv(__dirname + "/../resources/solar-traces-new.csv"),
  loadWind: async () =>
    await mockReadLocalCsv(__dirname + "/../resources/wind-traces-new.csv"),
  DEFAULT_LOCATION: "Z10",
}));

describe("App", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  beforeAll(() => {
    console.error = function () {};
  });

  it("should generate expected summary of results for default basic inputs", async () => {
    const route = "/design/hydrogen";
    const { container, getByText } = render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(
      () =>
        expect(
          container.querySelectorAll('input[type="number"]').length
        ).toEqual(10),
      { timeout: 2000 }
    );
    fireEvent.click(getByText(/Calculate/i));
    await waitFor(
      () =>
        expect(
          container.querySelector("#summary-of-results-0-value")?.textContent
        ).not.toEqual("0"),
      { timeout: 2000 }
    );

    expect(
      container.querySelector("#key-inputs-electrolyser-capacity")?.textContent
    ).toContain("1,251,548 MW");

    expect(
      container.querySelector("#key-inputs-power-plant-capacity")?.textContent
    ).toContain("2,503,096 MW");

    const expectedKeys: string[] = [
      "Power Plant Capacity Factor",
      "Time Electrolyser is at its Maximum Capacity (% of hrs/yr)",
      "Total Time Electrolyser is Operating (% of hrs/yr)",
      "Electrolyser Capacity Factor",
      "Energy Consumed by Electrolyser (MWh/yr)",
      "Excess Energy Not Utilised by Electrolyser (MWh/yr)",
      "Hydrogen Output (t/yr)",
      "LCH2 ($/kg)",
    ];

    const expectedValues: string[] = [
      "34.15",
      "19.95",
      "93.69",
      "60.8",
      "6,666,000,000",
      "822,397,992",
      "100,000,000",
      "3.93",
    ];

    const EXPECTED_RESULTS = 11;

    [...Array(EXPECTED_RESULTS).keys()].forEach((i) => {
      expect(
        container.querySelector(`#summary-of-results-${i}-key`)?.textContent
      ).toEqual(expectedKeys[i]);

      expect(
        container.querySelector(`#summary-of-results-${i}-value`)?.textContent
      ).toEqual(expectedValues[i]);
    });
  });

  it("should generate expected summary of results for default advanced inputs", async () => {
    const route = "/design/hydrogen";
    const { container, getByText } = render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    );
    fireEvent.click(getByText(/Advanced Input/i));

    await waitFor(
      () =>
        expect(
          container.querySelectorAll('input[type="number"]').length
        ).toEqual(12),
      { timeout: 2000 }
    );
    fireEvent.click(getByText(/Calculate/i));
    await waitFor(
      () =>
        expect(
          container.querySelector("#summary-of-results-0-value")?.textContent
        ).not.toEqual("0"),
      { timeout: 2000 }
    );

    expect(
      container.querySelector("#key-inputs-electrolyser-capacity")?.textContent
    ).toContain("10 MW");

    expect(
      container.querySelector("#key-inputs-power-plant-capacity")?.textContent
    ).toContain("10 MW");

    const expectedKeys: string[] = [
      "Power Plant Capacity Factor",
      "Time Electrolyser is at its Maximum Capacity (% of hrs/yr)",
      "Total Time Electrolyser is Operating (% of hrs/yr)",
      "Electrolyser Capacity Factor",
      "Energy Consumed by Electrolyser (MWh/yr)",
      "Excess Energy Not Utilised by Electrolyser (MWh/yr)",
      "Hydrogen Output (t/yr)",
      "LCH2 ($/kg)",
    ];

    const expectedValues: string[] = [
      "26.94",
      "2.74",
      "43.57",
      "26.73",
      "23,412",
      "184",
      "702",
      "3.02",
    ];

    const EXPECTED_RESULTS = 11;

    [...Array(EXPECTED_RESULTS).keys()].forEach((i) => {
      expect(
        container.querySelector(`#summary-of-results-${i}-key`)?.textContent
      ).toEqual(expectedKeys[i]);

      expect(
        container.querySelector(`#summary-of-results-${i}-value`)?.textContent
      ).toEqual(expectedValues[i]);
    });
  });
});
