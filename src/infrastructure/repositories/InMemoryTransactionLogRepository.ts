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

  async listByStoreAndDateRange(params: {
    storeId: string;
    startDate: string;
    endDate: string;
    limit?: number;
    offset?: number;
  }): Promise<TransactionLog[]> {
    const filtered = this.items
      .filter((log) => {
        const storeId = log.payload["storeId"];
        if (storeId !== params.storeId) return false;

        const logDate = log.occurredAt.toISOString().slice(0, 10);
        return logDate >= params.startDate && logDate <= params.endDate;
      })
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

    const offset = params.offset ?? 0;
    const limit = params.limit ?? 50;
    return filtered.slice(offset, offset + limit);
  }

  async countByStoreAndDateRange(params: {
    storeId: string;
    startDate: string;
    endDate: string;
  }): Promise<number> {
    return this.items.filter((log) => {
      const storeId = log.payload["storeId"];
      if (storeId !== params.storeId) return false;

      const logDate = log.occurredAt.toISOString().slice(0, 10);
      return logDate >= params.startDate && logDate <= params.endDate;
    }).length;
  }
}
