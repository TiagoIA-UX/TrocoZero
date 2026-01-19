import { TransactionLog } from "../../domain/entities/TransactionLog.js";

export interface TransactionLogRepository {
  listByDateAndStore(params: { date: string; storeId: string }): Promise<TransactionLog[]>;
}

export class GetDailyReport {
  constructor(private readonly logRepo: TransactionLogRepository) {}

  async execute(params: { date: string; storeId: string }): Promise<{
    storeId: string;
    date: string;
    totalPixChange: number;
    count: number;
  }> {
    const logs = await this.logRepo.listByDateAndStore(params);

    const pixLogs = logs.filter((log) => log.type === "PIX_CHANGE_SENT");
    const totalPixChange = pixLogs.reduce((acc, log) => {
      const amount = (log.payload["changeAmount"] as number) ?? 0;
      return acc + amount;
    }, 0);

    return {
      storeId: params.storeId,
      date: params.date,
      totalPixChange,
      count: pixLogs.length
    };
  }
}
