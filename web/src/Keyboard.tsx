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

export function Keyboard() {
  return (
    <svg viewBox="0 0 15 5" role="img" aria-label="A 60% Kiboar keyboard" className="w-full">
      {KEYS.map((key) => (
        <g key={`${key.x}-${key.y}`}>
          <rect
            x={key.x + 0.03}
            y={key.y + 0.03}
            width={key.w - 0.06}
            height={0.94}
            rx={0.06}
            fill="#ffffff"
            fillOpacity={0.04}
            stroke="#ffffff"
            strokeOpacity={0.18}
            strokeWidth={0.012}
          />
          {key.label ? (
            <text
              x={key.x + key.w / 2}
              y={key.y + 0.52}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#bef264"
              fillOpacity={0.9}
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontSize={0.26}
            >
              {key.label}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}
