import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";

import App from "../../components/App";
import { readLocalCsv as mockReadLocalCsv } from "../resources/loader";

jest.mock("../../model/DataLoader", () => ({
  __esModule: true,
  loadSolar: async () =>
    await mockReadLocalCsv(__dirname + "/../../../assets/solar.csv"),
  loadWind: async () =>
    await mockReadLocalCsv(__dirname + "/../../../assets/wind.csv"),
  DEFAULT_LOCATION: "Z10",
}));

describe("App", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  beforeAll(() => {
    console.error = function () {};
  });

  it("should generate expected summary of results for default hydrogen basic inputs", async () => {
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
    ).toContain("1,223 MW");

    expect(
      container.querySelector("#key-inputs-power-plant-capacity")?.textContent
    ).toContain("2,447 MW");

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
      "33.45",
      "17.11",
      "96.69",
      "62.03",
      "6,666,000",
      "524,354",
      "100,000",
      "5.15",
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

  it("should generate expected summary of results for default hydrogen advanced inputs", async () => {
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
      "43.75",
      "0.07",
      "86.54",
      "43.12",
      "37,874",
      "553",
      "1,136",
      "4.36",
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

  it("should generate expected summary of results for default methanol advanced inputs", async () => {
    const route = "/design/methanol";
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
    ).toContain("400 MW");

    expect(
      container.querySelector("#key-inputs-power-plant-capacity")?.textContent
    ).toContain("1,401 MW");

    const expectedKeys: string[] = [
      "Power Plant Capacity Factor",
      "Time Electrolyser is at its Maximum Capacity (% of hrs/yr)",
      "Total Time Electrolyser is Operating (% of hrs/yr)",
      "Time Methanol Plant is at its Maximum Capacity (% of hrs/yr)",
      "Total Time Methanol Plant is Operating (% of hrs/yr)",
      "Electrolyser Capacity Factor",
      "Methanol Capacity Factor",
      "Energy Consumed by Electrolyser (MWh/yr)",
      "Excess Energy Not Utilised by Electrolyser (MWh/yr)",
      "Hydrogen Output (t/yr)",
      "Methanol Output (TPA)",
      "LCH2 ($/kg)",
      "LCMeOH ($/kg)",
    ];

    const expectedValues: string[] = [
      "43.75",
      "59.46",
      "92.71",
      "87.66",
      "87.66",
      "76.25",
      "87.66",
      "2,679,831",
      "2,702,500",
      "80,403",
      "320,833",
      "5.36",
      "1.34",
    ];

    const EXPECTED_RESULTS = 13;

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
