import postgres from "postgres";

const connectionString = process.env.DATABASE_URL!;

// Create postgres connection
export const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Database utility functions
export const db = {
  // Users
  async createUser(data: {
    email?: string;
    name?: string;
    isAnonymous?: boolean;
  }) {
    const [user] = await sql`
      INSERT INTO users (email, name, is_anonymous)
      VALUES (${data.email || null}, ${data.name || null}, ${data.isAnonymous || false})
      RETURNING *
    `;
    return user;
  },

  async getUserById(id: string) {
    const [user] = await sql`
      SELECT * FROM users WHERE id = ${id} AND deleted_at IS NULL
    `;
    return user;
  },

  async getUserByEmail(email: string) {
    const [user] = await sql`
      SELECT * FROM users WHERE email = ${email} AND deleted_at IS NULL
    `;
    return user;
  },

  // Jobs
  async createJob(data: {
    userId?: string;
    toolId: string;
    inputConfig?: Record<string, any>;
  }) {
    const [job] = await sql`
      INSERT INTO jobs (user_id, tool_id, input_config, status)
      VALUES (
        ${data.userId || null},
        ${data.toolId},
        ${data.inputConfig ? sql.json(data.inputConfig) : null},
        'created'
      )
      RETURNING *
    `;
    return job;
  },

  async updateJob(id: string, data: {
    status?: string;
    resultSummary?: Record<string, any>;
    errorMessage?: string;
    startedAt?: Date;
    completedAt?: Date;
  }) {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.status !== undefined) {
      updates.push(`status = $${updates.length + 1}`);
      values.push(data.status);
    }
    if (data.resultSummary !== undefined) {
      updates.push(`result_summary = $${updates.length + 1}`);
      values.push(JSON.stringify(data.resultSummary));
    }
    if (data.errorMessage !== undefined) {
      updates.push(`error_message = $${updates.length + 1}`);
      values.push(data.errorMessage);
    }
    if (data.startedAt !== undefined) {
      updates.push(`started_at = $${updates.length + 1}`);
      values.push(data.startedAt);
    }
    if (data.completedAt !== undefined) {
      updates.push(`completed_at = $${updates.length + 1}`);
      values.push(data.completedAt);
    }

    if (updates.length === 0) return null;

    const [job] = await sql`
      UPDATE jobs
      SET ${sql(updates.join(", "))}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return job;
  },

  async getJobById(id: string) {
    const [job] = await sql`
      SELECT * FROM jobs WHERE id = ${id} AND deleted_at IS NULL
    `;
    return job;
  },

  async getJobsByUserId(userId: string, limit = 50) {
    const jobs = await sql`
      SELECT * FROM jobs
      WHERE user_id = ${userId} AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return jobs;
  },

  // Files
  async createFile(data: {
    jobId: string;
    fileType: string;
    originalName: string;
    storageKey: string;
    mimeType: string;
    sizeBytes: number;
    checksum?: string;
  }) {
    const [file] = await sql`
      INSERT INTO files (job_id, file_type, original_name, storage_key, mime_type, size_bytes, checksum)
      VALUES (
        ${data.jobId},
        ${data.fileType},
        ${data.originalName},
        ${data.storageKey},
        ${data.mimeType},
        ${data.sizeBytes},
        ${data.checksum || null}
      )
      RETURNING *
    `;
    return file;
  },

  async getFilesByJobId(jobId: string) {
    const files = await sql`
      SELECT * FROM files WHERE job_id = ${jobId} AND deleted_at IS NULL
    `;
    return files;
  },

  // Audit logs
  async createAuditLog(data: {
    jobId: string;
    stepNumber: number;
    stepName: string;
    description: string;
    inputSummary?: Record<string, any>;
    outputSummary?: Record<string, any>;
    warnings?: string[];
    counts?: Record<string, number>;
    durationMs?: number;
  }) {
    const [log] = await sql`
      INSERT INTO audit_logs (
        job_id, step_number, step_name, description,
        input_summary, output_summary, warnings, counts, duration_ms
      )
      VALUES (
        ${data.jobId},
        ${data.stepNumber},
        ${data.stepName},
        ${data.description},
        ${data.inputSummary ? sql.json(data.inputSummary) : null},
        ${data.outputSummary ? sql.json(data.outputSummary) : null},
        ${data.warnings ? sql.json(data.warnings) : null},
        ${data.counts ? sql.json(data.counts) : null},
        ${data.durationMs || null}
      )
      RETURNING *
    `;
    return log;
  },

  async getAuditLogsByJobId(jobId: string) {
    const logs = await sql`
      SELECT * FROM audit_logs
      WHERE job_id = ${jobId}
      ORDER BY step_number ASC
    `;
    return logs;
  },

  // Presets
  async createPreset(data: {
    userId: string;
    toolId: string;
    name: string;
    config: Record<string, any>;
    isDefault?: boolean;
  }) {
    const [preset] = await sql`
      INSERT INTO presets (user_id, tool_id, name, config, is_default)
      VALUES (
        ${data.userId},
        ${data.toolId},
        ${data.name},
        ${sql.json(data.config)},
        ${data.isDefault || false}
      )
      RETURNING *
    `;
    return preset;
  },

  async getPresetsByUserAndTool(userId: string, toolId: string) {
    const presets = await sql`
      SELECT * FROM presets
      WHERE user_id = ${userId} AND tool_id = ${toolId} AND deleted_at IS NULL
      ORDER BY is_default DESC, created_at DESC
    `;
    return presets;
  },

  async deletePreset(id: string) {
    await sql`
      UPDATE presets SET deleted_at = NOW() WHERE id = ${id}
    `;
  },

  // Rate limiting
  async checkRateLimit(identifier: string, identifierType: string, endpoint: string, limit: number): Promise<boolean> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour window

    const [existing] = await sql`
      SELECT * FROM rate_limits
      WHERE identifier = ${identifier}
        AND identifier_type = ${identifierType}
        AND endpoint = ${endpoint}
        AND window_end > ${windowStart}
    `;

    if (!existing) {
      // Create new rate limit entry
      await sql`
        INSERT INTO rate_limits (identifier, identifier_type, endpoint, request_count, window_start, window_end)
        VALUES (${identifier}, ${identifierType}, ${endpoint}, 1, ${now}, ${new Date(now.getTime() + 60 * 60 * 1000)})
      `;
      return true;
    }

    if (existing.request_count >= limit) {
      return false;
    }

    // Increment counter
    await sql`
      UPDATE rate_limits
      SET request_count = request_count + 1, updated_at = NOW()
      WHERE id = ${existing.id}
    `;
    return true;
  },

  // Cleanup
  async cleanupOldData() {
    await sql`SELECT cleanup_old_data()`;
  },
};

