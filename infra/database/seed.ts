import { sql } from "../../apps/web/src/lib/db";

async function seed() {
  console.log("Seeding database...");

  // Create a test user
  const [user] = await sql`
    INSERT INTO users (email, name, is_anonymous)
    VALUES ('demo@flowbench.app', 'Demo User', false)
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING *
  `;
  console.log("✓ Created demo user:", user.id);

  // Create sample jobs
  const [job1] = await sql`
    INSERT INTO jobs (user_id, tool_id, status, input_config, result_summary)
    VALUES (
      ${user.id},
      'excel-fix-it',
      'succeeded',
      '{"dedupeRows": true, "trimWhitespace": true}'::jsonb,
      '{"rowsProcessed": 1000, "duplicatesRemoved": 50}'::jsonb
    )
    RETURNING *
  `;
  console.log("✓ Created sample job:", job1.id);

  // Create audit logs for the job
  await sql`
    INSERT INTO audit_logs (job_id, step_number, step_name, description, counts, duration_ms)
    VALUES
      (${job1.id}, 1, 'Parse Input', 'Parsed sample.csv', '{"rows": 1000}'::jsonb, 150),
      (${job1.id}, 2, 'Remove Duplicates', 'Removed 50 duplicate rows', '{"removed": 50}'::jsonb, 300),
      (${job1.id}, 3, 'Trim Whitespace', 'Cleaned all cells', '{}'::jsonb, 100)
  `;
  console.log("✓ Created audit logs");

  // Create a sample preset
  await sql`
    INSERT INTO presets (user_id, tool_id, name, config, is_default)
    VALUES (
      ${user.id},
      'excel-fix-it',
      'Quick Clean',
      '{"dedupeRows": true, "trimWhitespace": true, "normalizeCase": "lower"}'::jsonb,
      true
    )
  `;
  console.log("✓ Created sample preset");

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});

