import { NextRequest, NextResponse } from "next/server";
import { JobService } from "@/lib/job-service";
import { extractInvoiceData } from "@flowbench/lib";
import { generateCSV } from "@flowbench/lib";

export const maxDuration = 60;

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
        toolId: "invoice-extractor",
        inputConfig: config,
      },
      files
    );

    await JobService.startJob(jobId);

    const auditSteps = [];
    let stepNumber = 0;

    // Step 1: Validate files
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Validate Input",
      description: `Received ${files.length} invoice files`,
      counts: {
        files: files.length,
      },
      durationMs: 0,
    });

    const invoices: any[] = [];
    const lineItems: any[] = [];
    const perFileData: any[] = [];
    let successCount = 0;
    let failedCount = 0;
    const warnings: string[] = [];

    // Step 2: Extract data from each file
    const extractStep = await JobService.measureStep("Extract Invoice Data", async () => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          // Read file content
          const buffer = await file.arrayBuffer();
          const text = new TextDecoder().decode(buffer);

          // Extract using deterministic regex
          const extracted = extractInvoiceData(text);

          if (!extracted.invoiceNumber && !extracted.total) {
            warnings.push(`${file.name}: No invoice data found`);
            failedCount++;
            continue;
          }

          // Add to invoices array
          const invoice = {
            fileName: file.name,
            vendor: extracted.vendor || "",
            invoiceNumber: extracted.invoiceNumber || "",
            date: extracted.date || "",
            total: extracted.total || 0,
            currency: extracted.currency || "USD",
            tax: extracted.tax || 0,
          };

          invoices.push(invoice);

          // Add line items if present
          if (extracted.lineItems && extracted.lineItems.length > 0) {
            extracted.lineItems.forEach((item, idx) => {
              lineItems.push({
                invoiceNumber: invoice.invoiceNumber,
                lineNumber: idx + 1,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount,
              });
            });
          }

          // Per-file JSON
          perFileData.push({
            file: file.name,
            extracted,
          });

          successCount++;
        } catch (error) {
          console.error(`Failed to process ${file.name}:`, error);
          warnings.push(`${file.name}: Processing failed`);
          failedCount++;
        }
      }

      return { successCount, failedCount };
    });

    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Extract Invoice Data",
      description: `Extracted data from ${successCount} invoices, ${failedCount} failed`,
      counts: {
        success: successCount,
        failed: failedCount,
        invoices: invoices.length,
        lineItems: lineItems.length,
      },
      warnings: warnings.length > 0 ? warnings : undefined,
      durationMs: extractStep.durationMs,
    });

    // Step 3: Generate outputs
    const invoicesCsv = generateCSV(invoices);
    const lineItemsCsv = lineItems.length > 0 ? generateCSV(lineItems) : "";
    const perFileJson = JSON.stringify(perFileData, null, 2);

    const outputFiles: Array<{ name: string; data: Buffer; mimeType: string }> = [
      {
        name: "invoices.csv",
        data: Buffer.from(invoicesCsv, "utf-8"),
        mimeType: "text/csv",
      },
    ];

    if (lineItemsCsv) {
      outputFiles.push({
        name: "line-items.csv",
        data: Buffer.from(lineItemsCsv, "utf-8"),
        mimeType: "text/csv",
      });
    }

    outputFiles.push({
      name: "per-file-data.json",
      data: Buffer.from(perFileJson, "utf-8"),
      mimeType: "application/json",
    });

    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Generate Outputs",
      description: "Created CSV and JSON outputs",
      counts: {
        csv_files: lineItemsCsv ? 2 : 1,
        json_files: 1,
      },
      durationMs: 0,
    });

    // Calculate accuracy (simplified - would compare against ground truth)
    const accuracy = successCount > 0 ? (successCount / files.length) * 100 : 0;

    // Complete job
    const { downloadUrl } = await JobService.completeJob(jobId, {
      success: true,
      summary: {
        filesProcessed: files.length,
        invoicesExtracted: successCount,
        failed: failedCount,
        accuracy: Math.round(accuracy),
        lineItems: lineItems.length,
      },
      outputFiles,
      auditSteps,
    });

    return NextResponse.json({
      success: true,
      jobId,
      downloadUrl,
      summary: {
        filesProcessed: files.length,
        invoicesExtracted: successCount,
        failed: failedCount,
        accuracy: Math.round(accuracy),
        lineItems: lineItems.length,
      },
      auditSteps,
    });
  } catch (error) {
    console.error("Invoice Extractor error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

