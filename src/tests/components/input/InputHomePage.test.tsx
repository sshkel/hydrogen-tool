import {fireEvent, render, waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router-dom";

import InputHomePage from "../../../components/input/blocks/InputHomePage";

describe("InputHomePage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("sends expected input fields for basic configuration", async () => {
    const setState = jest.fn();
    const {container, getByText} = render(
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
      electrolyserEfficiency: 70,
      electrolyserPurchaseCost: 1500,
      powerPlantOversizeRatio: 1.5,
      powerfuel: "hydrogen",
      projectScale: 15,
      projectTimeline: 15,
      principalPPACost: 50,
      solarFarmBuildCost: 1200,
      solarToWindPercentage: 50,
      windFarmBuildCost: 2000,
      powerSupplyOption: "Self Build",
      waterSupplyCost: 5,
      inputConfiguration: "Basic",
      // might not need all of these
      additionalAnnualCosts: 0,
      additionalTransmissionCharges: 10,
      additionalUpfrontCosts: 0,
      batteryCosts: 0,
      batteryEfficiency: 0,
      batteryEpcCosts: 0,
      batteryLandProcurementCosts: 0,
      batteryLifetime: 0,
      batteryMinCharge: 0,
      batteryOMCost: 0,
      batteryRatedPower: 0,
      batteryReplacementCost: 0,
      batteryStorageDuration: 0,

      electrolyserCostReductionWithScale: 5,

      electrolyserEpcCosts: 30,
      electrolyserLandProcurementCosts: 6,
      electrolyserMaximumLoad: 100,
      electrolyserMinimumLoad: 10,
      electrolyserNominalCapacity: 1,
      electrolyserOMCost: 3,

      electrolyserReferenceCapacity: 1000,
      electrolyserReferenceFoldIncrease: 10,
      electrolyserStackReplacement: 40,
      gridConnectionCost: 1000000,
      inflationRate: 2.5,

      maximumDegradationBeforeReplacement: 10,
      maximumLoadWhenOverloading: 0,
      powerCapacityConfiguration: "Oversize Ratio",
      powerPlantConfiguration: "Standalone",

      powerPlantType: "Hybrid",

      secAtNominalLoad: 39.38,
      solarDegradation: 0,
      solarEpcCosts: 30,

      solarLandProcurementCosts: 6,
      solarOpex: 17000,
      solarPVCostReductionWithScale: 5,
      solarReferenceCapacity: 1000,
      solarReferenceFoldIncrease: 10,

      stackDegradation: 0,
      stackLifetime: 80000,
      stackReplacementType: "Cumulative Hours",
      timeBetweenOverloading: 0,
      waterRequirementOfElectrolyser: 15,

      windCostReductionWithScale: 5,
      windDegradation: 0,
      windEpcCosts: 30,

      windLandProcurementCosts: 6,
      windOpex: 25000,
      windReferenceCapacity: 1000,
      windReferenceFoldIncrease: 10,
    });
  });

  it("calls setInputConfiguration on tab switch", () => {
    const setInputConfiguration = jest.fn();
    const {getByText} = render(
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
    const {container, getByText} = render(
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
        ).toEqual(21),
      {timeout: 1000}
    );
    fireEvent.click(getByText(/Calculate/i));

    expect(setState).toHaveBeenCalledWith({
      additionalAnnualCosts: 0,
      additionalTransmissionCharges: 10,
      additionalUpfrontCosts: 0,
      batteryCosts: 380,
      batteryEfficiency: 85,
      batteryEpcCosts: 0,
      batteryLandProcurementCosts: 0,
      batteryLifetime: 10,
      batteryMinCharge: 10,
      batteryOMCost: 10000,
      batteryRatedPower: 0,
      batteryReplacementCost: 100,
      batteryStorageDuration: 0,
      discountRate: 7,
      electrolyserCostReductionWithScale: 5,
      electrolyserEpcCosts: 30,
      electrolyserLandProcurementCosts: 6,
      electrolyserMaximumLoad: 100,
      electrolyserMinimumLoad: 10,
      electrolyserNominalCapacity: 100,
      electrolyserOMCost: 3,
      electrolyserPurchaseCost: 1500,
      electrolyserReferenceCapacity: 1000,
      electrolyserReferenceFoldIncrease: 10,
      electrolyserStackReplacement: 40,
      gridConnectionCost: 1000000,
      maximumDegradationBeforeReplacement: 10,
      maximumLoadWhenOverloading: 100,
      powerPlantConfiguration: "Standalone",
      powerfuel: "hydrogen",
      powerPlantType: "Hybrid",
      powerSupplyOption: "Self Build",
      powerCapacityConfiguration: "Oversize Ratio",
      powerPlantOversizeRatio: 1.5,
      principalPPACost: 50,
      projectTimeline: 15,
      secAtNominalLoad: 50,
      solarDegradation: 0,
      solarEpcCosts: 30,
      solarFarmBuildCost: 1200,
      solarLandProcurementCosts: 6,
      solarNominalCapacity: 150,
      solarOpex: 17000,
      solarPVCostReductionWithScale: 5,
      solarReferenceCapacity: 1000,
      solarReferenceFoldIncrease: 10,
      solarToWindPercentage: 50,
      windNominalCapacity: 150,
      windDegradation: 0,
      stackDegradation: 0,
      stackLifetime: 80000,
      stackReplacementType: "Cumulative Hours",
      windCostReductionWithScale: 5,
      windEpcCosts: 30,
      windFarmBuildCost: 2000,
      windLandProcurementCosts: 6,
      windOpex: 25000,
      windReferenceCapacity: 1000,
      windReferenceFoldIncrease: 10,
      timeBetweenOverloading: 0,
      waterRequirementOfElectrolyser: 15,
      waterSupplyCost: 5,
      inputConfiguration: "Advanced",
      electrolyserEfficiency: 70,
      inflationRate:2.5
    });
  });

  it("sends expected input fields for advanced configuration with hybrid", async () => {
    const setState = jest.fn();
    const {container, getByText, getByLabelText} = render(
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
      {timeout: 1000}
    );

    // Select nominal capacity
    fireEvent.click(getByText(/Nominal Capacity/i));

    await waitFor(
      () =>
        expect(
          container.querySelectorAll('input[type="number"]').length
        ).toEqual(21),
      {timeout: 1000}
    );

    fireEvent.click(getByText(/Grid Connected/i));

    await waitFor(
      () =>
        expect(
          container.querySelectorAll('input[type="number"]').length
        ).toEqual(23),
      {timeout: 1000}
    );

    fireEvent.click(getByLabelText(/hybrid-show-more/i));
    await waitFor(() => expect(getByLabelText(/hybrid-show-more/i)).not, {
      timeout: 2000,
    });

    fireEvent.click(getByText(/Calculate/i));

    expect(setState).toHaveBeenCalledWith({
      electrolyserNominalCapacity: 100,
      additionalAnnualCosts: 0,
      additionalTransmissionCharges: 10,
      additionalUpfrontCosts: 0,
      batteryCosts: 380,
      batteryEfficiency: 85,
      batteryEpcCosts: 0,
      batteryLandProcurementCosts: 0,
      batteryLifetime: 10,
      batteryMinCharge: 10,
      batteryOMCost: 10000,
      batteryRatedPower: 0,
      batteryReplacementCost: 100,
      batteryStorageDuration: 0,
      discountRate: 7,
      electrolyserCostReductionWithScale: 5,
      electrolyserEpcCosts: 30,
      electrolyserLandProcurementCosts: 6,
      electrolyserMaximumLoad: 100,
      electrolyserMinimumLoad: 10,
      electrolyserOMCost: 3,
      electrolyserPurchaseCost: 1500,
      electrolyserReferenceCapacity: 1000,
      electrolyserReferenceFoldIncrease: 10,
      electrolyserStackReplacement: 40,
      gridConnectionCost: 1_000_000,
      maximumDegradationBeforeReplacement: 10,
      maximumLoadWhenOverloading: 100,
      powerPlantConfiguration: "Grid Connected",
      powerfuel: "hydrogen",
      powerPlantType: "Hybrid",
      powerSupplyOption: "Self Build",
      powerCapacityConfiguration: "Nominal Capacity",
      powerPlantOversizeRatio: 1.5,
      principalPPACost: 50,
      projectTimeline: 15,
      secAtNominalLoad: 50,
      solarDegradation: 0,
      solarEpcCosts: 30,
      solarFarmBuildCost: 1200,
      solarLandProcurementCosts: 6,
      solarNominalCapacity: 150,
      solarOpex: 17000,
      solarPVCostReductionWithScale: 5,
      solarReferenceCapacity: 1000,
      solarReferenceFoldIncrease: 10,
      solarToWindPercentage: 50,
      windNominalCapacity: 150,
      windCostReductionWithScale: 5,
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
      timeBetweenOverloading: 0,
      waterRequirementOfElectrolyser: 15,
      waterSupplyCost: 5,
      inputConfiguration: "Advanced",
      electrolyserEfficiency: 70,
      inflationRate:2.5
    });
  });

  it("sends expected input fields for basic configuration with PPA", async () => {
    const setState = jest.fn();
    const {container, getByText, getByLabelText} = render(
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
      {timeout: 1000}
    );

    // Set PPA cost of 10
    fireEvent.change(getByLabelText(/principalPPACost/i), {
      target: {value: 10},
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
      electrolyserEfficiency: 70,
      electrolyserPurchaseCost: 1500,
      powerPlantOversizeRatio: 1.5,
      powerfuel: "hydrogen",
      projectScale: 15,
      projectTimeline: 15,
      principalPPACost: 10,
      powerSupplyOption: "Power Purchase Agreement (PPA)",
      waterSupplyCost: 5,
      solarToWindPercentage: 50,
      solarFarmBuildCost: 1200,
      windFarmBuildCost: 2000,
      inputConfiguration: "Basic",
      // might not need all of these
      additionalAnnualCosts: 0,
      additionalTransmissionCharges: 10,
      additionalUpfrontCosts: 0,
      batteryCosts: 0,
      batteryEfficiency: 0,
      batteryEpcCosts: 0,
      batteryLandProcurementCosts: 0,
      batteryLifetime: 0,
      batteryMinCharge: 0,
      batteryOMCost: 0,
      batteryRatedPower: 0,
      batteryReplacementCost: 0,
      batteryStorageDuration: 0,

      electrolyserCostReductionWithScale: 5,

      electrolyserEpcCosts: 30,
      electrolyserLandProcurementCosts: 6,
      electrolyserMaximumLoad: 100,
      electrolyserMinimumLoad: 10,
      electrolyserNominalCapacity: 1,
      electrolyserOMCost: 3,

      electrolyserReferenceCapacity: 1000,
      electrolyserReferenceFoldIncrease: 10,
      electrolyserStackReplacement: 40,
      gridConnectionCost: 1000000,
      inflationRate: 2.5,

      maximumDegradationBeforeReplacement: 10,
      maximumLoadWhenOverloading: 0,
      powerCapacityConfiguration: "Oversize Ratio",
      powerPlantConfiguration: "Standalone",

      powerPlantType: "Hybrid",

      secAtNominalLoad: 39.38,
      solarDegradation: 0,
      solarEpcCosts: 30,

      solarLandProcurementCosts: 6,
      solarOpex: 17000,
      solarPVCostReductionWithScale: 5,
      solarReferenceCapacity: 1000,
      solarReferenceFoldIncrease: 10,

      stackDegradation: 0,
      stackLifetime: 80000,
      stackReplacementType: "Cumulative Hours",
      timeBetweenOverloading: 0,
      waterRequirementOfElectrolyser: 15,

      windCostReductionWithScale: 5,
      windDegradation: 0,
      windEpcCosts: 30,

      windLandProcurementCosts: 6,
      windOpex: 25000,
      windReferenceCapacity: 1000,
      windReferenceFoldIncrease: 10,
    });
  });

  it("sends expected input fields for basic offshore", async () => {
    const setState = jest.fn();
    const {container, getByText} = render(
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

    // No solarToWindPercentage is taken
    expect(setState).toHaveBeenCalledWith({
      discountRate: 7,
      electrolyserEfficiency: 70,
      electrolyserPurchaseCost: 1500,
      powerPlantOversizeRatio: 1.5,
      powerfuel: "hydrogen",
      projectScale: 15,
      projectTimeline: 15,
      principalPPACost: 50,
      solarFarmBuildCost: 1200,
      windFarmBuildCost: 2000,
      powerSupplyOption: "Self Build",
      waterSupplyCost: 5,
      inputConfiguration: "Basic",

      // might not need all of these
      additionalAnnualCosts: 0,
      additionalTransmissionCharges: 10,
      additionalUpfrontCosts: 0,
      batteryCosts: 0,
      batteryEfficiency: 0,
      batteryEpcCosts: 0,
      batteryLandProcurementCosts: 0,
      batteryLifetime: 0,
      batteryMinCharge: 0,
      batteryOMCost: 0,
      batteryRatedPower: 0,
      batteryReplacementCost: 0,
      batteryStorageDuration: 0,

      electrolyserCostReductionWithScale: 5,

      electrolyserEpcCosts: 30,
      electrolyserLandProcurementCosts: 6,
      electrolyserMaximumLoad: 100,
      electrolyserMinimumLoad: 10,
      electrolyserNominalCapacity: 1,
      electrolyserOMCost: 3,

      electrolyserReferenceCapacity: 1000,
      electrolyserReferenceFoldIncrease: 10,
      electrolyserStackReplacement: 40,
      gridConnectionCost: 1000000,
      inflationRate: 2.5,

      maximumDegradationBeforeReplacement: 10,
      maximumLoadWhenOverloading: 0,
      powerCapacityConfiguration: "Oversize Ratio",
      powerPlantConfiguration: "Standalone",

      powerPlantType: "Wind",

      secAtNominalLoad: 39.38,
      solarDegradation: 0,
      solarEpcCosts: 30,

      solarLandProcurementCosts: 6,
      solarOpex: 17000,
      solarPVCostReductionWithScale: 5,
      solarReferenceCapacity: 1000,
      solarReferenceFoldIncrease: 10,

      stackDegradation: 0,
      stackLifetime: 80000,
      stackReplacementType: "Cumulative Hours",
      timeBetweenOverloading: 0,
      waterRequirementOfElectrolyser: 15,

      windCostReductionWithScale: 5,
      windDegradation: 0,
      windEpcCosts: 30,

      windLandProcurementCosts: 6,
      windOpex: 25000,
      windReferenceCapacity: 1000,
      windReferenceFoldIncrease: 10,
      solarToWindPercentage: 0,
    });
  });

  it("sends expected input fields for advanced offshore", async () => {
    const setState = jest.fn();
    const {container, getByText, getByLabelText, queryByText} = render(
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
      {timeout: 1000}
    );

    fireEvent.click(getByLabelText(/power-plant-parameters-show-more/i));

    expect(queryByText("Hybrid")).toBeNull();

    fireEvent.click(getByText(/Calculate/i));

    // No solarToWindPercentage or solarNominalCapacity is taken
    expect(setState).toHaveBeenCalledWith({
      additionalAnnualCosts: 0,
      additionalTransmissionCharges: 10,
      additionalUpfrontCosts: 0,
      batteryCosts: 380,
      batteryEfficiency: 85,
      batteryEpcCosts: 0,
      batteryLandProcurementCosts: 0,
      batteryLifetime: 10,
      batteryMinCharge: 10,
      batteryOMCost: 10000,
      batteryRatedPower: 0,
      batteryReplacementCost: 100,
      batteryStorageDuration: 0,
      discountRate: 7,
      electrolyserCostReductionWithScale: 5,
      electrolyserEpcCosts: 30,
      electrolyserLandProcurementCosts: 6,
      electrolyserMaximumLoad: 100,
      electrolyserMinimumLoad: 10,
      electrolyserNominalCapacity: 100,
      electrolyserOMCost: 3,
      electrolyserPurchaseCost: 1500,
      electrolyserReferenceCapacity: 1000,
      electrolyserReferenceFoldIncrease: 10,
      electrolyserStackReplacement: 40,
      gridConnectionCost: 1000000,
      maximumDegradationBeforeReplacement: 10,
      maximumLoadWhenOverloading: 100,
      powerPlantConfiguration: "Standalone",
      powerfuel: "hydrogen",
      powerPlantType: "Wind",
      powerSupplyOption: "Self Build",
      powerCapacityConfiguration: "Oversize Ratio",
      powerPlantOversizeRatio: 1.5,
      principalPPACost: 50,
      projectTimeline: 15,
      secAtNominalLoad: 50,
      solarDegradation: 0,
      solarEpcCosts: 30,
      solarFarmBuildCost: 1200,
      solarLandProcurementCosts: 6,
      solarOpex: 17000,
      solarPVCostReductionWithScale: 5,
      solarReferenceCapacity: 1000,
      solarReferenceFoldIncrease: 10,
      windNominalCapacity: 150,
      windDegradation: 0,
      stackDegradation: 0,
      stackLifetime: 80000,
      stackReplacementType: "Cumulative Hours",
      timeBetweenOverloading: 0,
      waterRequirementOfElectrolyser: 15,
      waterSupplyCost: 5,
      windCostReductionWithScale: 5,
      windEpcCosts: 30,
      windFarmBuildCost: 2000,
      windLandProcurementCosts: 6,
      windOpex: 25000,
      windReferenceCapacity: 1000,
      windReferenceFoldIncrease: 10,
      inputConfiguration: "Advanced",
      electrolyserEfficiency: 70,
      inflationRate: 2.5,
      solarNominalCapacity: 150,
      solarToWindPercentage: 0
    });
  });

  it("submits changed dropdown field value as part of form", async () => {
    const setState = jest.fn();
    const {container, getByText, getByLabelText, getByRole, getAllByRole} =
      render(
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
        ).toEqual(21),
      {timeout: 1000}
    );

    fireEvent.click(getByLabelText(/battery-parameters-show-more/i));

    await waitFor(
      () =>
        expect(
          container.querySelectorAll('input[type="number"]').length
        ).toEqual(30),
      {timeout: 1000}
    );

    fireEvent.click(getByLabelText(/battery-capacity-show-more/i));

    await waitFor(
      () =>
        expect(
          container.querySelectorAll('input[type="number"]').length
        ).toEqual(30),
      {timeout: 1000}
    );

    fireEvent.mouseDown(
      getByRole("button", {
        name: /Battery Storage Duration 0/i,
      })
    );

    await waitFor(() => expect(getAllByRole("option").length).toEqual(5), {
      timeout: 1000,
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
        timeout: 1000,
      }
    );

    fireEvent.click(getByText(/Calculate/i));

    expect(setState).toHaveBeenCalledWith({
      additionalAnnualCosts: 0,
      additionalTransmissionCharges: 10,
      additionalUpfrontCosts: 0,
      batteryCosts: 380,
      batteryEfficiency: 85,
      batteryEpcCosts: 0,
      batteryLandProcurementCosts: 0,
      batteryLifetime: 10,
      batteryMinCharge: 10,
      batteryOMCost: 10000,
      batteryRatedPower: 0,
      batteryReplacementCost: 100,
      batteryStorageDuration: 2,
      discountRate: 7,
      electrolyserCostReductionWithScale: 5,
      electrolyserEpcCosts: 30,
      electrolyserLandProcurementCosts: 6,
      electrolyserMaximumLoad: 100,
      electrolyserMinimumLoad: 10,
      electrolyserNominalCapacity: 100,
      electrolyserOMCost: 3,
      electrolyserPurchaseCost: 1500,
      electrolyserReferenceCapacity: 1000,
      electrolyserReferenceFoldIncrease: 10,
      electrolyserStackReplacement: 40,
      gridConnectionCost: 1000000,
      maximumDegradationBeforeReplacement: 10,
      maximumLoadWhenOverloading: 100,
      powerPlantConfiguration: "Standalone",
      powerfuel: "hydrogen",
      powerPlantType: "Hybrid",
      powerSupplyOption: "Self Build",
      powerCapacityConfiguration: "Oversize Ratio",
      powerPlantOversizeRatio: 1.5,
      principalPPACost: 50,
      projectTimeline: 15,
      secAtNominalLoad: 50,
      solarNominalCapacity: 150,
      solarDegradation: 0,
      solarEpcCosts: 30,
      solarFarmBuildCost: 1200,
      solarLandProcurementCosts: 6,
      solarOpex: 17000,
      solarPVCostReductionWithScale: 5,
      solarReferenceCapacity: 1000,
      solarReferenceFoldIncrease: 10,
      solarToWindPercentage: 50,
      windNominalCapacity: 150,
      windDegradation: 0,
      stackDegradation: 0,
      stackLifetime: 80000,
      stackReplacementType: "Cumulative Hours",
      timeBetweenOverloading: 0,
      waterRequirementOfElectrolyser: 15,
      waterSupplyCost: 5,
      windCostReductionWithScale: 5,
      windEpcCosts: 30,
      windFarmBuildCost: 2000,
      windLandProcurementCosts: 6,
      windOpex: 25000,
      windReferenceCapacity: 1000,
      windReferenceFoldIncrease: 10,
      inputConfiguration: "Advanced",
      electrolyserEfficiency: 70,
      inflationRate: 2.5,
    });
  });
});
