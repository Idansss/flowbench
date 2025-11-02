import { NextRequest, NextResponse } from "next/server";
import { db, sql } from "@/lib/db";
import { storage } from "@/lib/storage";
import { config } from "@/config";

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🧹 Running cleanup job...");

    // Step 1: Get files to delete (24h retention)
    const filesToDelete24h = await sql`
      SELECT f.storage_key
      FROM files f
      JOIN jobs j ON f.job_id = j.id
      LEFT JOIN users u ON j.user_id = u.id
      WHERE f.deleted_at IS NULL
        AND f.created_at < NOW() - INTERVAL '24 hours'
        AND (u.extended_retention = FALSE OR u.extended_retention IS NULL OR u.id IS NULL)
    `;

    // Step 2: Get files to delete (7d retention)
    const filesToDelete7d = await sql`
      SELECT f.storage_key
      FROM files f
      JOIN jobs j ON f.job_id = j.id
      JOIN users u ON j.user_id = u.id
      WHERE f.deleted_at IS NULL
        AND f.created_at < NOW() - INTERVAL '7 days'
        AND u.extended_retention = TRUE
    `;

    const allFilesToDelete = [
      ...filesToDelete24h.map((f: any) => f.storage_key),
      ...filesToDelete7d.map((f: any) => f.storage_key),
    ];

    console.log(`  Found ${allFilesToDelete.length} files to delete from storage`);

    // Step 3: Delete from storage
    if (allFilesToDelete.length > 0) {
      await storage.deleteFiles(allFilesToDelete);
      console.log(`  ✓ Deleted ${allFilesToDelete.length} files from storage`);
    }

    // Step 4: Run database cleanup (marks files and jobs as deleted)
    await db.cleanupOldData();
    console.log("  ✓ Cleaned up database records");

    // Step 5: Clean up old rate limit records
    const rateLimitResult = await sql`
      DELETE FROM rate_limits
      WHERE window_end < NOW() - INTERVAL '24 hours'
    `;
    console.log(`  ✓ Cleaned up ${rateLimitResult.count} rate limit records`);

    // Step 6: Clean up expired sessions
    const sessionResult = await sql`
      DELETE FROM sessions
      WHERE expires_at < NOW()
    `;
    console.log(`  ✓ Cleaned up ${sessionResult.count} expired sessions`);

    // Summary
    const summary = {
      filesDeletedFromStorage: allFilesToDelete.length,
      rateLimitsDeleted: rateLimitResult.count,
      sessionsDeleted: sessionResult.count,
      timestamp: new Date().toISOString(),
    };

    console.log("🎉 Cleanup complete:", summary);

    return NextResponse.json({
      success: true,
      message: "Cleanup completed successfully",
      ...summary,
    });
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


