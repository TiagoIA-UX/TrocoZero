import { randomUUID } from "node:crypto";
import { PixTransfer } from "../../domain/entities/PixTransfer.js";
import { TransactionLog } from "../../domain/entities/TransactionLog.js";
import { Money } from "../../shared/money.js";
import { Sale } from "../../domain/entities/Sale.js";

export interface SaleRepository {
  findById(id: string): Promise<Sale | null>;
  save(sale: Sale): Promise<void>;
}

export interface PixTransferRepository {
  save(transfer: PixTransfer): Promise<void>;
}

export interface TransactionLogRepository {
  save(log: TransactionLog): Promise<void>;
}

export class RequestPixChange {
  constructor(
    private readonly saleRepo: SaleRepository,
    private readonly pixRepo: PixTransferRepository,
    private readonly logRepo: TransactionLogRepository
  ) {}

  async execute(params: {
    saleId: string;
    pixKey: string;
  }): Promise<{
    pixTransferId: string;
    status: "SENT";
    changeAmount: number;
  }> {
    const sale = await this.saleRepo.findById(params.saleId);
    if (!sale) throw new Error("Venda nao encontrada");

    if (sale.changeAmount.cents <= 0) {
      throw new Error("Venda sem troco");
    }

    sale.markPixChangeSent();
    await this.saleRepo.save(sale);

    // Decisao importante: no MVP simulamos envio imediato como SENT.
    const transfer = new PixTransfer(
      randomUUID(),
      sale.id,
      params.pixKey,
      Money.fromCents(sale.changeAmount.cents),
      "SENT",
      new Date()
    );

    await this.pixRepo.save(transfer);

    await this.logRepo.save(
      new TransactionLog(
        randomUUID(),
        "PIX_CHANGE_SENT",
        {
          saleId: sale.id,
          storeId: sale.storeId,
          pixTransferId: transfer.id,
          pixKey: params.pixKey,
          changeAmount: sale.changeAmount.cents
        },
        new Date()
      )
    );

    return {
      pixTransferId: transfer.id,
      status: "SENT",
      changeAmount: sale.changeAmount.cents
    };
  }
}
