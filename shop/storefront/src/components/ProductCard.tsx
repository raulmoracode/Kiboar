import type { MouseEvent } from "react";
import { formatPrice, imageUrl, isVariantSoldOut, type Product, productPrice } from "../lib/api";

export function productHref(handle: string): string {
  return `?p=${encodeURIComponent(handle)}`;
}

function opensInPlace(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export function ProductCard({
  product,
  currency,
  onOpen,
  layout = "grid",
}: {
  product: Product;
  currency?: string | undefined;
  onOpen: (handle: string) => void;
  layout?: "grid" | "related";
}) {
  const image = imageUrl(product.thumbnail);
  const Title = layout === "grid" ? "h2" : "h3";
  const variants = product.variants ?? [];
  const soldOut = variants.length > 0 && variants.every((variant) => isVariantSoldOut(variant));

  return (
    <a
      href={productHref(product.handle)}
      onClick={(event) => {
        if (!opensInPlace(event)) {
          return;
        }
        event.preventDefault();
        onOpen(product.handle);
      }}
      className={`group flex min-h-0 flex-col overflow-hidden kiboar-card transition-colors hover:border-white/25 ${
        layout === "grid" ? "md:h-[calc((100vh-9rem)/3)]" : ""
      }`}
    >
      <div className="flex items-baseline justify-between gap-2 px-3 pt-2.5 pb-2 sm:gap-4 sm:px-4 sm:pt-3.5 sm:pb-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <Title className="line-clamp-2 min-w-0 text-[13px] leading-tight text-zinc-100 sm:line-clamp-1 sm:text-[14px]">
            {product.title}
          </Title>
          {soldOut ? (
            <span className="shrink-0 rounded border border-red-400/30 bg-red-500/10 px-1.5 py-0.5 text-[9px] tracking-[0.12em] text-red-300 uppercase sm:text-[10px]">
              Sold out
            </span>
          ) : null}
        </div>
        <p className="shrink-0 font-mono text-[11px] text-zinc-300 sm:text-[12px]">
          {formatPrice(productPrice(product, currency))}
        </p>
      </div>
      <div
        className={`w-full overflow-hidden ${
          layout === "grid" ? "aspect-[4/3] md:aspect-auto md:min-h-0 md:flex-1" : "aspect-[4/3]"
        }`}
      >
        {image ? (
          <img
            src={image}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/[0.02]">
            <span className="text-[10px] tracking-[0.16em] text-zinc-600 uppercase">No photo</span>
          </div>
        )}
      </div>
    </a>
  );
}
