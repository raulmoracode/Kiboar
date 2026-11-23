import type { MouseEvent } from "react";
import { formatPrice, imageUrl, type Product, productPrice } from "./api";

export type CatalogueState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; products: Product[] };

function productHref(handle: string): string {
  return `?p=${encodeURIComponent(handle)}`;
}

function opensInPlace(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export function Catalogue({
  state,
  onOpen,
}: {
  state: CatalogueState;
  onOpen: (handle: string) => void;
}) {
  if (state.status === "loading") {
    return <p className="text-[13px] text-zinc-500">Loading the shop…</p>;
  }

  if (state.status === "error") {
    return (
      <p className="text-[13px] text-zinc-400">
        {state.message}{" "}
        <a
          className="text-zinc-200 underline decoration-white/20 underline-offset-4 hover:text-lime-200"
          href="https://kiboar.raulmoracode.com/"
        >
          Back to Kiboar
        </a>
        .
      </p>
    );
  }

  if (state.products.length === 0) {
    return <p className="text-[13px] text-zinc-400">The first boards are not published yet.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
      {state.products.map((product) => {
        const image = imageUrl(product.thumbnail);

        return (
          <a
            key={product.id}
            href={productHref(product.handle)}
            onClick={(event) => {
              if (!opensInPlace(event)) {
                return;
              }
              event.preventDefault();
              onOpen(product.handle);
            }}
            className="group flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.015] transition-colors hover:border-white/25 md:h-[calc((100vh-9rem)/3)]"
          >
            <div className="flex items-baseline justify-between gap-4 px-4 pt-3.5 pb-3">
              <h2 className="min-w-0 truncate text-[14px] text-zinc-100">{product.title}</h2>
              <p className="shrink-0 font-mono text-[12px] text-zinc-300">
                {formatPrice(productPrice(product))}
              </p>
            </div>
            <div className="aspect-[4/3] w-full overflow-hidden md:aspect-auto md:min-h-0 md:flex-1">
              {image ? (
                <img
                  src={image}
                  alt={product.title}
                  loading="lazy"
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/[0.02]">
                  <span className="text-[10px] tracking-[0.16em] text-zinc-600 uppercase">
                    No photo
                  </span>
                </div>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}
