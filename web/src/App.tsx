import { type MouseEvent, useCallback, useEffect, useState } from "react";
import { Keyboard } from "./Keyboard";
import { productForKey, products } from "./products";
import { StudioPage } from "./StudioPage";

function pathFromLocation(): string {
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

function isPlainClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export default function App() {
  const [path, setPath] = useState(pathFromLocation);

  useEffect(() => {
    function onPopState() {
      setPath(pathFromLocation());
      window.scrollTo(0, 0);
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((href: string) => {
    window.history.pushState({}, "", href);
    setPath(pathFromLocation());
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (path !== "/") {
      return;
    }

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
      if (!product) {
        return;
      }

      event.preventDefault();
      if (product.internal) {
        navigate(product.href);
      } else {
        window.open(product.href, "_blank", "noopener,noreferrer");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [path, navigate]);

  if (path === "/studio") {
    return (
      <main className="min-h-screen bg-[var(--kiboar-bg)] text-zinc-200">
        <StudioPage onHome={() => navigate("/")} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--kiboar-bg)] text-zinc-200">
      <div className="mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-6 py-10 sm:px-10 sm:py-14">
        <h1 className="sr-only">Kiboar</h1>

        <div className="flex flex-1 items-center">
          <section aria-label="Kiboar 60% keyboard" className="w-full">
            <Keyboard onNavigate={navigate} />
          </section>
        </div>

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
                        navigate(product.href);
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
      </div>
    </main>
  );
}
