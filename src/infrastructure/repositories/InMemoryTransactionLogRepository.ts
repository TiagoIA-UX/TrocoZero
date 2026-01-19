import { TransactionLog } from "../../domain/entities/TransactionLog.js";

export class InMemoryTransactionLogRepository {
  private items: TransactionLog[] = [];

  async save(log: TransactionLog): Promise<void> {
    this.items.push(log);
  }

  async listByDateAndStore(params: { date: string; storeId: string }): Promise<TransactionLog[]> {
    // Decisao importante: MVP filtra por payload.storeId e data do ocorrido.
    return this.items.filter((log) => {
      const storeId = log.payload["storeId"];
      if (storeId !== params.storeId) return false;

      const logDate = log.occurredAt.toISOString().slice(0, 10);
      return logDate === params.date;
    });
  }
}
