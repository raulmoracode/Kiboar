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

function BoardCard({ board }: { board: OpenBoard }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden kiboar-card transition-colors hover:border-white/25">
      <div className="flex min-h-[180px] flex-1 items-center justify-center border-b border-white/[0.06] px-5 py-10">
        <MatrixPreview board={board} />
      </div>

      <div className="flex items-baseline justify-between gap-4 p-5">
        <h2 className="min-w-0 truncate text-[15px] font-medium text-zinc-100">{board.name}</h2>
        <div className="flex shrink-0 items-baseline gap-2">
          <a
            href={board.files}
            target="_blank"
            rel="noreferrer"
            aria-label={`${board.name} files on GitHub (opens in a new tab)`}
            className="kiboar-link text-[11px] text-zinc-400"
          >
            GitHub
          </a>
          <span aria-hidden="true" className="text-[11px] text-zinc-700">
            ·
          </span>
          <a
            href={board.shop}
            target="_blank"
            rel="noreferrer"
            aria-label={`Shop ${board.name} (opens in a new tab)`}
            className="text-[11px] font-medium text-lime-300 transition-colors hover:text-lime-200"
          >
            Shop
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
      autoScroll
    >
      <section aria-label="Board definitions" className="grid gap-3 md:grid-cols-3">
        {boards.map((board) => (
          <BoardCard key={board.id} board={board} />
        ))}
      </section>
    </LandingLayout>
  );
}
