import { TransactionLog } from "../../domain/entities/TransactionLog.js";

export interface TransactionLogRepository {
  listByStoreAndDateRange(params: {
    storeId: string;
    startDate: string;
    endDate: string;
    limit?: number;
    offset?: number;
  }): Promise<TransactionLog[]>;
  countByStoreAndDateRange(params: {
    storeId: string;
    startDate: string;
    endDate: string;
  }): Promise<number>;
}

export class ListTransactions {
  constructor(private readonly logRepo: TransactionLogRepository) {}

  async execute(params: {
    storeId: string;
    startDate: string;
    endDate: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    transactions: Array<{
      id: string;
      type: string;
      payload: Record<string, unknown>;
      occurredAt: string;
    }>;
    total: number;
    limit: number;
    offset: number;
  }> {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const [transactions, total] = await Promise.all([
      this.logRepo.listByStoreAndDateRange({ ...params, limit, offset }),
      this.logRepo.countByStoreAndDateRange(params)
    ]);

    return {
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        payload: t.payload,
        occurredAt: t.occurredAt.toISOString()
      })),
      total,
      limit,
      offset
    };
  }
}
