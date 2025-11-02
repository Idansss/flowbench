import { NextRequest, NextResponse } from "next/server";
import { parseCSV, generateCSV } from "@flowbench/lib";
import { JobService } from "@/lib/job-service";
import { normalizeDate } from "@flowbench/lib";

export const maxDuration = 60; // 60 seconds for Vercel

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

    // Create job and save input files
    const jobId = await JobService.createJob(
      {
        toolId: "excel-fix-it",
        inputConfig: config,
      },
      files
    );

    // Start processing
    await JobService.startJob(jobId);

    const auditSteps = [];
    let stepNumber = 0;

    // Step 1: Parse input file
    const file = files[0];
    const parseStep = await JobService.measureStep("Parse Input", async () => {
      return await parseCSV(file);
    });
    
    const csvData = parseStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Parse Input",
      description: `Parsed ${file.name}`,
      counts: {
        rows: csvData.rows.length,
        columns: csvData.headers.length,
      },
      durationMs: parseStep.durationMs,
    });

    let processedRows = [...csvData.rows];
    let duplicatesRemoved = 0;
    let emptyRowsRemoved = 0;
    let datesFixed = 0;

    // Step 2: Remove empty rows
    if (config.removeEmptyRows) {
      const removeStep = await JobService.measureStep("Remove Empty Rows", async () => {
        const initialCount = processedRows.length;
        processedRows = processedRows.filter((row) => {
          return Object.values(row).some((val) => val !== null && val !== "");
        });
        return initialCount - processedRows.length;
      });

      emptyRowsRemoved = removeStep.result;
      auditSteps.push({
        stepNumber: ++stepNumber,
        stepName: "Remove Empty Rows",
        description: `Removed ${emptyRowsRemoved} empty rows`,
        counts: { removed: emptyRowsRemoved, remaining: processedRows.length },
        durationMs: removeStep.durationMs,
      });
    }

    // Step 3: Trim whitespace
    if (config.trimWhitespace) {
      const trimStep = await JobService.measureStep("Trim Whitespace", async () => {
        processedRows = processedRows.map((row) => {
          const trimmed: any = {};
          Object.keys(row).forEach((key) => {
            const val = row[key];
            trimmed[key] = typeof val === "string" ? val.trim() : val;
          });
          return trimmed;
        });
        return processedRows;
      });

      auditSteps.push({
        stepNumber: ++stepNumber,
        stepName: "Trim Whitespace",
        description: "Trimmed whitespace from all cells",
        durationMs: trimStep.durationMs,
      });
    }

    // Step 4: Fix dates to ISO
    if (config.fixDates) {
      const dateStep = await JobService.measureStep("Fix Dates", async () => {
        let fixed = 0;
        processedRows = processedRows.map((row) => {
          const normalized: any = {};
          Object.keys(row).forEach((key) => {
            const val = row[key];
            if (typeof val === "string" && val.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/)) {
              const isoDate = normalizeDate(val);
              if (isoDate) {
                normalized[key] = isoDate;
                fixed++;
              } else {
                normalized[key] = val;
              }
            } else {
              normalized[key] = val;
            }
          });
          return normalized;
        });
        return fixed;
      });

      datesFixed = dateStep.result;
      auditSteps.push({
        stepNumber: ++stepNumber,
        stepName: "Fix Dates to ISO",
        description: `Normalized ${datesFixed} dates to ISO 8601 format`,
        counts: { dates_fixed: datesFixed },
        durationMs: dateStep.durationMs,
      });
    }

    // Step 5: Normalize case
    if (config.normalizeCase !== "none") {
      const caseStep = await JobService.measureStep("Normalize Case", async () => {
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
        return processedRows;
      });

      auditSteps.push({
        stepNumber: ++stepNumber,
        stepName: "Normalize Case",
        description: `Applied ${config.normalizeCase} case normalization`,
        durationMs: caseStep.durationMs,
      });
    }

    // Step 6: Split column by delimiter
    if (config.splitColumn) {
      const splitStep = await JobService.measureStep("Split Column", async () => {
        const { column, delimiter } = config.splitColumn;
        let splitCount = 0;

        processedRows = processedRows.map((row) => {
          const result = { ...row };
          
          if (row[column] && typeof row[column] === "string") {
            const parts = row[column].split(delimiter).map((p: string) => p.trim());
            
            // Create new columns for each part
            parts.forEach((part: string, i: number) => {
              result[`${column}_${i + 1}`] = part;
            });
            
            splitCount++;
          }
          
          return result;
        });

        return splitCount;
      });

      auditSteps.push({
        stepNumber: ++stepNumber,
        stepName: "Split Column",
        description: `Split ${config.splitColumn.column} by '${config.splitColumn.delimiter}'`,
        counts: { rows_affected: splitStep.result },
        durationMs: splitStep.durationMs,
      });
    }

    // Step 7: Merge columns with template
    if (config.mergeColumns) {
      const mergeStep = await JobService.measureStep("Merge Columns", async () => {
        const { columns, template, targetColumn } = config.mergeColumns;
        let mergedCount = 0;

        processedRows = processedRows.map((row) => {
          const result = { ...row };
          
          // Replace {column} in template with actual values
          let merged = template;
          columns.forEach((col: string) => {
            merged = merged.replace(new RegExp(`\\{${col}\\}`, "g"), row[col] || "");
          });
          
          result[targetColumn || "merged"] = merged;
          mergedCount++;
          
          return result;
        });

        return mergedCount;
      });

      auditSteps.push({
        stepNumber: ++stepNumber,
        stepName: "Merge Columns",
        description: `Merged ${config.mergeColumns.columns.length} columns`,
        counts: { rows_affected: mergeStep.result },
        durationMs: mergeStep.durationMs,
      });
    }

    // Step 8: Deduplicate rows
    if (config.dedupeRows) {
      const dedupeStep = await JobService.measureStep("Deduplicate", async () => {
        const initialCount = processedRows.length;
        const seen = new Set<string>();
        processedRows = processedRows.filter((row) => {
          const key = JSON.stringify(row);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        return initialCount - processedRows.length;
      });

      duplicatesRemoved = dedupeStep.result;
      auditSteps.push({
        stepNumber: ++stepNumber,
        stepName: "Deduplicate Rows",
        description: `Removed ${duplicatesRemoved} duplicate rows`,
        counts: { removed: duplicatesRemoved, remaining: processedRows.length },
        durationMs: dedupeStep.durationMs,
      });
    }

    // Step 9: Generate output
    const outputStep = await JobService.measureStep("Generate Output", async () => {
      // Get final headers (may have new columns from split/merge)
      const finalHeaders = processedRows.length > 0 ? Object.keys(processedRows[0]) : csvData.headers;
      return generateCSV(processedRows, finalHeaders);
    });

    const outputCSV = outputStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Generate Output",
      description: "Generated cleaned CSV file",
      counts: { rows: processedRows.length },
      durationMs: outputStep.durationMs,
    });

    // Complete job with results
    const { downloadUrl } = await JobService.completeJob(jobId, {
      success: true,
      summary: {
        rowsProcessed: csvData.rows.length,
        duplicatesRemoved,
        emptyRowsRemoved,
        datesFixed,
        outputRows: processedRows.length,
      },
      outputFiles: [
        {
          name: file.name.replace(/\.[^.]+$/, "_cleaned.csv"),
          data: Buffer.from(outputCSV, "utf-8"),
          mimeType: "text/csv",
        },
      ],
      auditSteps,
    });

    return NextResponse.json({
      success: true,
      jobId,
      downloadUrl,
      summary: {
        rowsProcessed: csvData.rows.length,
        duplicatesRemoved,
        emptyRowsRemoved,
        datesFixed,
        outputRows: processedRows.length,
      },
      auditSteps,
    });
  } catch (error) {
    console.error("Excel Fix It error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
