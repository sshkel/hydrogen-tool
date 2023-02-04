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

  // TODO: Move this back to App.test.tsx when fix the state leak
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

    // Select over size ratio
    fireEvent.click(getByText(/Oversize Ratio/i));

    await waitFor(
      () =>
        expect(
          container.querySelectorAll('input[type="number"]').length
        ).toEqual(21),
      { timeout: 1000 }
    );

    // Set oversize ratio to 1.5
    fireEvent.change(getByLabelText(/powerPlantOversizeRatio/i), {
      target: { value: 1.5 },
    });

    // Set capacity ratio to 75%
    fireEvent.change(getByLabelText(/solarToWindPercentage/i), {
      target: { value: 75 },
    });

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
    ).toContain("15 MW");

    const {
      container: containerRefreshed,
      getByText: getByTextRefreshed,
      getByLabelText: getByLabelTextRefreshed,
      getByRole,
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

    // TODO: Fix bug with selected state not persisting
    // expect(content).toContain("Oversize Ratio");

    // Select oversize ratio
    fireEvent.click(getByTextRefreshed(/Oversize Ratio/i));

    await waitFor(
      () =>
        expect(
          containerRefreshed.querySelectorAll('input[type="number"]').length
        ).toEqual(21),
      { timeout: 1000 }
    );

    expect(
      (getByLabelTextRefreshed(/powerPlantOversizeRatio/i) as any).value
    ).toEqual("1.5");

    expect(
      (getByLabelTextRefreshed(/solarToWindPercentage/i) as any).value
    ).toEqual("75");
  });
});
