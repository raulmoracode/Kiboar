import type { MouseEvent } from "react";
import { products } from "./products";

function isPlainClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export function ProductLinks({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <section className="mt-auto grid gap-6 sm:grid-cols-3 lg:grid-cols-6">
      {products.map((product) => {
        const internal = product.internal === true;

        return (
          <a
            key={product.name}
            href={product.href}
            {...(internal
              ? {
                  onClick: (event: MouseEvent<HTMLAnchorElement>) => {
                    if (!isPlainClick(event)) {
                      return;
                    }
                    event.preventDefault();
                    onNavigate(product.href);
                  },
                }
              : { target: "_blank", rel: "noreferrer" })}
            className="group py-6"
          >
            <span className="flex items-center gap-2">
              <kbd className="inline-flex size-5 items-center justify-center rounded border border-white/15 font-mono text-[10px] text-zinc-400 transition-colors group-hover:border-lime-300/40 group-hover:text-lime-200">
                {product.key}
              </kbd>
              <span className="text-[13px] text-zinc-200 transition-colors group-hover:text-lime-200">
                {product.name}
              </span>
              {internal ? null : <span className="sr-only"> (opens in a new tab)</span>}
            </span>
            <span className="mt-1 block text-[12px] leading-relaxed text-zinc-400">
              {product.line}
            </span>
          </a>
        );
      })}
    </section>
  );
}
