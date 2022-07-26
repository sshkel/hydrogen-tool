import { ChartData } from "./types";

export const isSolar = (tech: string): boolean => tech !== "Wind";
export const isWind = (tech: string): boolean => tech !== "Solar";

export function getActiveYearsLabels(projectLife: number): string[] {
  const labels: string[] = [];
  labels.push(
    "Startup",
    ...projectYears(projectLife).map(String),
    "Decommisioning"
  );
  return labels;
}

export function fillYearsArray(
  years: number,
  map: (i: number) => number
): number[] {
  return Array.from({ length: years }, (_, i) => map(i));
}

export function projectYears(projectLife: number): number[] {
  // gives you array of years starting from 1 and ending in projectLife inclusive
  return Array.from({ length: projectLife }, (_, i) => i + 1);
}

// projectLife with padding in the front and back.
// initial investment and decommissioning year
// pad array with zero-th and decommissionning year
export function padArray(arr: number[]) {
  const paddedArray = [];
  paddedArray.push(0, ...arr, 0);
  return paddedArray;
}

export function startup(element: number, projectLife: number) {
  const paddedArray = Array(projectLife + 2).fill(0);
  paddedArray[0] = element;

  return paddedArray;
}

export function decomissioning(element: number, projectLife: number) {
  const paddedArray = Array(projectLife + 2).fill(0);
  paddedArray[projectLife + 1] = element;

  return paddedArray;
}

export function dropPadding(arr: number[]) {
  return arr.slice(1, arr.length - 1);
}
export function checkLength(datapoints: ChartData[], projectLife: number) {
  datapoints.forEach((p) => {
    if (p.data.length !== projectLife) {
      throw new Error(
        `Invalid size of ${p.data.length} for ${p.label}. Should be ${projectLife}. Data is ${p.data}`
      );
    }
  });
}

export function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

export function mean(arr: number[]): number {
  return sum(arr) / arr.length || 0;
}
