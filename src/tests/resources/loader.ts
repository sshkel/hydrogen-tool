import fs from "fs";
import Papa from "papaparse";

export async function readLocalCsv(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    let fileStream = null;
    try {
      fileStream = fs.createReadStream(filePath);
    } catch (err) {
      reject(err);
    }
    Papa.parse(fileStream!, {
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

export async function writeLocalFile(
  filePath: string,
  data: string
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    try {
      fs.writeFile(filePath, data, function (err) {
        if (err) {
          return reject(err);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
