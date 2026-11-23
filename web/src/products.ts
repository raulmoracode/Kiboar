export interface Product {
  name: string;
  href: string;
  line: string;
  /** Letter of "Kiboar" that opens the product. */
  key: string;
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
    href: "https://kiboar.raulmoracode.com/docs/install/pcm",
    line: "The official KiCad parts.",
    key: "i",
  },
  {
    name: "Shop",
    href: "/shop",
    line: "Buy one assembled.",
    key: "b",
  },
  {
    name: "Studio",
    href: "https://github.com/raulmoracode/Kiboar/releases/tag/studio-v0.1.0",
    line: "Flash and configure.",
    key: "o",
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
