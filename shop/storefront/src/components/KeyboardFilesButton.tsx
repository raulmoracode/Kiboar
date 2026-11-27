const base =
  "mt-3 flex h-10 w-full items-center justify-center gap-2 rounded text-[12px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300/60";

const secondary = `${base} border border-white/15 text-zinc-400 hover:border-white/30 hover:text-zinc-100`;

const primary = `${base} bg-zinc-100 text-[var(--kiboar-bg)] hover:bg-lime-200`;

export function KeyboardFilesButton({
  url,
  prominent = false,
}: {
  url: string | null;
  prominent?: boolean;
}) {
  if (!url) {
    return null;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={prominent ? primary : secondary}
    >
      Keyboard files on GitHub
      <span className="sr-only"> (opens in a new tab)</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}
