import { ChartData } from "../types";

export function first(element: number, projectLife: number) {
  return [element].concat(Array(projectLife + 1).fill(0));
}
// projectLife with padding in the front and back.
// initial investment and decommissioning year
export function activeYears(element: number, projectLife: number) {
  return [0].concat(Array(projectLife).fill(element)).concat([0]);
}
// pad array with zero-th and decommissionning year
export function padArray(arr: number[]) {
  return [0].concat(arr).concat([0]);
}

export function decomissioning(element: number, projectLife: number) {
  return Array(projectLife + 1)
    .fill(0)
    .concat([element]);
}

export function dropPadding(arr: number[]) {
  return arr.slice(1, arr.length - 1);
}
export function checkLength(datapoints: ChartData[], plantLife: number) {
  datapoints.forEach((p) => {
    if (p.data.length !== plantLife) {
      throw new Error(
        `Invalid size of ${p.data.length} for ${p.label}. Should be ${plantLife}.`
      );
    }
  });
}
