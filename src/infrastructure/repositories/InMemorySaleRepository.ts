import { Sale } from "../../domain/entities/Sale.js";

export class InMemorySaleRepository {
  private items = new Map<string, Sale>();

  async save(sale: Sale): Promise<void> {
    this.items.set(sale.id, sale);
  }

  async findById(id: string): Promise<Sale | null> {
    return this.items.get(id) ?? null;
  }
}
