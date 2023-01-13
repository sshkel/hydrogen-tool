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
export interface MethanolProjectModelSummary extends ProjectModelSummary {
  methanolCapacityFactors: number[];
  totalMethanolOperatingTime: number[];
  methanolRatedCapacityTime: number[];
  methanolProduction: number[];
}

export interface MethaneProjectModelSummary extends ProjectModelSummary {
  methaneCapacityFactors: number[];
  totalMethaneOperatingTime: number[];
  methaneRatedCapacityTime: number[];
  methaneProduction: number[];
}
