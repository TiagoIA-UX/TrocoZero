import { CashRegister } from "../../domain/entities/CashRegister.js";

export interface CashRegisterRepository {
  listByStore(storeId: string): Promise<CashRegister[]>;
}

export class ListCashRegisters {
  constructor(private readonly registerRepo: CashRegisterRepository) {}

  async execute(params: { storeId: string }): Promise<{ registers: { id: string; label: string }[] }> {
    const registers = await this.registerRepo.listByStore(params.storeId);
    return { registers: registers.map((r) => ({ id: r.id, label: r.label })) };
  }
}
