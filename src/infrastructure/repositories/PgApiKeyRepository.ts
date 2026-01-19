import { pool } from "../db/pg.js";
import { ApiKey } from "../../domain/entities/ApiKey.js";

export class PgApiKeyRepository {
  async save(apiKey: ApiKey): Promise<void> {
    await pool.query(
      `
      INSERT INTO api_keys (id, store_id, name, key_hash, prefix, active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id)
      DO UPDATE SET
        store_id = EXCLUDED.store_id,
        name = EXCLUDED.name,
        key_hash = EXCLUDED.key_hash,
        prefix = EXCLUDED.prefix,
        active = EXCLUDED.active,
        created_at = EXCLUDED.created_at
    `,
      [
        apiKey.id,
        apiKey.storeId,
        apiKey.name,
        apiKey.keyHash,
        apiKey.prefix,
        apiKey.active,
        apiKey.createdAt
      ]
    );
  }

  async listByStore(storeId: string): Promise<ApiKey[]> {
    const result = await pool.query(
      `
      SELECT id, store_id, name, key_hash, prefix, active, created_at
      FROM api_keys
      WHERE store_id = $1
      ORDER BY created_at DESC
    `,
      [storeId]
    );

    return result.rows.map(
      (row) =>
        new ApiKey(
          row.id,
          row.store_id,
          row.name,
          row.key_hash,
          row.prefix,
          row.active,
          row.created_at
        )
    );
  }

  async findByHash(hash: string): Promise<ApiKey | null> {
    const result = await pool.query(
      `
      SELECT id, store_id, name, key_hash, prefix, active, created_at
      FROM api_keys
      WHERE key_hash = $1 AND active = true
      LIMIT 1
    `,
      [hash]
    );

    const row = result.rows[0];
    if (!row) return null;

    return new ApiKey(
      row.id,
      row.store_id,
      row.name,
      row.key_hash,
      row.prefix,
      row.active,
      row.created_at
    );
  }
}
