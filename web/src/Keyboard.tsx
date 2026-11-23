import { productForKey } from "./products";

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
    { w: 1, label: "T" },
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
    { w: 1, label: "S" },
    { w: 1, label: "D" },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1 },
    { w: 1, label: "K" },
    { w: 1, label: "L" },
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
    { w: 6.25, label: "Kiboar" },
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

function Cap({ cap }: { cap: Key }) {
  const brand = cap.label !== undefined && cap.label.length > 1;

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
          fontSize={brand ? 0.2 : 0.26}
          letterSpacing={brand ? 0.06 : 0}
        >
          {cap.label}
        </text>
      ) : null}
    </>
  );
}

export function Keyboard() {
  return (
    <svg viewBox="0 0 15 5" aria-label="Kiboar keyboard" className="w-full">
      {KEYS.map((key) => {
        const product = key.label ? productForKey(key.label) : undefined;

        if (product) {
          return (
            <a
              key={`${key.x}-${key.y}`}
              href={product.href}
              aria-label={product.name}
              className="cursor-pointer"
            >
              <Cap cap={key} />
            </a>
          );
        }

        return (
          <g key={`${key.x}-${key.y}`}>
            <Cap cap={key} />
          </g>
        );
      })}
    </svg>
  );
}
