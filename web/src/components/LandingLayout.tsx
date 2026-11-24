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
          <div className="relative w-full">
            <section aria-label={keyboardLabel} className="w-full">
              <Keyboard
                onNavigate={onNavigate}
                interactive={!word}
                {...(word ? { word } : {})}
                {...(children ? { hint: "details below" } : {})}
              />
            </section>
            {children ? <p className="sr-only">Details below</p> : null}
          </div>
        </div>

        <ProductLinks onNavigate={onNavigate} {...(word ? { current: word } : {})} />
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
