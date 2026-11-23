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
    <div>
      {state.products.map((product) => {
        const price = priceOf(product);

        return (
          <article
            key={product.id}
            className="grid gap-2 border-t border-white/[0.07] py-6 sm:grid-cols-[1fr_auto] sm:items-baseline"
          >
            <div>
              <h2 className="text-[17px] font-medium text-zinc-100">{product.title}</h2>
              {product.description ? (
                <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-zinc-400">
                  {product.description}
                </p>
              ) : null}
            </div>
            <p className="font-mono text-[13px] text-zinc-300">{price ?? "—"}</p>
          </article>
        );
      })}
    </div>
  );
}

export default function App() {
  const [state, setState] = useState<State>({ status: "loading" });

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
          `${MEDUSA_URL}/store/products?limit=24&fields=title,handle,description,*variants,*variants.prices`,
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
      <div className="mx-auto flex min-h-screen w-full max-w-[980px] flex-col px-6 py-10 sm:px-10 sm:py-14">
        <header className="flex items-center justify-between">
          <a
            href="https://kiboar.raulmoracode.com/"
            className="text-[15px] font-semibold text-zinc-100"
          >
            Kiboar
          </a>
          <a
            className="text-[13px] text-zinc-400 transition-colors hover:text-zinc-100"
            href="https://kiboar.raulmoracode.com/"
          >
            Back to the site
          </a>
        </header>

        <section className="mt-20">
          <h1 className="text-[clamp(2.4rem,5vw,3.8rem)] leading-none font-medium tracking-[-0.035em] text-zinc-100">
            Keyboards
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-zinc-400">
            Built from the official Kiboar library.
          </p>
        </section>

        <section aria-label="Products" className="mt-14">
          <Catalogue state={state} />
        </section>

        <footer className="mt-auto pt-16 font-mono text-[11px] text-zinc-600">Kiboar · Shop</footer>
      </div>
    </main>
  );
}
