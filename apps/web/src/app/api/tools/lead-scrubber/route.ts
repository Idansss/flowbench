import { NextRequest, NextResponse } from "next/server";
import { parseCSV, generateCSV } from "@flowbench/lib";
import { validateEmail, normalizeName } from "@flowbench/lib";
import { JobService } from "@/lib/job-service";
import { validateToolConfig } from "@/lib/validation";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const configStr = formData.get("config") as string;
    const rawConfig = JSON.parse(configStr || "{}");

    // SECURITY: Validate configuration
    const config = validateToolConfig("lead-scrubber", rawConfig);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // Create job
    const jobId = await JobService.createJob(
      {
        toolId: "lead-scrubber",
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
    const changes: Record<string, number> = {
      names_normalized: 0,
      emails_validated: 0,
      emails_invalid: 0,
      domains_inferred: 0,
      duplicates_removed: 0,
    };

    const warnings: string[] = [];

    // Step 2: Normalize names
    if (config.normalizeNames !== false) {
      const normalizeStep = await JobService.measureStep("Normalize Names", async () => {
        let normalized = 0;
        processedRows = processedRows.map((row) => {
          const result: any = { ...row };
          if (row.name && typeof row.name === "string") {
            const original = row.name;
            result.name = normalizeName(row.name);
            if (result.name !== original) normalized++;
          }
          return result;
        });
        return normalized;
      });

      changes.names_normalized = normalizeStep.result;
      auditSteps.push({
        stepNumber: ++stepNumber,
        stepName: "Normalize Names",
        description: `Normalized ${changes.names_normalized} names to title case`,
        counts: { normalized: changes.names_normalized },
        durationMs: normalizeStep.durationMs,
      });
    }

    // Step 3: Validate emails
    if (config.validateEmails !== false) {
      const emailStep = await JobService.measureStep("Validate Emails", async () => {
        let valid = 0;
        let invalid = 0;
        
        processedRows = processedRows.map((row) => {
          const result: any = { ...row, _validation_status: "ok" };
          
          if (row.email && typeof row.email === "string") {
            const validation = validateEmail(row.email);
            
            if (validation.isValid) {
              result.email = validation.normalized;
              valid++;
            } else {
              result._validation_status = validation.reason || "invalid_email";
              invalid++;
            }
          }
          
          return result;
        });
        
        return { valid, invalid };
      });

      changes.emails_validated = emailStep.result.valid;
      changes.emails_invalid = emailStep.result.invalid;

      if (changes.emails_invalid > 0) {
        warnings.push(`${changes.emails_invalid} emails failed validation`);
      }

      auditSteps.push({
        stepNumber: ++stepNumber,
        stepName: "Validate Emails",
        description: `Validated ${changes.emails_validated} emails, ${changes.emails_invalid} invalid`,
        counts: {
          valid: changes.emails_validated,
          invalid: changes.emails_invalid,
        },
        warnings: warnings.length > 0 ? warnings : undefined,
        durationMs: emailStep.durationMs,
      });
    }

    // Step 4: Infer company domains
    if (config.inferDomains !== false) {
      const domainStep = await JobService.measureStep("Infer Domains", async () => {
        let inferred = 0;
        
        processedRows = processedRows.map((row) => {
          const result: any = { ...row };
          
          if (row.email && typeof row.email === "string") {
            const validation = validateEmail(row.email);
            
            if (validation.companyDomain) {
              result.company_domain = validation.companyDomain;
              inferred++;
            }
          }
          
          return result;
        });
        
        return inferred;
      });

      changes.domains_inferred = domainStep.result;

      auditSteps.push({
        stepNumber: ++stepNumber,
        stepName: "Infer Company Domains",
        description: `Inferred ${changes.domains_inferred} company domains from emails`,
        counts: { inferred: changes.domains_inferred },
        durationMs: domainStep.durationMs,
      });
    }

    // Step 5: Deduplicate by email
    if (config.dedupeByEmail !== false) {
      const dedupeStep = await JobService.measureStep("Deduplicate", async () => {
        const initialCount = processedRows.length;
        const seen = new Map<string, any>();
        
        processedRows.forEach((row) => {
          if (row.email && typeof row.email === "string") {
            const email = row.email.toLowerCase();
            if (!seen.has(email)) {
              seen.set(email, row);
            }
          } else {
            // Keep rows without emails
            seen.set(`no-email-${Math.random()}`, row);
          }
        });
        
        processedRows = Array.from(seen.values());
        return initialCount - processedRows.length;
      });

      changes.duplicates_removed = dedupeStep.result;

      auditSteps.push({
        stepNumber: ++stepNumber,
        stepName: "Deduplicate by Email",
        description: `Removed ${changes.duplicates_removed} duplicate entries`,
        counts: {
          removed: changes.duplicates_removed,
          remaining: processedRows.length,
        },
        durationMs: dedupeStep.durationMs,
      });
    }

    // Step 6: Generate output
    const outputStep = await JobService.measureStep("Generate Output", async () => {
      const headers = [
        ...csvData.headers,
        ...(config.inferDomains !== false ? ["company_domain"] : []),
        "_validation_status",
      ];
      return generateCSV(processedRows, headers);
    });

    const outputCSV = outputStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Generate Output",
      description: "Generated cleaned CSV with validation status",
      counts: { rows: processedRows.length },
      durationMs: outputStep.durationMs,
    });

    // Complete job
    const { downloadUrl } = await JobService.completeJob(jobId, {
      success: true,
      summary: {
        totalRows: csvData.rows.length,
        outputRows: processedRows.length,
        ...changes,
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
        totalRows: csvData.rows.length,
        outputRows: processedRows.length,
        ...changes,
      },
      auditSteps,
    });
  } catch (error) {
    console.error("Lead Scrubber error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

