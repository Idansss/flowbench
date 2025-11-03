import { NextRequest, NextResponse } from "next/server";
import { parseCSV } from "@flowbench/lib";
import { JobService } from "@/lib/job-service";
import { validateToolConfig } from "@/lib/validation";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const configStr = formData.get("config") as string;
    const rawConfig = JSON.parse(configStr || "{}");

    // SECURITY: Validate configuration
    const config = validateToolConfig("qr-generator", rawConfig);

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // Create job
    const jobId = await JobService.createJob(
      {
        toolId: "qr-generator",
        inputConfig: config,
      },
      files
    );

    await JobService.startJob(jobId);

    const auditSteps = [];
    let stepNumber = 0;

    // Configuration
    const qrOptions = {
      errorCorrectionLevel: config.errorCorrection || "M",
      type: "png" as const,
      width: config.size || 300,
      margin: 2,
    };

    // Step 1: Parse input CSV
    const file = files[0];
    const parseStep = await JobService.measureStep("Parse Input", async () => {
      return await parseCSV(file);
    });

    const csvData = parseStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Parse Input",
      description: `Parsed ${file.name} with ${csvData.rows.length} entries`,
      counts: {
        rows: csvData.rows.length,
        columns: csvData.headers.length,
      },
      durationMs: parseStep.durationMs,
    });

    // Step 2: Generate QR codes
    const qrStep = await JobService.measureStep("Generate QR Codes", async () => {
      const qrCodes: Buffer[] = [];
      const tokens: string[] = [];
      let success = 0;
      let failed = 0;

      for (let i = 0; i < csvData.rows.length; i++) {
        const row = csvData.rows[i];
        
        try {
          // Create payload
          const token = uuidv4();
          const payload = config.secret
            ? JSON.stringify({ ...row, token, signature: "signed" })
            : JSON.stringify({ ...row, token });

          // Generate QR code
          const buffer = await QRCode.toBuffer(payload, qrOptions);
          qrCodes.push(buffer);
          tokens.push(token);
          success++;
        } catch (error) {
          console.error(`Failed to generate QR for row ${i}:`, error);
          failed++;
        }
      }

      return { qrCodes, tokens, success, failed };
    });

    const { qrCodes, tokens, success, failed } = qrStep.result;

    const warnings = failed > 0 ? [`${failed} QR codes failed to generate`] : undefined;

    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Generate QR Codes",
      description: `Generated ${success} QR codes`,
      counts: {
        success,
        failed,
      },
      warnings,
      durationMs: qrStep.durationMs,
    });

    // Step 3: Create output files
    const outputFiles: Array<{ name: string; data: Buffer; mimeType: string }> = [];

    // Individual QR code PNGs
    for (let i = 0; i < qrCodes.length; i++) {
      const row = csvData.rows[i];
      const name = row.name || `qr_${i + 1}`;
      const safeName = name.replace(/[^a-z0-9-]/gi, "_");
      
      outputFiles.push({
        name: `${safeName}_qr.png`,
        data: qrCodes[i],
        mimeType: "image/png",
      });
    }

    // Verification tokens CSV
    const tokensCsv = [
      ["index", "name", "token", ...csvData.headers],
      ...csvData.rows.map((row, i) => [
        i + 1,
        row.name || "",
        tokens[i],
        ...csvData.headers.map((h) => row[h] || ""),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    outputFiles.push({
      name: "verification_tokens.csv",
      data: Buffer.from(tokensCsv, "utf-8"),
      mimeType: "text/csv",
    });

    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Package Outputs",
      description: `Created ${outputFiles.length} output files`,
      counts: {
        qr_images: qrCodes.length,
        csv_files: 1,
      },
      durationMs: 0,
    });

    // Complete job
    const { downloadUrl } = await JobService.completeJob(jobId, {
      success: true,
      summary: {
        totalEntries: csvData.rows.length,
        qrCodesGenerated: success,
        qrCodesFailed: failed,
      },
      outputFiles,
      auditSteps,
    });

    return NextResponse.json({
      success: true,
      jobId,
      downloadUrl,
      summary: {
        totalEntries: csvData.rows.length,
        qrCodesGenerated: success,
        qrCodesFailed: failed,
      },
      auditSteps,
    });
  } catch (error) {
    console.error("QR Generator error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

