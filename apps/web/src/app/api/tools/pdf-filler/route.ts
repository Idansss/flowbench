import { NextRequest, NextResponse } from "next/server";
import { JobService } from "@/lib/job-service";
import { PDFDocument, PDFForm, PDFTextField } from "pdf-lib";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const configStr = formData.get("config") as string;
    const config = JSON.parse(configStr || "{}");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No PDF template provided" },
        { status: 400 }
      );
    }

    // Create job
    const jobId = await JobService.createJob(
      {
        toolId: "pdf-filler",
        inputConfig: config,
      },
      files
    );

    await JobService.startJob(jobId);

    const auditSteps = [];
    let stepNumber = 0;

    // Step 1: Parse PDF template
    const file = files[0];
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Parse PDF Template",
      description: `Loaded ${file.name}`,
      counts: {
        size_bytes: file.size,
      },
      durationMs: 0,
    });

    // Step 2: Extract form fields
    const fieldsStep = await JobService.measureStep("Extract Fields", async () => {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const form = pdfDoc.getForm();
      
      const fields = form.getFields();
      return fields.map((field) => ({
        name: field.getName(),
        type: field.constructor.name,
      }));
    });

    const fields = fieldsStep.result;
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Extract Form Fields",
      description: `Found ${fields.length} form fields in PDF`,
      counts: {
        fields: fields.length,
      },
      durationMs: fieldsStep.durationMs,
    });

    // Step 3: Fill PDF with provided data
    const fillStep = await JobService.measureStep("Fill PDF", async () => {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const form = pdfDoc.getForm();
      
      let filledCount = 0;
      const fieldData = config.fieldData || {};

      // Fill each field with provided data
      for (const [fieldName, value] of Object.entries(fieldData)) {
        try {
          const field = form.getField(fieldName);
          
          if (field instanceof PDFTextField) {
            field.setText(String(value));
            filledCount++;
          }
          // Support for other field types can be added
        } catch (error) {
          console.warn(`Failed to fill field ${fieldName}:`, error);
        }
      }

      // Flatten the form (make fields non-editable)
      if (config.flatten !== false) {
        form.flatten();
      }

      // Save the filled PDF
      const pdfBytes = await pdfDoc.save();
      return { buffer: Buffer.from(pdfBytes), filledCount };
    });

    const { buffer: filledPdf, filledCount } = fillStep.result;
    
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Fill PDF",
      description: `Filled ${filledCount} form fields${config.flatten !== false ? " and flattened PDF" : ""}`,
      counts: {
        fields_filled: filledCount,
        total_fields: fields.length,
      },
      durationMs: fillStep.durationMs,
    });

    // Complete job
    const { downloadUrl } = await JobService.completeJob(jobId, {
      success: true,
      summary: {
        totalFields: fields.length,
        fieldsFilled: filledCount,
        pdfGenerated: true,
        flattened: config.flatten !== false,
      },
      outputFiles: [
        {
          name: file.name.replace(/\.pdf$/, "_filled.pdf"),
          data: filledPdf,
          mimeType: "application/pdf",
        },
      ],
      auditSteps,
    });

    return NextResponse.json({
      success: true,
      jobId,
      downloadUrl,
      summary: {
        totalFields: fields.length,
        fieldsFilled: filledCount,
        pdfGenerated: true,
      },
      auditSteps,
    });
  } catch (error) {
    console.error("PDF Filler error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

