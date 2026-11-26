import { type ReactNode, useEffect } from "react";
import { Keyboard } from "./Keyboard";
import { ProductLinks } from "./ProductLinks";

const DETAILS_SCROLL_DELAY = 200;
const DETAILS_SCROLL_DURATION = 500;

function easeInOutCubic(progress: number): number {
  return progress < 0.5 ? 4 * progress * progress * progress : 1 - (-2 * progress + 2) ** 3 / 2;
}

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

    const section = document.getElementById("details");
    if (!section) {
      return;
    }

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    let frame = 0;
    let timer = 0;

    function stopAnimation() {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    }

    const scrollToDetails = () => {
      stopAnimation();

      const start = window.scrollY;
      const margin = Number.parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const target = Math.min(
        Math.max(0, start + section.getBoundingClientRect().top - margin),
        maxScroll,
      );

      if (reduceMotion) {
        window.scrollTo({ top: target, behavior: "auto" });
        return;
      }

      const distance = target - start;
      if (Math.abs(distance) < 1) {
        window.scrollTo({ top: target, behavior: "instant" });
        return;
      }

      const startedAt = performance.now();
      function step(now: number) {
        const progress = Math.min((now - startedAt) / DETAILS_SCROLL_DURATION, 1);
        window.scrollTo({
          top: start + distance * easeInOutCubic(progress),
          behavior: "instant",
        });
        if (progress < 1) {
          frame = window.requestAnimationFrame(step);
        } else {
          frame = 0;
        }
      }
      frame = window.requestAnimationFrame(step);
    };

    function onHashChange() {
      if (window.location.hash === "#details") {
        scrollToDetails();
      }
    }

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
      stopAnimation();
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
                detailsLink={Boolean(children)}
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
