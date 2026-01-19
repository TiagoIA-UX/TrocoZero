import { randomUUID } from "node:crypto";
import { ApiKey } from "../../domain/entities/ApiKey.js";
import { generateApiKey, hashApiKey, keyPrefix } from "../../shared/crypto.js";

export interface ApiKeyRepository {
  save(apiKey: ApiKey): Promise<void>;
}

export class CreateApiKey {
  constructor(private readonly apiKeyRepo: ApiKeyRepository) {}

  async execute(params: { storeId: string; name: string }): Promise<{
    id: string;
    key: string;
    prefix: string;
  }> {
    const key = generateApiKey();
    const apiKey = new ApiKey(
      randomUUID(),
      params.storeId,
      params.name,
      hashApiKey(key),
      keyPrefix(key),
      true,
      new Date()
    );

    await this.apiKeyRepo.save(apiKey);

    // Decisao importante: a chave completa so aparece uma vez.
    return { id: apiKey.id, key, prefix: apiKey.prefix };
  }
}
