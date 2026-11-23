export interface Product {
  name: string;
  href: string;
  line: string;
  /** Single letter that opens the product from the physical keyboard. */
  key: string;
}

export const products: readonly Product[] = [
  {
    name: "Shop",
    href: "/shop",
    line: "Buy one assembled.",
    key: "s",
  },
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
    key: "l",
  },
  {
    name: "Studio",
    href: "https://github.com/raulmoracode/Kiboar/releases/tag/studio-v0.1.0",
    line: "Flash and configure.",
    key: "t",
  },
  {
    name: "Docs",
    href: "https://kiboar.raulmoracode.com/docs",
    line: "Install, build and flash.",
    key: "d",
  },
];

export function productForKey(key: string): Product | undefined {
  return products.find((product) => product.key === key.toLowerCase());
}
