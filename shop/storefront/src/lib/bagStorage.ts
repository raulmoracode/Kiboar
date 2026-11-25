import type { BagItem } from "../components/Bag";

const STORAGE_KEY = "kiboar.bag.v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBagItem(value: unknown): value is BagItem {
  if (!isRecord(value)) {
    return false;
  }

  const price = value.price;

  return (
    typeof value.variantId === "string" &&
    typeof value.title === "string" &&
    typeof value.handle === "string" &&
    (value.thumbnail === null || typeof value.thumbnail === "string") &&
    (value.variantTitle === null || typeof value.variantTitle === "string") &&
    isRecord(price) &&
    typeof price.amount === "number" &&
    Number.isFinite(price.amount) &&
    typeof price.currency_code === "string" &&
    typeof value.quantity === "number" &&
    Number.isInteger(value.quantity) &&
    value.quantity > 0
  );
}

export function loadBag(): BagItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isBagItem) : [];
  } catch {
    return [];
  }
}

export function saveBag(items: BagItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // A full quota or a blocked storage must not break the bag.
  }
}
