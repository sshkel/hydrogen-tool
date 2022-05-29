import WorkingData from "../../../components/charts/WorkingData";
import { InputFields } from "../../../types";
import { mount } from "enzyme";
import { readLocalCsv } from "../../resources/loader";
import DurationCurve from "../../../components/charts/DurationCurve";
jest.setTimeout(10_000);
describe("Working Data calculations", () => {
  let loadSolar: () => Promise<any[]>;
  let loadWind: () => Promise<any[]>;
  beforeAll(() => {
    console.error = function () {};
    loadSolar = async () =>
      await readLocalCsv(__dirname + "/../../resources/solar-traces.csv");
    loadWind = async () =>
      await readLocalCsv(__dirname + "/../../resources/wind-traces.csv");
  });

  describe("Duration Curves", () => {
    it("calculates generator duration curve as 8760 percentages", (done) => {
      const data: InputFields = {
        ...defaultInputData,
        technology: "Solar",
        solarNominalCapacity: 15, // MW
        solarReferenceCapacity: 1000, // kW
        solarPVFarmReferenceCost: 1200, // A$/kw
        solarPVCostReductionWithScale: 20, // %
        solarReferenceFoldIncrease: 10,
      };

      const wrapper = mount(
        <WorkingData data={data} loadSolar={loadSolar} loadWind={loadWind} />
      );

      // Sad 600ms sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const durationCurve = wrapper
          .find(DurationCurve)
          .filterWhere((e) => e.prop("title") === "Generator Duration Curve");
        expect(durationCurve).toHaveLength(1);
        expect(durationCurve.at(0).prop("data")).toHaveLength(8760);
        (durationCurve.at(0).prop("data") as number[]).forEach((val) => {
          expect(val).toBeGreaterThanOrEqual(0);
          expect(val).toBeLessThanOrEqual(100);
        });
        done();
      }, 1500);
    });
  });

  it("calculates electrolyser duration curve as 8760 percentages", (done) => {
    const data: InputFields = {
      ...defaultInputData,
      technology: "Wind",
      windNominalCapacity: 15, // MW
      windReferenceCapacity: 1000, // kW
      windFarmReferenceCost: 1200, // A$/kw
      windCostReductionWithScale: 20, // %
      windReferenceFoldIncrease: 10,
      electrolyserNominalCapacity: 10, // MW
      electrolyserReferenceCapacity: 10000, // kW
      electrolyserReferencePurchaseCost: 1000, // A$/kw
      electrolyserCostReductionWithScale: 20, // %
      electrolyserReferenceFoldIncrease: 10,
      electrolyserMaximumLoad: 100,
      electrolyserMinimumLoad: 10,
    };

    const wrapper = mount(
      <WorkingData data={data} loadSolar={loadSolar} loadWind={loadWind} />
    );

    // Sad 600ms sleep to wait for CSV to load and set state
    setTimeout(() => {
      wrapper.update();
      const durationCurve = wrapper
        .find(DurationCurve)
        .filterWhere((e) => e.prop("title") === "Electrolyser Duration Curve");
      expect(durationCurve).toHaveLength(1);
      expect(durationCurve.at(0).prop("data")).toHaveLength(8760);
      (durationCurve.at(0).prop("data") as number[]).forEach((val) => {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(100);
      });
      done();
    }, 1000);
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
  location: "Far North QLD",
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
