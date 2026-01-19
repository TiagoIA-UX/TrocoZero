import { randomUUID } from "node:crypto";
import { Store } from "../../domain/entities/Store.js";

export interface StoreRepository {
  save(store: Store): Promise<void>;
}

export class CreateStore {
  constructor(private readonly storeRepo: StoreRepository) {}

  async execute(params: { name: string }): Promise<{ storeId: string; name: string }> {
    const store = new Store(randomUUID(), params.name, new Date());
    await this.storeRepo.save(store);
    return { storeId: store.id, name: store.name };
  }
}
