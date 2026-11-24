import type { ReactNode } from "react";

export function PageHeader({
  section,
  onHome,
  right,
}: {
  section: string;
  onHome: () => void;
  right?: ReactNode;
}) {
  return (
    <header className="flex h-11 items-center justify-between">
      <div className="flex items-baseline gap-2.5">
        <a
          href="/"
          onClick={(event) => {
            event.preventDefault();
            onHome();
          }}
          className="text-[13px] font-semibold text-zinc-100"
        >
          Kiboar
        </a>
        <span aria-hidden="true" className="text-[12px] text-zinc-700">
          /
        </span>
        <span className="text-[12px] text-zinc-400">{section}</span>
      </div>
      {right ?? null}
    </header>
  );
}
