export class ApiKey {
  constructor(
    public readonly id: string,
    public readonly storeId: string,
    public readonly name: string,
    public readonly keyHash: string,
    public readonly prefix: string,
    public readonly active: boolean,
    public readonly createdAt: Date
  ) {}
}
