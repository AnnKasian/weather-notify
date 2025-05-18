import { Frequency } from "../../src/modules/subscription/enums/frequency.enum";

const subscriptionMock = {
  responcefromRepository: {
    emailExist: {
      id: "123e4567-e89b-12d3-a456-555555555",
      email: "exist@example.com",
      token: "123e4567-e89b-12d3-a456-555555555",
      city: "Kyiv",
      frequency: Frequency.Hourly,
      confirmed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    emailExistAndConfirmed: {
      id: "123e4567-e89b-12d3-a456-88888888",
      email: "existandconfirm@example.com",
      token: "123e4567-e89b-12d3-a456-88888888",
      city: "Kyiv",
      frequency: Frequency.Hourly,
      confirmed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    emailNotExist: {
      id: "123e4567-e89b-12d3-a456-99999999",
      email: "new@example.com",
      token: "123e4567-e89b-12d3-a456-99999999",
      city: "Kyiv",
      frequency: Frequency.Hourly,
      confirmed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },

  request: {
    emailExist: {
      email: "exist@example.com",
      city: "Kyiv",
      frequency: Frequency.Hourly,
    },
    emailExistAndConfirmed: {
      email: "existandconfirm@example.com",
      city: "Kyiv",
      frequency: Frequency.Hourly,
    },
    emailNotExist: {
      email: "new@example.com",
      city: "Kyiv",
      frequency: Frequency.Hourly,
    },
    tokenConfirm: {
      token: "123e4567-e89b-12d3-a456-88888888",
    },
  },

  response: {
    emailExist: {
      token: "123e4567-e89b-12d3-a456-555555555",
    },
    emailNotExist: {
      token: "123e4567-e89b-12d3-a456-99999999",
    },
  },
};

export { subscriptionMock };
