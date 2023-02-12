import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

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
    await waitFor(
        () =>
    expect(
      container.querySelector("#key-inputs-electrolyser-capacity")?.textContent
    ).toContain("136 MW"),{ timeout: 2000 }
  );

    expect(
      container.querySelector("#key-inputs-power-plant-capacity")?.textContent
    ).toContain("204 MW");

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
      "23.99",
      "90.52",
      "59.76",
      "714,214",
      "69,999",
      "15,000",
      "5.72",
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
      await waitFor(
          () =>
    expect(
      container.querySelector("#key-inputs-electrolyser-capacity")?.textContent
    ).toContain("100 MW"),{ timeout: 2000 });

    expect(
      container.querySelector("#key-inputs-power-plant-capacity")?.textContent
    ).toContain("150 MW");

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
      "23.99",
      "90.52",
      "59.76",
      "524,955",
      "51,450",
      "10,499",
      "6.83",
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

  it("should reuse submitted values when renavigating to the input page", async () => {
    const route = "/design/hydrogen";
    const { container, getByText, getByLabelText } = render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    );
    fireEvent.click(getByText(/Advanced Input/i));

    fireEvent.click(getByLabelText(/power-plant-parameters-show-more/i));

    // Open hybrid panel
    await waitFor(() => expect(getByText(/Hybrid/i)).toBeDefined());

    fireEvent.click(getByText(/Hybrid/i));

    await waitFor(
      () =>
        expect(
          container.querySelectorAll('input[type="number"]').length
        ).toEqual(21),
      { timeout: 1000 }
    );

    // Select nominal capacity
    fireEvent.click(getByText(/Nominal Capacity/i));

    await waitFor(
      () =>
        expect(
          container.querySelectorAll('input[type="number"]').length
        ).toEqual(21),
      { timeout: 1000 }
    );

    // Set solar nominal capacity to 200
    fireEvent.change(getByLabelText(/solarNominalCapacity/i), {
      target: { value: 200 },
    });

    // Set capacity ratio to 300
    fireEvent.change(getByLabelText(/windNominalCapacity/i), {
      target: { value: 300 },
    });

    fireEvent.click(getByText(/Calculate/i));
    await waitFor(
      () =>
        expect(
          container.querySelector("#summary-of-results-0-value")?.textContent
        ).not.toEqual("0"),
      { timeout: 2000 }
    );

    const {
      container: containerRefreshed,
      getByText: getByTextRefreshed,
      getByLabelText: getByLabelTextRefreshed,
    } = render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(
      () =>
        expect(
          containerRefreshed.querySelectorAll('input[type="number"]').length
        ).toEqual(10),
      { timeout: 2000 }
    );

    fireEvent.click(getByTextRefreshed(/Advanced Input/i));

    fireEvent.click(
      getByLabelTextRefreshed(/power-plant-parameters-show-more/i)
    );

    // Open hybrid panel
    await waitFor(() => expect(getByTextRefreshed(/Hybrid/i)).toBeDefined());

    fireEvent.click(getByTextRefreshed(/Hybrid/i));

    await waitFor(
      () =>
        expect(
          containerRefreshed.querySelectorAll('input[type="number"]').length
        ).toEqual(21),
      { timeout: 1000 }
    );

    const options = containerRefreshed.querySelectorAll(
      "button.MuiButton-containedSuccess"
    );

    const content: (string | null)[] = [];
    options.forEach((o) => content.push(o.textContent));

    expect(content).toHaveLength(5);

    expect(content).toContain("Nominal Capacity");

    // Select nominal capacity
    fireEvent.click(
      getByLabelTextRefreshed(/powerPlantConfigurationSelect-1/i)
    );

    await waitFor(
      () =>
        expect(
          containerRefreshed.querySelectorAll('input[type="number"]').length
        ).toEqual(21),
      { timeout: 1000 }
    );

    expect(
      (getByLabelTextRefreshed(/solarNominalCapacity/i) as any).value
    ).toEqual("200");

    expect(
      (getByLabelTextRefreshed(/windNominalCapacity/i) as any).value
    ).toEqual("300");
  });

  // TODO: Re-add this once we figure out defaults for methanol
  // it("should generate expected summary of results for default methanol advanced inputs", async () => {
  //   const route = "/design/methanol";
  //   const { container, getByText } = render(
  //     <MemoryRouter initialEntries={[route]}>
  //       <App />
  //     </MemoryRouter>
  //   );
  //   fireEvent.click(getByText(/Advanced Input/i));

  //   await waitFor(
  //     () =>
  //       expect(
  //         container.querySelectorAll('input[type="number"]').length
  //       ).toEqual(12),
  //     { timeout: 2000 }
  //   );
  //   fireEvent.click(getByText(/Calculate/i));
  //   await waitFor(
  //     () =>
  //       expect(
  //         container.querySelector("#summary-of-results-0-value")?.textContent
  //       ).not.toEqual("0"),
  //     { timeout: 2000 }
  //   );

  //   expect(
  //     container.querySelector("#key-inputs-electrolyser-capacity")?.textContent
  //   ).toContain("400 MW");

  //   expect(
  //     container.querySelector("#key-inputs-power-plant-capacity")?.textContent
  //   ).toContain("1,401 MW");

  //   const expectedKeys: string[] = [
  //     "Power Plant Capacity Factor",
  //     "Time Electrolyser is at its Maximum Capacity (% of hrs/yr)",
  //     "Total Time Electrolyser is Operating (% of hrs/yr)",
  //     "Time Methanol Plant is at its Maximum Capacity (% of hrs/yr)",
  //     "Total Time Methanol Plant is Operating (% of hrs/yr)",
  //     "Electrolyser Capacity Factor",
  //     "Methanol Capacity Factor",
  //     "Energy Consumed by Electrolyser (MWh/yr)",
  //     "Excess Energy Not Utilised by Electrolyser (MWh/yr)",
  //     "Hydrogen Output (t/yr)",
  //     "Methanol Output (TPA)",
  //     "LCH2 ($/kg)",
  //     "LCMeOH ($/kg)",
  //   ];

  //   const expectedValues: string[] = [
  //     "43.75",
  //     "59.46",
  //     "92.71",
  //     "87.66",
  //     "87.66",
  //     "76.25",
  //     "87.66",
  //     "2,679,831",
  //     "2,702,500",
  //     "80,403",
  //     "320,833",
  //     "5.36",
  //     "1.34",
  //   ];

  //   const EXPECTED_RESULTS = 13;

  //   [...Array(EXPECTED_RESULTS).keys()].forEach((i) => {
  //     expect(
  //       container.querySelector(`#summary-of-results-${i}-key`)?.textContent
  //     ).toEqual(expectedKeys[i]);

  //     expect(
  //       container.querySelector(`#summary-of-results-${i}-value`)?.textContent
  //     ).toEqual(expectedValues[i]);
  //   });
  // });
});
