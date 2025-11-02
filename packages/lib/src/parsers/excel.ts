import * as XLSX from "xlsx";

export interface ExcelData {
  sheets: {
    name: string;
    headers: string[];
    rows: Record<string, any>[];
    meta: {
      rowCount: number;
      columnCount: number;
    };
  }[];
}

export async function parseExcel(file: File | Buffer): Promise<ExcelData> {
  let buffer: ArrayBuffer;

  if (file instanceof File) {
    buffer = await file.arrayBuffer();
  } else {
    buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
  }

  const workbook = XLSX.read(buffer, { type: "array" });

  const sheets = workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    if (jsonData.length === 0) {
      return {
        name: sheetName,
        headers: [],
        rows: [],
        meta: { rowCount: 0, columnCount: 0 },
      };
    }

    const headers = jsonData[0].map((h: any, i: number) =>
      h?.toString() || `Column ${i + 1}`
    );

    const rows = jsonData.slice(1).map((row) =>
      Object.fromEntries(
        headers.map((header, i) => [header, row[i] !== undefined ? row[i] : null])
      )
    );

    return {
      name: sheetName,
      headers,
      rows,
      meta: {
        rowCount: rows.length,
        columnCount: headers.length,
      },
    };
  });

  return { sheets };
}

export function generateExcel(
  data: { sheetName: string; rows: Record<string, any>[] }[]
): Buffer {
  const workbook = XLSX.utils.book_new();

  data.forEach(({ sheetName, rows }) => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer;
}

export function excelToCSV(file: File | Buffer, sheetIndex = 0): Promise<string> {
  return parseExcel(file).then((data) => {
    if (!data.sheets[sheetIndex]) {
      throw new Error(`Sheet index ${sheetIndex} not found`);
    }

    const sheet = data.sheets[sheetIndex];
    const headers = sheet.headers.join(",");
    const rows = sheet.rows
      .map((row) =>
        sheet.headers.map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          const str = val.toString();
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        }).join(",")
      )
      .join("\n");

    return `${headers}\n${rows}`;
  });
}

