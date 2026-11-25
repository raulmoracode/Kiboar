import type { MouseEvent } from "react";
import { products } from "../data/products";
import { isPlainClick } from "../lib/links";

const HOME = { name: "Home", href: "/", line: "Back to the start." };

export function ProductLinks({
  onNavigate,
  current,
}: {
  onNavigate: (href: string) => void;
  current?: string;
}) {
  const currentPage = current?.toLowerCase();

  return (
    <section className="mt-auto grid gap-6 sm:grid-cols-3 lg:grid-cols-6">
      {products.map((product) => {
        const isCurrent = product.name.toLowerCase() === currentPage;
        const name = isCurrent ? HOME.name : product.name;
        const href = isCurrent ? HOME.href : product.href;
        const line = isCurrent ? HOME.line : product.line;
        const internal = isCurrent || product.internal === true;
        const unavailable = product.disabled === true && !isCurrent;

        if (unavailable) {
          return (
            <span key={product.name} aria-disabled="true" className="cursor-not-allowed py-6">
              <span className="flex items-center gap-2">
                <kbd className="inline-flex size-5 items-center justify-center rounded border border-white/5 font-mono text-[10px] text-zinc-700">
                  {product.key}
                </kbd>
                <span className="text-[13px] text-zinc-600">{name}</span>
                <span className="sr-only"> (unavailable)</span>
              </span>
              <span className="mt-1 block text-[12px] leading-relaxed text-zinc-700">{line}</span>
            </span>
          );
        }

        return (
          <a
            key={product.name}
            href={href}
            {...(internal
              ? {
                  onClick: (event: MouseEvent<HTMLAnchorElement>) => {
                    if (!isPlainClick(event)) {
                      return;
                    }
                    event.preventDefault();
                    onNavigate(href);
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
                {name}
              </span>
              {internal ? null : <span className="sr-only"> (opens in a new tab)</span>}
            </span>
            <span className="mt-1 block text-[12px] leading-relaxed text-zinc-400">{line}</span>
          </a>
        );
      })}
    </section>
  );
}
