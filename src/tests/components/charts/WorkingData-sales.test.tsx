import { mount } from "enzyme";

import CostLineChart from "../../../components/charts/CostLineChart";
import WorkingData from "../../../components/charts/WorkingData";
import { readLocalCsv } from "../../resources/loader";
import { solarPvWithBatteryScenario } from "../../scenario";

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

  describe("Sales", () => {
    it("calculates sales for solar with battery", (done) => {
      const wrapper = mount(
        <WorkingData
          data={solarPvWithBatteryScenario}
          loadSolar={loadSolar}
          loadWind={loadWind}
        />
      );

      const hydrogenSales = [
        4711147.215573239, 4828925.895962571, 4949649.043361634,
        5073390.269445674, 5200225.026181815, 5330230.651836361,
        5463486.41813227, 5600073.578585575, 5740075.418050215,
        5883577.303501469, 6030666.736089005, 6181433.40449123,
        6335969.23960351, 6494368.470593597, 6656727.682358437,
        6823145.874417397, 6993724.521277831, 7168567.634309776,
        7347781.82516752, 7531476.370796707,
      ];

      const electricitySales = new Array(20).fill(0);

      const oxygenSales = new Array(20).fill(0);

      const totalSales = hydrogenSales;

      // Sleep to wait for CSV to load and set state
      setTimeout(() => {
        wrapper.update();
        const opexChart = wrapper
          .find(CostLineChart)
          .filterWhere((e) => e.prop("title") === "Sales");
        expect(opexChart).toHaveLength(1);
        const datapoints = opexChart.at(0).prop("datapoints");
        expect(datapoints).toHaveLength(4);

        expect(datapoints[0].label).toEqual("Hydrogen Sales");
        datapoints[0].data.forEach((num, i) =>
          expect(num).toBeCloseTo(hydrogenSales[i], 8)
        );

        expect(datapoints[1].label).toEqual("Electricity Sales");
        datapoints[1].data.forEach((num, i) =>
          expect(num).toBeCloseTo(electricitySales[i], 8)
        );

        expect(datapoints[2].label).toEqual("Oxygen Sales");
        datapoints[2].data.forEach((num, i) =>
          expect(num).toBeCloseTo(oxygenSales[i], 8)
        );

        expect(datapoints[3].label).toEqual("Total Sales");
        datapoints[3].data.forEach((num, i) =>
          expect(num).toBeCloseTo(totalSales[i], 8)
        );

        done();
      }, 1500);
    });
  });
});
