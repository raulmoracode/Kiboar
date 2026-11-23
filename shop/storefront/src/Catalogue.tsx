import type { Product } from "./api";
import { ProductCard } from "./ProductCard";

export type CatalogueState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; products: Product[] };

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
      {state.products.map((product) => (
        <ProductCard key={product.id} product={product} onOpen={onOpen} />
      ))}
    </div>
  );
}
