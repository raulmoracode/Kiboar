import { useEffect } from "react";
import { PageHeader } from "./PageHeader";

const LINKS = [
  ["Home", "/"],
  ["Keyboards", "/keyboards"],
  ["Library", "/library"],
  ["Studio", "/studio"],
] as const;

export function NotFoundPage({ onNavigate }: { onNavigate: (href: string) => void }) {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.append(meta);
    return () => meta.remove();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[760px] px-6 py-10 sm:px-10 sm:py-14">
      <PageHeader section="Not found" onHome={() => onNavigate("/")} />

      <section aria-labelledby="not-found-title" className="mt-20">
        <p className="font-mono text-[10px] tracking-[0.16em] text-zinc-500 uppercase">404</p>
        <h1
          id="not-found-title"
          className="mt-3 text-[28px] leading-tight font-medium tracking-[-0.01em] text-zinc-100"
        >
          Nothing here.
        </h1>
        <p className="mt-5 max-w-[480px] text-[13px] leading-relaxed text-zinc-400">
          The page you asked for is not part of Kiboar. The keyboard and the product pages are still
          one key away.
        </p>

        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[12px]">
          {LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={(event) => {
                if (
                  event.button !== 0 ||
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                ) {
                  return;
                }
                event.preventDefault();
                onNavigate(href);
              }}
              className="text-zinc-400 underline decoration-white/15 underline-offset-4 transition-colors hover:text-lime-200"
            >
              {label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
