import Papa from "papaparse";

export interface CSVParseOptions {
  header?: boolean;
  skipEmptyLines?: boolean;
  delimiter?: string;
  encoding?: string;
}

export interface CSVData {
  headers: string[];
  rows: Record<string, any>[];
  rawRows: any[][];
  meta: {
    rowCount: number;
    columnCount: number;
    delimiter: string;
  };
}

export async function parseCSV(
  input: string | File,
  options: CSVParseOptions = {}
): Promise<CSVData> {
  const defaultOptions = {
    header: true,
    skipEmptyLines: true,
    delimiter: "",
    ...options,
  };

  return new Promise((resolve, reject) => {
    Papa.parse(input, {
      ...defaultOptions,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors[0].message}`));
          return;
        }

        const headers = defaultOptions.header
          ? results.meta.fields || []
          : Array.from({ length: (results.data[0] as any[])?.length || 0 }, (_, i) => `Column ${i + 1}`);

        const rows = defaultOptions.header
          ? (results.data as Record<string, any>[])
          : (results.data as any[][]).map((row) =>
              Object.fromEntries(headers.map((h, i) => [h, row[i]]))
            );

        resolve({
          headers,
          rows,
          rawRows: results.data as any[][],
          meta: {
            rowCount: rows.length,
            columnCount: headers.length,
            delimiter: results.meta.delimiter,
          },
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function generateCSV(
  data: Record<string, any>[],
  headers?: string[]
): string {
  const actualHeaders = headers || Object.keys(data[0] || {});
  return Papa.unparse(data, {
    columns: actualHeaders,
  });
}

export function csvToArray(csv: string): string[][] {
  const result = Papa.parse(csv, { header: false });
  return result.data as string[][];
}

