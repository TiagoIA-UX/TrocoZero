import { pool } from "../db/pg.js";
import { TransactionLog } from "../../domain/entities/TransactionLog.js";

export class PgTransactionLogRepository {
  async save(log: TransactionLog): Promise<void> {
    await pool.query(
      `
      INSERT INTO transaction_logs (id, type, payload, occurred_at)
      VALUES ($1, $2, $3, $4)
    `,
      [log.id, log.type, log.payload, log.occurredAt]
    );
  }

  async listByDateAndStore(params: { date: string; storeId: string }): Promise<TransactionLog[]> {
    const result = await pool.query(
      `
      SELECT id, type, payload, occurred_at
      FROM transaction_logs
      WHERE payload->>'storeId' = $1
        AND occurred_at::date = $2::date
      ORDER BY occurred_at ASC
    `,
      [params.storeId, params.date]
    );

    return result.rows.map(
      (row) => new TransactionLog(row.id, row.type, row.payload, row.occurred_at)
    );
  }
}
