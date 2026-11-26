import { type ReactNode, useEffect } from "react";
import { Keyboard } from "./Keyboard";
import { ProductLinks } from "./ProductLinks";

const DETAILS_SCROLL_DELAY = 200;

export function LandingLayout({
  title,
  word,
  keyboardLabel,
  onNavigate,
  children,
  wide,
  autoScroll = false,
}: {
  title: string;
  word?: string;
  keyboardLabel: string;
  onNavigate: (href: string) => void;
  children?: ReactNode;
  wide?: boolean;
  /** Scroll to the details section after the page paints. */
  autoScroll?: boolean;
}) {
  useEffect(() => {
    if (!children) {
      return;
    }

    const details = document.getElementById("details");
    if (!details) {
      return;
    }

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    function scrollToDetails() {
      details?.scrollIntoView?.({ behavior: reduceMotion ? "auto" : "smooth" });
    }

    function onHashChange() {
      if (window.location.hash === "#details") {
        scrollToDetails();
      }
    }

    let timer = 0;
    if (window.location.hash === "#details") {
      // The section mounts after the first paint, so the browser cannot perform
      // its own hash scroll on a direct load or a refresh.
      scrollToDetails();
    } else if (autoScroll) {
      // Hold the hero long enough for the page word to be read before moving.
      timer = window.setTimeout(scrollToDetails, reduceMotion ? 0 : DETAILS_SCROLL_DELAY);
    }

    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [children, autoScroll]);

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
          id="details"
          className={`mx-auto w-full scroll-mt-10 px-6 pt-16 pb-10 sm:px-10 sm:pb-14 ${
            wide ? "max-w-[1180px]" : "max-w-[760px]"
          }`}
        >
          {children}
        </div>
      ) : null}
    </>
  );
}
