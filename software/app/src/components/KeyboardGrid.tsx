import { Plus } from "lucide-react";
import type { BoardInfo } from "../lib/bindings/BoardInfo";
import type { BoardSummary } from "../lib/bindings/BoardSummary";
import { boardKey } from "../store";
import { KeyboardCard } from "./KeyboardCard";

interface Props {
  boards: BoardSummary[];
  customBoards: BoardSummary[];
  detected: Map<string, BoardInfo>;
  selected: BoardSummary | null;
  onSelect: (board: BoardSummary) => void;
  onAdd: () => void;
}

export function KeyboardGrid({ boards, customBoards, detected, selected, onSelect, onAdd }: Props) {
  const localKeys = new Set(customBoards.map(boardKey));
  const cards = [...customBoards, ...boards];

  return (
    <section aria-label="Keyboards" className="flex min-h-0 flex-1 flex-col">
      <div className="grid min-h-0 flex-1 auto-rows-fr gap-3 overflow-y-auto sm:grid-cols-2 md:grid-cols-3">
        {cards.map((board) => {
          const key = boardKey(board);
          return (
            <KeyboardCard
              key={key}
              board={board}
              connected={detected.get(key) ?? null}
              local={localKeys.has(key)}
              selected={selected !== null && boardKey(selected) === key}
              onSelect={() => onSelect(board)}
            />
          );
        })}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-3 flex shrink-0 items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.08] py-4 text-[11px] text-zinc-600 transition hover:border-white/15 hover:text-zinc-400"
      >
        <Plus size={14} />
        Add keyboard
      </button>
    </section>
  );
}
