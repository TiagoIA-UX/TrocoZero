import { ApiKey } from "../../domain/entities/ApiKey.js";

export interface ApiKeyRepository {
  listByStore(storeId: string): Promise<ApiKey[]>;
}

export class ListApiKeys {
  constructor(private readonly apiKeyRepo: ApiKeyRepository) {}

  async execute(params: { storeId: string }): Promise<{
    items: { id: string; name: string; prefix: string; active: boolean; createdAt: Date }[];
  }> {
    const keys = await this.apiKeyRepo.listByStore(params.storeId);
    return {
      items: keys.map((key) => ({
        id: key.id,
        name: key.name,
        prefix: key.prefix,
        active: key.active,
        createdAt: key.createdAt
      }))
    };
  }
}
