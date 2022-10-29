import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "../../components/App";
import { readLocalCsv as mockReadLocalCsv } from "../resources/loader";

jest.mock("../../model/DataLoader", () => ({
  __esModule: true,
  loadSolar: async () =>
    await mockReadLocalCsv(__dirname + "/../resources/solar-traces.csv"),
  loadWind: async () =>
    await mockReadLocalCsv(__dirname + "/../resources/wind-traces.csv"),
  DEFAULT_LOCATION: "Central West NSW",
}));

describe("App", () => {
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
    ).toContain("1,220,465.683");

    expect(
      container.querySelector("#key-inputs-power-plant-capacity")?.textContent
    ).toContain("2,440,931.365");

    const expectedKeys: string[] = [
      "Power Plant Capacity Factor",
      "Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)",
      "Total Time Electrolyser is Operating (% of 8760 hrs/yr)",
      "Electrolyser Capacity Factor",
      "Energy Consumed by Electrolyser (MWh/yr)",
      "Excess Energy Not Utilised by Electrolyser (MWh/yr)",
      "Hydrogen Output [t/yr]",
      "LCH2",
    ];

    const expectedValues: string[] = [
      "33.793",
      "18.059",
      "91.187",
      "62.35",
      "6,666,000,000",
      "559,746,755.67",
      "100,000,000",
      "3.827",
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
    ).toContain("10");

    expect(
      container.querySelector("#key-inputs-power-plant-capacity")?.textContent
    ).toContain("10");

    const expectedKeys: string[] = [
      "Power Plant Capacity Factor",
      "Time Electrolyser is at its Maximum Capacity (% of 8760/hrs)",
      "Total Time Electrolyser is Operating (% of 8760 hrs/yr)",
      "Electrolyser Capacity Factor",
      "Energy Consumed by Electrolyser (MWh/yr)",
      "Excess Energy Not Utilised by Electrolyser (MWh/yr)",
      "Hydrogen Output [t/yr]",
      "LCH2",
    ];

    const expectedValues: string[] = [
      "28.909",
      "0.217",
      "45.468",
      "28.751",
      "25,185.968",
      "138.64",
      "755.655",
      "4.875",
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
