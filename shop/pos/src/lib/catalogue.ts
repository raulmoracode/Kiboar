import { apiUrl, publishableKey } from "./config";

export interface StorePrice {
  amount: number;
  currency_code: string;
}

export interface StoreVariant {
  id: string;
  title: string;
  prices?: StorePrice[];
  inventory_quantity?: number | null;
  manage_inventory?: boolean | null;
  allow_backorder?: boolean | null;
}

export interface StoreProduct {
  id: string;
  title: string;
  thumbnail?: string | null;
  variants?: StoreVariant[];
}

/** A product variant the cashier can add to the cart. */
export interface CatalogueItem {
  variantId: string;
  productId: string;
  title: string;
  /** Medusa v2 returns prices in major units: 149 is €149.00. */
  unitAmount: number;
  currency: string;
  thumbnail: string | null;
  /** The variant cannot be sold: no stock and no backorder allowed. */
  soldOut: boolean;
}

export class NotConfiguredError extends Error {}

const FIELDS = "id,title,thumbnail,*variants,*variants.prices,+variants.inventory_quantity";

export function variantPrice(variant: StoreVariant | undefined): StorePrice | null {
  const prices = variant?.prices ?? [];

  return prices.find((price) => price.currency_code.toLowerCase() === "eur") ?? prices[0] ?? null;
}

/** `inventory_quantity` is null when Medusa does not manage stock for the variant. */
export function isVariantSoldOut(variant: StoreVariant | undefined): boolean {
  if (!variant || variant.inventory_quantity == null) {
    return false;
  }

  return (
    variant.manage_inventory === true &&
    variant.allow_backorder !== true &&
    variant.inventory_quantity <= 0
  );
}

export function toCatalogueItem(product: StoreProduct): CatalogueItem | null {
  const variant = product.variants?.[0];
  const price = variantPrice(variant);

  if (!variant || !price) {
    return null;
  }

  return {
    variantId: variant.id,
    productId: product.id,
    title: product.title,
    unitAmount: price.amount,
    currency: price.currency_code,
    thumbnail: product.thumbnail ?? null,
    soldOut: isVariantSoldOut(variant),
  };
}

export function imageUrl(thumbnail: string | null): string | null {
  if (!thumbnail) {
    return null;
  }

  return thumbnail.startsWith("http") ? thumbnail : `${apiUrl}${thumbnail}`;
}

/**
 * Reads the catalogue from the Store API with the POS publishable key. The key
 * is scoped to the POS sales channel, so the till only sees the products that
 * are published for it.
 */
export async function listCatalogue(): Promise<CatalogueItem[]> {
  if (!publishableKey) {
    throw new NotConfiguredError(
      "The POS is not configured: EXPO_PUBLIC_POS_PUBLISHABLE_KEY is missing.",
    );
  }

  const params = new URLSearchParams({ limit: "100", fields: FIELDS });
  const response = await fetch(`${apiUrl}/store/products?${params.toString()}`, {
    headers: { "x-publishable-api-key": publishableKey },
  });

  if (!response.ok) {
    throw new Error(`The Store API responded ${response.status}.`);
  }

  const data = (await response.json()) as { products: StoreProduct[] };

  return data.products.map(toCatalogueItem).filter((item): item is CatalogueItem => item !== null);
}
