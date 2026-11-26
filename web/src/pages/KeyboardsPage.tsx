import { LandingLayout } from "../components/LandingLayout";
import { boards, type OpenBoard } from "../data/boards";

function MatrixPreview({ board }: { board: OpenBoard }) {
  const groups = board.split ? [board.cols / 2, board.cols / 2] : [board.cols];

  return (
    <div aria-hidden="true" className="flex w-full max-w-[240px] items-center justify-center gap-2">
      {groups.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className="grid min-w-0 flex-1 gap-1"
          style={{ gridTemplateColumns: `repeat(${group}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: board.rows * group }, (_, index) => {
            const row = Math.floor(index / group);
            const col = index % group;
            return (
              <span
                key={`${groupIndex}:${row}:${col}`}
                className="aspect-square rounded-[2px] border border-white/10 bg-white/[0.04] transition-colors group-hover:border-lime-300/25 group-hover:bg-lime-300/[0.04]"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function BoardCard({ board, index }: { board: OpenBoard; index: number }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden kiboar-card transition-colors hover:border-white/25">
      <div className="flex min-h-[180px] flex-1 items-center justify-center border-b border-white/[0.06] px-5 py-10">
        <MatrixPreview board={board} />
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] tracking-[0.12em] text-zinc-600 uppercase">
              Board {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-1 truncate text-[15px] font-medium text-zinc-100">{board.name}</h2>
          </div>
          <span className="shrink-0 font-mono text-[10px] text-zinc-600">rev{board.revision}</span>
        </div>

        <p className="font-mono text-[10px] tracking-[0.12em] text-zinc-500 uppercase">
          {board.keys} keys · {board.rows} × {board.cols}
          {board.split ? " · split" : ""}
        </p>

        <div className="mt-auto flex items-baseline justify-between gap-3 border-t border-white/[0.06] pt-3">
          <span className="font-mono text-[10px] text-zinc-600">{board.mcu}</span>
          <a
            href={board.definition}
            target="_blank"
            rel="noreferrer"
            aria-label={`${board.name} definition (opens in a new tab)`}
            className="text-[11px] text-zinc-400 underline decoration-white/15 underline-offset-4 transition-colors hover:text-lime-200"
          >
            Definition
          </a>
        </div>
      </div>
    </article>
  );
}

export function KeyboardsPage({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <LandingLayout
      title="Keyboards"
      word="Keyboards"
      keyboardLabel="Keyboards keyboard"
      onNavigate={onNavigate}
      wide
    >
      <h1 className="sr-only">Keyboards</h1>

      <section aria-label="Board definitions" className="grid gap-3 md:grid-cols-3">
        {boards.map((board, index) => (
          <BoardCard key={board.id} board={board} index={index} />
        ))}
      </section>
    </LandingLayout>
  );
}
