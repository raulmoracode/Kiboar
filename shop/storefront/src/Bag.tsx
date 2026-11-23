import { useEffect, useRef } from "react";
import { formatPrice, type Price } from "./api";

export interface BagItem {
  variantId: string;
  title: string;
  variantTitle: string | null;
  price: Price;
  quantity: number;
}

export function Bag({
  items,
  onClose,
  onRemove,
}: {
  items: BagItem[];
  onClose: () => void;
  onRemove: (variantId: string) => void;
}) {
  const panel = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const node = panel.current;
    node?.focus();

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
      previous?.focus();
    };
  }, []);

  const total = items.reduce((sum, item) => sum + item.price.amount * item.quantity, 0);
  const currency = items[0]?.price.currency_code ?? "eur";

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Bag">
      <button
        type="button"
        aria-label="Close the bag"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <aside
        ref={panel}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-[min(380px,100vw)] flex-col border-l border-white/10 bg-[#0c0e11] p-6 outline-none"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-medium text-zinc-100">Bag</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close the bag"
            className="text-[12px] text-zinc-500 transition-colors hover:text-zinc-200"
          >
            Close
          </button>
        </div>

        {items.length === 0 ? (
          <p className="mt-6 text-[13px] text-zinc-400">Your bag is empty.</p>
        ) : (
          <ul className="mt-6 divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {items.map((item) => (
              <li key={item.variantId} className="flex items-baseline justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] text-zinc-200">{item.title}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
                    {item.variantTitle ? `${item.variantTitle} · ` : ""}
                    {item.quantity} × {formatPrice(item.price)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onRemove(item.variantId)}
                    className="mt-1 text-[10px] text-zinc-500 underline decoration-white/20 underline-offset-4 transition-colors hover:text-lime-200"
                  >
                    Remove
                  </button>
                </div>
                <p className="shrink-0 font-mono text-[12px] text-zinc-300">
                  {formatPrice({
                    amount: item.price.amount * item.quantity,
                    currency_code: item.price.currency_code,
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-6">
          <div className="flex items-baseline justify-between text-[13px]">
            <span className="text-zinc-500">Total</span>
            <span className="font-mono text-zinc-100">
              {formatPrice({ amount: total, currency_code: currency })}
            </span>
          </div>
          <p className="mt-4 text-[10px] leading-relaxed text-zinc-600">
            Demo bag. Checkout is not connected to Medusa yet.
          </p>
        </div>
      </aside>
    </div>
  );
}
