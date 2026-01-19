import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pg.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureSchemaMigrations(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function runMigrations(): Promise<void> {
  await ensureSchemaMigrations();

  const migrationsDir = path.resolve(__dirname, "../../../migrations");
  const files = (await readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const applied = await pool.query<{ id: string }>(
    "SELECT id FROM schema_migrations ORDER BY id"
  );
  const appliedIds = new Set(applied.rows.map((r) => r.id));

  for (const file of files) {
    if (appliedIds.has(file)) continue;

    const sql = await readFile(path.join(migrationsDir, file), "utf8");

    // Decisao importante: cada migration roda em transacao unica.
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (id) VALUES ($1)", [file]);
      await client.query("COMMIT");
      // eslint-disable-next-line no-console
      console.log(`Applied migration: ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  await pool.end();
}

runMigrations().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
