import { describe, it, expect, beforeEach } from "vitest";
import { ProcessCashSale } from "../../src/application/use-cases/ProcessCashSale.js";
import { RequestPixChange } from "../../src/application/use-cases/RequestPixChange.js";
import { ConfirmPixTransfer } from "../../src/application/use-cases/ConfirmPixTransfer.js";
import { InMemorySaleRepository } from "../../src/infrastructure/repositories/InMemorySaleRepository.js";
import { InMemoryPixTransferRepository } from "../../src/infrastructure/repositories/InMemoryPixTransferRepository.js";
import { InMemoryTransactionLogRepository } from "../../src/infrastructure/repositories/InMemoryTransactionLogRepository.js";

describe("Fluxo de venda em dinheiro com troco Pix", () => {
  let saleRepo: InMemorySaleRepository;
  let pixRepo: InMemoryPixTransferRepository;
  let logRepo: InMemoryTransactionLogRepository;
  let processCashSale: ProcessCashSale;
  let requestPixChange: RequestPixChange;
  let confirmPixTransfer: ConfirmPixTransfer;

  beforeEach(() => {
    saleRepo = new InMemorySaleRepository();
    pixRepo = new InMemoryPixTransferRepository();
    logRepo = new InMemoryTransactionLogRepository();
    processCashSale = new ProcessCashSale(saleRepo, logRepo);
    requestPixChange = new RequestPixChange(saleRepo, pixRepo, logRepo);
    confirmPixTransfer = new ConfirmPixTransfer(pixRepo, saleRepo, logRepo);
  });

  it("deve processar venda e calcular troco corretamente", async () => {
    const result = await processCashSale.execute({
      storeId: "store-1",
      registerId: "register-1",
      saleTotal: 12500,
      cashReceived: 15000
    });

    expect(result.saleId).toBeDefined();
    expect(result.saleTotal).toBe(12500);
    expect(result.cashReceived).toBe(15000);
    expect(result.changeAmount).toBe(2500);
    expect(result.canOfferPixChange).toBe(true);
  });

  it("deve indicar que nao pode oferecer Pix quando nao ha troco", async () => {
    const result = await processCashSale.execute({
      storeId: "store-1",
      registerId: "register-1",
      saleTotal: 10000,
      cashReceived: 10000
    });

    expect(result.changeAmount).toBe(0);
    expect(result.canOfferPixChange).toBe(false);
  });

  it("deve executar fluxo completo de troco via Pix", async () => {
    // 1. Criar venda
    const sale = await processCashSale.execute({
      storeId: "store-1",
      registerId: "register-1",
      saleTotal: 12500,
      cashReceived: 15000
    });

    expect(sale.canOfferPixChange).toBe(true);

    // 2. Solicitar troco via Pix
    const pixRequest = await requestPixChange.execute({
      saleId: sale.saleId,
      pixKey: "cpf:12345678900"
    });

    expect(pixRequest.pixTransferId).toBeDefined();
    expect(pixRequest.status).toBe("SENT");
    expect(pixRequest.changeAmount).toBe(2500);

    // 3. Confirmar Pix
    const confirmation = await confirmPixTransfer.execute({
      pixTransferId: pixRequest.pixTransferId
    });

    expect(confirmation.status).toBe("CONFIRMED");

    // 4. Verificar estado final
    const finalSale = await saleRepo.findById(sale.saleId);
    expect(finalSale?.status).toBe("PIX_CHANGE_CONFIRMED");
  });

  it("deve rejeitar troco via Pix quando venda nao existe", async () => {
    await expect(
      requestPixChange.execute({
        saleId: "venda-inexistente",
        pixKey: "cpf:12345678900"
      })
    ).rejects.toThrow("Venda nao encontrada");
  });

  it("deve rejeitar troco via Pix quando nao ha troco", async () => {
    const sale = await processCashSale.execute({
      storeId: "store-1",
      registerId: "register-1",
      saleTotal: 10000,
      cashReceived: 10000
    });

    await expect(
      requestPixChange.execute({
        saleId: sale.saleId,
        pixKey: "cpf:12345678900"
      })
    ).rejects.toThrow("Venda sem troco");
  });

  it("deve ser idempotente na confirmacao de Pix", async () => {
    const sale = await processCashSale.execute({
      storeId: "store-1",
      registerId: "register-1",
      saleTotal: 12500,
      cashReceived: 15000
    });

    const pixRequest = await requestPixChange.execute({
      saleId: sale.saleId,
      pixKey: "cpf:12345678900"
    });

    // Confirmar duas vezes
    const first = await confirmPixTransfer.execute({
      pixTransferId: pixRequest.pixTransferId
    });
    const second = await confirmPixTransfer.execute({
      pixTransferId: pixRequest.pixTransferId
    });

    expect(first.status).toBe("CONFIRMED");
    expect(second.status).toBe("CONFIRMED");
  });
});
