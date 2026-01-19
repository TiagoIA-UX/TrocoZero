import { Money } from "../../shared/money.js";

export type PixTransferStatus = "PENDING" | "SENT" | "CONFIRMED" | "FAILED";

export class PixTransfer {
  constructor(
    public readonly id: string,
    public readonly saleId: string,
    public readonly pixKey: string,
    public readonly amount: Money,
    public status: PixTransferStatus,
    public readonly createdAt: Date
  ) {}
}
