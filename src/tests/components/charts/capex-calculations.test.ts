import {
  calculateBatteryCapex,
  calculateCapex,
  getIndirectCost,
} from "../../../components/charts/capex-calculations";

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
});
