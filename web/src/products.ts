export interface Product {
  name: string;
  href: string;
  line: string;
  /** Letter of "Kiboar" that opens the product. */
  key: string;
  /** True when the destination lives in this app and opens in the same tab. */
  internal?: boolean;
}

export const products: readonly Product[] = [
  {
    name: "Keyboards",
    href: "https://github.com/raulmoracode/Kiboar/tree/main/keyboards",
    line: "The official board files.",
    key: "k",
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
