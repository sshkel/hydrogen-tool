import Papa from "papaparse";

export const DEFAULT_LOCATION = "Z1";

export async function loadSolar() {
  return await read_csv(
    "assets/solar.csv"
  );
}
export async function loadWind() {
  return await read_csv(
    "assets/wind.csv"
  );
}
// to use these run
// npx http-server in hydrogen-tool/src/tests/resources
// you will also need to replace loading methods in WorkingData
export async function loadLocalSolar() {
  return await read_csv("http://127.0.0.1:8080/solar-traces.csv");
}
export async function loadLocalWind() {
  return await read_csv("http://127.0.0.1:8080/wind-traces.csv");
}

export async function read_csv(file: any, options?: any): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      ...options,
      download: true,
      complete: (results) => {
        const df = results.data;
        resolve(df);
      },
      error: (err) => {
        reject(err);
      },
    });
  });
}
