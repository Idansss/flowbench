#!/usr/bin/env ts-node
/**
 * Test database connection
 * Run: node --loader ts-node/esm scripts/test-db.ts
 */

import { sql } from "../src/lib/db.js";

async function testConnection() {
  try {
    console.log("🔍 Testing database connection...\n");
    
    // Test basic connection
    const [result] = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log("✅ Database connected successfully!");
    console.log(`   Time: ${result.current_time}`);
    console.log(`   PostgreSQL: ${result.pg_version.split(" ")[1]}\n`);
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    if (tables.length === 0) {
      console.log("⚠️  No tables found. Run migrations:");
      console.log("   pnpm db:migrate\n");
    } else {
      console.log(`✅ Found ${tables.length} tables:`);
      tables.forEach((t: any) => console.log(`   - ${t.table_name}`));
      console.log("");
    }
    
    // Check for sample data
    const [userCount] = await sql`SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL`;
    const [jobCount] = await sql`SELECT COUNT(*) as count FROM jobs WHERE deleted_at IS NULL`;
    
    console.log("📊 Data Summary:");
    console.log(`   Users: ${userCount.count}`);
    console.log(`   Jobs: ${jobCount.count}\n`);
    
    if (userCount.count === 0) {
      console.log("💡 Tip: Run seed script to add sample data:");
      console.log("   pnpm db:seed\n");
    }
    
    console.log("🎉 Database is ready to use!");
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(`   ${error instanceof Error ? error.message : error}\n`);
    console.error("💡 Troubleshooting:");
    console.error("   1. Check DATABASE_URL in .env.local");
    console.error("   2. Ensure PostgreSQL is running");
    console.error("   3. Verify database exists");
    console.error("   4. Check network connectivity (if remote)\n");
    console.error("📖 See SETUP.md for detailed instructions");
    process.exit(1);
  }
}

testConnection();

