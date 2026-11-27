import type { Product } from "./api";

export type SpecKey = "mcu" | "case" | "keys" | "layout";

export interface SpecField {
  key: SpecKey;
  label: string;
}

export const SPEC_FIELDS: readonly SpecField[] = [
  { key: "mcu", label: "MCU" },
  { key: "case", label: "Case" },
  { key: "keys", label: "Keys" },
  { key: "layout", label: "Layout" },
];

export interface SpecEntry {
  key: SpecKey;
  label: string;
  value: string;
}

function formatValue(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

export function productSpecs(product: Product): SpecEntry[] {
  const metadata = product.metadata;

  if (!metadata) {
    return [];
  }

  const specs: SpecEntry[] = [];

  for (const field of SPEC_FIELDS) {
    const value = formatValue(metadata[field.key]);
    if (value !== null) {
      specs.push({ key: field.key, label: field.label, value });
    }
  }

  return specs;
}
