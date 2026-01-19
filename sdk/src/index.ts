export type CashSaleRequest = {
  storeId: string;
  registerId: string;
  saleTotal: number;
  cashReceived: number;
};

export type CashSaleResponse = {
  saleId: string;
  saleTotal: number;
  cashReceived: number;
  changeAmount: number;
  canOfferPixChange: boolean;
};

export type PixChangeRequest = {
  saleId: string;
  pixKey: string;
};

export type PixChangeResponse = {
  pixTransferId: string;
  status: "SENT";
  changeAmount: number;
};

export type ConfirmPixResponse = {
  status: "CONFIRMED";
};

export type DailyReportResponse = {
  storeId: string;
  date: string;
  totalPixChange: number;
  count: number;
};

export class TrocoZeroClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(params: { baseUrl: string; apiKey?: string }) {
    this.baseUrl = params.baseUrl.replace(/\/$/, "");
    this.apiKey = params.apiKey;
  }

  private async request<T>(
    path: string,
    options: { method?: string; body?: unknown; idempotencyKey?: string } = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (this.apiKey) headers["x-api-key"] = this.apiKey;
    if (options.idempotencyKey) headers["idempotency-key"] = options.idempotencyKey;

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Erro ${response.status}`);
    }

    return (await response.json()) as T;
  }

  createCashSale(input: CashSaleRequest, idempotencyKey?: string): Promise<CashSaleResponse> {
    return this.request("/sales/cash", {
      method: "POST",
      body: input,
      idempotencyKey
    });
  }

  requestPixChange(input: PixChangeRequest): Promise<PixChangeResponse> {
    return this.request(`/sales/${input.saleId}/pix-change`, {
      method: "POST",
      body: { pixKey: input.pixKey }
    });
  }

  confirmPix(pixTransferId: string): Promise<ConfirmPixResponse> {
    return this.request(`/pix-transfers/${pixTransferId}/confirm`, {
      method: "POST"
    });
  }

  dailyReport(storeId: string, date: string): Promise<DailyReportResponse> {
    return this.request(`/reports/daily?storeId=${storeId}&date=${date}`);
  }
}
