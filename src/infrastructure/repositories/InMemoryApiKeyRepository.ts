import { ApiKey } from "../../domain/entities/ApiKey.js";

export class InMemoryApiKeyRepository {
  private items = new Map<string, ApiKey>();

  async save(apiKey: ApiKey): Promise<void> {
    this.items.set(apiKey.id, apiKey);
  }

  async listByStore(storeId: string): Promise<ApiKey[]> {
    return Array.from(this.items.values()).filter((key) => key.storeId === storeId);
  }

  async findByHash(hash: string): Promise<ApiKey | null> {
    const match = Array.from(this.items.values()).find(
      (key) => key.keyHash === hash && key.active
    );
    return match ?? null;
  }
}
