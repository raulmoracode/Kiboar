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
    <section aria-labelledby="keyboards-heading" className="flex flex-1 flex-col">
      <div className="mb-3 flex items-baseline justify-between">
        <h2
          id="keyboards-heading"
          className="text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-600"
        >
          Keyboards
        </h2>
        <span className="font-mono text-[10px] text-zinc-700">{cards.length}</span>
      </div>

      <div className="grid flex-1 auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-3">
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

        <button
          type="button"
          onClick={onAdd}
          className="flex h-full min-h-[140px] items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.08] text-[11px] text-zinc-600 transition hover:border-white/15 hover:text-zinc-400"
        >
          <Plus size={14} />
          Add keyboard
        </button>
      </div>
    </section>
  );
}
