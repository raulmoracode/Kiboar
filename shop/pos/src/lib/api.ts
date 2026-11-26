import { apiUrl } from "./config";
import type { CheckoutInput, QrPayment } from "./payments";

export type SalesChannelKind = "online" | "pos" | "other";
export type SalesPaymentMethod = "stripe_link" | "cash" | "other";

export interface Sale {
  id: string;
  display_id: number | null;
  created_at: string;
  status: string;
  total: number;
  currency_code: string;
  channel: SalesChannelKind;
  channel_name: string;
  payment_method: SalesPaymentMethod;
}

export interface SalesPage {
  sales: Sale[];
  count: number;
  limit: number;
  offset: number;
}

export class MedusaAdminClient {
  private readonly baseUrl: string;
  private token: string | undefined;

  constructor(baseUrl: string = apiUrl, token?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.token = token;
  }

  private async request<T>(
    path: string,
    init: { method?: string; body?: unknown } = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: init.method ?? "GET",
      headers: {
        "content-type": "application/json",
        ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
      },
      ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
    });

    if (!response.ok) {
      throw new Error(`Medusa responded ${response.status} for ${path}`);
    }

    return (await response.json()) as T;
  }

  async login(email: string, password: string): Promise<string> {
    const result = await this.request<{ token: string }>("/auth/user/emailpass", {
      method: "POST",
      body: { email, password },
    });
    this.token = result.token;
    return result.token;
  }

  async listSales(limit = 100, offset = 0): Promise<Sale[]> {
    const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    const result = await this.request<SalesPage>(`/admin/reports/sales?${query.toString()}`);
    return result.sales;
  }

  /** Contract implemented by the shop backend in a later change. */
  async createCheckout(input: CheckoutInput): Promise<QrPayment> {
    return this.request<QrPayment>("/admin/pos/checkout", { method: "POST", body: input });
  }

  async getCheckout(draftOrderId: string): Promise<QrPayment> {
    return this.request<QrPayment>(`/admin/pos/checkout/${encodeURIComponent(draftOrderId)}`);
  }
}
