import { randomUUID } from "node:crypto";
import { CashRegister } from "../../domain/entities/CashRegister.js";

export interface CashRegisterRepository {
  save(register: CashRegister): Promise<void>;
}

export class CreateCashRegister {
  constructor(private readonly registerRepo: CashRegisterRepository) {}

  async execute(params: { storeId: string; label: string }): Promise<{
    registerId: string;
    storeId: string;
    label: string;
  }> {
    const register = new CashRegister(randomUUID(), params.storeId, params.label, new Date());
    await this.registerRepo.save(register);
    return { registerId: register.id, storeId: register.storeId, label: register.label };
  }
}
