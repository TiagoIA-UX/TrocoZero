import { describe, it, expect } from "vitest";
import { Sale } from "../../src/domain/entities/Sale.js";
import { Money } from "../../src/shared/money.js";

describe("Sale", () => {
  describe("createCashSale", () => {
    it("deve criar venda com troco correto", () => {
      const sale = Sale.createCashSale({
        id: "sale-1",
        storeId: "store-1",
        registerId: "register-1",
        saleTotal: Money.fromCents(12500),
        cashReceived: Money.fromCents(15000)
      });

      expect(sale.id).toBe("sale-1");
      expect(sale.saleTotal.cents).toBe(12500);
      expect(sale.cashReceived.cents).toBe(15000);
      expect(sale.changeAmount.cents).toBe(2500);
      expect(sale.status).toBe("PAID");
    });

    it("deve criar venda sem troco quando valor exato", () => {
      const sale = Sale.createCashSale({
        id: "sale-2",
        storeId: "store-1",
        registerId: "register-1",
        saleTotal: Money.fromCents(10000),
        cashReceived: Money.fromCents(10000)
      });

      expect(sale.changeAmount.cents).toBe(0);
    });

    it("deve rejeitar dinheiro insuficiente", () => {
      expect(() =>
        Sale.createCashSale({
          id: "sale-3",
          storeId: "store-1",
          registerId: "register-1",
          saleTotal: Money.fromCents(15000),
          cashReceived: Money.fromCents(10000)
        })
      ).toThrow("Dinheiro recebido insuficiente");
    });
  });

  describe("markPixChangeSent", () => {
    it("deve marcar status como PIX_CHANGE_SENT quando ha troco", () => {
      const sale = Sale.createCashSale({
        id: "sale-1",
        storeId: "store-1",
        registerId: "register-1",
        saleTotal: Money.fromCents(12500),
        cashReceived: Money.fromCents(15000)
      });

      sale.markPixChangeSent();
      expect(sale.status).toBe("PIX_CHANGE_SENT");
    });

    it("deve rejeitar envio de Pix quando nao ha troco", () => {
      const sale = Sale.createCashSale({
        id: "sale-2",
        storeId: "store-1",
        registerId: "register-1",
        saleTotal: Money.fromCents(10000),
        cashReceived: Money.fromCents(10000)
      });

      expect(() => sale.markPixChangeSent()).toThrow(
        "Nao ha troco para enviar via Pix"
      );
    });
  });

  describe("markPixChangeConfirmed", () => {
    it("deve marcar status como PIX_CHANGE_CONFIRMED", () => {
      const sale = Sale.createCashSale({
        id: "sale-1",
        storeId: "store-1",
        registerId: "register-1",
        saleTotal: Money.fromCents(12500),
        cashReceived: Money.fromCents(15000)
      });

      sale.markPixChangeSent();
      sale.markPixChangeConfirmed();
      expect(sale.status).toBe("PIX_CHANGE_CONFIRMED");
    });
  });
});
