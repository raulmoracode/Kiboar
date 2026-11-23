import type { BoardSummary } from "../lib/bindings/BoardSummary";
import { KeyboardPreview } from "./KeyboardPreview";

interface Props {
  board: BoardSummary;
  selected: boolean;
  connected?: boolean;
  onSelect: () => void;
}

export function KeyboardCard({ board, selected, connected = false, onSelect }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`relative flex h-full min-h-[180px] flex-col overflow-hidden rounded-lg border p-0 text-left transition ${
        selected
          ? "border-lime-300/30 bg-lime-300/[0.03] text-zinc-300"
          : "border-white/[0.06] bg-white/[0.015] text-zinc-400 hover:border-white/15 hover:text-zinc-300"
      }`}
    >
      {connected ? (
        <span className="absolute right-4 top-4 size-1.5 rounded-full bg-lime-300" />
      ) : null}
      <div className="px-5 pt-4">
        <p className="truncate text-[15px] text-zinc-200">{board.name}</p>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <KeyboardPreview layout={board.layout ?? []} className="h-full w-full" />
      </div>
    </button>
  );
}
