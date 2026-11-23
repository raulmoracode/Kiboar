import { Plus } from "lucide-react";
import type { BoardSummary } from "../lib/bindings/BoardSummary";
import { boardKey } from "../store";
import { KeyboardCard } from "./KeyboardCard";

interface Props {
  boards: BoardSummary[];
  customBoards: BoardSummary[];
  selected: BoardSummary | null;
  onSelect: (board: BoardSummary) => void;
  onAdd: () => void;
}

export function KeyboardGrid({ boards, customBoards, selected, onSelect, onAdd }: Props) {
  const cards = [...customBoards, ...boards];

  return (
    <section aria-label="Keyboards" className="flex min-h-0 flex-1 flex-col">
      <div className="grid min-h-0 flex-1 auto-rows-fr gap-3 overflow-y-auto sm:grid-cols-2 md:grid-cols-3">
        {cards.map((board) => (
          <KeyboardCard
            key={boardKey(board)}
            board={board}
            selected={selected !== null && boardKey(selected) === boardKey(board)}
            onSelect={() => onSelect(board)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-3 flex min-h-[112px] shrink-0 items-center justify-center gap-3 rounded-lg border border-dashed border-white/10 text-sm text-zinc-500 transition hover:border-white/20 hover:text-zinc-300"
      >
        <Plus size={18} />
        Add keyboard
      </button>
    </section>
  );
}
