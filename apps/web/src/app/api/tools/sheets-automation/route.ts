import { NextRequest, NextResponse } from "next/server";
import { parseCSV, generateCSV } from "@flowbench/lib";
import { JobService } from "@/lib/job-service";

export const maxDuration = 60;

// Safe expression evaluator for rules
function evaluateRule(row: Record<string, any>, condition: string): boolean {
  try {
    // Very simple safe expression language
    // Format: "column operator value"
    // Examples: "status == active", "amount > 100", "name contains John"
    
    const parts = condition.trim().split(/\s+/);
    if (parts.length < 3) return false;

    const [column, operator, ...valueParts] = parts;
    const value = valueParts.join(" ").replace(/^["']|["']$/g, "");
    const cellValue = row[column];

    switch (operator) {
      case "==":
      case "equals":
        return String(cellValue).toLowerCase() === value.toLowerCase();
      case "!=":
      case "not_equals":
        return String(cellValue).toLowerCase() !== value.toLowerCase();
      case ">":
        return Number(cellValue) > Number(value);
      case "<":
        return Number(cellValue) < Number(value);
      case ">=":
        return Number(cellValue) >= Number(value);
      case "<=":
        return Number(cellValue) <= Number(value);
      case "contains":
        return String(cellValue).toLowerCase().includes(value.toLowerCase());
      case "starts_with":
        return String(cellValue).toLowerCase().startsWith(value.toLowerCase());
      case "ends_with":
        return String(cellValue).toLowerCase().endsWith(value.toLowerCase());
      default:
        return false;
    }
  } catch (error) {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const configStr = formData.get("config") as string;
    const config = JSON.parse(configStr || "{}");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // Create job
    const jobId = await JobService.createJob(
      {
        toolId: "sheets-automation",
        inputConfig: config,
      },
      files
    );

    await JobService.startJob(jobId);

    const auditSteps = [];
    let stepNumber = 0;

    // Step 1: Parse input
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
    const recipe = config.recipe || "label"; // label, move, rollup

    // Step 2: Apply automation recipe
    const automationStep = await JobService.measureStep("Apply Automation", async () => {
      const stats = {
        labeled: 0,
        moved: 0,
        summarized: 0,
      };

      switch (recipe) {
        case "label":
          // Label rows by rule
          const rules = config.rules || [];
          processedRows = processedRows.map((row) => {
            const result = { ...row, _label: "" };
            
            for (const rule of rules) {
              if (evaluateRule(row, rule.condition)) {
                result._label = rule.label;
                stats.labeled++;
                break;
              }
            }
            
            return result;
          });
          break;

        case "move":
          // Move rows to tabs (simplified - adds category column)
          const moveRules = config.rules || [];
          processedRows = processedRows.map((row) => {
            const result = { ...row, _category: "default" };
            
            for (const rule of moveRules) {
              if (evaluateRule(row, rule.condition)) {
                result._category = rule.target;
                stats.moved++;
                break;
              }
            }
            
            return result;
          });
          break;

        case "rollup":
          // Weekly rollup summary
          const groupBy = config.groupBy || "week";
          // Simplified: just count and sum
          const summary = processedRows.reduce((acc: any, row) => {
            const key = row[config.groupColumn] || "unknown";
            if (!acc[key]) {
              acc[key] = { key, count: 0, total: 0 };
            }
            acc[key].count++;
            if (config.sumColumn && row[config.sumColumn]) {
              acc[key].total += Number(row[config.sumColumn]) || 0;
            }
            return acc;
          }, {});

          processedRows = Object.values(summary);
          stats.summarized = processedRows.length;
          break;
      }

      return stats;
    });

    const stats = automationStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Apply Automation",
      description: `Applied ${recipe} recipe`,
      counts: stats,
      durationMs: automationStep.durationMs,
    });

    // Step 3: Generate output
    const outputCsv = generateCSV(processedRows);

    // Complete job
    const { downloadUrl } = await JobService.completeJob(jobId, {
      success: true,
      summary: {
        recipe,
        inputRows: csvData.rows.length,
        outputRows: processedRows.length,
        ...stats,
      },
      outputFiles: [
        {
          name: file.name.replace(/\.[^.]+$/, "_automated.csv"),
          data: Buffer.from(outputCsv, "utf-8"),
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
        recipe,
        inputRows: csvData.rows.length,
        outputRows: processedRows.length,
        ...stats,
      },
      auditSteps,
    });
  } catch (error) {
    console.error("Sheets Automation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

