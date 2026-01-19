import { pool } from "../db/pg.js";

export type IdempotencyRecord = {
  key: string;
  response: unknown;
};

export class PgIdempotencyRepository {
  async find(key: string): Promise<IdempotencyRecord | null> {
    const result = await pool.query(
      "SELECT key, response FROM idempotency_keys WHERE key = $1",
      [key]
    );
    const row = result.rows[0];
    if (!row) return null;
    return { key: row.key, response: row.response };
  }

  async save(record: IdempotencyRecord): Promise<void> {
    await pool.query(
      `
      INSERT INTO idempotency_keys (key, response)
      VALUES ($1, $2)
      ON CONFLICT (key) DO NOTHING
    `,
      [record.key, record.response]
    );
  }
}
