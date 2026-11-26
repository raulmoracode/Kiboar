import { apiUrl } from "./config";
import type { CheckoutInput, QrPayment } from "./payments";

export interface MedusaProduct {
  id: string;
  title: string;
  thumbnail?: string | null;
  variants?: {
    id: string;
    title: string;
    prices?: { amount: number; currency_code: string }[];
  }[];
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

  async listProducts(): Promise<MedusaProduct[]> {
    const result = await this.request<{ products: MedusaProduct[] }>(
      "/admin/products?limit=100&fields=id,title,thumbnail,*variants,*variants.prices",
    );
    return result.products;
  }

  /** Contract implemented by the shop backend in a later change. */
  async createCheckout(input: CheckoutInput): Promise<QrPayment> {
    return this.request<QrPayment>("/admin/pos/checkout", { method: "POST", body: input });
  }

  async getCheckout(draftOrderId: string): Promise<QrPayment> {
    return this.request<QrPayment>(`/admin/pos/checkout/${encodeURIComponent(draftOrderId)}`);
  }
}
