import { pool } from "../db/pg.js";
import { CashRegister } from "../../domain/entities/CashRegister.js";

export class PgCashRegisterRepository {
  async save(register: CashRegister): Promise<void> {
    await pool.query(
      `
      INSERT INTO cash_registers (id, store_id, label, created_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id)
      DO UPDATE SET store_id = EXCLUDED.store_id, label = EXCLUDED.label, created_at = EXCLUDED.created_at
    `,
      [register.id, register.storeId, register.label, register.createdAt]
    );
  }

  async listByStore(storeId: string): Promise<CashRegister[]> {
    const result = await pool.query(
      `
      SELECT id, store_id, label, created_at
      FROM cash_registers
      WHERE store_id = $1
      ORDER BY created_at ASC
    `,
      [storeId]
    );
    return result.rows.map(
      (row) => new CashRegister(row.id, row.store_id, row.label, row.created_at)
    );
  }

  async findById(id: string): Promise<CashRegister | null> {
    const result = await pool.query(
      "SELECT id, store_id, label, created_at FROM cash_registers WHERE id = $1",
      [id]
    );
    const row = result.rows[0];
    if (!row) return null;
    return new CashRegister(row.id, row.store_id, row.label, row.created_at);
  }
}
