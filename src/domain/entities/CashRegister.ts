export class CashRegister {
  constructor(
    public readonly id: string,
    public readonly storeId: string,
    public readonly label: string,
    public readonly createdAt: Date
  ) {}
}
