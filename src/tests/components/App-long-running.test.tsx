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

jest.setTimeout(8_000);

describe("App", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  beforeAll(() => {
    console.error = function () {};
  });

  it("should reuse submitted dropdown field values for defaults", async () => {
    const route = "/design/hydrogen";
    const { container, getByText, getByLabelText, getByRole, getAllByRole } =
      render(
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>
      );
    fireEvent.click(getByText(/Advanced Input/i));

    fireEvent.click(getByLabelText(/battery-parameters-show-more/i));

    await waitFor(
      () =>
        expect(
          container.querySelectorAll('input[type="number"]').length
        ).toEqual(21),
      { timeout: 1000 }
    );

    fireEvent.click(getByLabelText(/battery-capacity-show-more/i));

    await waitFor(
      () =>
        expect(
          container.querySelectorAll('input[type="number"]').length
        ).toEqual(21),
      { timeout: 1000 }
    );

    fireEvent.mouseDown(
      getByRole("button", {
        name: /Battery Storage Duration 0/i,
      })
    );

    await waitFor(() => expect(getAllByRole("option").length).toEqual(5), {
      timeout: 500,
    });

    fireEvent.click(
      getByRole("option", {
        name: /2/i,
      })
    );

    await waitFor(
      () =>
        expect(
          getByRole("button", {
            name: /Battery Storage Duration 2/i,
          })
        ).toBeDefined(),
      {
        timeout: 500,
      }
    );

    fireEvent.click(getByText(/Calculate/i));

    const {
      container: containerRefreshed,
      getByText: getByTextRefreshed,
      getByLabelText: getByLabelTextRefreshed,
      getByRole: getByRoleRefreshed,
    } = render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    );

    fireEvent.click(getByTextRefreshed(/Advanced Input/i));

    fireEvent.click(getByLabelTextRefreshed(/battery-parameters-show-more/i));

    await waitFor(
      () =>
        expect(
          containerRefreshed.querySelectorAll('input[type="number"]').length
        ).toEqual(21),
      { timeout: 1000 }
    );

    fireEvent.click(getByLabelTextRefreshed(/battery-capacity-show-more/i));

    await waitFor(
      () =>
        expect(
          getByRoleRefreshed("button", {
            name: /Battery Storage Duration 2/i,
          })
        ).toBeDefined(),
      { timeout: 1000 }
    );
  });
});
