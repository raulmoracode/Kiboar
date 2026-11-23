import type { BoardSummary } from "../lib/bindings/BoardSummary";

type Status = "idle" | "loading" | "ready" | "error";

interface Props {
  boards: BoardSummary[];
  status: Status;
  error: string | null;
  selected: BoardSummary | null;
  onSelect: (board: BoardSummary) => void;
  onRetry: () => void;
}

export function BoardPicker({ boards, status, error, selected, onSelect, onRetry }: Props) {
  return (
    <section aria-labelledby="board-heading">
      <div className="flex items-baseline justify-between">
        <h2
          id="board-heading"
          className="text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-600"
        >
          Board
        </h2>
        <span className="font-mono text-[10px] text-zinc-700">{boards.length}</span>
      </div>

      {status === "error" ? (
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-rose-300/80">Registry unavailable</span>
          <button type="button" onClick={onRetry} className="text-zinc-500 hover:text-zinc-200">
            Retry
          </button>
        </div>
      ) : null}

      {status === "loading" ? <p className="mt-3 text-xs text-zinc-600">Loading</p> : null}

      {status === "ready" ? (
        <div className="mt-2 grid gap-0.5">
          {boards.map((board) => {
            const isSelected =
              selected?.board_id === board.board_id && selected.hw_rev === board.hw_rev;
            return (
              <button
                key={`${board.board_id}@${board.hw_rev}`}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(board)}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-left transition ${
                  isSelected ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`size-1.5 rounded-full ${
                      isSelected ? "bg-lime-300" : "bg-zinc-700"
                    }`}
                  />
                  <span className="text-sm text-zinc-300">{board.name}</span>
                </span>
                <span className="font-mono text-[10px] text-zinc-600">rev {board.hw_rev}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {selected ? (
        <p className="mt-1 px-3 font-mono text-[10px] text-zinc-600">
          {selected.rows}×{selected.cols} · {selected.keys} keys · {selected.mcu}
        </p>
      ) : null}

      {error && status === "error" ? (
        <p className="mt-1 text-[10px] text-zinc-600">{error}</p>
      ) : null}
    </section>
  );
}
