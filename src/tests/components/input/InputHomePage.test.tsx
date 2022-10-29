import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import InputHomePage from "../../../components/input/InputHomePage";

describe("InputHomePage", () => {
  it("sends expected input fields for basic configuration", async () => {
    const setState = jest.fn();
    const { container, getByText } = render(
      <MemoryRouter>
        <InputHomePage setState={setState} setInputConfiguration={jest.fn()} />
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
      projectScale: 100_000,
      projectTimeline: 20,
      solarFarmBuildCost: 1200,
      solarToWindPercentage: 50,
      windFarmBuildCost: 1950,
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
        <InputHomePage setState={setState} setInputConfiguration={jest.fn()} />
      </MemoryRouter>
    );

    fireEvent.click(getByText(/Advanced Input/i));

    await waitFor(
      () =>
        expect(
          container.querySelectorAll('input[type="number"]').length
        ).toEqual(11),
      { timeout: 2000 }
    );
    fireEvent.click(getByText(/Calculate/i));

    expect(setState).toHaveBeenCalledWith({
      electrolyserNominalCapacity: 10,
      powerPlantConfiguration: "Standalone",
      powerPlantType: "Solar",
      powerSupplyOption: "Self Build",
      powerCapacityConfiguration: "Nominal Capacity",
      solarEpcCosts: 30,
      solarFarmBuildCost: 1200,
      solarLandProcurementCosts: 6,
      solarNominalCapacity: 10,
      solarOpex: 17000,
      solarPVCostReductionWithScale: 10,
      solarReferenceCapacity: 1000,
      solarReferenceFoldIncrease: 10,
      stackDegradation: 0,
      stackLifetime: 80000,
      stackReplacementType: "Cumulative Hours",
    });
  });

  it("sends expected input fields for advanced configuration with hybrid", async () => {
    const setState = jest.fn();
    const { container, getByText, getByLabelText } = render(
      <MemoryRouter>
        <InputHomePage setState={setState} setInputConfiguration={jest.fn()} />
      </MemoryRouter>
    );

    fireEvent.click(getByText(/Advanced Input/i));

    fireEvent.click(getByLabelText(/power-plant-parameters-show-more/i));

    await waitFor(() => expect(getByText(/Hybrid/i)).toBeDefined());

    fireEvent.click(getByText(/Hybrid/i));

    await waitFor(
      () =>
        expect(
          container.querySelectorAll('input[type="number"]').length
        ).toEqual(19),
      { timeout: 2000 }
    );
    fireEvent.click(getByText(/Calculate/i));

    expect(setState).toHaveBeenCalledWith({
      electrolyserNominalCapacity: 10,
      powerPlantConfiguration: "Standalone",
      // powerPlantType: "Solar",
      powerSupplyOption: "Self Build",
      powerCapacityConfiguration: "Nominal Capacity",
      solarEpcCosts: 30,
      solarFarmBuildCost: 1200,
      solarLandProcurementCosts: 6,
      solarNominalCapacity: 10,
      solarOpex: 17000,
      solarPVCostReductionWithScale: 10,
      solarReferenceCapacity: 1000,
      solarReferenceFoldIncrease: 10,
      windCostReductionWithScale: 10,
      windEpcCosts: 30,
      windFarmBuildCost: 1950,
      windLandProcurementCosts: 6,
      windNominalCapacity: 10,
      windOpex: 25000,
      windReferenceCapacity: 1000,
      windReferenceFoldIncrease: 10,
      stackDegradation: 0,
      stackLifetime: 80000,
      stackReplacementType: "Cumulative Hours",
    });
  });
});
