import { NextRequest, NextResponse } from "next/server";
import { db, sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get user ID from session/auth (simplified for now)
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get user data
    const user = await db.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all jobs
    const jobs = await sql`
      SELECT 
        j.id,
        j.tool_id,
        j.status,
        j.input_config,
        j.result_summary,
        j.created_at,
        j.completed_at
      FROM jobs j
      WHERE j.user_id = ${userId}
        AND j.deleted_at IS NULL
      ORDER BY j.created_at DESC
    `;

    // Get all files
    const files = await sql`
      SELECT 
        f.id,
        f.job_id,
        f.file_type,
        f.original_name,
        f.size_bytes,
        f.created_at
      FROM files f
      JOIN jobs j ON f.job_id = j.id
      WHERE j.user_id = ${userId}
        AND f.deleted_at IS NULL
    `;

    // Get all presets
    const presets = await db.getPresetsByUserAndTool(userId, ""); // All tools

    // Get all audit logs
    const auditLogs = await sql`
      SELECT 
        a.id,
        a.job_id,
        a.step_number,
        a.step_name,
        a.description,
        a.counts,
        a.created_at
      FROM audit_logs a
      JOIN jobs j ON a.job_id = j.id
      WHERE j.user_id = ${userId}
      ORDER BY a.created_at DESC
    `;

    // Create export
    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
      },
      jobs: jobs.map((j: any) => ({
        id: j.id,
        toolId: j.tool_id,
        status: j.status,
        createdAt: j.created_at,
        completedAt: j.completed_at,
        summary: j.result_summary,
      })),
      files: files.map((f: any) => ({
        id: f.id,
        jobId: f.job_id,
        name: f.original_name,
        type: f.file_type,
        sizeBytes: f.size_bytes,
        createdAt: f.created_at,
      })),
      presets: presets.map((p: any) => ({
        id: p.id,
        toolId: p.tool_id,
        name: p.name,
        config: p.config,
      })),
      auditLogs: auditLogs.slice(0, 1000), // Limit to recent 1000 logs
      exportedAt: new Date().toISOString(),
      retentionPolicy: {
        filesRetention: user.extended_retention ? "7 days" : "24 hours",
        jobsRetention: "30 days",
      },
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="flowbench-data-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

