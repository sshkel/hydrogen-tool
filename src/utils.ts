import { zoneInfo } from "./components/map/ZoneInfo";
import { ChartData } from "./types";

export const nameToId = (key: string) => key.replace(/\s+/g, "-").toLowerCase();

export const isSolar = (tech: string): boolean => tech !== "Wind";
export const isWind = (tech: string): boolean => tech !== "Solar";

export function fillYearsArray(
  years: number,
  map: (i: number) => number
): number[] {
  return Array.from({ length: years }, (_, i) => map(i));
}

export function projectYears(projectTimeline: number): number[] {
  // gives you array of years starting from 1 and ending in projectTimeline inclusive
  return Array.from({ length: projectTimeline }, (_, i) => i + 1);
}

// projectTimeline with padding in the front and back.
// initial investment and decommissioning year
// pad array with zero-th and decommissionning year
export function padArray(arr: number[]) {
  const paddedArray = [];
  paddedArray.push(0, ...arr, 0);
  return paddedArray;
}

export function startup(element: number, projectTimeline: number) {
  const paddedArray = Array(projectTimeline + 2).fill(0);
  paddedArray[0] = element;

  return paddedArray;
}
export function checkLength(datapoints: ChartData[], projectTimeline: number) {
  datapoints.forEach((p) => {
    if (p.data.length !== projectTimeline) {
      throw new Error(
        `Invalid size of ${p.data.length} for ${p.label}. Should be ${projectTimeline}. Data is ${p.data}`
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
export function isOffshore(zone: string) {
  if (!Object.keys(zoneInfo).includes(zone)) {
    // hacky handling for tests since we've moved from using
    // zone names to special codes
    return false;
  }
  type ObjectKey = keyof typeof zoneInfo;
  const zoneKey = zone as ObjectKey;
  // TODO find a better way to check for offshore location
  return zoneInfo[zoneKey].solarCapFactor === "-%";
}
