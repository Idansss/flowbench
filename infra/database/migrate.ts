import { readFileSync } from "fs";
import { join } from "path";
import { sql } from "../../apps/web/src/lib/db";

async function migrate() {
  console.log("Running database migrations...");

  try {
    // Read and execute schema.sql
    const schemaPath = join(__dirname, "schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");

    // Split by semicolon and execute each statement
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      await sql.unsafe(statement);
    }

    console.log("✓ Schema created successfully");
    console.log("✓ Migrations complete!");

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();

