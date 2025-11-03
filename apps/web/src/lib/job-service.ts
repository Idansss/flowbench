/**
 * Job Service - High-level API for job lifecycle management
 * Combines database, storage, and audit logging
 */

import { db } from "./db";
import { storage } from "./storage";
import { validateFiles } from "./upload";
import { redactPII } from "./observability";
import { v4 as uuidv4 } from "uuid";
import JSZip from "jszip";

export interface JobConfig {
  toolId: string;
  userId?: string;
  inputConfig: Record<string, any>;
}

export interface JobResult {
  success: boolean;
  summary: Record<string, any>;
  outputFiles: Array<{
    name: string;
    data: Buffer;
    mimeType: string;
  }>;
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
}

export class JobService {
  /**
   * Create a new job and save input files
   */
  static async createJob(config: JobConfig, inputFiles: File[]): Promise<string> {
    const jobId = uuidv4();
    
    // SECURITY: Validate files before processing
    const validation = await validateFiles(inputFiles);
    if (!validation.valid) {
      throw new Error(`File validation failed: ${validation.errors.join(", ")}`);
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn("File validation warnings:", validation.warnings);
    }

    // Create job in database
    const job = await db.createJob({
      userId: config.userId,
      toolId: config.toolId,
      inputConfig: config.inputConfig,
    });

    // Upload input files to storage
    for (const file of inputFiles) {
      const { key, url } = await storage.uploadFile(file, "inputs", job.id);
      
      await db.createFile({
        jobId: job.id,
        fileType: "input",
        originalName: file.name,
        storageKey: key,
        mimeType: file.type,
        sizeBytes: file.size,
      });
    }

    return job.id;
  }

  /**
   * Update job to running status
   */
  static async startJob(jobId: string): Promise<void> {
    await db.updateJob(jobId, {
      status: "running",
      startedAt: new Date(),
    });
  }

  /**
   * Complete job with results
   */
  static async completeJob(jobId: string, result: JobResult): Promise<{
    downloadUrl: string;
    bundleKey: string;
  }> {
    if (!result.success) {
      // Job failed
      await db.updateJob(jobId, {
        status: "failed",
        errorMessage: result.error || "Unknown error",
        completedAt: new Date(),
      });
      throw new Error(result.error || "Job failed");
    }

    // SECURITY: Redact PII from audit logs before saving
    const redactedAuditSteps = result.auditSteps.map((step) => ({
      ...step,
      inputSummary: step.inputSummary ? redactPII(step.inputSummary) : undefined,
      outputSummary: step.outputSummary ? redactPII(step.outputSummary) : undefined,
      description: typeof step.description === "string" ? redactPII(step.description) : step.description,
    }));

    // Save audit logs (redacted)
    for (const step of redactedAuditSteps) {
      await db.createAuditLog({
        jobId,
        ...step,
      });
    }

    // Upload output files
    for (const file of result.outputFiles) {
      const { key } = await storage.uploadBuffer(
        file.data,
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
        sizeBytes: file.data.length,
      });
    }

    // Create audit.json
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

    // Create result bundle (ZIP)
    const zip = new JSZip();

    // Add all output files to ZIP
    for (const file of result.outputFiles) {
      zip.file(file.name, file.data);
    }

    // Add audit.json to ZIP
    zip.file("audit.json", auditJson);

    // Generate ZIP
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const { key: bundleKey, url: downloadUrl } = await storage.uploadBuffer(
      zipBuffer,
      "results.zip",
      "bundles",
      jobId,
      "application/zip"
    );

    await db.createFile({
      jobId,
      fileType: "output",
      originalName: "results.zip",
      storageKey: bundleKey,
      mimeType: "application/zip",
      sizeBytes: zipBuffer.length,
    });

    // Update job to succeeded
    await db.updateJob(jobId, {
      status: "succeeded",
      resultSummary: result.summary,
      completedAt: new Date(),
    });

    return { downloadUrl, bundleKey };
  }

  /**
   * Get job details with files and audit logs
   */
  static async getJob(jobId: string) {
    const job = await db.getJobById(jobId);
    if (!job) return null;

    const files = await db.getFilesByJobId(jobId);
    const auditLogs = await db.getAuditLogsByJobId(jobId);

    return {
      ...job,
      files,
      auditLogs,
    };
  }

  /**
   * Helper: Measure execution time of a step
   */
  static async measureStep<T>(
    stepName: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; durationMs: number }> {
    const start = Date.now();
    const result = await fn();
    const durationMs = Date.now() - start;
    return { result, durationMs };
  }
}

