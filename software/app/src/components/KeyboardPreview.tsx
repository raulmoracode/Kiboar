import type { KeyPosition } from "../lib/bindings/KeyPosition";

const FALLBACK: KeyPosition[] = Array.from({ length: 48 }, (_, index) => ({
  x: index % 12,
  y: Math.floor(index / 12),
  w: 1,
  h: 1,
}));

interface Props {
  layout: KeyPosition[];
  className?: string;
}

export function KeyboardPreview({ layout, className }: Props) {
  const keys = Array.isArray(layout) && layout.length > 0 ? layout : FALLBACK;
  const width = Math.max(...keys.map((key) => key.x + key.w));
  const height = Math.max(...keys.map((key) => key.y + key.h));
  const pad = 0.8;

  return (
    <svg
      viewBox={`${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Keyboard layout"
      className={className}
    >
      {keys.map((key, index) => (
        <rect
          // Positions are stable; the index is the only identity a key has here.
          key={`${key.x}-${key.y}-${index}`}
          x={key.x + 0.04}
          y={key.y + 0.04}
          width={Math.max(0.8, key.w - 0.08)}
          height={Math.max(0.8, key.h - 0.08)}
          rx={0.08}
          fill="currentColor"
          fillOpacity={0.06}
          stroke="currentColor"
          strokeOpacity={0.18}
          strokeWidth={0.02}
        />
      ))}
    </svg>
  );
}
