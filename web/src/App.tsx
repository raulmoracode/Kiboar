import { useEffect } from "react";
import { Keyboard } from "./Keyboard";
import { productForKey, products } from "./products";

export default function App() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT"
      ) {
        return;
      }

      const product = productForKey(event.key);
      if (product) {
        event.preventDefault();
        window.location.assign(product.href);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0b0d] text-zinc-200">
      <div className="mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-6 py-10 sm:px-10 sm:py-14">
        <h1 className="sr-only">Kiboar</h1>

        <div className="flex flex-1 items-center">
          <section aria-label="Kiboar 60% keyboard" className="w-full">
            <Keyboard />
          </section>
        </div>

        <section className="mt-auto grid gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {products.map((product) => (
            <a key={product.name} href={product.href} className="group py-6">
              <span className="flex items-center gap-2">
                <kbd className="inline-flex size-5 items-center justify-center rounded border border-white/15 font-mono text-[10px] text-zinc-400 transition-colors group-hover:border-lime-300/40 group-hover:text-lime-200">
                  {product.key}
                </kbd>
                <span className="text-[13px] text-zinc-200 transition-colors group-hover:text-lime-200">
                  {product.name}
                </span>
              </span>
              <span className="mt-1 block text-[12px] leading-relaxed text-zinc-400">
                {product.line}
              </span>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}
