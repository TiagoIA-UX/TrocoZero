export type IdempotencyRecord = {
  key: string;
  response: unknown;
};

export class InMemoryIdempotencyRepository {
  private items = new Map<string, IdempotencyRecord>();

  async find(key: string): Promise<IdempotencyRecord | null> {
    return this.items.get(key) ?? null;
  }

  async save(record: IdempotencyRecord): Promise<void> {
    this.items.set(record.key, record);
  }
}
