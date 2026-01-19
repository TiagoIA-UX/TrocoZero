import { pool } from "../db/pg.js";
import { Sale } from "../../domain/entities/Sale.js";
import { Money } from "../../shared/money.js";

export class PgSaleRepository {
  async save(sale: Sale): Promise<void> {
    await pool.query(
      `
      INSERT INTO sales (id, store_id, register_id, sale_total, cash_received, change_amount, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id)
      DO UPDATE SET
        store_id = EXCLUDED.store_id,
        register_id = EXCLUDED.register_id,
        sale_total = EXCLUDED.sale_total,
        cash_received = EXCLUDED.cash_received,
        change_amount = EXCLUDED.change_amount,
        status = EXCLUDED.status,
        created_at = EXCLUDED.created_at
    `,
      [
        sale.id,
        sale.storeId,
        sale.registerId,
        sale.saleTotal.cents,
        sale.cashReceived.cents,
        sale.changeAmount.cents,
        sale.status,
        sale.createdAt
      ]
    );
  }

  async findById(id: string): Promise<Sale | null> {
    const result = await pool.query(
      `
      SELECT id, store_id, register_id, sale_total, cash_received, change_amount, status, created_at
      FROM sales
      WHERE id = $1
    `,
      [id]
    );

    const row = result.rows[0];
    if (!row) return null;

    return Sale.restore({
      id: row.id,
      storeId: row.store_id,
      registerId: row.register_id,
      saleTotal: Money.fromCents(row.sale_total),
      cashReceived: Money.fromCents(row.cash_received),
      changeAmount: Money.fromCents(row.change_amount),
      status: row.status,
      createdAt: row.created_at
    });
  }
}
