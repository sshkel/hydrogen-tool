import Button from "@mui/material/Button";
import { mount, shallow } from "enzyme";

import Input from "../../../components/input/Input";
import InputExpand from "../../../components/input/InputExpand";
import InputNumberField from "../../../components/input/InputNumberField";
import InputSelectField from "../../../components/input/InputSelectField";
import { InputFields } from "../../../types";

describe("Input", () => {
  it("renders expands", () => {
    const data: InputFields = {
      ...defaultInputData,
    };

    const spy = jest.fn();

    const wrapper = mount(<Input setState={spy} />);

    // Make sure input components render
    expect(wrapper.find(InputExpand).length).toBeGreaterThan(0);
    expect(wrapper.find(InputSelectField).length).toBeGreaterThan(0);
    expect(wrapper.find(InputNumberField).length).toBeGreaterThan(0);
    expect(wrapper.find("button")).toHaveLength(1);

    const button = wrapper.find("button").at(0);
    button.simulate("submit");

    expect(spy.mock.calls).toHaveLength(1);
    // TODO: Fix test
    // expect(spy.mock.calls[0][0]).toEqual({});
  });
});

const defaultInputData: InputFields = {
  additionalUpfrontCosts: 0,
  additionalAnnualCosts: 0,
  batteryEpcCosts: 0,
  batteryEfficiency: 0,
  batteryMinCharge: 0,
  batteryLandProcurementCost: 0,
  batteryRatedPower: 0,
  batteryCosts: 0,
  batteryOMCost: 0,
  batteryReplacementCost: 0,
  batteryLifetime: 0,
  discountRate: 0,
  durationOfStorage: 0,
  electrolyserCostReductionWithScale: 0,
  electrolyserEpcCosts: 0,
  electrolyserLandProcurementCost: 0,
  electrolyserReferenceFoldIncrease: 0,
  electrolyserOMCost: 0,
  electrolyserStackReplacement: 0,
  gridConnectionCost: 0,
  batteryNominalCapacity: 0,
  electrolyserNominalCapacity: 0,
  solarNominalCapacity: 0,
  windNominalCapacity: 0,
  solarReferenceCapacity: 0,
  windReferenceCapacity: 0,
  electrolyserReferenceCapacity: 0,
  electrolyserReferencePurchaseCost: 0,
  solarPVFarmReferenceCost: 0,
  windFarmReferenceCost: 0,
  solarEpcCosts: 0,
  solarLandProcurementCost: 0,
  solarPVCostReductionWithScale: 0,
  solarReferenceFoldIncrease: 0,
  solarOpex: 0,
  stackReplacementType: "Cumulative Hours",
  stackLifetime: 0,
  stackDegradation: 0,
  maximumDegradationBeforeReplacement: 0,
  technology: "Solar",
  electrolyserWaterCost: 0,
  windCostReductionWithScale: 0,
  windEpcCosts: 0,
  windLandProcurementCost: 0,
  windReferenceFoldIncrease: 0,
  windOpex: 0,
  plantLife: 0,
  additionalTransmissionCharges: 0,
  principalPPACost: 0,
  profile: "Fixed",
  location: "WA",
  solarDegradation: 0,
  windDegradation: 0,
  electrolyserMaximumLoad: 0,
  electrolyserMinimumLoad: 0,
  timeBetweenOverloading: 0,
  maximumLoadWhenOverloading: 0,
  waterRequirementOfElectrolyser: 0,
  salesMargin: 0,
  oxygenRetailPrice: 0,
  averageElectricitySpotPrice: 0,
  shareOfTotalInvestmentFinancedViaEquity: 0,
  directEquityShare: 0,
  salvageCostShare: 0,
  decommissioningCostShare: 0,
  loanTerm: 0,
  interestOnLoan: 0,
  capitalDepreciationProfile: "Straight Line",
  taxRate: 0,
  inflationRate: 0,
  ppaAgreement: "false",
};
