import { useCallback, useEffect, useState } from "react";
import { listProducts, NotConfiguredError, type Product, type Variant, variantPrice } from "./api";
import { Bag, type BagItem } from "./Bag";
import { Catalogue, type CatalogueState } from "./Catalogue";
import { ProductPage } from "./ProductPage";

function handleFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("p");
}

const NO_PRODUCTS: Product[] = [];

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

function Header({
  count,
  inProduct,
  onHome,
  onOpenBag,
}: {
  count: number;
  inProduct: boolean;
  onHome: () => void;
  onOpenBag: () => void;
}) {
  return (
    <header className="mb-3 flex h-11 items-center justify-between">
      <div className="flex items-baseline gap-2.5">
        <a
          href="?"
          onClick={(event) => {
            event.preventDefault();
            onHome();
          }}
          className="text-[13px] font-semibold text-zinc-100"
        >
          Kiboar
        </a>
        {inProduct ? (
          <>
            <span aria-hidden="true" className="text-[12px] text-zinc-700">
              /
            </span>
            <a
              href="?"
              onClick={(event) => {
                event.preventDefault();
                onHome();
              }}
              aria-label="Back to the shop"
              className="text-[12px] text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Shop
            </a>
          </>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onOpenBag}
        aria-label={
          count > 0 ? `Open the bag, ${count} ${count === 1 ? "item" : "items"}` : "Open the bag"
        }
        className="flex items-center gap-2 text-[12px] text-zinc-400 transition-colors hover:text-zinc-100"
      >
        <BagIcon />
        Bag
        {count > 0 ? <span className="font-mono text-[11px] text-lime-300">{count}</span> : null}
      </button>
    </header>
  );
}

export default function App() {
  const [state, setState] = useState<CatalogueState>({ status: "loading" });
  const [handle, setHandle] = useState<string | null>(handleFromUrl);
  const [items, setItems] = useState<BagItem[]>([]);
  const [bagOpen, setBagOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const products = await listProducts();
        if (!cancelled) {
          setState({ status: "ready", products });
        }
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
  }, []);

  useEffect(() => {
    function onPopState() {
      setHandle(handleFromUrl());
      window.scrollTo(0, 0);
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const go = useCallback((next: string | null) => {
    const url = new URL(window.location.href);
    if (next) {
      url.searchParams.set("p", next);
    } else {
      url.searchParams.delete("p");
    }

    window.history.pushState({}, "", url);
    setHandle(next);
    window.scrollTo(0, 0);
  }, []);

  const add = useCallback((product: Product, variant: Variant) => {
    const price = variantPrice(variant);
    if (!price) {
      return;
    }

    setItems((current) => {
      const existing = current.find((item) => item.variantId === variant.id);
      if (existing) {
        return current.map((item) =>
          item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [
        ...current,
        {
          variantId: variant.id,
          title: product.title,
          handle: product.handle,
          thumbnail: product.thumbnail,
          variantTitle: (product.variants?.length ?? 0) > 1 ? variant.title : null,
          price,
          quantity: 1,
        },
      ];
    });
    setBagOpen(true);
  }, []);

  const increase = useCallback((variantId: string) => {
    setItems((current) =>
      current.map((item) =>
        item.variantId === variantId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }, []);

  const decrease = useCallback((variantId: string) => {
    setItems((current) =>
      current.map((item) =>
        item.variantId === variantId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  }, []);

  const remove = useCallback((variantId: string) => {
    setItems((current) => current.filter((item) => item.variantId !== variantId));
  }, []);

  const openFromBag = useCallback(
    (next: string) => {
      setBagOpen(false);
      go(next);
    },
    [go],
  );

  const browse = useCallback(() => {
    setBagOpen(false);
    go(null);
  }, [go]);

  const count = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <main className="min-h-screen bg-[var(--kiboar-bg)] text-zinc-200">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-8 sm:px-10">
        <Header
          count={count}
          inProduct={handle !== null}
          onHome={() => go(null)}
          onOpenBag={() => setBagOpen(true)}
        />

        {handle ? (
          <section aria-label="Product" className="mx-auto mt-14 w-full max-w-[1200px]">
            <ProductPage
              key={handle}
              handle={handle}
              products={state.status === "ready" ? state.products : NO_PRODUCTS}
              onOpen={go}
              onBack={() => go(null)}
              onAdd={add}
            />
          </section>
        ) : (
          <section aria-label="Products">
            <Catalogue state={state} onOpen={go} />
          </section>
        )}
      </div>

      {bagOpen ? (
        <Bag
          items={items}
          onClose={() => setBagOpen(false)}
          onBrowse={browse}
          onIncrease={increase}
          onDecrease={decrease}
          onRemove={remove}
          onOpenProduct={openFromBag}
        />
      ) : null}
    </main>
  );
}
