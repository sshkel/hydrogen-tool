import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import InputHomePage from "../../../components/input/InputHomePage";

describe("InputHomePage", () => {
  it("sends expected input fields for basic configuration", () => {
    const setState = jest.fn();
    const { getByText } = render(
      <MemoryRouter>
        <InputHomePage setState={setState} setInputConfiguration={jest.fn()} />
      </MemoryRouter>
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
    const { getByText } = render(
      <MemoryRouter>
        <InputHomePage setState={setState} setInputConfiguration={jest.fn()} />
      </MemoryRouter>
    );

    fireEvent.click(getByText(/Advanced Input/i));

    await waitFor(() =>
      expect(getByText("Electrolyser System Capacity")).toBeDefined()
    );

    fireEvent.click(getByText(/Calculate/i));

    expect(setState).toHaveBeenCalledWith({
      additionalAnnualCosts: 0,
      additionalUpfrontCosts: 0,
      averageElectricitySpotPrice: 0,
      batteryCosts: 542,
      batteryEfficiency: 90,
      batteryEpcCosts: 0,
      batteryLandProcurementCosts: 0,
      batteryLifetime: 10,
      batteryMinCharge: 0,
      batteryOMCost: 9717,
      batteryRatedPower: 0,
      batteryReplacementCost: 100,
      batteryStorageDuration: 0,
      capitalDepreciationProfile: "Straight Line",
      decommissioningCostShare: 10,
      directEquityShare: 100,
      discountRate: 7,
      electrolyserCostReductionWithScale: 10,
      electrolyserEfficiency: 50,
      electrolyserEpcCosts: 30,
      electrolyserLandProcurementCosts: 6,
      electrolyserMaximumLoad: 100,
      electrolyserMinimumLoad: 10,
      electrolyserNominalCapacity: 10,
      electrolyserOMCost: 2.5,
      electrolyserPurchaseCost: 1000,
      electrolyserReferenceCapacity: 1000,
      electrolyserReferenceFoldIncrease: 10,
      electrolyserStackReplacement: 40,
      hydrogenSalesMargin: 1,
      inflationRate: 2.5,
      interestOnLoan: 2.5,
      loanTerm: 10,
      maximumLoadWhenOverloading: 0,
      oxygenRetailPrice: 50,
      powerPlantConfiguration: "Standalone",
      powerPlantType: "Solar",
      powerSupplyOption: "Self Build",
      projectTimeline: 20,
      salvageCostShare: 10,
      secAtNominalLoad: 33.33,
      shareOfTotalInvestmentFinancedViaEquity: 70,
      solarDegradation: 0,
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
      taxRate: 30,
      timeBetweenOverloading: 0,
      waterRequirementOfElectrolyser: 15,
      waterSupplyCost: 5,
      windCostReductionWithScale: 10,
      windDegradation: 0,
      windEpcCosts: 30,
      windFarmBuildCost: 1950,
      windLandProcurementCosts: 6,
      windOpex: 25000,
      windReferenceCapacity: 1000,
      windReferenceFoldIncrease: 10,
    });
  });
});
