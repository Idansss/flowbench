import { NextRequest, NextResponse } from "next/server";
import { parseCSV, generateCSV } from "@flowbench/lib";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const configStr = formData.get("config") as string;
    const config = JSON.parse(configStr);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const auditSteps = [];
    const startTime = Date.now();

    // Step 1: Parse input file
    const file = files[0]; // Process first file for simplicity
    const parseStart = Date.now();
    const csvData = await parseCSV(file);
    auditSteps.push({
      stepNumber: 1,
      stepName: "Parse Input",
      description: `Parsed ${file.name}`,
      counts: {
        rows: csvData.rows.length,
        columns: csvData.headers.length,
      },
      durationMs: Date.now() - parseStart,
    });

    let processedRows = [...csvData.rows];
    let duplicatesRemoved = 0;
    let emptyRowsRemoved = 0;

    // Step 2: Remove empty rows
    if (config.removeEmptyRows) {
      const removeStart = Date.now();
      const initialCount = processedRows.length;
      processedRows = processedRows.filter((row) => {
        return Object.values(row).some((val) => val !== null && val !== "");
      });
      emptyRowsRemoved = initialCount - processedRows.length;
      auditSteps.push({
        stepNumber: 2,
        stepName: "Remove Empty Rows",
        description: `Removed ${emptyRowsRemoved} empty rows`,
        counts: { removed: emptyRowsRemoved, remaining: processedRows.length },
        durationMs: Date.now() - removeStart,
      });
    }

    // Step 3: Trim whitespace
    if (config.trimWhitespace) {
      const trimStart = Date.now();
      processedRows = processedRows.map((row) => {
        const trimmed: any = {};
        Object.keys(row).forEach((key) => {
          const val = row[key];
          trimmed[key] =
            typeof val === "string" ? val.trim() : val;
        });
        return trimmed;
      });
      auditSteps.push({
        stepNumber: 3,
        stepName: "Trim Whitespace",
        description: "Trimmed whitespace from all cells",
        durationMs: Date.now() - trimStart,
      });
    }

    // Step 4: Normalize case
    if (config.normalizeCase !== "none") {
      const caseStart = Date.now();
      processedRows = processedRows.map((row) => {
        const normalized: any = {};
        Object.keys(row).forEach((key) => {
          const val = row[key];
          if (typeof val === "string") {
            switch (config.normalizeCase) {
              case "lower":
                normalized[key] = val.toLowerCase();
                break;
              case "upper":
                normalized[key] = val.toUpperCase();
                break;
              case "title":
                normalized[key] = val
                  .split(" ")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                  .join(" ");
                break;
              default:
                normalized[key] = val;
            }
          } else {
            normalized[key] = val;
          }
        });
        return normalized;
      });
      auditSteps.push({
        stepNumber: 4,
        stepName: "Normalize Case",
        description: `Applied ${config.normalizeCase} case normalization`,
        durationMs: Date.now() - caseStart,
      });
    }

    // Step 5: Deduplicate rows
    if (config.dedupeRows) {
      const dedupeStart = Date.now();
      const initialCount = processedRows.length;
      const seen = new Set<string>();
      processedRows = processedRows.filter((row) => {
        const key = JSON.stringify(row);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      duplicatesRemoved = initialCount - processedRows.length;
      auditSteps.push({
        stepNumber: 5,
        stepName: "Deduplicate Rows",
        description: `Removed ${duplicatesRemoved} duplicate rows`,
        counts: { removed: duplicatesRemoved, remaining: processedRows.length },
        durationMs: Date.now() - dedupeStart,
      });
    }

    // Step 6: Generate output
    const outputStart = Date.now();
    const outputCSV = generateCSV(processedRows, csvData.headers);
    auditSteps.push({
      stepNumber: 6,
      stepName: "Generate Output",
      description: "Generated cleaned CSV file",
      counts: { rows: processedRows.length },
      durationMs: Date.now() - outputStart,
    });

    // Create download response
    const summary = {
      rowsProcessed: csvData.rows.length,
      duplicatesRemoved,
      emptyRowsRemoved,
      outputRows: processedRows.length,
      processingTimeMs: Date.now() - startTime,
    };

    return NextResponse.json({
      success: true,
      summary,
      auditSteps,
      downloadUrl: `/api/download/${file.name}`, // Simplified for demo
      data: outputCSV,
    });
  } catch (error) {
    console.error("Excel Fix It error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

