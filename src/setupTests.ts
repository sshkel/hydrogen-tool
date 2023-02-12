import "jest-canvas-mock";

jest.mock("react-chartjs-2", () => ({
    Line: () => null,
    Bar: () => null,
    Doughnut: () => null,
}));
