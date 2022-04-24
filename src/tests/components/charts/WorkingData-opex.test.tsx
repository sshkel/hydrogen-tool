import WorkingData from "../../../components/charts/WorkingData";
import { InputFields } from "../../../types";
import { shallow, ShallowWrapper } from "enzyme";
import { Line } from "react-chartjs-2";
import * as DataLoader from "../../../model/DataLoader";

const findGeneratorDurationCurveChart = (wrapper: ShallowWrapper) =>
  wrapper
    .find(Line)
    .filterWhere((e) => e.prop("title") === "Generator Duration Curve");

describe("Working Data calculations", () => {
  beforeAll(() => {
    jest.mock("../../../model/DataLoader", () => {
      const originalModule = jest.requireActual("../../../model/DataLoader");

      return {
        __esModule: true,
        ...originalModule,
        loadSolar: async () =>
          await DataLoader.read_csv(
            __dirname + "/../resources/solar-traces.csv"
          ),
        loadWind: async () =>
          await DataLoader.read_csv(
            __dirname + "/../resources/wind-traces.csv"
          ),
      };
    });
  });

  describe("Generator Duration Curve", () => {
    it("calculates electrolyser CAPEX as expected", () => {
      const data: InputFields = {
        ...defaultInputData,
      };

      const wrapper = shallow(<WorkingData data={data} />);

      const costBreakdownChart = findGeneratorDurationCurveChart(wrapper);

      expect(costBreakdownChart).toHaveLength(1);

      // Electrolyser Default CAPEX = 10_000_000
      expect(costBreakdownChart.at(0).prop("data")).toEqual(10_000_000);
    });
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
  totalNominalPowerPlantCapacity: 0,
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
  region: "WA",
  electrolyserMaximumLoad: 0,
  electrolyserMinimumLoad: 0,
  timeBetweenOverloading: 0,
  maximumLoadWhenOverloading: 0,
  waterRequirementOfElectrolyser: 0,
  h2RetailPrice: 0,
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
};

async function readCSV(filePath: string): Promise<any[]> {
  if (filePath.startsWith("http") || filePath.startsWith("https")) {
    return new Promise((resolve) => {
      const optionsWithDefaults = {
        header: true,
        dynamicTyping: true,
      };

      const dataStream = fs.createReadStream(filePath);
      const parseStream: any = Papa.parse(
        Papa.NODE_STREAM_INPUT,
        optionsWithDefaults
      );
      dataStream.pipe(parseStream);

      const data: any = [];
      parseStream.on("data", (chunk: any) => {
        data.push(chunk);
      });

      parseStream.on("finish", () => {
        resolve(data);
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      const fileStream = fs.createReadStream(filePath);
      Papa.parse(fileStream, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }
}
