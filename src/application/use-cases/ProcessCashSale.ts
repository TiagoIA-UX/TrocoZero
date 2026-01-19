import { randomUUID } from "node:crypto";
import { Money } from "../../shared/money.js";
import { Sale } from "../../domain/entities/Sale.js";
import { TransactionLog } from "../../domain/entities/TransactionLog.js";

export interface SaleRepository {
  save(sale: Sale): Promise<void>;
}

export interface TransactionLogRepository {
  save(log: TransactionLog): Promise<void>;
}

export class ProcessCashSale {
  constructor(
    private readonly saleRepo: SaleRepository,
    private readonly logRepo: TransactionLogRepository
  ) {}

  async execute(params: {
    storeId: string;
    registerId: string;
    saleTotal: number;
    cashReceived: number;
  }): Promise<{
    saleId: string;
    saleTotal: number;
    cashReceived: number;
    changeAmount: number;
    canOfferPixChange: boolean;
  }> {
    const sale = Sale.createCashSale({
      id: randomUUID(),
      storeId: params.storeId,
      registerId: params.registerId,
      saleTotal: Money.fromCents(params.saleTotal),
      cashReceived: Money.fromCents(params.cashReceived)
    });

    await this.saleRepo.save(sale);

    await this.logRepo.save(
      new TransactionLog(
        randomUUID(),
        "CASH_SALE_REGISTERED",
        {
          saleId: sale.id,
          storeId: sale.storeId,
          registerId: sale.registerId,
          saleTotal: sale.saleTotal.cents,
          cashReceived: sale.cashReceived.cents,
          changeAmount: sale.changeAmount.cents
        },
        new Date()
      )
    );

    return {
      saleId: sale.id,
      saleTotal: sale.saleTotal.cents,
      cashReceived: sale.cashReceived.cents,
      changeAmount: sale.changeAmount.cents,
      canOfferPixChange: sale.changeAmount.cents > 0
    };
  }
}
