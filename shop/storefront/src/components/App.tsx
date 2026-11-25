import { useCallback, useEffect, useState } from "react";
import {
  listProducts,
  listRegions,
  NotConfiguredError,
  type Product,
  type Region,
  type Variant,
  variantPrice,
} from "../lib/api";
import { loadBag, saveBag } from "../lib/bagStorage";
import { Bag, type BagItem } from "./Bag";
import { Catalogue, type CatalogueState } from "./Catalogue";
import { ProductPage } from "./ProductPage";

function handleFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("p");
}

function resolveRegion(regions: Region[]): Region | null {
  const configured = import.meta.env.VITE_REGION_ID;

  if (configured) {
    const region = regions.find((entry) => entry.id === configured);
    if (!region) {
      throw new NotConfiguredError(
        `The configured region ${configured} is not published in the store.`,
      );
    }
    return region;
  }

  return regions[0] ?? null;
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
  const [region, setRegion] = useState<Region | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [handle, setHandle] = useState<string | null>(handleFromUrl);
  const [items, setItems] = useState<BagItem[]>(loadBag);
  const [bagOpen, setBagOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ status: "loading" });

      try {
        const regions = await listRegions();
        const selected = resolveRegion(regions);
        const { products, count } = await listProducts({ regionId: selected?.id });

        if (!cancelled) {
          setRegion(selected);
          setState({ status: "ready", products, count });
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
  }, [reloadToken]);

  useEffect(() => {
    saveBag(items);
  }, [items]);

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

  const loadMore = useCallback(async () => {
    if (state.status !== "ready" || loadingMore) {
      return;
    }

    setLoadingMore(true);
    setLoadMoreError(false);

    try {
      const { products } = await listProducts({
        offset: state.products.length,
        regionId: region?.id,
      });

      setState((current) =>
        current.status === "ready"
          ? {
              status: "ready",
              products: [...current.products, ...products],
              count: current.count,
            }
          : current,
      );
    } catch {
      setLoadMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  }, [state, region?.id, loadingMore]);

  const add = useCallback(
    (product: Product, variant: Variant) => {
      const price = variantPrice(variant, region?.currency_code);
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
    },
    [region?.currency_code],
  );

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
    <main className="kiboar-shell">
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
              regionId={region?.id}
              currency={region?.currency_code}
              onOpen={go}
              onBack={() => go(null)}
              onAdd={add}
            />
          </section>
        ) : (
          <section aria-label="Products">
            <Catalogue
              state={state}
              currency={region?.currency_code}
              loadingMore={loadingMore}
              loadMoreError={loadMoreError}
              onLoadMore={loadMore}
              onOpen={go}
              onRetry={() => setReloadToken((current) => current + 1)}
            />
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
