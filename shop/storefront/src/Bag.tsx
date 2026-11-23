import { useEffect, useRef } from "react";
import { formatPrice, imageUrl, type Price } from "./api";
import { productHref } from "./ProductCard";

export interface BagItem {
  variantId: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  variantTitle: string | null;
  price: Price;
  quantity: number;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Bag({
  items,
  onClose,
  onBrowse,
  onIncrease,
  onDecrease,
  onOpenProduct,
}: {
  items: BagItem[];
  onClose: () => void;
  onBrowse: () => void;
  onIncrease: (variantId: string) => void;
  onDecrease: (variantId: string) => void;
  onOpenProduct: (handle: string) => void;
}) {
  const panel = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const node = panel.current;
    node?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close.current();
        return;
      }

      if (event.key !== "Tab" || !node) {
        return;
      }

      const focusable = node.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }

      if (event.shiftKey && (document.activeElement === first || document.activeElement === node)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  const count = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price.amount * item.quantity, 0);
  const currency = items[0]?.price.currency_code ?? "eur";

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Bag">
      <button
        type="button"
        aria-label="Close the bag"
        onClick={onClose}
        className="bag-overlay absolute inset-0 bg-black/60"
      />
      <aside
        ref={panel}
        tabIndex={-1}
        className="bag-panel absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-xl border-t border-white/10 bg-[#0c0e11] outline-none sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:max-h-none sm:w-[420px] sm:rounded-none sm:border-t-0 sm:border-l"
      >
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <h2 className="flex items-baseline gap-2 text-[15px] font-medium text-zinc-100">
            Bag
            {count > 0 ? (
              <span className="font-mono text-[11px] text-lime-300">{count}</span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close the bag"
            className="grid size-8 place-items-center rounded-full text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-100"
          >
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-12 text-center">
            <p className="text-[13px] text-zinc-400">Your bag is empty.</p>
            <button
              type="button"
              onClick={onBrowse}
              className="rounded border border-white/15 px-4 py-2 text-[12px] text-zinc-300 transition-colors hover:border-white/30 hover:text-zinc-100"
            >
              Browse boards
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-white/[0.07] overflow-y-auto px-5">
              {items.map((item) => {
                const image = imageUrl(item.thumbnail);

                return (
                  <li
                    key={item.variantId}
                    className="grid grid-cols-[56px_minmax(0,1fr)_auto] gap-3 py-4"
                  >
                    <a
                      href={productHref(item.handle)}
                      onClick={(event) => {
                        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                          return;
                        }
                        event.preventDefault();
                        onOpenProduct(item.handle);
                      }}
                      className="aspect-[4/3] w-14 self-start overflow-hidden rounded border border-white/[0.06] bg-white/[0.015]"
                    >
                      {image ? (
                        <img src={image} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-[8px] tracking-[0.12em] text-zinc-600 uppercase">
                          No photo
                        </span>
                      )}
                    </a>

                    <div className="min-w-0">
                      <a
                        href={productHref(item.handle)}
                        onClick={(event) => {
                          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                            return;
                          }
                          event.preventDefault();
                          onOpenProduct(item.handle);
                        }}
                        className="block truncate text-[13px] text-zinc-100 transition-colors hover:text-lime-200"
                      >
                        {item.title}
                      </a>
                      {item.variantTitle ? (
                        <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
                          {item.variantTitle}
                        </p>
                      ) : null}
                      <div className="mt-2 inline-flex items-center rounded border border-white/10">
                        <button
                          type="button"
                          onClick={() => onDecrease(item.variantId)}
                          aria-label={
                            item.quantity === 1
                              ? `Remove ${item.title} from the bag`
                              : `Decrease the quantity of ${item.title}`
                          }
                          className="grid size-6 place-items-center text-[13px] leading-none text-zinc-500 transition-colors hover:text-zinc-100"
                        >
                          −
                        </button>
                        <span className="w-7 text-center font-mono text-[11px] text-zinc-300">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onIncrease(item.variantId)}
                          aria-label={`Increase the quantity of ${item.title}`}
                          className="grid size-6 place-items-center text-[13px] leading-none text-zinc-500 transition-colors hover:text-zinc-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <p className="self-start pt-0.5 font-mono text-[12px] text-zinc-300">
                      {formatPrice({
                        amount: item.price.amount * item.quantity,
                        currency_code: item.price.currency_code,
                      })}
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-white/[0.07] px-5 py-4">
              <div className="flex items-baseline justify-between text-[13px]">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-mono text-zinc-100">
                  {formatPrice({ amount: total, currency_code: currency })}
                </span>
              </div>
              <button
                type="button"
                disabled
                className="mt-4 h-10 w-full cursor-not-allowed rounded bg-zinc-700 text-[12px] font-medium text-zinc-500"
              >
                Checkout
              </button>
              <p className="mt-3 text-[10px] leading-relaxed text-zinc-600">
                Demo bag. Checkout is not connected to Medusa yet.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
