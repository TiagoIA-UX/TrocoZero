import { Store } from "../../domain/entities/Store.js";

export interface StoreRepository {
  list(): Promise<Store[]>;
}

export class ListStores {
  constructor(private readonly storeRepo: StoreRepository) {}

  async execute(): Promise<{ stores: { id: string; name: string }[] }> {
    const stores = await this.storeRepo.list();
    return { stores: stores.map((s) => ({ id: s.id, name: s.name })) };
  }
}
