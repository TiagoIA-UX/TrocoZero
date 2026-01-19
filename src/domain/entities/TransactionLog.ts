export type TransactionType =
  | "CASH_SALE_REGISTERED"
  | "PIX_CHANGE_REQUESTED"
  | "PIX_CHANGE_SENT"
  | "PIX_CHANGE_CONFIRMED";

export class TransactionLog {
  constructor(
    public readonly id: string,
    public readonly type: TransactionType,
    public readonly payload: Record<string, unknown>,
    public readonly occurredAt: Date
  ) {}
}
