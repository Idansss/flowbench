// In-process job runner
// This handles job execution without needing a separate worker process

import { db } from "./db";
import { storage } from "./storage";

export type JobContext = {
  jobId: string;
  userId: string | null;
  toolId: string;
  inputConfig: Record<string, any>;
  inputFiles: File[];
};

export type JobResult = {
  success: boolean;
  summary: Record<string, any>;
  outputFiles: { name: string; buffer: Buffer; mimeType: string }[];
  auditSteps: Array<{
    stepNumber: number;
    stepName: string;
    description: string;
    inputSummary?: Record<string, any>;
    outputSummary?: Record<string, any>;
    warnings?: string[];
    counts?: Record<string, number>;
    durationMs?: number;
  }>;
  error?: string;
};

export type JobHandler = (ctx: JobContext) => Promise<JobResult>;

const handlers = new Map<string, JobHandler>();

export function registerJobHandler(toolId: string, handler: JobHandler) {
  handlers.set(toolId, handler);
}

export async function runJob(jobId: string): Promise<void> {
  const job = await db.getJobById(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  const handler = handlers.get(job.tool_id);
  if (!handler) {
    await db.updateJob(jobId, {
      status: "failed",
      errorMessage: `No handler registered for tool: ${job.tool_id}`,
      completedAt: new Date(),
    });
    return;
  }

  try {
    // Update status to running
    await db.updateJob(jobId, {
      status: "running",
      startedAt: new Date(),
    });

    // Get input files
    const inputFiles = await db.getFilesByJobId(jobId);
    const files: File[] = []; // In a real implementation, reconstruct File objects

    // Execute the job
    const result = await handler({
      jobId,
      userId: job.user_id,
      toolId: job.tool_id,
      inputConfig: job.input_config || {},
      inputFiles: files,
    });

    if (result.success) {
      // Upload output files
      for (const file of result.outputFiles) {
        const { key, url } = await storage.uploadBuffer(
          file.buffer,
          file.name,
          "outputs",
          jobId,
          file.mimeType
        );

        await db.createFile({
          jobId,
          fileType: "output",
          originalName: file.name,
          storageKey: key,
          mimeType: file.mimeType,
          sizeBytes: file.buffer.length,
        });
      }

      // Create audit logs
      for (const step of result.auditSteps) {
        await db.createAuditLog({
          jobId,
          ...step,
        });
      }

      // Generate audit.json
      const auditJson = JSON.stringify(result.auditSteps, null, 2);
      const auditBuffer = Buffer.from(auditJson, "utf-8");
      const { key: auditKey } = await storage.uploadBuffer(
        auditBuffer,
        "audit.json",
        "audits",
        jobId,
        "application/json"
      );

      await db.createFile({
        jobId,
        fileType: "audit",
        originalName: "audit.json",
        storageKey: auditKey,
        mimeType: "application/json",
        sizeBytes: auditBuffer.length,
      });

      // Update job to succeeded
      await db.updateJob(jobId, {
        status: "succeeded",
        resultSummary: result.summary,
        completedAt: new Date(),
      });
    } else {
      await db.updateJob(jobId, {
        status: "failed",
        errorMessage: result.error || "Unknown error",
        completedAt: new Date(),
      });
    }
  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    await db.updateJob(jobId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      completedAt: new Date(),
    });
  }
}

// Helper to create audit steps
export function createAuditStep(
  stepNumber: number,
  stepName: string,
  description: string,
  options: {
    inputSummary?: Record<string, any>;
    outputSummary?: Record<string, any>;
    warnings?: string[];
    counts?: Record<string, number>;
    durationMs?: number;
  } = {}
) {
  return {
    stepNumber,
    stepName,
    description,
    ...options,
  };
}

