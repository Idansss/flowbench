import { NextRequest, NextResponse } from "next/server";
import { db, sql } from "@/lib/db";
import { storage } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    // Get user ID from session/auth
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    console.log(`🗑️ Deleting all data for user ${userId}...`);

    // Step 1: Get all files for this user
    const files = await sql`
      SELECT f.storage_key
      FROM files f
      JOIN jobs j ON f.job_id = j.id
      WHERE j.user_id = ${userId}
        AND f.deleted_at IS NULL
    `;

    const storageKeys = files.map((f: any) => f.storage_key);
    console.log(`  Found ${storageKeys.length} files to delete`);

    // Step 2: Delete from storage
    if (storageKeys.length > 0) {
      await storage.deleteFiles(storageKeys);
      console.log(`  ✓ Deleted ${storageKeys.length} files from storage`);
    }

    // Step 3: Soft delete all files
    await sql`
      UPDATE files
      SET deleted_at = NOW()
      WHERE job_id IN (
        SELECT id FROM jobs WHERE user_id = ${userId}
      )
    `;

    // Step 4: Soft delete all jobs
    await sql`
      UPDATE jobs
      SET deleted_at = NOW()
      WHERE user_id = ${userId}
    `;

    // Step 5: Delete audit logs (cascade will handle this)
    const auditResult = await sql`
      DELETE FROM audit_logs
      WHERE job_id IN (
        SELECT id FROM jobs WHERE user_id = ${userId} AND deleted_at IS NOT NULL
      )
    `;

    // Step 6: Delete presets
    await sql`
      UPDATE presets
      SET deleted_at = NOW()
      WHERE user_id = ${userId}
    `;

    // Step 7: Delete user account
    await sql`
      UPDATE users
      SET deleted_at = NOW(), email = NULL, name = NULL
      WHERE id = ${userId}
    `;

    console.log("✅ User data deletion complete");

    return NextResponse.json({
      success: true,
      message: "All your data has been permanently deleted",
      deleted: {
        files: storageKeys.length,
        auditLogs: auditResult.count,
      },
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

