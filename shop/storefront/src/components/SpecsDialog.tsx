import { useEffect, useId, useRef } from "react";
import type { SpecEntry } from "../lib/specs";

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SpecsDialog({
  specs,
  title,
  onClose,
}: {
  specs: SpecEntry[];
  title: string;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const node = panel.current;
    node?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close.current();
        return;
      }

      if (event.key !== "Tab" || !node) {
        return;
      }

      const focusable = node.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }

      if (event.shiftKey && (document.activeElement === first || document.activeElement === node)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <button
        type="button"
        aria-label="Close the specifications"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div
        ref={panel}
        tabIndex={-1}
        className="relative w-full max-w-[420px] rounded-xl border border-white/10 bg-[var(--kiboar-surface)] outline-none"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-4">
          <div>
            <h2 id={headingId} className="text-[15px] font-medium text-zinc-100">
              Specifications
            </h2>
            <p className="mt-0.5 font-mono text-[11px] text-zinc-500">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 shrink-0 place-items-center rounded-full text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-100"
          >
            <CloseIcon />
          </button>
        </div>

        <dl className="px-5 py-1">
          {specs.map((spec) => (
            <div
              key={spec.key}
              className="flex items-baseline justify-between gap-4 border-b border-white/[0.05] py-3 last:border-b-0"
            >
              <dt className="text-[10px] tracking-[0.16em] text-zinc-500 uppercase">
                {spec.label}
              </dt>
              <dd className="text-right font-mono text-[12px] text-zinc-200">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
