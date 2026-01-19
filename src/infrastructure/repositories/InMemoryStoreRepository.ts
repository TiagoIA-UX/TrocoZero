import { Store } from "../../domain/entities/Store.js";

export class InMemoryStoreRepository {
  private items = new Map<string, Store>();

  async save(store: Store): Promise<void> {
    this.items.set(store.id, store);
  }

  async list(): Promise<Store[]> {
    return Array.from(this.items.values());
  }

  async findById(id: string): Promise<Store | null> {
    return this.items.get(id) ?? null;
  }
}
