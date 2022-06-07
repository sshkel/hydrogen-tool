import { mount } from "enzyme";

import CostBarChart from "../../../components/charts/CostBarChart";
import WorkingData from "../../../components/charts/WorkingData";
import { readLocalCsv } from "../../resources/loader";
import {
  solarPvWithBatteryScenario,
  solarPvWithElectrolyserScenario,
} from "../../scenario";

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

  describe("Cash Flow Analysis", () => {
    it("calculates cash flow analysis for solar", (done) => {
      const wrapper = mount(
        <WorkingData
          data={solarPvWithElectrolyserScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -17500000, -15607914.35017068, -13672276.559095625, -11691997.823243694,
        -9665962.118995465, -7593025.522141032, -5472015.510365237,
        -3301730.248295047, -1080937.8546731034, 1191624.3487893892,
        3517250.607338444, 6811113.017696889, 10177946.988314295,
        13619576.808197135, 17137872.373577047, 15947362.499748051,
        19624787.40312532, 23384772.92908702, 27229383.093197763,
        31160733.511411272, 35180992.69008012, 35180992.69008012,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(CostBarChart)
          .filterWhere((e) => e.prop("title") === "Cash Flow Analysis");
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(1);
        expect(datapoints.at(0)).toEqual({
          label: "Cash Flow Analysis",
          data: cashFlowAnalysis,
        });

        done();
      }, 1500);
    });

    it("calculates cash flow analysis for solar with battery", (done) => {
      const wrapper = mount(
        <WorkingData
          data={solarPvWithBatteryScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const cashFlowAnalysis = [
        -20868000, -18468842.924651816, -16014006.597419927, -13502099.03700724,
        -10931693.462584237, -8301327.423800658, -5609501.909047491,
        -2854680.4314254937, -35288.091862947214, 2850289.3811886627,
        -1860332.402528136, 2252363.0645115087, 6456868.5432271445,
        6245170.314547649, 10640238.948748263, 15134176.923803892,
        19729455.973235913, 24428609.623903733, 29234234.74083825,
        34148993.11069612, 39175613.06480045, 39175613.06480045,
      ];

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const cashFlowChart = wrapper
          .find(CostBarChart)
          .filterWhere((e) => e.prop("title") === "Cash Flow Analysis");
        expect(cashFlowChart).toHaveLength(1);
        const datapoints = cashFlowChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(1);
        expect(datapoints.at(0)).toEqual({
          label: "Cash Flow Analysis",
          data: cashFlowAnalysis,
        });

        done();
      }, 1500);
    });
  });
});
