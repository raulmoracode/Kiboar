import type { BoardSummary } from "../lib/bindings/BoardSummary";

type Status = "idle" | "loading" | "ready" | "error";

interface Props {
  boards: BoardSummary[];
  status: Status;
  error: string | null;
  selected: BoardSummary | null;
  onSelect: (board: BoardSummary) => void;
}

export function BoardCatalog({ boards, status, error, selected, onSelect }: Props) {
  return (
    <section aria-labelledby="boards-heading">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 id="boards-heading" className="text-lg font-semibold text-zinc-100">
            Boards
          </h2>
          <p className="mt-1 text-sm text-zinc-500">Select the model printed on your PCB.</p>
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-500">
          {status === "ready" ? `${boards.length} in the registry` : "registry"}
        </span>
      </div>

      {status === "loading" ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-zinc-400">
          Reading the board registry…
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
          <span className="font-medium">Registry unavailable.</span> {error}
        </div>
      ) : null}

      {status === "ready" ? (
        <ul className="grid gap-3">
          {boards.map((board) => {
            const isSelected =
              selected?.board_id === board.board_id && selected.hw_rev === board.hw_rev;
            return (
              <li key={`${board.board_id}@${board.hw_rev}`}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelect(board)}
                  className={`w-full rounded-2xl border px-5 py-4 text-left transition ${
                    isSelected
                      ? "border-emerald-400/50 bg-emerald-400/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-base font-semibold text-zinc-100">{board.name}</span>
                    <span className="font-mono text-xs text-zinc-500">
                      {board.board_id} · rev {board.hw_rev}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
                    <div>
                      <dt className="uppercase tracking-[0.14em] text-zinc-600">MCU</dt>
                      <dd className="mt-0.5 font-mono text-zinc-300">{board.mcu}</dd>
                    </div>
                    <div>
                      <dt className="uppercase tracking-[0.14em] text-zinc-600">Matrix</dt>
                      <dd className="mt-0.5 font-mono text-zinc-300">
                        {board.rows} × {board.cols}
                      </dd>
                    </div>
                    <div>
                      <dt className="uppercase tracking-[0.14em] text-zinc-600">Keys</dt>
                      <dd className="mt-0.5 font-mono text-zinc-300">{board.keys}</dd>
                    </div>
                    <div>
                      <dt className="uppercase tracking-[0.14em] text-zinc-600">Layers</dt>
                      <dd className="mt-0.5 font-mono text-zinc-300">{board.layers}</dd>
                    </div>
                  </dl>
                  {board.split ? (
                    <p className="mt-3 text-xs text-amber-200/70">
                      Split board. Flashing is supported; half detection is not.
                    </p>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
