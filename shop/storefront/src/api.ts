export interface Price {
  amount: number;
  currency_code: string;
}

export interface Variant {
  id: string;
  title: string;
  prices?: Price[];
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
  images?: ProductImage[];
  variants?: Variant[];
}

const BASE_URL = (import.meta.env.VITE_MEDUSA_URL ?? "http://localhost:9000").replace(/\/$/, "");
const PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY ?? "";

const FIELDS = "id,title,handle,description,thumbnail,*images,*variants,*variants.prices";

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

export async function listProducts(): Promise<Product[]> {
  const data = await request<{ products: Product[] }>(`/store/products?limit=24&fields=${FIELDS}`);
  return data.products;
}

export async function getProduct(handle: string): Promise<Product | null> {
  const data = await request<{ products: Product[] }>(
    `/store/products?handle=${encodeURIComponent(handle)}&fields=${FIELDS}`,
  );
  return data.products[0] ?? null;
}

export function variantPrice(variant: Variant | undefined): Price | null {
  const prices = variant?.prices ?? [];
  return prices.find((price) => price.currency_code === "eur") ?? prices[0] ?? null;
}

export function productPrice(product: Product): Price | null {
  return variantPrice(product.variants?.[0]);
}

export function formatPrice(price: Price | null): string {
  if (!price) {
    return "—";
  }

  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: price.currency_code.toUpperCase(),
  }).format(price.amount / 100);
}

export function imageUrl(thumbnail: string | null): string | null {
  if (!thumbnail) {
    return null;
  }

  return thumbnail.startsWith("http") ? thumbnail : `${BASE_URL}${thumbnail}`;
}
