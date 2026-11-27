import { type MouseEvent, useEffect, useState } from "react";
import { productForKey } from "../data/products";
import { isPlainClick } from "../lib/links";

interface KeyDef {
  w: number;
  label?: string;
}

const ROWS: readonly (readonly KeyDef[])[] = [
  [
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 2 },
  ],
  [
    { w: 1.5 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1.5 },
  ],
  [
    { w: 1.75 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1, label: "K" },
    { w: 1, label: "i" },
    { w: 1, label: "b" },
    { w: 1, label: "o" },
    { w: 1, label: "a" },
    { w: 1, label: "r" },
    { w: 1 },
    { w: 1 },
    { w: 2.25 },
  ],
  [
    { w: 2.25 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 2.75 },
  ],
  [
    { w: 1.25 },
    { w: 1.25 },
    { w: 1.25 },
    { w: 6.25 },
    { w: 1.25 },
    { w: 1.25 },
    { w: 1.25 },
    { w: 1.25 },
  ],
];

interface Key {
  x: number;
  y: number;
  w: number;
  label?: string;
}

function layout(): Key[] {
  const keys: Key[] = [];
  ROWS.forEach((row, y) => {
    let x = 0;
    for (const key of row) {
      keys.push({ ...key, x, y });
      x += key.w;
    }
  });
  return keys;
}

const KEYS = layout();
const WORD_ROW = KEYS.filter((key) => key.y === 2);
const CROSSFADE_MS = 340;

// The page components remount the keyboard on navigation, so the previous
// word has to survive outside the component for the incoming one to crossfade.
let lastWord: string | undefined;

function wordLabels(word: string | undefined): Map<Key, string> {
  const labels = new Map<Key, string>();
  if (!word) {
    return labels;
  }

  const letters = Array.from(word.replace(/\s+/g, ""));
  const start = Math.max(0, Math.round((WORD_ROW.length - letters.length) / 2));
  letters.forEach((letter, index) => {
    const key = WORD_ROW[start + index];
    if (key) {
      labels.set(key, letter);
    }
  });
  return labels;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function KeyboardLabel({ cap, label, className }: { cap: Key; label: string; className: string }) {
  return (
    <text
      x={cap.x + cap.w / 2}
      y={cap.y + 0.52}
      textAnchor="middle"
      dominantBaseline="middle"
      fill="#bef264"
      fillOpacity={0.9}
      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      fontSize={0.26}
      className={className}
    >
      {label}
    </text>
  );
}

function Cap({ cap, previousLabel }: { cap: Key; previousLabel?: string | undefined }) {
  return (
    <>
      <rect
        x={cap.x + 0.03}
        y={cap.y + 0.03}
        width={cap.w - 0.06}
        height={0.94}
        rx={0.06}
        fill="#ffffff"
        fillOpacity={0.04}
        stroke="#ffffff"
        strokeOpacity={0.18}
        strokeWidth={0.012}
      />
      {previousLabel !== undefined ? (
        <KeyboardLabel
          key={`out-${previousLabel}`}
          cap={cap}
          label={previousLabel}
          className="kiboar-key-label kiboar-key-label-out"
        />
      ) : null}
      {cap.label ? (
        <KeyboardLabel
          key={`in-${cap.label}`}
          cap={cap}
          label={cap.label}
          className="kiboar-key-label kiboar-key-label-in"
        />
      ) : null}
    </>
  );
}

export function Keyboard({
  onNavigate,
  word,
  interactive = true,
  detailsLink = false,
}: {
  onNavigate?: (href: string) => void;
  word?: string;
  interactive?: boolean;
  detailsLink?: boolean;
}) {
  const currentLabels = wordLabels(word);
  const [previousWord, setPreviousWord] = useState<string | undefined>(() =>
    word && lastWord && lastWord !== word && !prefersReducedMotion() ? lastWord : undefined,
  );
  const previousLabels = wordLabels(previousWord);

  useEffect(() => {
    lastWord = word;
  }, [word]);

  useEffect(() => {
    if (!previousWord) {
      return;
    }
    const timer = window.setTimeout(() => setPreviousWord(undefined), CROSSFADE_MS);
    return () => window.clearTimeout(timer);
  }, [previousWord]);

  return (
    <svg
      viewBox="0 0 15 5"
      aria-label={word ? `${word} keyboard` : "Kiboar keyboard"}
      className="w-full"
    >
      {KEYS.map((key) => {
        const label = currentLabels.get(key) ?? (word ? undefined : key.label);
        const previousLabel = previousLabels.get(key);
        const product = interactive && label ? productForKey(label) : undefined;
        const cap: Key = label ? { ...key, label } : { x: key.x, y: key.y, w: key.w };

        // The wide key is the detail-page shortcut; it is the only
        // interactive key on a page whose words are otherwise inert.
        if (detailsLink && key.w > 4) {
          return (
            <a
              key={`${key.x}-${key.y}`}
              href="#details"
              aria-label="Scroll to the details"
              className="cursor-pointer"
            >
              <Cap cap={cap} previousLabel={previousLabel} />
            </a>
          );
        }

        if (product) {
          const internal = product.internal === true;
          const href = product.href;

          function onInternalClick(event: MouseEvent<HTMLAnchorElement>) {
            if (!isPlainClick(event) || !onNavigate) {
              return;
            }
            event.preventDefault();
            onNavigate(href);
          }

          return (
            <a
              key={`${key.x}-${key.y}`}
              href={href}
              {...(internal
                ? { onClick: onInternalClick }
                : { target: "_blank", rel: "noreferrer" })}
              aria-label={internal ? product.name : `${product.name} (opens in a new tab)`}
              className="cursor-pointer"
            >
              <Cap cap={cap} previousLabel={previousLabel} />
            </a>
          );
        }

        return (
          <g key={`${key.x}-${key.y}`}>
            <Cap cap={cap} previousLabel={previousLabel} />
          </g>
        );
      })}
    </svg>
  );
}
