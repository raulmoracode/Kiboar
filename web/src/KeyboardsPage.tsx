import { boards, type OpenBoard } from "./boards";
import { PageHeader } from "./PageHeader";

const README = "https://github.com/raulmoracode/Kiboar/blob/main/keyboards/README.md";

function MatrixPreview({ board }: { board: OpenBoard }) {
  const groups = board.split ? [board.cols / 2, board.cols / 2] : [board.cols];

  return (
    <div aria-hidden="true" className="flex items-center gap-2">
      {groups.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${group}, 0.5rem)` }}
        >
          {Array.from({ length: board.rows * group }, (_, index) => {
            const row = Math.floor(index / group);
            const col = index % group;
            return (
              <span
                key={`${groupIndex}:${row}:${col}`}
                className="size-2 rounded-[2px] border border-white/10 bg-white/[0.04]"
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
    <article className="flex h-full flex-col rounded-lg border border-white/[0.06] bg-white/[0.015] p-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="min-w-0 truncate text-[14px] text-zinc-100">{board.name}</h2>
        <span className="shrink-0 font-mono text-[10px] text-zinc-600">rev{board.revision}</span>
      </div>
      <p className="mt-1 font-mono text-[10px] text-zinc-600">{board.id}</p>

      <div className="mt-6 flex min-h-[72px] items-center">
        <MatrixPreview board={board} />
      </div>

      <dl className="mt-5 space-y-1.5 border-t border-white/[0.07] pt-3 font-mono text-[10px]">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-zinc-600">MCU</dt>
          <dd className="text-zinc-400">{board.mcu}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-zinc-600">Matrix</dt>
          <dd className="text-zinc-400">
            {board.rows} × {board.cols}
            {board.split ? " · split" : ""}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-zinc-600">Keys</dt>
          <dd className="text-zinc-400">{board.keys}</dd>
        </div>
      </dl>

      <div className="mt-auto flex items-baseline justify-between gap-3 pt-4">
        <span className="text-[10px] text-zinc-600">Hardware files pending</span>
        <a
          href={board.definition}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-zinc-400 underline decoration-white/15 underline-offset-4 transition-colors hover:text-lime-200"
        >
          Definition
        </a>
      </div>
    </article>
  );
}

export function KeyboardsPage({ onHome }: { onHome: () => void }) {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-6 py-10 sm:px-10 sm:py-14">
      <PageHeader
        section="Keyboards"
        onHome={onHome}
        right={
          <a
            href={README}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] text-zinc-500 transition-colors hover:text-zinc-200"
          >
            README
          </a>
        }
      />

      <section aria-labelledby="keyboards-title" className="mt-20">
        <p className="font-mono text-[10px] tracking-[0.16em] text-zinc-500 uppercase">
          Open hardware · {boards.length} board definitions
        </p>
        <h1
          id="keyboards-title"
          className="mt-3 text-[28px] leading-tight font-medium tracking-[-0.01em] text-zinc-100"
        >
          Keyboards
        </h1>
        <p className="mt-5 max-w-[560px] text-[13px] leading-relaxed text-zinc-400">
          The boards Kiboar designs. Studio reads these definitions today; the KiCad project,
          fabrication files and firmware will live in <code className="font-mono">keyboards/</code>{" "}
          as each board is released.
        </p>
      </section>

      <section aria-label="Board definitions" className="mt-10 grid gap-3 md:grid-cols-3">
        {boards.map((board) => (
          <BoardCard key={board.id} board={board} />
        ))}
      </section>

      <p className="mt-8 max-w-[560px] text-[11px] leading-relaxed text-zinc-600">
        A board definition is the matrix, pins and layers Studio uses; it is not a KiCad project or
        a firmware image. The hardware release lives in{" "}
        <a
          href={README}
          target="_blank"
          rel="noreferrer"
          className="text-zinc-400 underline decoration-white/15 underline-offset-4 hover:text-lime-200"
        >
          keyboards/
        </a>{" "}
        and starts empty.
      </p>
    </div>
  );
}
