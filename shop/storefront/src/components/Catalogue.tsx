import { home } from "@kiboar/links";
import type { Product } from "../lib/api";
import { ProductCard } from "./ProductCard";

export type CatalogueState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; products: Product[]; count: number };

export function Catalogue({
  state,
  currency,
  loadingMore,
  loadMoreError,
  onLoadMore,
  onOpen,
  onRetry,
}: {
  state: CatalogueState;
  currency?: string | undefined;
  loadingMore: boolean;
  loadMoreError: boolean;
  onLoadMore: () => void;
  onOpen: (handle: string) => void;
  onRetry: () => void;
}) {
  if (state.status === "loading") {
    return <p className="text-[13px] text-zinc-500">Loading the shop…</p>;
  }

  if (state.status === "error") {
    return (
      <p className="text-[13px] text-zinc-400">
        {state.message}{" "}
        <button type="button" onClick={onRetry} className="text-zinc-200 kiboar-link">
          Try again
        </button>{" "}
        or{" "}
        <a className="text-zinc-200 kiboar-link" href={home}>
          back to Kiboar
        </a>
        .
      </p>
    );
  }

  if (state.products.length === 0) {
    return <p className="text-[13px] text-zinc-400">The first boards are not published yet.</p>;
  }

  const hasMore = state.products.length < state.count;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {state.products.map((product) => (
          <ProductCard key={product.id} product={product} currency={currency} onOpen={onOpen} />
        ))}
      </div>

      {hasMore ? (
        <div className="mt-6 flex flex-col items-center gap-2">
          {loadMoreError ? (
            <p className="text-[11px] text-zinc-500">Could not load more boards.</p>
          ) : null}
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="rounded border border-white/15 px-4 py-2 text-[12px] text-zinc-300 transition-colors hover:border-white/30 hover:text-zinc-100 disabled:cursor-wait disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : loadMoreError ? "Try again" : "Load more"}
          </button>
          <p className="font-mono text-[10px] text-zinc-600">
            {state.products.length} of {state.count}
          </p>
        </div>
      ) : null}
    </>
  );
}
