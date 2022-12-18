export type CsvRow = {
  [k: string]: number;
};

export type ModelHourlyOperation = {
  [k: string]: number[];
};
export type ModelSummaryPerYear = {
  [k: string]: number;
};

export interface ProjectModelSummary {
  electricityConsumed: number[];
  electricityProduced: number[];
  electricityConsumedByBattery: number[];
  totalOperatingTime: number[];
  hydrogenProduction: number[];
  powerPlantCapacityFactors: number[];
  ratedCapacityTime: number[];
  electrolyserCapacityFactors: number[];
}

export interface AmmoniaProjectModelSummary extends ProjectModelSummary {
  ammoniaCapacityFactors: number[];
  totalAmmoniaOperatingTime: number[];
  ammoniaRatedCapacityTime: number[];
  ammoniaProduction: number[];
}
