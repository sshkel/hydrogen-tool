import {
  fireEvent,
  queryByText,
  render,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import InputHomePage from "../../../components/input/InputHomePage";

describe("InputHomePage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("sends expected input fields for basic configuration", async () => {
    const setState = jest.fn();
    const { container, getByText } = render(
      <MemoryRouter>
        <InputHomePage
          setState={setState}
          setInputConfiguration={jest.fn()}
          location={"Z1"}
        />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(container.querySelectorAll('input[type="number"]').length).toEqual(
        10
      )
    );

    fireEvent.click(getByText(/Calculate/i));

    expect(setState).toHaveBeenCalledWith({
      discountRate: 7,
      electrolyserEfficiency: 50,
      electrolyserPurchaseCost: 1000,
      powerPlantOversizeRatio: 2,
      powerfuel: "hydrogen",
      projectScale: 100,
      projectTimeline: 20,
      solarFarmBuildCost: 1200,
      solarToWindPercentage: 50,
      windFarmBuildCost: 2000,
      powerSupplyOption: "Self Build",
      waterSupplyCost: 5,
    });
  });

  it("calls setInputConfiguration on tab switch", () => {
    const setInputConfiguration = jest.fn();
    const { getByText } = render(
      <MemoryRouter>
        <InputHomePage
          setState={jest.fn()}
          setInputConfiguration={setInputConfiguration}
          location={"Z1"}
        />
      </MemoryRouter>
    );

    fireEvent.click(getByText(/Advanced Input/i));

    expect(setInputConfiguration).toHaveBeenCalledWith("Advanced");
  });

  it("sends expected input fields for advanced configuration", async () => {
    const setState = jest.fn();
    const { container, getByText } = render(
      <MemoryRouter>
        <InputHomePage
          setState={setState}
          setInputConfiguration={jest.fn()}
          location={"Z1"}
        />
      </MemoryRouter>
    );

    fireEvent.click(getByText(/Advanced Input/i));

    await waitFor(
      () =>
        expect(
          container.querySelectorAll('input[type="number"]').length
        ).toEqual(12),
      { timeout: 1000 }
    );
    fireEvent.click(getByText(/Calculate/i));

    expect(setState).toHaveBeenCalledWith({
      electrolyserNominalCapacity: 10,
      powerPlantConfiguration: "Standalone",
      powerfuel: "hydrogen",
      powerPlantType: "Wind",
      powerSupplyOption: "Self Build",
      powerCapacityConfiguration: "Nominal Capacity",
      windNominalCapacity: 10,
      windDegradation: 0,
      stackDegradation: 0,
      stackLifetime: 80000,
      stackReplacementType: "Cumulative Hours",
      windCostReductionWithScale: 10,
      windEpcCosts: 30,
      windFarmBuildCost: 2000,
      windLandProcurementCosts: 6,
      windOpex: 25000,
      windReferenceCapacity: 1000,
      windReferenceFoldIncrease: 10,
    });
  });

  it("sends expected input fields for advanced configuration with hybrid", async () => {
    const setState = jest.fn();
    const { container, getByText, getByLabelText } = render(
      <MemoryRouter>
        <InputHomePage
          setState={setState}
          setInputConfiguration={jest.fn()}
          location={"Z1"}
        />
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

    fireEvent.click(getByText(/Grid Connected/i));

    await waitFor(
      () =>
        expect(
          container.querySelectorAll('input[type="number"]').length
        ).toEqual(23),
      { timeout: 1000 }
    );

    fireEvent.click(getByLabelText(/hybrid-show-more/i));
    await waitFor(() => expect(getByLabelText(/hybrid-show-more/i)).not, {
      timeout: 2000,
    });

    fireEvent.click(getByText(/Calculate/i));

    expect(setState).toHaveBeenCalledWith({
      electrolyserNominalCapacity: 10,
      additionalTransmissionCharges: 0,
      powerPlantConfiguration: "Grid Connected",
      gridConnectionCost: 0,
      powerfuel: "hydrogen",
      powerPlantType: "Hybrid",
      powerSupplyOption: "Self Build",
      powerCapacityConfiguration: "Oversize Ratio",
      powerPlantOversizeRatio: 2,
      solarNominalCapacity: 10,
      solarEpcCosts: 30,
      solarFarmBuildCost: 1200,
      solarLandProcurementCosts: 6,
      solarToWindPercentage: 50,
      solarOpex: 17000,
      solarPVCostReductionWithScale: 10,
      solarReferenceCapacity: 1000,
      solarReferenceFoldIncrease: 10,
      solarDegradation: 0,
      windNominalCapacity: 10,
      windCostReductionWithScale: 10,
      windEpcCosts: 30,
      windFarmBuildCost: 2000,
      windLandProcurementCosts: 6,
      windOpex: 25000,
      windReferenceCapacity: 1000,
      windReferenceFoldIncrease: 10,
      windDegradation: 0,
      stackDegradation: 0,
      stackLifetime: 80000,
      stackReplacementType: "Cumulative Hours",
    });
  });

  it("sends expected input fields for basic configuration with PPA", async () => {
    const setState = jest.fn();
    const { container, getByText, getByLabelText } = render(
      <MemoryRouter>
        <InputHomePage
          setState={setState}
          setInputConfiguration={jest.fn()}
          location={"Z1"}
        />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(container.querySelectorAll('input[type="number"]').length).toEqual(
        10
      )
    );

    fireEvent.click(getByLabelText(/capital-&-operating-cost-show-more/i));

    await waitFor(() =>
      expect(getByText(/Power Supply Option/i)).toBeDefined()
    );

    fireEvent.click(getByText(/Power Purchase Agreement/i));

    await waitFor(
      () =>
        expect(
          container.querySelectorAll('input[type="number"]').length
        ).toEqual(9),
      { timeout: 1000 }
    );

    // Set PPA cost of 10
    fireEvent.change(getByLabelText(/principalPPACost/i), {
      target: { value: 10 },
    });

    fireEvent.click(getByLabelText(/power-purchase-agreement-.*-show-more/i));

    await waitFor(
      () =>
        expect(getByLabelText(/power-purchase-agreement-.*-show-more/i)).not,
      {
        timeout: 1000,
      }
    );

    fireEvent.click(getByText(/Calculate/i));

    expect(setState).toHaveBeenCalledWith({
      discountRate: 7,
      electrolyserEfficiency: 50,
      electrolyserPurchaseCost: 1000,
      powerPlantOversizeRatio: 2,
      powerfuel: "hydrogen",
      projectScale: 100,
      projectTimeline: 20,
      principalPPACost: 10,
      powerSupplyOption: "Power Purchase Agreement (PPA)",
      waterSupplyCost: 5,
      solarToWindPercentage: 50,
      solarFarmBuildCost: 1200,
      windFarmBuildCost: 2000,
    });
  });

  it("sends expected input fields for basic offshore", async () => {
    const setState = jest.fn();
    const { container, getByText } = render(
      <MemoryRouter>
        <InputHomePage
          setState={setState}
          setInputConfiguration={jest.fn()}
          location={"Z20"}
        />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(container.querySelectorAll('input[type="number"]').length).toEqual(
        8
      )
    );

    fireEvent.click(getByText(/Calculate/i));

    expect(setState).toHaveBeenCalledWith({
      discountRate: 7,
      electrolyserEfficiency: 50,
      electrolyserPurchaseCost: 1000,
      powerPlantOversizeRatio: 2,
      powerfuel: "hydrogen",
      projectScale: 100,
      projectTimeline: 20,
      windFarmBuildCost: 2000,
      powerSupplyOption: "Self Build",
      waterSupplyCost: 5,
    });
  });

  it("sends expected input fields for advanced offshore", async () => {
    const setState = jest.fn();
    const { container, getByText, queryByText } = render(
      <MemoryRouter>
        <InputHomePage
          setState={setState}
          setInputConfiguration={jest.fn()}
          location={"Z19"}
        />
      </MemoryRouter>
    );

    fireEvent.click(getByText(/Advanced Input/i));

    await waitFor(
      () =>
        expect(
          container.querySelectorAll('input[type="number"]').length
        ).toEqual(12),
      { timeout: 1000 }
    );

    expect(queryByText("Hybrid")).toBeNull();

    fireEvent.click(getByText(/Calculate/i));

    expect(setState).toHaveBeenCalledWith({
      electrolyserNominalCapacity: 10,
      powerPlantConfiguration: "Standalone",
      powerfuel: "hydrogen",
      powerPlantType: "Wind",
      powerSupplyOption: "Self Build",
      powerCapacityConfiguration: "Nominal Capacity",
      windNominalCapacity: 10,
      windDegradation: 0,
      stackDegradation: 0,
      stackLifetime: 80000,
      stackReplacementType: "Cumulative Hours",
      windCostReductionWithScale: 10,
      windEpcCosts: 30,
      windFarmBuildCost: 2000,
      windLandProcurementCosts: 6,
      windOpex: 25000,
      windReferenceCapacity: 1000,
      windReferenceFoldIncrease: 10,
    });
  });
});
