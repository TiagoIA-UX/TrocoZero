import { pool } from "../db/pg.js";
import { Store } from "../../domain/entities/Store.js";

export class PgStoreRepository {
  async save(store: Store): Promise<void> {
    await pool.query(
      `
      INSERT INTO stores (id, name, created_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (id)
      DO UPDATE SET name = EXCLUDED.name, created_at = EXCLUDED.created_at
    `,
      [store.id, store.name, store.createdAt]
    );
  }

  async list(): Promise<Store[]> {
    const result = await pool.query(
      "SELECT id, name, created_at FROM stores ORDER BY created_at ASC"
    );
    return result.rows.map((row) => new Store(row.id, row.name, row.created_at));
  }

  async findById(id: string): Promise<Store | null> {
    const result = await pool.query(
      "SELECT id, name, created_at FROM stores WHERE id = $1",
      [id]
    );
    const row = result.rows[0];
    if (!row) return null;
    return new Store(row.id, row.name, row.created_at);
  }
}
