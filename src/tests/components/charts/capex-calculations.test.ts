import {
  calculateBatteryCapex,
  calculateCapex,
  generateCapexValues,
  getIndirectCost,
} from "../../../components/charts/capex-calculations";
import { Inputs } from "../../../types";
import { defaultInputData } from "../../scenario";

describe("Capex calculations", () => {
  it("calculates capex", () => {
    const capex = calculateCapex(10, 10, 10, 10, 10);

    expect(capex).toEqual(73000);
  });

  it("calculates battery capex", () => {
    const capex = calculateBatteryCapex(10, 10, 10);

    expect(capex).toEqual(100000);
  });

  it("calculates indirect cost", () => {
    const cost = getIndirectCost(350000, 1);

    expect(cost).toEqual(4000);
  });

  it("sets grid connection CAPEX when grid connected", () => {
    const data: Inputs = {
      ...defaultInputData.data,
      powerPlantConfiguration: "Grid Connected",
      gridConnectionCost: 10,
    };

    const { gridConnectionCAPEX } = generateCapexValues(data);

    expect(gridConnectionCAPEX).toEqual(10);
  });

  it("sets grid connection CAPEX when PPA agreement", () => {
    const data: Inputs = {
      ...defaultInputData.data,
      powerPlantConfiguration: "Grid Connected",
      powerSupplyOption: "Power Purchase Agreement (PPA)",
      gridConnectionCost: 10,
    };

    const { gridConnectionCAPEX } = generateCapexValues(data);

    expect(gridConnectionCAPEX).toEqual(10);
  });

  it("does not set grid connection CAPEX when standalone", () => {
    const data: Inputs = {
      ...defaultInputData.data,
      powerPlantConfiguration: "Standalone",
      gridConnectionCost: 10,
    };

    const { gridConnectionCAPEX } = generateCapexValues(data);

    expect(gridConnectionCAPEX).toEqual(0);
  });
});
