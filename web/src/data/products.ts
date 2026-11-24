export interface Product {
  name: string;
  href: string;
  line: string;
  /** Letter of "Kiboar" that opens the product. */
  key: string;
  /** True when the destination lives in this app and opens in the same tab. */
  internal?: boolean;
  /** True when the destination is not live yet; the link renders as unavailable. */
  disabled?: boolean;
}

export const products: readonly Product[] = [
  {
    name: "Keyboards",
    href: "/keyboards",
    line: "The open board definitions.",
    key: "k",
    internal: true,
  },
  {
    name: "Library",
    href: "/library",
    line: "The official KiCad parts.",
    key: "i",
    internal: true,
  },
  {
    name: "Shop",
    href: "/shop",
    line: "Buy one assembled.",
    key: "b",
    // The storefront is not deployed and checkout is not connected.
    disabled: true,
  },
  {
    name: "Studio",
    href: "/studio",
    line: "Flash and configure.",
    key: "o",
    internal: true,
  },
  {
    name: "Docs",
    href: "https://kiboar.raulmoracode.com/docs",
    line: "Install, build and flash.",
    key: "a",
    // The docs domain has no deployment yet.
    disabled: true,
  },
  {
    name: "GitHub",
    href: "https://github.com/raulmoracode/Kiboar",
    line: "The repository.",
    key: "r",
  },
];

export function productForKey(key: string): Product | undefined {
  return products.find((product) => product.key === key.toLowerCase());
}
