import { useEffect, useState } from "react";

interface Price {
  amount: number;
  currency_code: string;
}

interface Variant {
  id: string;
  prices?: Price[];
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  variants?: Variant[];
}

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; products: Product[] };

const MEDUSA_URL = import.meta.env.VITE_MEDUSA_URL ?? "http://localhost:9000";
const PUBLISHABLE_KEY = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY ?? "";

function priceOf(product: Product): string | null {
  const prices = product.variants?.flatMap((variant) => variant.prices ?? []) ?? [];
  if (prices.length === 0) {
    return null;
  }

  const price = prices.find((entry) => entry.currency_code === "eur") ?? prices[0];
  if (!price) {
    return null;
  }

  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: price.currency_code.toUpperCase(),
  }).format(price.amount / 100);
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M6.5 8.5h11l1 12h-13l1-12Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M9 8.5V7a3 3 0 0 1 6 0v1.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Catalogue({ state }: { state: State }) {
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
        const price = priceOf(product);
        const image = product.thumbnail
          ? product.thumbnail.startsWith("http")
            ? product.thumbnail
            : `${MEDUSA_URL}${product.thumbnail}`
          : null;

        return (
          <article
            key={product.id}
            className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.015] transition-colors hover:border-white/15 md:h-[calc((100vh-9rem)/3)]"
          >
            <div className="flex items-baseline justify-between gap-4 px-4 pt-3.5 pb-3">
              <h2 className="min-w-0 truncate text-[14px] text-zinc-100">{product.title}</h2>
              <p className="shrink-0 font-mono text-[12px] text-zinc-300">{price ?? "—"}</p>
            </div>
            <div className="aspect-[4/3] w-full overflow-hidden md:aspect-auto md:min-h-0 md:flex-1">
              {image ? (
                <img
                  src={image}
                  alt={product.title}
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/[0.02]">
                  <span className="text-[10px] tracking-[0.16em] text-zinc-600 uppercase">
                    No photo
                  </span>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function App() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [bagOpen, setBagOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!PUBLISHABLE_KEY) {
        setState({
          status: "error",
          message: "The shop is not configured: the publishable key is missing.",
        });
        return;
      }

      try {
        const response = await fetch(
          `${MEDUSA_URL}/store/products?limit=24&fields=title,handle,description,thumbnail,*variants,*variants.prices`,
          { headers: { "x-publishable-api-key": PUBLISHABLE_KEY } },
        );

        if (!response.ok) {
          throw new Error(`store API responded ${response.status}`);
        }

        const data = (await response.json()) as { products: Product[] };
        if (!cancelled) {
          setState({ status: "ready", products: data.products });
        }
      } catch {
        if (!cancelled) {
          setState({
            status: "error",
            message: "The shop cannot be reached right now.",
          });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0b0d] text-zinc-200">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-8 sm:px-10">
        <header className="mb-3 flex h-11 items-center justify-between">
          <a
            href="https://kiboar.raulmoracode.com/"
            className="text-[13px] font-semibold text-zinc-100"
          >
            Kiboar
          </a>
          <button
            type="button"
            onClick={() => setBagOpen(true)}
            className="flex items-center gap-2 text-[12px] text-zinc-400 transition-colors hover:text-zinc-100"
          >
            <BagIcon />
            Bag
          </button>
        </header>

        <section aria-label="Products">
          <Catalogue state={state} />
        </section>
      </div>

      {bagOpen ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Bag">
          <button
            type="button"
            aria-label="Close the bag"
            onClick={() => setBagOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <aside className="absolute inset-y-0 right-0 flex w-[min(380px,100vw)] flex-col border-l border-white/10 bg-[#0c0e11] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-medium text-zinc-100">Bag</h2>
              <button
                type="button"
                onClick={() => setBagOpen(false)}
                aria-label="Close the bag"
                className="text-[12px] text-zinc-500 transition-colors hover:text-zinc-200"
              >
                Close
              </button>
            </div>

            <p className="mt-6 text-[13px] text-zinc-400">Your bag is empty.</p>

            <p className="mt-auto pt-6 text-[10px] leading-relaxed text-zinc-600">
              Demo bag. Checkout is not connected to Medusa yet.
            </p>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
