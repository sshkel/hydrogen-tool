import {UserInputFields,} from "./types";
// TODO remove this or use for validaiton
export default class SynthesisedInputs {
  constructor(userInputs: UserInputFields) {
    let sanitisedUserInputFields: any = {...userInputs};

    Object.keys(sanitisedUserInputFields).forEach((key) => {
      if (sanitisedUserInputFields[key] === undefined) {
        delete sanitisedUserInputFields[key];
      }
    });

    const form = {
      ...this,
      ...sanitisedUserInputFields,
    };

    return form;
  }
}
