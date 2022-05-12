import fs from "fs";
import Papa from "papaparse";

export async function readLocalCsv(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);
    Papa.parse(fileStream, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (err) => {
        reject(err);
      },
    });
  });
}
