import { useEffect, useState } from "react";
import {
  firmwareUrl,
  formatPrice,
  getProduct,
  imageUrl,
  isVariantSoldOut,
  keyboardFilesUrl,
  NotConfiguredError,
  type Product,
  type Variant,
  variantPrice,
} from "../lib/api";
import { productSpecs } from "../lib/specs";
import { DownloadFirmwareButton } from "./DownloadFirmwareButton";
import { KeyboardFilesButton } from "./KeyboardFilesButton";
import { ProductCard } from "./ProductCard";
import { SpecsDialog } from "./SpecsDialog";

const RELATED_COUNT = 3;

function hashHandle(handle: string): number {
  let hash = 2166136261;
  for (let index = 0; index < handle.length; index += 1) {
    hash ^= handle.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function nextRandom(seed: { value: number }): number {
  seed.value = (seed.value + 0x6d2b79f5) | 0;
  let t = seed.value;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function relatedProducts(products: Product[], current: Product): Product[] {
  const pool = products.filter((product) => product.id !== current.id);
  const seed = { value: hashHandle(current.handle) };

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(nextRandom(seed) * (index + 1));
    const a = pool[index];
    const b = pool[swap];
    if (a && b) {
      pool[index] = b;
      pool[swap] = a;
    }
  }

  return pool.slice(0, RELATED_COUNT);
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-[18px]">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 10.8v5.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="12" cy="7.9" r="0.9" fill="currentColor" />
    </svg>
  );
}

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "missing" }
  | { status: "ready"; product: Product };

export function ProductPage({
  handle,
  products,
  regionId,
  currency,
  onOpen,
  onBack,
  onAdd,
}: {
  handle: string;
  products: Product[];
  regionId?: string | undefined;
  currency?: string | undefined;
  onOpen: (handle: string) => void;
  onBack: () => void;
  onAdd: (product: Product, variant: Variant) => void;
}) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [variantId, setVariantId] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [related, setRelated] = useState<Product[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [specsOpen, setSpecsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    async function load() {
      try {
        const product = await getProduct(handle, regionId);
        if (cancelled) {
          return;
        }

        if (!product) {
          setState({ status: "missing" });
          return;
        }

        setVariantId(product.variants?.[0]?.id ?? null);
        setImageIndex(0);
        setState({ status: "ready", product });
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
  }, [handle, regionId, attempt]);

  useEffect(() => {
    if (state.status !== "ready" || products.length === 0) {
      setRelated([]);
      return;
    }

    setRelated(relatedProducts(products, state.product));
  }, [products, state]);

  useEffect(() => {
    if (state.status !== "ready") {
      return;
    }

    const previousTitle = document.title;
    const description = state.product.description?.trim();
    const existing = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = existing?.getAttribute("content") ?? null;
    const created = !existing && Boolean(description);
    const meta = existing ?? (created ? document.createElement("meta") : null);

    document.title = `${state.product.title} · Kiboar Shop`;

    if (meta && description) {
      meta.setAttribute("name", "description");
      meta.setAttribute("content", description);
      if (created) {
        document.head.append(meta);
      }
    }

    return () => {
      document.title = previousTitle;
      if (meta && description) {
        if (created) {
          meta.remove();
        } else if (previousDescription !== null) {
          meta.setAttribute("content", previousDescription);
        } else {
          meta.removeAttribute("content");
        }
      }
    };
  }, [state]);

  if (state.status === "loading") {
    return <p className="text-[13px] text-zinc-500">Loading the board…</p>;
  }

  if (state.status === "error") {
    return (
      <p className="text-[13px] text-zinc-400">
        {state.message}{" "}
        <button
          type="button"
          onClick={() => setAttempt((current) => current + 1)}
          className="text-zinc-200 kiboar-link"
        >
          Try again
        </button>{" "}
        or{" "}
        <button type="button" onClick={onBack} className="text-zinc-200 kiboar-link">
          back to all boards
        </button>
        .
      </p>
    );
  }

  if (state.status === "missing") {
    return (
      <p className="text-[13px] text-zinc-400">
        This board is not published.{" "}
        <button type="button" onClick={onBack} className="text-zinc-200 kiboar-link">
          Back to all boards
        </button>
        .
      </p>
    );
  }

  const { product } = state;
  const variants = product.variants ?? [];
  const variant = variants.find((entry) => entry.id === variantId) ?? variants[0];
  const price = variantPrice(variant, currency);
  const soldOut = isVariantSoldOut(variant);
  const images = (product.images ?? [])
    .map((entry) => imageUrl(entry.url))
    .filter((url): url is string => Boolean(url));
  const fallback = imageUrl(product.thumbnail);
  if (images.length === 0 && fallback) {
    images.push(fallback);
  }
  const image = images[imageIndex] ?? images[0] ?? null;
  const filesUrl = keyboardFilesUrl(product);
  const firmware = firmwareUrl(product);
  const specs = productSpecs(product);

  return (
    <>
      <article className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <div>
          <div className="flex aspect-[16/10] w-full items-center justify-center overflow-hidden kiboar-card sm:aspect-[4/3]">
            {image ? (
              <img src={image} alt={product.title} className="h-full w-full object-contain" />
            ) : (
              <span className="text-[10px] tracking-[0.16em] text-zinc-600 uppercase">
                No photo
              </span>
            )}
          </div>

          {images.length > 1 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  aria-label={`View image ${index + 1} of ${images.length}`}
                  aria-pressed={index === imageIndex}
                  onClick={() => setImageIndex(index)}
                  className={`aspect-[4/3] w-20 overflow-hidden rounded border bg-white/[0.015] transition-colors ${
                    index === imageIndex
                      ? "border-lime-300/60"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="lg:py-2">
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="min-w-0 text-[22px] leading-tight font-medium text-zinc-100">
                {product.title}
              </h1>
              {specs.length > 0 ? (
                <button
                  type="button"
                  aria-label={`Specifications for ${product.title}`}
                  aria-haspopup="dialog"
                  onClick={() => setSpecsOpen(true)}
                  className="grid size-7 shrink-0 place-items-center rounded-full text-lime-300 transition-colors hover:text-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300/70"
                >
                  <InfoIcon />
                </button>
              ) : null}
            </div>
            <p className="shrink-0 font-mono text-[14px] text-zinc-200">{formatPrice(price)}</p>
          </div>

          {product.description ? (
            <p className="mt-4 max-w-prose text-[13px] leading-relaxed text-zinc-400 sm:mt-6">
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
            disabled={!variant || !price || soldOut}
            onClick={() => variant && onAdd(product, variant)}
            className="mt-6 h-10 w-full rounded bg-zinc-100 text-[12px] font-medium text-[var(--kiboar-bg)] transition-colors hover:bg-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300/70 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500 sm:mt-8"
          >
            {soldOut ? "Sold out" : "Add to bag"}
          </button>

          <KeyboardFilesButton url={filesUrl} />
          <DownloadFirmwareButton url={firmware} />
        </div>
      </article>

      {related.length > 0 ? (
        <section
          aria-label="More boards"
          className="mt-10 border-t border-white/[0.06] pt-6 sm:mt-16 sm:pt-8"
        >
          <h2 className="mb-4 text-[10px] tracking-[0.16em] text-zinc-500 uppercase">
            More boards
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {related.map((entry) => (
              <ProductCard key={entry.id} product={entry} onOpen={onOpen} layout="related" />
            ))}
          </div>
        </section>
      ) : null}

      {specsOpen ? (
        <SpecsDialog specs={specs} title={product.title} onClose={() => setSpecsOpen(false)} />
      ) : null}
    </>
  );
}
