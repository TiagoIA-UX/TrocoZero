import { CashRegister } from "../../domain/entities/CashRegister.js";

export class InMemoryCashRegisterRepository {
  private items = new Map<string, CashRegister>();

  async save(register: CashRegister): Promise<void> {
    this.items.set(register.id, register);
  }

  async listByStore(storeId: string): Promise<CashRegister[]> {
    return Array.from(this.items.values()).filter((r) => r.storeId === storeId);
  }

  async findById(id: string): Promise<CashRegister | null> {
    return this.items.get(id) ?? null;
  }
}
