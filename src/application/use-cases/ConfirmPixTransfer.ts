import { randomUUID } from "node:crypto";
import { TransactionLog } from "../../domain/entities/TransactionLog.js";
import { PixTransfer } from "../../domain/entities/PixTransfer.js";
import { Sale } from "../../domain/entities/Sale.js";

export interface PixTransferRepository {
  findById(id: string): Promise<PixTransfer | null>;
  save(transfer: PixTransfer): Promise<void>;
}

export interface SaleRepository {
  findById(id: string): Promise<Sale | null>;
  save(sale: Sale): Promise<void>;
}

export interface TransactionLogRepository {
  save(log: TransactionLog): Promise<void>;
}

export class ConfirmPixTransfer {
  constructor(
    private readonly pixRepo: PixTransferRepository,
    private readonly saleRepo: SaleRepository,
    private readonly logRepo: TransactionLogRepository
  ) {}

  async execute(params: { pixTransferId: string }): Promise<{ status: "CONFIRMED" }> {
    const transfer = await this.pixRepo.findById(params.pixTransferId);
    if (!transfer) throw new Error("PixTransfer nao encontrado");

    if (transfer.status === "CONFIRMED") {
      // Decisao importante: confirmacao idempotente no MVP.
      return { status: "CONFIRMED" };
    }

    transfer.status = "CONFIRMED";
    await this.pixRepo.save(transfer);

    const sale = await this.saleRepo.findById(transfer.saleId);
    if (!sale) throw new Error("Venda nao encontrada para PixTransfer");

    sale.markPixChangeConfirmed();
    await this.saleRepo.save(sale);

    await this.logRepo.save(
      new TransactionLog(
        randomUUID(),
        "PIX_CHANGE_CONFIRMED",
        { saleId: sale.id, storeId: sale.storeId, pixTransferId: transfer.id },
        new Date()
      )
    );

    return { status: "CONFIRMED" };
  }
}
