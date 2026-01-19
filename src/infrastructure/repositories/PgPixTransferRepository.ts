import { pool } from "../db/pg.js";
import { PixTransfer } from "../../domain/entities/PixTransfer.js";
import { Money } from "../../shared/money.js";

export class PgPixTransferRepository {
  async save(transfer: PixTransfer): Promise<void> {
    await pool.query(
      `
      INSERT INTO pix_transfers (id, sale_id, pix_key, amount, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id)
      DO UPDATE SET
        sale_id = EXCLUDED.sale_id,
        pix_key = EXCLUDED.pix_key,
        amount = EXCLUDED.amount,
        status = EXCLUDED.status,
        created_at = EXCLUDED.created_at
    `,
      [
        transfer.id,
        transfer.saleId,
        transfer.pixKey,
        transfer.amount.cents,
        transfer.status,
        transfer.createdAt
      ]
    );
  }

  async findById(id: string): Promise<PixTransfer | null> {
    const result = await pool.query(
      `
      SELECT id, sale_id, pix_key, amount, status, created_at
      FROM pix_transfers
      WHERE id = $1
    `,
      [id]
    );

    const row = result.rows[0];
    if (!row) return null;

    return new PixTransfer(
      row.id,
      row.sale_id,
      row.pix_key,
      Money.fromCents(row.amount),
      row.status,
      row.created_at
    );
  }
}
