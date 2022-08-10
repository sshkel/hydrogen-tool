import Button from "@mui/material/Button";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router-dom";

import Input from "../../../components/input/Input";
import InputExpand from "../../../components/input/InputExpand";
import InputNumberField from "../../../components/input/InputNumberField";
import InputSelectField from "../../../components/input/InputSelectField";
import { SynthesisedInputs } from "../../../types";
import { defaultInputData } from "../../scenario";

describe("Input", () => {
  it("renders expands", () => {
    const data: SynthesisedInputs = {
      ...defaultInputData.data,
    };

    const spy = jest.fn();

    const wrapper = mount(
      <MemoryRouter initialEntries={["/random"]}>
        <Input setState={spy} />
      </MemoryRouter>
    );

    // Make sure input components render
    expect(wrapper.find(InputExpand).length).toBeGreaterThan(0);
    expect(wrapper.find(InputSelectField).length).toBeGreaterThan(0);
    expect(wrapper.find(InputNumberField).length).toBeGreaterThan(0);
    expect(wrapper.find(Button)).toHaveLength(1);

    const button = wrapper.find(Button).find("button").at(0);
    button.simulate("submit");

    expect(spy.mock.calls).toHaveLength(1);
    // TODO: Fix test
    // expect(spy.mock.calls[0][0]).toEqual({});
  });
});
