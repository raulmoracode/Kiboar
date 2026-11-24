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
          <p className="absolute inset-x-0 top-8 flex items-center justify-center gap-2 font-mono text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
            Scroll for details
            <span aria-hidden="true" className="text-[13px] leading-none text-lime-300/90">
              ↓
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
