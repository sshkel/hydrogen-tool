import Papa from "papaparse";

export async function loadSolar() {
  return await read_csv(
    "https://hysupply.s3.ap-southeast-2.amazonaws.com/solar-traces.csv"
  );
}
export async function loadWind() {
  return await read_csv(
    "https://hysupply.s3.ap-southeast-2.amazonaws.com/wind-traces.csv"
  );
}

export async function read_csv(file: any, options?: any): Promise<any[]> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      ...options,
      download: true,
      complete: (results) => {
        const df = results.data;
        resolve(df);
      },
    });
  });
}
