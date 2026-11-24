import type { MouseEvent } from "react";
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

function Cap({ cap, hint }: { cap: Key; hint?: string }) {
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
      {cap.label ? (
        <text
          x={cap.x + cap.w / 2}
          y={cap.y + 0.52}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#bef264"
          fillOpacity={0.9}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize={0.26}
        >
          {cap.label}
        </text>
      ) : null}
      {hint ? (
        <text
          x={cap.x + cap.w / 2}
          y={cap.y + 0.52}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#d4d4d8"
          fillOpacity={0.9}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize={0.15}
          letterSpacing={0.02}
        >
          {hint}
        </text>
      ) : null}
    </>
  );
}

export function Keyboard({
  onNavigate,
  word,
  interactive = true,
  hint,
}: {
  onNavigate?: (href: string) => void;
  word?: string;
  interactive?: boolean;
  hint?: string;
}) {
  const wordRow = KEYS.filter((key) => key.y === 2);
  const customLabels = new Map<Key, string>();

  if (word) {
    const letters = Array.from(word.replace(/\s+/g, ""));
    const start = Math.max(0, Math.round((wordRow.length - letters.length) / 2));
    letters.forEach((letter, index) => {
      const key = wordRow[start + index];
      if (key) {
        customLabels.set(key, letter);
      }
    });
  }

  return (
    <svg
      viewBox="0 0 15 5"
      aria-label={word ? `${word} keyboard` : "Kiboar keyboard"}
      className="w-full"
    >
      {KEYS.map((key) => {
        const label = word ? customLabels.get(key) : key.label;
        const product = interactive && label ? productForKey(label) : undefined;
        const cap: Key = label ? { ...key, label } : { x: key.x, y: key.y, w: key.w };
        // The spacebar is the only wide key; the hint sits on it.
        const capHint = key.w > 4 && hint ? { hint } : {};

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
              <Cap cap={cap} {...capHint} />
            </a>
          );
        }

        return (
          <g key={`${key.x}-${key.y}`}>
            <Cap cap={cap} {...capHint} />
          </g>
        );
      })}
    </svg>
  );
}
