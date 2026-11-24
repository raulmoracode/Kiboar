import type { ReactNode } from "react";
import { Keyboard } from "./Keyboard";
import { ProductLinks } from "./ProductLinks";

export function LandingLayout({
  title,
  word,
  keyboardLabel,
  onNavigate,
  children,
  wide,
}: {
  title: string;
  word?: string;
  keyboardLabel: string;
  onNavigate: (href: string) => void;
  children?: ReactNode;
  wide?: boolean;
}) {
  return (
    <>
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-6 py-10 sm:px-10 sm:py-14">
        {children ? null : <h1 className="sr-only">{title}</h1>}

        <div className="flex flex-1 items-center">
          <section aria-label={keyboardLabel} className="w-full">
            <Keyboard onNavigate={onNavigate} interactive={!word} {...(word ? { word } : {})} />
          </section>
        </div>

        <ProductLinks onNavigate={onNavigate} {...(word ? { current: word } : {})} />

        {children ? (
          <p className="absolute inset-x-0 bottom-3 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] tracking-[0.16em] text-zinc-300 uppercase">
              <span
                aria-hidden="true"
                className="text-[13px] leading-none text-lime-300/80 motion-safe:animate-bounce"
              >
                ↓
              </span>
              Scroll
            </span>
          </p>
        ) : null}
      </div>

      {children ? (
        <div
          className={`mx-auto w-full px-6 pt-16 pb-10 sm:px-10 sm:pb-14 ${
            wide ? "max-w-[1180px]" : "max-w-[760px]"
          }`}
        >
          {children}
        </div>
      ) : null}
    </>
  );
}
