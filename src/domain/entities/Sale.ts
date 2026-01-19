import { Money } from "../../shared/money.js";

export type SaleStatus = "OPEN" | "PAID" | "PIX_CHANGE_SENT" | "PIX_CHANGE_CONFIRMED";

export class Sale {
  private constructor(
    public readonly id: string,
    public readonly storeId: string,
    public readonly registerId: string,
    public readonly saleTotal: Money,
    public readonly cashReceived: Money,
    public readonly changeAmount: Money,
    public status: SaleStatus,
    public readonly createdAt: Date
  ) {}

  static restore(params: {
    id: string;
    storeId: string;
    registerId: string;
    saleTotal: Money;
    cashReceived: Money;
    changeAmount: Money;
    status: SaleStatus;
    createdAt: Date;
  }): Sale {
    // Decisao importante: restaurar preserva status e timestamps do banco.
    return new Sale(
      params.id,
      params.storeId,
      params.registerId,
      params.saleTotal,
      params.cashReceived,
      params.changeAmount,
      params.status,
      params.createdAt
    );
  }

  static createCashSale(params: {
    id: string;
    storeId: string;
    registerId: string;
    saleTotal: Money;
    cashReceived: Money;
  }): Sale {
    if (params.cashReceived.cents < params.saleTotal.cents) {
      throw new Error("Dinheiro recebido insuficiente");
    }

    const changeAmount = params.cashReceived.subtract(params.saleTotal);

    // Decisao importante: pagamento em dinheiro liquida a venda imediatamente.
    return new Sale(
      params.id,
      params.storeId,
      params.registerId,
      params.saleTotal,
      params.cashReceived,
      changeAmount,
      "PAID",
      new Date()
    );
  }

  markPixChangeSent(): void {
    if (this.changeAmount.cents <= 0) {
      throw new Error("Nao ha troco para enviar via Pix");
    }
    this.status = "PIX_CHANGE_SENT";
  }

  markPixChangeConfirmed(): void {
    this.status = "PIX_CHANGE_CONFIRMED";
  }
}
