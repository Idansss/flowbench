import { NextRequest, NextResponse } from "next/server";
import { JobService } from "@/lib/job-service";
import sharp from "sharp";

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

    if (files.length > 200) {
      return NextResponse.json(
        { error: "Maximum 200 images per batch" },
        { status: 400 }
      );
    }

    // Create job
    const jobId = await JobService.createJob(
      {
        toolId: "image-studio",
        inputConfig: config,
      },
      files
    );

    await JobService.startJob(jobId);

    const auditSteps = [];
    let stepNumber = 0;

    // Step 1: Parse input files
    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Parse Input",
      description: `Received ${files.length} images`,
      counts: {
        images: files.length,
      },
      durationMs: 0,
    });

    // Configuration
    const resize = config.resize || null;
    const format = config.format || "webp";
    const quality = config.quality || 80;
    const removeBackground = config.removeBackground || false;

    const outputFiles: Array<{ name: string; data: Buffer; mimeType: string }> = [];
    let processedCount = 0;
    let failedCount = 0;
    const warnings: string[] = [];

    // Step 2: Process images
    const processStep = await JobService.measureStep("Process Images", async () => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          const buffer = await file.arrayBuffer();
          let image = sharp(Buffer.from(buffer));

          // Get metadata
          const metadata = await image.metadata();

          // Resize if requested
          if (resize) {
            image = image.resize({
              width: resize.width,
              height: resize.height,
              fit: resize.fit as any,
            });
          }

          // Background removal (simplified - would use rembg or similar in production)
          if (removeBackground) {
            // This is a placeholder - real implementation would use AI model
            warnings.push("Background removal requires external service - skipped");
          }

          // Format conversion
          let outputBuffer: Buffer;
          let mimeType: string;

          switch (format) {
            case "webp":
              outputBuffer = await image.webp({ quality }).toBuffer();
              mimeType = "image/webp";
              break;
            case "png":
              outputBuffer = await image.png({ quality }).toBuffer();
              mimeType = "image/png";
              break;
            case "jpg":
              outputBuffer = await image.jpeg({ quality }).toBuffer();
              mimeType = "image/jpeg";
              break;
            default:
              outputBuffer = await image.webp({ quality }).toBuffer();
              mimeType = "image/webp";
          }

          // Generate output filename
          const baseName = file.name.replace(/\.[^.]+$/, "");
          const sizeSuffix = resize ? `_${resize.width}x${resize.height}` : "";
          const outputName = `${baseName}${sizeSuffix}.${format}`;

          outputFiles.push({
            name: outputName,
            data: outputBuffer,
            mimeType,
          });

          processedCount++;
        } catch (error) {
          console.error(`Failed to process ${file.name}:`, error);
          failedCount++;
          warnings.push(`Failed to process ${file.name}`);
        }
      }

      return { processedCount, failedCount };
    });

    auditSteps.push({
      stepNumber: ++stepNumber,
      stepName: "Process Images",
      description: `Processed ${processedCount} images, ${failedCount} failed`,
      counts: {
        processed: processedCount,
        failed: failedCount,
      },
      warnings: warnings.length > 0 ? warnings : undefined,
      durationMs: processStep.durationMs,
    });

    // Complete job
    const { downloadUrl } = await JobService.completeJob(jobId, {
      success: true,
      summary: {
        totalImages: files.length,
        processed: processedCount,
        failed: failedCount,
        format,
        quality,
        resized: resize ? true : false,
      },
      outputFiles,
      auditSteps,
    });

    return NextResponse.json({
      success: true,
      jobId,
      downloadUrl,
      summary: {
        totalImages: files.length,
        processed: processedCount,
        failed: failedCount,
        format,
        quality,
      },
      auditSteps,
    });
  } catch (error) {
    console.error("Image Studio error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

