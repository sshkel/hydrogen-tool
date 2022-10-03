import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import InputHomePage from "../../../components/input/InputHomePage";

it("on submit for basic inputs sends expected fields", () => {
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
