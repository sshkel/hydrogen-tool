import {PowerPlantType} from "../types";

export type CsvRow = {
  [k: string]: number;
};

export type ModelHourlyOperation = {
  [k: string]: number[];
};
export type ModelSummaryPerYear = {
  [k: string]: number;
};

export type ProjectModelSummary = {
  electricityConsumed: number[]
  electricityProduced: number[]
  electricityConsumedByBattery: number[]
  totalOperatingTime: number[]
  hydrogenProduction: number[]
  powerPlantCapacityFactors: number[]
  ratedCapacityTime: number[]
  electrolyserCapacityFactors: number[]
};
