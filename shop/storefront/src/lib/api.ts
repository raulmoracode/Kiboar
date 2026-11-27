export interface Price {
  amount: number;
  currency_code: string;
}

export interface CalculatedPrice {
  calculated_amount: number;
  currency_code: string;
}

export interface Variant {
  id: string;
  title: string;
  prices?: Price[];
  calculated_price?: CalculatedPrice | null;
  manage_inventory?: boolean;
  allow_backorder?: boolean;
  inventory_quantity?: number | null;
}

export interface ProductImage {
  id: string;
  url: string;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  thumbnail: string | null;
  metadata?: Record<string, unknown> | null;
  images?: ProductImage[];
  variants?: Variant[];
}

export interface Region {
  id: string;
  name: string;
  currency_code: string;
}

export interface ProductPage {
  products: Product[];
  count: number;
}

const BASE_URL = (import.meta.env.VITE_MEDUSA_URL ?? "http://localhost:9000").replace(/\/$/, "");
const PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY ?? "";

// `inventory_quantity` is a computed field: Medusa only returns it with `+`,
// while `*` leaves it null and the sold-out checks never trigger.
const FIELDS =
  "id,title,handle,description,thumbnail,metadata,*images,*variants,*variants.prices,*variants.calculated_price,+variants.inventory_quantity";

export const PAGE_SIZE = 12;

export class NotConfiguredError extends Error {}

async function request<T>(path: string): Promise<T> {
  if (!PUBLISHABLE_KEY) {
    throw new NotConfiguredError("The shop is not configured: the publishable key is missing.");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
  });

  if (!response.ok) {
    throw new Error(`The store API responded ${response.status}.`);
  }

  return (await response.json()) as T;
}

export async function listRegions(): Promise<Region[]> {
  const data = await request<{ regions: Region[] }>("/store/regions?limit=50");
  return data.regions;
}

export async function listProducts({
  offset = 0,
  limit = PAGE_SIZE,
  regionId,
}: {
  offset?: number;
  limit?: number;
  regionId?: string | undefined;
} = {}): Promise<ProductPage> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    fields: FIELDS,
  });

  if (regionId) {
    params.set("region_id", regionId);
  }

  const data = await request<ProductPage>(`/store/products?${params.toString()}`);
  return { products: data.products, count: data.count };
}

export async function getProduct(handle: string, regionId?: string): Promise<Product | null> {
  const params = new URLSearchParams({
    handle,
    fields: FIELDS,
  });

  if (regionId) {
    params.set("region_id", regionId);
  }

  const data = await request<{ products: Product[] }>(`/store/products?${params.toString()}`);
  return data.products[0] ?? null;
}

export function variantPrice(variant: Variant | undefined, currency?: string): Price | null {
  const calculated = variant?.calculated_price;
  if (calculated) {
    if (!currency || calculated.currency_code.toLowerCase() === currency.toLowerCase()) {
      return {
        amount: calculated.calculated_amount,
        currency_code: calculated.currency_code,
      };
    }
  }

  const prices = variant?.prices ?? [];

  if (currency) {
    const match = prices.find(
      (price) => price.currency_code.toLowerCase() === currency.toLowerCase(),
    );
    if (match) {
      return match;
    }
  }

  return prices.find((price) => price.currency_code === "eur") ?? prices[0] ?? null;
}

export function productPrice(product: Product, currency?: string): Price | null {
  return variantPrice(product.variants?.[0], currency);
}

export function isVariantSoldOut(variant: Variant | undefined): boolean {
  if (!variant || variant.inventory_quantity == null) {
    return false;
  }

  return (
    variant.manage_inventory === true &&
    variant.allow_backorder !== true &&
    variant.inventory_quantity <= 0
  );
}

export function formatPrice(price: Price | null): string {
  if (!price) {
    return "—";
  }

  const locale = typeof navigator === "undefined" ? "en" : navigator.language;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: price.currency_code.toUpperCase(),
  }).format(price.amount);
}

export function imageUrl(thumbnail: string | null): string | null {
  if (!thumbnail) {
    return null;
  }

  return thumbnail.startsWith("http") ? thumbnail : `${BASE_URL}${thumbnail}`;
}

export function keyboardFilesUrl(product: Product): string | null {
  const value = product.metadata?.keyboard_files_url;
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value.trim());
    const isGithub = url.hostname === "github.com" || url.hostname === "www.github.com";
    if (url.protocol !== "https:" || !isGithub) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function firmwareUrl(product: Product): string | null {
  const value = product.metadata?.firmware_url;
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.includes("..")) {
    return `${BASE_URL}${trimmed}`;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
