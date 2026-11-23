import { useEffect, useState } from "react";
import {
  formatPrice,
  getProduct,
  imageUrl,
  NotConfiguredError,
  type Product,
  type Variant,
  variantPrice,
} from "./api";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "missing" }
  | { status: "ready"; product: Product };

export function ProductPage({
  handle,
  onBack,
  onAdd,
}: {
  handle: string;
  onBack: () => void;
  onAdd: (product: Product, variant: Variant) => void;
}) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [variantId, setVariantId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    async function load() {
      try {
        const product = await getProduct(handle);
        if (cancelled) {
          return;
        }

        if (!product) {
          setState({ status: "missing" });
          document.title = "Board not found · Kiboar";
          return;
        }

        setVariantId(product.variants?.[0]?.id ?? null);
        setState({ status: "ready", product });
        document.title = `${product.title} · Kiboar`;
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              error instanceof NotConfiguredError
                ? error.message
                : "The shop cannot be reached right now.",
          });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  if (state.status === "loading") {
    return <p className="text-[13px] text-zinc-500">Loading the board…</p>;
  }

  if (state.status === "error") {
    return (
      <p className="text-[13px] text-zinc-400">
        {state.message}{" "}
        <button
          type="button"
          onClick={onBack}
          className="text-zinc-200 underline decoration-white/20 underline-offset-4 hover:text-lime-200"
        >
          Back to all boards
        </button>
        .
      </p>
    );
  }

  if (state.status === "missing") {
    return (
      <p className="text-[13px] text-zinc-400">
        This board is not published.{" "}
        <button
          type="button"
          onClick={onBack}
          className="text-zinc-200 underline decoration-white/20 underline-offset-4 hover:text-lime-200"
        >
          Back to all boards
        </button>
        .
      </p>
    );
  }

  const { product } = state;
  const variants = product.variants ?? [];
  const variant = variants.find((entry) => entry.id === variantId) ?? variants[0];
  const price = variantPrice(variant);
  const image = imageUrl(product.thumbnail);

  return (
    <article className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
      <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.015]">
        {image ? (
          <img src={image} alt={product.title} className="h-full w-full object-contain" />
        ) : (
          <span className="text-[10px] tracking-[0.16em] text-zinc-600 uppercase">No photo</span>
        )}
      </div>

      <div className="lg:py-2">
        <h1 className="text-[22px] leading-tight font-medium text-zinc-100">{product.title}</h1>
        <p className="mt-2 font-mono text-[14px] text-zinc-200">{formatPrice(price)}</p>

        {product.description ? (
          <p className="mt-6 max-w-prose text-[13px] leading-relaxed text-zinc-400">
            {product.description}
          </p>
        ) : null}

        {variants.length > 1 ? (
          <div className="mt-8">
            <p className="text-[10px] tracking-[0.16em] text-zinc-500 uppercase">Variant</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {variants.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={entry.id === variant?.id}
                  onClick={() => setVariantId(entry.id)}
                  className={`rounded border px-3 py-1.5 text-[12px] transition-colors ${
                    entry.id === variant?.id
                      ? "border-lime-300/60 text-lime-200"
                      : "border-white/15 text-zinc-400 hover:border-white/30 hover:text-zinc-200"
                  }`}
                >
                  {entry.title}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          disabled={!variant || !price}
          onClick={() => variant && onAdd(product, variant)}
          className="mt-8 h-10 w-full max-w-sm rounded bg-zinc-100 text-[12px] font-medium text-[#0a0b0d] transition-colors hover:bg-lime-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500"
        >
          Add to bag
        </button>

        <p className="mt-3 text-[10px] leading-relaxed text-zinc-600">
          Demo bag. Checkout is not connected to Medusa yet.
        </p>
      </div>
    </article>
  );
}
