import { PixTransfer } from "../../domain/entities/PixTransfer.js";

export class InMemoryPixTransferRepository {
  private items = new Map<string, PixTransfer>();

  async save(transfer: PixTransfer): Promise<void> {
    this.items.set(transfer.id, transfer);
  }

  async findById(id: string): Promise<PixTransfer | null> {
    return this.items.get(id) ?? null;
  }
}
