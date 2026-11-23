import type { BoardInfo } from "../lib/bindings/BoardInfo";
import type { BoardSummary } from "../lib/bindings/BoardSummary";

interface Props {
  board: BoardSummary;
  connected: BoardInfo | null;
  local: boolean;
  selected: boolean;
  onSelect: () => void;
}

export function KeyboardCard({ board, connected, local, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex min-h-[108px] flex-col rounded-lg border p-4 text-left transition ${
        selected
          ? "border-lime-300/30 bg-lime-300/[0.03]"
          : "border-white/[0.06] bg-white/[0.015] hover:border-white/15"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`size-1.5 rounded-full ${connected ? "bg-lime-300" : "bg-zinc-700"}`} />
        <span className="text-[9px] uppercase tracking-[0.14em] text-zinc-600">
          {local ? "Local" : connected ? "Connected" : "Registry"}
        </span>
      </div>
      <p className="mt-3 truncate text-sm text-zinc-200">{board.name}</p>
      <p className="mt-1 truncate font-mono text-[10px] text-zinc-600">
        {board.board_id} · rev {board.hw_rev}
      </p>
      {connected ? (
        <p className="mt-auto pt-2 font-mono text-[10px] text-zinc-500">
          fw {connected.fw_version}
        </p>
      ) : null}
    </button>
  );
}
